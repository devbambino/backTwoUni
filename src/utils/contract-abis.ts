

export const backuniContractAbi: any = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_proposalId",
				"type": "uint256"
			}
		],
		"name": "executeProposal",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "refundOrgStaker",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_orgId",
				"type": "string"
			}
		],
		"name": "sendOrgBalanceToOrgAdmin",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bool",
				"name": "_newRule",
				"type": "bool"
			}
		],
		"name": "setAllowAdminsWithdrawals",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bool",
				"name": "_newRule",
				"type": "bool"
			}
		],
		"name": "setAllowFundersWithdrawals",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_orgId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_userName",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "_allowProposals",
				"type": "bool"
			}
		],
		"name": "setOrgAdmin",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_orgId",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "_allowProposals",
				"type": "bool"
			}
		],
		"name": "setOrgAllowProposal",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_proposalName",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_proposalDesc",
				"type": "string"
			}
		],
		"name": "setProposal",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_newSuperOwner",
				"type": "address"
			}
		],
		"name": "setSuperOwner",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_orgId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_userName",
				"type": "string"
			}
		],
		"name": "setUser",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "stakeFundsFunder",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_proposalId",
				"type": "uint256"
			}
		],
		"name": "voteProposal",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "adminStakingThreshold",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_proposalId",
				"type": "uint256"
			}
		],
		"name": "checkIfVoted",
		"outputs": [
			{
				"internalType": "bool",
				"name": "_hasVoted",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "fundersStakingThreshold",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getOrgInfo",
		"outputs": [
			{
				"components": [
					{
						"internalType": "enum BackTwoUni.OrgType",
						"name": "orgType",
						"type": "uint8"
					},
					{
						"internalType": "string",
						"name": "orgId",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "orgName",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "orgBalance",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "orgStakersBalance",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "allowProposals",
						"type": "bool"
					},
					{
						"internalType": "address payable",
						"name": "orgAdmin",
						"type": "address"
					},
					{
						"internalType": "uint256[]",
						"name": "orgProposals",
						"type": "uint256[]"
					},
					{
						"internalType": "address[]",
						"name": "orgUsers",
						"type": "address[]"
					}
				],
				"internalType": "struct BackTwoUni.Org",
				"name": "_orgInfo",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getOrgProposals",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "_orgProposals",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getOrgProposalsCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "_proposalsCount",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getOrgUsersCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "_usersCount",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_proposalId",
				"type": "uint256"
			}
		],
		"name": "getProposalInfo",
		"outputs": [
			{
				"components": [
					{
						"internalType": "bool",
						"name": "isOn",
						"type": "bool"
					},
					{
						"internalType": "bool",
						"name": "passed",
						"type": "bool"
					},
					{
						"internalType": "string",
						"name": "proposalName",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "proposalDesc",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "proposalVotesCount",
						"type": "uint256"
					}
				],
				"internalType": "struct Proposal.Info",
				"name": "_proposalInfo",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getSuperOwner",
		"outputs": [
			{
				"internalType": "address",
				"name": "_address",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getUserInfo",
		"outputs": [
			{
				"components": [
					{
						"internalType": "enum BackTwoUni.UserType",
						"name": "userType",
						"type": "uint8"
					},
					{
						"internalType": "string",
						"name": "orgId",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "userName",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "userBalance",
						"type": "uint256"
					}
				],
				"internalType": "struct BackTwoUni.User",
				"name": "_userInfo",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
