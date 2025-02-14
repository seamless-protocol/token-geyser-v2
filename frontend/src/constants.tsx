const MS_PER_SEC = 1000

export const MIN_IN_SEC = 60
export const HOUR_IN_SEC = 60 * MIN_IN_SEC
export const DAY_IN_SEC = 24 * HOUR_IN_SEC
export const WEEK_IN_SEC = 7 * DAY_IN_SEC
export const MONTH_IN_SEC = 30 * DAY_IN_SEC
export const YEAR_IN_SEC = 365 * DAY_IN_SEC

export const MIN_IN_MS = MIN_IN_SEC * MS_PER_SEC
export const HOUR_IN_MS = HOUR_IN_SEC * MS_PER_SEC
export const DAY_IN_MS = DAY_IN_SEC * MS_PER_SEC
export const WEEK_IN_MS = WEEK_IN_SEC * MS_PER_SEC
export const MONTH_IN_MS = MONTH_IN_SEC * MS_PER_SEC
export const YEAR_IN_MS = YEAR_IN_SEC * MS_PER_SEC

// polling interval for querying subgraph
export const POLL_INTERVAL = 30 * MS_PER_SEC

// pseudo permanent cache time
export const CONST_CACHE_TIME_MS = YEAR_IN_MS

// geyser stats cache time
export const GEYSER_STATS_CACHE_TIME_MS = 0

export const MOCK_ERC_20_ADDRESS = '0x0165878A594ca255338adfa4d48449f69242Eb8F'

// app mode
export enum Mode {
  VAULTS,
  GEYSERS,
}

// transaction state
export enum TxState {
  PENDING,
  SUBMITTED,
  MINED,
  FAILED,
}

// Staking tokens
export enum StakingToken {
  UNISWAP_V2,
  SUSHI_SWAP,
  SO_SWAP,
  // for testing
  MOCK,
  WAMPL,
  OG_POINTS,

  // for mainnet
  // TODO
  BASESWAP,
  SEAMLESS_ATOKEN,
}

// Reward tokens
export enum RewardToken {
  SEAM,
  // for testing
  MOCK,

  // for mainnet
  OG_POINTS,
}

// Netowrks
export enum Network {
  Base = 8453,
  BaseTestNet = 84531,
}

// tooltip messages
export const GET_APY_STAKE_MSG = () => (
  <div>
    APY is estimated for your current deposits till the end of this program. The APY metric does not account for gains
    or losses from holding liquidity tokens, or gains from liquidity mining rewards distributed by the underlying
    platform for holding liquidity tokens.
    <br />
    <br />
    For the OG Points Farms, APY refers solely to the annualized rate of earning OG Points for your participation in the
    Seamless ecosystem. OG Points are on-chain, nontransferable utility points that have no monetary value, cannot be
    traded or transferred among holders, and cannot be exchanged for cash or any other type of monetary value, they
    represent participation in the Seamless ecosystem only. No other rewards are offered hereby.
  </div>
)

export const GET_APY_NO_STAKE_MSG = ({ days = '1' }) => (
  <div>
    APY is estimated for an avg deposit (20,000 USD) over the next ${days} days. The APY metric does not account for
    gains or losses from holding liquidity tokens, or gains from liquidity mining rewards distributed by the underlying
    platform for holding liquidity tokens.
    <br />
    <br />
    For the OG Points Farms, APY refers solely to the annualized rate of earning OG Points for your participation in the
    Seamless ecosystem. OG Points are on-chain, nontransferable utility points that have no monetary value, cannot be
    traded or transferred among holders, and cannot be exchanged for cash or any other type of monetary value, they
    represent participation in the Seamless ecosystem only. No other rewards are offered hereby.
  </div>
)

export const GET_REWARD_MULTIPLIER_MSG = ({ days = '30', multiplier = '3.0' }) =>
  `Deposit liquidity tokens for ${days} days to achieve a ${multiplier}x reward multiplier.`

export const GET_CURRENT_REWARDS_MSG = () =>
  'Your share of the total unlocked reward pool. Larger your deposit and for longer, higher your share.'

export const GET_ESTIMATED_REWARDS_MSG = () =>
  'Estimated rewards assume you have achieved the maximum reward multiplier.'

// alignment
export enum Align {
  LEFT,
  RIGHT,
  CENTER,
}

// Tenderly
export const TENDERLY_PROJECT_ID = '1SVyxsO1IHL8NHPgMyQmuF'

export const DEFAULT_RPC_ENDPOINT =
  process.env.NODE_ENV === 'development'
    ? `https://rpc.ankr.com/base`
    : 'https://base-mainnet.g.alchemy.com/v2/cmOQkZesrPx6CW_f1TnZWzODwtDIf1f1'

// Other RPC endpoints for reference
// export const DEFAULT_RPC_ENDPOINT = `https://mainnet.base.org/`

// Enable withdrawing whole unlocked balance of staking tokens when unstaking
export const WITHDRAW_UNLOCKED_STAKING_TOKENS_WHEN_UNSTAKING = false

// Enable withdrawing whole unlocked balance of reward tokens when unstaking
export const WITHDRAW_UNLOCKED_REWARD_TOKENS_WHEN_UNSTAKING = true
