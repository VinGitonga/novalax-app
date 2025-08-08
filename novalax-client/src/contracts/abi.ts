export const recurringPaymentABI = [
	{
		inputs: [
			{
				internalType: "uint256",
				name: "paymentId",
				type: "uint256",
			},
		],
		name: "cancelPayment",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "paymentId",
				type: "uint256",
			},
		],
		name: "depositFunds",
		outputs: [],
		stateMutability: "payable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "paymentId",
				type: "uint256",
			},
		],
		name: "executePayment",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		stateMutability: "nonpayable",
		type: "constructor",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "owner",
				type: "address",
			},
		],
		name: "OwnableInvalidOwner",
		type: "error",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "account",
				type: "address",
			},
		],
		name: "OwnableUnauthorizedAccount",
		type: "error",
	},
	{
		inputs: [],
		name: "ReentrancyGuardReentrantCall",
		type: "error",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "uint256",
				name: "paymentId",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "address",
				name: "token",
				type: "address",
			},
		],
		name: "FundsDeposited",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "previousOwner",
				type: "address",
			},
			{
				indexed: true,
				internalType: "address",
				name: "newOwner",
				type: "address",
			},
		],
		name: "OwnershipTransferred",
		type: "event",
	},
	{
		inputs: [],
		name: "pause",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "uint256",
				name: "paymentId",
				type: "uint256",
			},
		],
		name: "PaymentCancelled",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "uint256",
				name: "paymentId",
				type: "uint256",
			},
			{
				indexed: true,
				internalType: "address",
				name: "provider",
				type: "address",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "address",
				name: "token",
				type: "address",
			},
		],
		name: "PaymentExecuted",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "uint256",
				name: "paymentId",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "string",
				name: "reason",
				type: "string",
			},
		],
		name: "PaymentFailed",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "uint256",
				name: "paymentId",
				type: "uint256",
			},
			{
				indexed: true,
				internalType: "address",
				name: "payer",
				type: "address",
			},
			{
				indexed: true,
				internalType: "address",
				name: "provider",
				type: "address",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "address",
				name: "token",
				type: "address",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "dueDate",
				type: "uint256",
			},
		],
		name: "PaymentScheduled",
		type: "event",
	},
	{
		inputs: [],
		name: "ping",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		anonymous: false,
		inputs: [],
		name: "Pong",
		type: "event",
	},
	{
		inputs: [],
		name: "renounceOwnership",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "provider",
				type: "address",
			},
			{
				internalType: "uint256",
				name: "amount",
				type: "uint256",
			},
			{
				internalType: "address",
				name: "token",
				type: "address",
			},
			{
				internalType: "uint256",
				name: "dueDate",
				type: "uint256",
			},
			{
				internalType: "bool",
				name: "isRecurring",
				type: "bool",
			},
			{
				internalType: "uint256",
				name: "interval",
				type: "uint256",
			},
		],
		name: "schedulePayment",
		outputs: [],
		stateMutability: "payable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "newOwner",
				type: "address",
			},
		],
		name: "transferOwnership",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "unpause",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		stateMutability: "payable",
		type: "receive",
	},
	{
		inputs: [],
		name: "getDuePayments",
		outputs: [
			{
				internalType: "uint256[]",
				name: "",
				type: "uint256[]",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "user",
				type: "address",
			},
			{
				internalType: "bool",
				name: "upcomingOnly",
				type: "bool",
			},
		],
		name: "getUserPayments",
		outputs: [
			{
				components: [
					{
						internalType: "uint256",
						name: "id",
						type: "uint256",
					},
					{
						internalType: "address",
						name: "payer",
						type: "address",
					},
					{
						internalType: "address",
						name: "provider",
						type: "address",
					},
					{
						internalType: "uint256",
						name: "amount",
						type: "uint256",
					},
					{
						internalType: "address",
						name: "token",
						type: "address",
					},
					{
						internalType: "string",
						name: "tokenSymbol",
						type: "string",
					},
					{
						internalType: "uint256",
						name: "dueDate",
						type: "uint256",
					},
					{
						internalType: "bool",
						name: "isRecurring",
						type: "bool",
					},
					{
						internalType: "uint256",
						name: "interval",
						type: "uint256",
					},
					{
						internalType: "bool",
						name: "executed",
						type: "bool",
					},
					{
						internalType: "bool",
						name: "active",
						type: "bool",
					},
				],
				internalType: "struct RecurringPayments.Payment[]",
				name: "",
				type: "tuple[]",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "owner",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "paused",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "paymentCount",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		name: "payments",
		outputs: [
			{
				internalType: "uint256",
				name: "id",
				type: "uint256",
			},
			{
				internalType: "address",
				name: "payer",
				type: "address",
			},
			{
				internalType: "address",
				name: "provider",
				type: "address",
			},
			{
				internalType: "uint256",
				name: "amount",
				type: "uint256",
			},
			{
				internalType: "address",
				name: "token",
				type: "address",
			},
			{
				internalType: "string",
				name: "tokenSymbol",
				type: "string",
			},
			{
				internalType: "uint256",
				name: "dueDate",
				type: "uint256",
			},
			{
				internalType: "bool",
				name: "isRecurring",
				type: "bool",
			},
			{
				internalType: "uint256",
				name: "interval",
				type: "uint256",
			},
			{
				internalType: "bool",
				name: "executed",
				type: "bool",
			},
			{
				internalType: "bool",
				name: "active",
				type: "bool",
			},
		],
		stateMutability: "view",
		type: "function",
	},
] as const;
