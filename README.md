## Novalax

Novalax is a payment gateway and platform for onchain payments of USDC directly on Hedera EVM Network for AI agents and Users. Novalax has been powered by x402 protocol, which enables seamless, secure, and automated payments for data and digital services.

### Inspiration 💡
In April, we had develop ![Novix AI Agent Marketplace](https://github.com/VinGitonga/novix_marketplace.git) marketplace for Hedera x AI hackathon, we had a challenge with monetization and payments for creators and AI agents. Moreover we needed to bridge the gap for a Web3 economy especially for autonomous agents and modern users.

For AI Agents: AI agents and APIs need a programmatic, HTTP-native way to pay for data and resources in real-time, without relying on traditional, centralized payment gateways.

For Users: Users expect a frictionless experience, where payments for premium files or content can be made with a click, without navigating complex dApps.

For Businesses: Businesses need a unified platform to manage all their on-chain revenue, whether it's from AI agents paying for API calls or users paying for subscriptions.

Novalax solves these challenges by use an web3 and a HTTP request that makes payments easier and thus empowering a new era of decentralized commerce.

### 🚀 Features
Novalax is built on x402 protocol and Hedera EVM Network

#### Core Technology: x402 & On-Chain Payments

Novalax is built on the x402 protocol, a standard that activates the HTTP 402 "Payment Required" status code. This allows us to make payments an intrinsic part of the HTTP request, creating a native payment layer for the blockchain.

- HTTP-Native Payments: Novix Pay enables real-time, on-chain payments for data and API calls directly over the HTTP protocol.
- On-Demand Payments: This technical core is the foundation for all our payment models, from one-time transactions to recurring subscriptions.
- Stablecoin Native: All transactions are settled in USDC, providing a reliable and non-volatile payment experience.

#### For AI Agents: Programmatic Payments for Resources
AI agents can now act as independent economic actors.
- Pay for Access to Data: Agents can use the x402 protocol to pay for access to data and resources programmatically, without human intervention
- Programmatic API Monetization: This enables developers to create true pay-per-use APIs, where every single API call can be monetized with a secure, on-chain transaction.

#### For Users & Businesses: Get Paid with USDC
- For Users: Users can interact with an AI agent in Telegram to request premium files. The AI agent generates a payment link, and the user signs the transaction on the web to receive instant access. 
- For Businesses: Businesses get a unified dashboard to generate payment links for both one-time and recurring payments. They can track all revenue from AI agents and users, and manage everything from one place.

### 📸 Screenshots
![Screenshot 2](https://firebasestorage.googleapis.com/v0/b/carepulse-00.firebasestorage.app/o/Screenshot%202025-08-09%20at%2006.00.10.png?alt=media&token=7310eaf2-bfa3-4aa3-bfaf-ebf3bd38b409)

![Screenshot 3](https://firebasestorage.googleapis.com/v0/b/carepulse-00.firebasestorage.app/o/Screenshot%202025-08-09%20at%2005.59.42.png?alt=media&token=7f56d2a7-85a2-4316-8955-ee0cb083ccc7)

![Screenshot 4](https://firebasestorage.googleapis.com/v0/b/carepulse-00.firebasestorage.app/o/Screenshot%202025-08-09%20at%2006.00.27.png?alt=media&token=a1a4fa56-2917-45e6-a378-c14855354cba)

![Screenshot 5](https://firebasestorage.googleapis.com/v0/b/carepulse-00.firebasestorage.app/o/Screenshot%202025-08-09%20at%2006.00.37.png?alt=media&token=ce09b06f-6675-4f65-b98a-faa91aa87b8b)

![Screenshot 6](https://firebasestorage.googleapis.com/v0/b/carepulse-00.firebasestorage.app/o/Screenshot%202025-08-09%20at%2006.01.06.png?alt=media&token=8da0176a-40a1-41e1-9027-7f6ba8b9405e)

![Screenshot 7](https://firebasestorage.googleapis.com/v0/b/carepulse-00.firebasestorage.app/o/Screenshot%202025-08-09%20at%2006.01.21.png?alt=media&token=fceb31e8-e2b6-4ede-9364-53c60a043497)

![Screenshot 8](https://firebasestorage.googleapis.com/v0/b/carepulse-00.firebasestorage.app/o/Screenshot%202025-08-09%20at%2006.07.51.png?alt=media&token=946a2243-d1bb-4cbb-86af-af46f6a6784c)

// RecurringPaymentCheckout.tsx 
// line 87-179
const handlePayment = async () => {
    if (!targetWallet || !amount || !activeAccount) {
        toast.error("Please connect your wallet and ensure all parameters are valid");
        return;
    }

    const isDueDate_date = isDate(new Date(dueDate));
    if (!isDueDate_date) {
        toast.error("Due date has to be a date");
        return;
    }

    // check if dueDate is in the future
    const isDueDateInFuture = isFuture(new Date(dueDate));

    if (!isDueDateInFuture) {
        toast.error("Due date has to be in the future");
        return;
    }

    const contract = getContract({
        abi: recurringPaymentABI,
        client: client!,
        chain: defineChain(etherlinkTestnetChain.id),
        address: CONTRACT_ADDRESS,
    });

    const dueDateUnix = getUnixTime(new Date(dueDate));
    const dueDateBigInt = BigInt(dueDateUnix);
    const amtInDecimals = parseUnits(amount, 6);

    const { interval, nextDueDate } = computeInterval(frequency as any, dueDate);

    const computedInterval = BigInt(interval);

    const preparedContractCall = prepareContractCall({
        contract,
        method: "schedulePayment",
        params: [targetWallet, amtInDecimals, USDC_CONTRACT_ADDRESS, dueDateBigInt, true, computedInterval],
        erc20Value: {
            amountWei: amtInDecimals,
            tokenAddress: USDC_CONTRACT_ADDRESS,
        },
    });

    setIsProcessing(true);

    const approvalTx = await getApprovalForTransaction({
        transaction: preparedContractCall as any,
        account: activeAccount,
    });

    if (approvalTx) {
        const approvalReceipt = await sendAndConfirmTransaction({
            transaction: approvalTx,
            account: activeAccount,
        });
        console.log("Approval transaction receipt:", approvalReceipt);
    } else {
        console.log("No approval needed (already sufficient allowance).");
    }

    // Send the schedulePayment transaction
    const transaction = await sendAndConfirmTransaction({
        transaction: preparedContractCall,
        account: activeAccount,
    });

    const receipt = await waitForReceipt({
        client: client!,
        chain: defineChain(etherlinkTestnetChain.id),
        transactionHash: transaction.transactionHash,
    });

    setPaymentTx(receipt.transactionHash);
    setIsProcessing(false);
    setPaymentSuccess(true);

    const dataToSave = {
        payer: activeAccount.address,
        provider: targetWallet,
        amount: parseFloat(amount),
        token: USDC_CONTRACT_ADDRESS,
        dueDate: nextDueDate,
        isRecurring: true,
        interval: interval,
        tx: receipt.transactionHash,
        tg_name: tg_username,
        tg_id: tg_id,
    } satisfies TCreateSubscription;

    const {} = await tryCatch(createSubscription(dataToSave));
};
```

### Transactions
- AI agent access resource: https://hashscan.io/testnet/transaction/0xf506f12a4d815ba8782724d1b575e6912e10350ecaa39ccbee34663bb8252b0c
- Subscription Payment: https://hashscan.io/testnet/transaction/0x2ab3173be0f8db79435ea9968bd4668d0dff977e301d72fc31a490f514ddd2fc

### Tech Stack
Frontend: React, Typescript, Tailwind CSS
Backend: Node JS, MongoDB, x402
Blockchain: Hedera EVM, Smart Contracts, x402 settlement, Wagmi, Remix
Authentication: Wagmi, Metamask

### Installation
Prequisites

- Git
- Yarn
- Pnpm
- Node JS (v23)
- Bun

#### Process

1. Clone the repo

```bash
git clone https://github.com/VinGitonga/novalax-app.git
```
2. Install dependencies

    2.1 Backend

    ```bash
    cd novalax-backend
    ```
    Use yarn to install deps
    ```bash
    yarn install
    ```

    Install x402 dependencies
    ```bash
    cd x402/typescript && pnpm install
    ```

    Create a .env file with the following values
    ```txt
    TELEGRAM_BOT_TOKEN=""
    OPENAI_API_KEY=""
    MONGODB_URI=""
    WALLET_PRIVATE_KEY=""
    NODE_ENV="development"
    PINATA_API_KEY="="
    PINATA_API_SECRET=""
    PINATA_JWT=""
    ```

    Start backend
    - Start Facilitator server
    ```bash
    bun --watch src/facilitator.ts
    ```
    - Start Telegram BOT
    ```bash
    bun --watch src/app.ts
    ```
    - Start the backend service
    ```bash
    bun --watch src/index.ts
    ```

    2.2 Frontend
    ```bash
    cd novalax-client
    ```

    Use yarn to install deps
    ```bash
    pnpm install
    ```

    Install x402 dependencies
    ```bash
    cd x402-typescript && pnpm install
    ```

    Start frontend
    ```
    pnpm run dev
    ```

3. Start Using
- Navigate to UI
```bash
http://localhost:4112
```
