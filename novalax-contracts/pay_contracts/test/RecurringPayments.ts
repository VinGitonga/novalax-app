import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { parseEther, parseUnits, zeroAddress } from "viem";

// Constants
const ONE_DAY = 24 * 60 * 60;
const USDC_DECIMALS = 6;

describe("RecurringPayments", function () {
	// Fixture to deploy contract and set up accounts
	async function deployContractFixture() {
		// Get wallet clients (signers)
		const [owner, payer, provider] = await hre.viem.getWalletClients();

		// Set block base fee to zero for exact balance checks
		await hre.network.provider.send("hardhat_setNextBlockBaseFeePerGas", ["0x0"]);

		// Deploy MockERC20 contract for USDC
		const usdcContract = await hre.viem.deployContract("MockERC20", ["Mock USDC", "USDC", parseUnits("1000000", USDC_DECIMALS)]);

		// Deploy RecurringPayments contract
		const recurringPaymentsContract = await hre.viem.deployContract("RecurringPayments", []);

		// Get public client for balance checks and event logs
		const publicClient = await hre.viem.getPublicClient();

		// Mint USDC to payer
		await usdcContract.write.transfer([payer.account.address, parseUnits("1000", USDC_DECIMALS)], { gasPrice: 0n });

		return {
			recurringPaymentsContract,
			usdcContract,
			owner,
			payer,
			provider,
			publicClient,
		};
	}

	describe("schedulePayment", function () {
		it("should schedule an ETH payment", async function () {
			const { recurringPaymentsContract, payer, provider, publicClient } = await loadFixture(deployContractFixture);
			const dueDate = BigInt(Math.floor(Date.now() / 1000) + ONE_DAY);
			const amount = parseEther("1");
			const initialContractBalance = await publicClient.getBalance({ address: recurringPaymentsContract.address });

			const txHash = await recurringPaymentsContract.write.schedulePayment([provider.account.address, amount, zeroAddress, dueDate, false, 0n], { value: amount, gasPrice: 0n, account: payer.account.address });

			const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
			expect(receipt.status).to.equal("success");

			const logs = await publicClient.getContractEvents({
				abi: recurringPaymentsContract.abi,
				eventName: "PaymentScheduled",
			});
			expect(logs.length).to.equal(1);
			expect(logs[0].args.paymentId).to.equal(1n);
			expect(logs[0].args.payer!.toLowerCase()).to.equal(payer.account.address.toLowerCase());
			expect(logs[0].args.provider!.toLowerCase()).to.equal(provider.account.address.toLowerCase());
			expect(logs[0].args.amount).to.equal(amount);
			expect(logs[0].args.token).to.equal(zeroAddress);
			expect(logs[0].args.dueDate).to.equal(dueDate);

			const payment = await recurringPaymentsContract.read.payments([1n]);
			expect(payment[0].toLowerCase()).to.equal(payer.account.address.toLowerCase()); // payer
			expect(payment[1].toLowerCase()).to.equal(provider.account.address.toLowerCase()); // provider
			expect(payment[2]).to.equal(amount); // amount
			expect(payment[3]).to.equal(zeroAddress); // token
			expect(payment[4]).to.equal(dueDate); // dueDate
			expect(payment[5]).to.be.false; // isRecurring
			expect(payment[6]).to.equal(0n); // interval
			expect(payment[7]).to.be.false; // executed
			expect(payment[8]).to.be.true; // active

			const finalContractBalance = await publicClient.getBalance({ address: recurringPaymentsContract.address });
			expect(finalContractBalance).to.equal(initialContractBalance + amount);
		});

		it("should schedule a USDC payment", async function () {
    const { recurringPaymentsContract, usdcContract, payer, provider, publicClient } = await loadFixture(deployContractFixture);
    const dueDate = BigInt(Math.floor(Date.now() / 1000) + ONE_DAY);
    const amount = parseUnits("100", USDC_DECIMALS);

    // Ensure sufficient approval
    await usdcContract.write.approve([recurringPaymentsContract.address, amount], { account: payer.account.address, gasPrice: 0n });
    const initialPayerBalance: bigint = await usdcContract.read.balanceOf([payer.account.address]);
    const txHash = await recurringPaymentsContract.write.schedulePayment(
      [provider.account.address, amount, usdcContract.address, dueDate, false, 0n],
      { gasPrice: 0n, account: payer.account.address }
    );

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    expect(receipt.status).to.equal("success");

    const logs = await publicClient.getContractEvents({
      abi: recurringPaymentsContract.abi,
      eventName: "PaymentScheduled",
    });
    expect(logs.length).to.equal(1);
    expect(logs[0].args.paymentId).to.equal(1n);
    expect(logs[0].args.payer!.toLowerCase()).to.equal(payer.account.address.toLowerCase());
    expect(logs[0].args.provider!.toLowerCase()).to.equal(provider.account.address.toLowerCase());
    expect(logs[0].args.amount).to.equal(amount);
    expect(logs[0].args.token).to.equal(usdcContract.address);
    expect(logs[0].args.dueDate).to.equal(dueDate);

    const payment = await recurringPaymentsContract.read.payments([1n]);
    expect(payment[0].toLowerCase()).to.equal(payer.account.address.toLowerCase()); // payer
    expect(payment[1].toLowerCase()).to.equal(provider.account.address.toLowerCase()); // provider
    expect(payment[2]).to.equal(amount); // amount
    expect(payment[3]).to.equal(usdcContract.address); // token
    expect(payment[4]).to.equal(dueDate); // dueDate
    expect(payment[5]).to.be.false; // isRecurring
    expect(payment[6]).to.equal(0n); // interval
    expect(payment[7]).to.be.false; // executed
    expect(payment[8]).to.be.true; // active

    const contractUSDCBalance: bigint = await usdcContract.read.balanceOf([recurringPaymentsContract.address]);
    expect(contractUSDCBalance).to.equal(amount);
    const finalPayerBalance: bigint = await usdcContract.read.balanceOf([payer.account.address]);
    expect(finalPayerBalance).to.equal(initialPayerBalance - amount);
  });
	});

	describe("executePayment", function () {
		it("should execute an ETH payment", async function () {
			const { recurringPaymentsContract, payer, provider, publicClient } = await loadFixture(deployContractFixture);
			const dueDate = BigInt(Math.floor(Date.now() / 1000) + ONE_DAY);
			const amount = parseEther("1");

			// Schedule payment
			const scheduleTxHash = await recurringPaymentsContract.write.schedulePayment([provider.account.address, amount, zeroAddress, dueDate, false, 0n], {
				value: amount,
				gasPrice: 0n,
				account: payer.account.address,
			});
			await publicClient.waitForTransactionReceipt({ hash: scheduleTxHash });

			// Fast-forward time to make payment due
			await hre.network.provider.send("evm_increaseTime", [ONE_DAY + 1]);
			await hre.network.provider.send("evm_mine");

			// Execute payment
			const providerBalanceBefore = await publicClient.getBalance({ address: provider.account.address });
			const executeTxHash = await recurringPaymentsContract.write.executePayment([1n], { gasPrice: 0n });
			const receipt = await publicClient.waitForTransactionReceipt({ hash: executeTxHash });
			expect(receipt.status).to.equal("success");

			const logs = await publicClient.getContractEvents({
				abi: recurringPaymentsContract.abi,
				eventName: "PaymentExecuted",
			});
			expect(logs.length).to.equal(1);
			expect(logs[0].args.paymentId).to.equal(1n);
			expect(logs[0].args.provider!.toLowerCase()).to.equal(provider.account.address.toLowerCase());
			expect(logs[0].args.amount).to.equal(amount);
			expect(logs[0].args.token).to.equal(zeroAddress);

			const payment = await recurringPaymentsContract.read.payments([1n]);
			expect(payment[7]).to.be.true; // executed
			expect(payment[8]).to.be.false; // active

			const providerBalanceAfter = await publicClient.getBalance({ address: provider.account.address });
			expect(Number(providerBalanceAfter - providerBalanceBefore)).to.be.closeTo(Number(amount), Number(parseEther("0.01")));
		});

		it("should execute a USDC payment", async function () {
			const { recurringPaymentsContract, usdcContract, payer, provider, publicClient } = await loadFixture(deployContractFixture);
			const dueDate = BigInt(Math.floor(Date.now() / 1000) + ONE_DAY);
			const amount = parseUnits("100", USDC_DECIMALS);

			// Schedule payment
			await usdcContract.write.approve([recurringPaymentsContract.address, amount], { account: payer.account.address, gasPrice: 0n });
			const scheduleTxHash = await recurringPaymentsContract.write.schedulePayment([provider.account.address, amount, usdcContract.address, dueDate, false, 0n], { gasPrice: 0n, account: payer.account.address });
			await publicClient.waitForTransactionReceipt({ hash: scheduleTxHash });

			// Fast-forward time to make payment due
			await hre.network.provider.send("evm_increaseTime", [ONE_DAY + 1]);
			await hre.network.provider.send("evm_mine");

			// Execute payment
			const providerBalanceBefore: bigint = await usdcContract.read.balanceOf([provider.account.address]);
			const executeTxHash = await recurringPaymentsContract.write.executePayment([1n], { gasPrice: 0n });
			const receipt = await publicClient.waitForTransactionReceipt({ hash: executeTxHash });
			expect(receipt.status).to.equal("success");

			const logs = await publicClient.getContractEvents({
				abi: recurringPaymentsContract.abi,
				eventName: "PaymentExecuted",
			});
			expect(logs.length).to.equal(1);
			expect(logs[0].args.paymentId).to.equal(1n);
			expect(logs[0].args.provider!.toLowerCase()).to.equal(provider.account.address.toLowerCase());
			expect(logs[0].args.amount).to.equal(amount);
			expect(logs[0].args.token).to.equal(usdcContract.address);

			const payment = await recurringPaymentsContract.read.payments([1n]);
			expect(payment[7]).to.be.true; // executed
			expect(payment[8]).to.be.false; // active

			const providerBalanceAfter: bigint = await usdcContract.read.balanceOf([provider.account.address]);
			expect(providerBalanceAfter).to.equal(providerBalanceBefore + amount);
		});
	});

	describe("cancelPayment", function () {
		it("should cancel an ETH payment and refund", async function () {
			const { recurringPaymentsContract, payer, provider, publicClient } = await loadFixture(deployContractFixture);
			const dueDate = BigInt(Math.floor(Date.now() / 1000) + ONE_DAY);
			const amount = parseEther("1");

			// Schedule payment
			const scheduleTxHash = await recurringPaymentsContract.write.schedulePayment([provider.account.address, amount, zeroAddress, dueDate, false, 0n], {
				value: amount,
				gasPrice: 0n,
				account: payer.account.address,
			});
			await publicClient.waitForTransactionReceipt({ hash: scheduleTxHash });

			// Cancel payment
			const payerBalanceBefore = await publicClient.getBalance({ address: payer.account.address });
			const cancelTxHash = await recurringPaymentsContract.write.cancelPayment([1n], { account: payer.account.address, gasPrice: 0n });
			const receipt = await publicClient.waitForTransactionReceipt({ hash: cancelTxHash });
			expect(receipt.status).to.equal("success");

			const logs = await publicClient.getContractEvents({
				abi: recurringPaymentsContract.abi,
				eventName: "PaymentCancelled",
			});
			expect(logs.length).to.equal(1);
			expect(logs[0].args.paymentId).to.equal(1n);

			const payment = await recurringPaymentsContract.read.payments([1n]);
			expect(payment[8]).to.be.false; // active

			const payerBalanceAfter = await publicClient.getBalance({ address: payer.account.address });
			expect(Number(payerBalanceAfter)).to.be.closeTo(Number(payerBalanceBefore + amount), Number(parseEther("0.01")));
		});
	});

	describe("depositFunds", function () {
		it("should deposit additional USDC", async function () {
			const { recurringPaymentsContract, usdcContract, payer, provider, publicClient } = await loadFixture(deployContractFixture);
			const dueDate = BigInt(Math.floor(Date.now() / 1000) + ONE_DAY);
			const amount = parseUnits("100", USDC_DECIMALS);

			// Schedule recurring payment
			await usdcContract.write.approve([recurringPaymentsContract.address, amount], { account: payer.account.address, gasPrice: 0n });
			const scheduleTxHash = await recurringPaymentsContract.write.schedulePayment([provider.account.address, amount, usdcContract.address, dueDate, true, BigInt(ONE_DAY)], {
				gasPrice: 0n,
				account: payer.account.address,
			});
			await publicClient.waitForTransactionReceipt({ hash: scheduleTxHash });

			// Deposit additional USDC
			await usdcContract.write.approve([recurringPaymentsContract.address, amount], { account: payer.account.address, gasPrice: 0n });
			const depositTxHash = await recurringPaymentsContract.write.depositFunds([1n], { account: payer.account.address, gasPrice: 0n });
			const receipt = await publicClient.waitForTransactionReceipt({ hash: depositTxHash });
			expect(receipt.status).to.equal("success");

			const logs = await publicClient.getContractEvents({
				abi: recurringPaymentsContract.abi,
				eventName: "FundsDeposited",
			});
			expect(logs.length).to.equal(1);
			expect(logs[0].args.paymentId).to.equal(1n);
			expect(logs[0].args.amount).to.equal(amount);

			const contractUSDCBalance: bigint = await usdcContract.read.balanceOf([recurringPaymentsContract.address]);
			expect(contractUSDCBalance).to.equal(amount * 2n);
		});
	});

	describe("getDuePayments", function () {
		it("should return due USDC payments", async function () {
			const { recurringPaymentsContract, usdcContract, payer, provider, publicClient } = await loadFixture(deployContractFixture);
			const dueDate = BigInt(Math.floor(Date.now() / 1000) + ONE_DAY);
			const amount = parseUnits("100", USDC_DECIMALS);

			// Schedule two payments, one due and one not due
			await usdcContract.write.approve([recurringPaymentsContract.address, amount * 2n], { account: payer.account.address, gasPrice: 0n });
			const scheduleTxHash1 = await recurringPaymentsContract.write.schedulePayment([provider.account.address, amount, usdcContract.address, dueDate, false, 0n], { gasPrice: 0n, account: payer.account.address });
			await publicClient.waitForTransactionReceipt({ hash: scheduleTxHash1 });

			const scheduleTxHash2 = await recurringPaymentsContract.write.schedulePayment([provider.account.address, amount, usdcContract.address, BigInt(Math.floor(Date.now() / 1000) + 2 * ONE_DAY), false, 0n], {
				gasPrice: 0n,
				account: payer.account.address,
			});
			await publicClient.waitForTransactionReceipt({ hash: scheduleTxHash2 });

			// Fast-forward time to make first payment due
			await hre.network.provider.send("evm_increaseTime", [ONE_DAY + 1]);
			await hre.network.provider.send("evm_mine");

			const duePayments = await recurringPaymentsContract.read.getDuePayments();
			expect(duePayments.length).to.equal(1);
			expect(duePayments[0]).to.equal(1n); // Only first payment is due
		});
	});
});
