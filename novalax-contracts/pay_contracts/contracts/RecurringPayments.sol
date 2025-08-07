// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Use console.log for Hardhat debugging
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IERC20WithSymbol.sol";

contract RecurringPayments is ReentrancyGuard, Ownable {
    
    struct Payment {
        uint256 id;
        address payer;
        address provider;
        uint256 amount;
        address token;
        string tokenSymbol;
        uint256 dueDate;
        bool isRecurring;
        uint256 interval;
        bool executed;
        bool active;
    }

    mapping(uint256 => Payment) public payments;
    uint256 public paymentCount;

    // Events for Notifications & Updates
    event PaymentScheduled(
        uint256 indexed paymentId,
        address indexed payer,
        address indexed provider,
        uint256 amount,
        address token,
        uint256 dueDate
    );
    event PaymentExecuted(
        uint256 indexed paymentId,
        address indexed provider,
        uint256 amount,
        address token
    );
    event PaymentFailed(uint256 indexed paymentId, string reason);
    event PaymentCancelled(uint256 indexed paymentId);
    event FundsDeposited(
        uint256 indexed paymentId,
        uint256 amount,
        address token
    );
    event Pong();

    constructor() Ownable(msg.sender) {}

    // Schedule a new payment
    function schedulePayment(
        address provider,
        uint256 amount,
        address token,
        uint256 dueDate,
        bool isRecurring,
        uint256 interval
    ) external payable nonReentrant {
        require(provider != address(0), "Invalid provider address");
        require(amount > 0, "Amount must be greater than 0");
        require(dueDate > block.timestamp, "Due date must be in the future");
        if (isRecurring) {
            require(interval >= 1 days, "Interval must be at least 1 day");
        }

        string memory tokenSymbol;
        if (token == address(0)) {
            tokenSymbol = "ETH";
        } else {
            try IERC20WithSymbol(token).symbol() returns (string memory symbol) {
                tokenSymbol = symbol;
            } catch {
                tokenSymbol = "UNKNOWN";
            }
        }

        paymentCount++;

        payments[paymentCount] = Payment({
            id: paymentCount,
            payer: msg.sender,
            provider: provider,
            amount: amount,
            token: token,
            tokenSymbol: tokenSymbol,
            dueDate: dueDate,
            isRecurring: isRecurring,
            interval: interval,
            executed: false,
            active: true
        });

        // Handle funds deposit
        if (token == address(0)) {
            // Eth Payment
            require(msg.value >= amount, "Insufficient ETH sent");
        } else {
            require(
                IERC20(token).allowance(msg.sender, address(this)) >= amount,
                "Insufficient token allowance"
            );
            bool success = IERC20(token).transferFrom(
                msg.sender,
                address(this),
                amount
            );
            require(success, "Token transfer failed");
        }

        emit PaymentScheduled(
            paymentCount,
            msg.sender,
            provider,
            amount,
            token,
            dueDate
        );
    }

    // Execute a due payment (to be done by a cron job)
    function executePayment(uint256 paymentId) external nonReentrant {
        Payment storage payment = payments[paymentId];
        require(payment.active, "Payment is not active");
        require(!payment.executed, "Payment already executed");
        require(block.timestamp >= payment.dueDate, "Payment not due yet");

        // check balance
        if (payment.token == address(0)) {
            require(
                address(this).balance >= payment.amount,
                "Insufficient ETH balance"
            );
        } else {
            require(
                IERC20(payment.token).balanceOf(address(this)) >=
                    payment.amount,
                "Insufficient token balance"
            );
        }

        // Transfer funds to provider
        bool success;
        if (payment.token == address(0)) {
            (success, ) = payment.provider.call{value: payment.amount}("");
        } else {
            success = IERC20(payment.token).transfer(
                payment.provider,
                payment.amount
            );
        }

        if (!success) {
            emit PaymentFailed(paymentId, "Transfer failed");
            return;
        }

        // Update payment status
        payment.executed = true;
        emit PaymentExecuted(
            paymentId,
            payment.provider,
            payment.amount,
            payment.token
        );

        // Handle recurring payments;
        if (payment.isRecurring) {
            payment.dueDate += payment.interval;
            payment.executed = false; // reset for the next cycle
        } else {
            payment.active = false; // for one time payment
        }
    }

    // Cancel a payment and refund funds
    function cancelPayment(uint256 paymentId) external nonReentrant {
        Payment storage payment = payments[paymentId];
        require(
            msg.sender == payment.payer || msg.sender == owner(),
            "Not authorized"
        );
        require(payment.active, "Payment is not active");
        require(!payment.executed, "Payment already executed");

        payment.active = false;
        bool success;

        // Refund funds
        if (payment.token == address(0)) {
            (success, ) = payment.payer.call{value: payment.amount}("");
        } else {
            success = IERC20(payment.token).transfer(
                payment.payer,
                payment.amount
            );
        }

        require(success, "Refund failed");
        emit PaymentCancelled(paymentId);
    }

    // Deposit additional funds for a payment (e.g., for recurring payments)
    function depositFunds(uint256 paymentId) external payable nonReentrant {
        Payment storage payment = payments[paymentId];
        require(payment.active, "Payment is not active");
        require(msg.sender == payment.payer, "Not payer");

        uint256 amount;
        if (payment.token == address(0)) {
            amount = msg.value;
            require(amount > 0, "No ETH sent");
        } else {
            amount = IERC20(payment.token).allowance(msg.sender, address(this));
            require(amount > 0, "No tokens approved");
            IERC20(payment.token).transferFrom(
                msg.sender,
                address(this),
                amount
            );
        }

        emit FundsDeposited(paymentId, amount, payment.token);
    }

    // Get all payments for a user
    function getUserPayments(address user, bool upcomingOnly) external view returns (Payment[] memory) {
        // First pass: count matching payments
        uint256 count = 0;
        for (uint256 i = 1; i <= paymentCount; i++) {
            if (payments[i].payer == user) {
                if (upcomingOnly) {
                    if (payments[i].active && !payments[i].executed) {
                        count++;
                    }
                } else {
                    count++;
                }
            }
        }

        // Second pass: populate result array
        Payment[] memory result = new Payment[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= paymentCount; i++) {
            if (payments[i].payer == user) {
                if (upcomingOnly) {
                    if (payments[i].active && !payments[i].executed) {
                        result[index] = payments[i];
                        index++;
                    }
                } else {
                    result[index] = payments[i];
                    index++;
                }
            }
        }

        return result;
    }

    // Get due payments
    function getDuePayments() external view returns (uint256[] memory) {
        // First pass: count due payments
        uint256 count = 0;
        for (uint256 i = 1; i <= paymentCount; i++) {
            if (
                payments[i].dueDate <= block.timestamp &&
                !payments[i].executed &&
                payments[i].active
            ) {
                count++;
            }
        }

        // Second pass: populate result array
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= paymentCount; i++) {
            if (
                payments[i].dueDate <= block.timestamp &&
                !payments[i].executed &&
                payments[i].active
            ) {
                result[index] = i;
                index++;
            }
        }

        return result;
    }

    // Emergency stop to pause contract
    bool public paused;
    modifier whenNoPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    function pause() external onlyOwner {
        paused = true;
    }

    function unpause() external onlyOwner {
        paused = false;
    }

    function ping() public {
        console.log("Ping");
        emit Pong();
    }

    // Fallback to receive ETH
    receive() external payable {}
}
