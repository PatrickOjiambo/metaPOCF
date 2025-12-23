export const MOTES_PER_CSPR = 1_000_000_000;

export const CONTRACT_HASH = import.meta.env.VITE_CONTRACT_HASH || 'hash-placeholder';

export const NODE_ADDRESS = import.meta.env.VITE_NODE_ADDRESS || 'http://localhost:11101/rpc';

export const NETWORK_NAME = import.meta.env.VITE_NETWORK_NAME || 'casper-test';

export const TRANSACTION_TYPES = {
  DEPOSIT: 'Deposit',
  WITHDRAWAL: 'Withdrawal',
  REWARD: 'Reward',
  UNSTAKE: 'Unstake',
} as const;

export const PRIZE_DISTRIBUTION = [
  { rank: 1, percentage: 40, label: '1st Prize' },
  { rank: 2, percentage: 25, label: '2nd Prize' },
  { rank: 3, percentage: 15, label: '3rd Prize' },
  { rank: 4, percentage: 12, label: '4th Prize' },
  { rank: 5, percentage: 8, label: '5th Prize' },
];

export const FEATURES = [
  {
    title: 'No-Loss Guarantee',
    description: 'Your principal is always safe. Withdraw anytime with your full deposit plus rewards.',
    icon: '🛡️',
  },
  {
    title: 'Weekly Prize Draws',
    description: 'Win substantial prizes from pooled staking rewards. The more you deposit, the better your chances.',
    icon: '🎯',
  },
  {
    title: 'Native CSPR Staking',
    description: 'Your deposits are staked on Casper Network, earning 8-12% APY automatically.',
    icon: '💎',
  },
  {
    title: 'Liquid Tokens',
    description: 'Receive pvCSPR tokens that can be traded or used in other DeFi protocols.',
    icon: '💧',
  },
];
