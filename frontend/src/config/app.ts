import { Network, StakingToken, RewardToken, DEFAULT_RPC_ENDPOINT } from '../constants'
import {
  AppGeysersList,
  NetworkConfig,
  GeyserConfig,
  ConnectionConfig,
  AdditionalTokenConfig,
  AppAdditionalTokensList,
} from '../types'

const networkConfig: NetworkConfig = {
  [Network.Base]: {
    id: Network.Base,
    networkId: 8453,
    chainId: 8453,
    ref: 'base',
    name: 'Base',
    rpcUrl: DEFAULT_RPC_ENDPOINT,
    graphUrl: 'https://subgraph.satsuma-prod.com/cb8cc6f077f3/wesleys-team/seamless-farms/api',
    explorerUrl: 'https://basescan.org/tx',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [Network.BaseTestNet]: {
    id: Network.BaseTestNet,
    networkId: 84531,
    chainId: 84531,
    ref: 'base-goerli',
    name: 'Base Goerli',
    rpcUrl: 'https://rpc.ankr.com/base_goerli',
    graphUrl: 'https://api.studio.thegraph.com/query/51577/seamless-geyser/version/latest',
    explorerUrl: 'https://goerli.basescan.org/tx',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
  },
}

const geyserList: AppGeysersList = {
  [Network.Base]: [
    {
      name: '[For withdraw only] ETH Suppliers',
      address: '0x9f5AF07189B4aE59845D36a2b0562478870fa915',
      stakingToken: StakingToken.SEAMLESS_ATOKEN,
      rewardToken: RewardToken.OG_POINTS,
      isWrapped: true,
    },
    {
      name: '[For withdraw only] USDbC Suppliers',
      address: '0xac42efBd7A86464Ff2B9d3C2FBdc622A77c7B3EC',
      stakingToken: StakingToken.SEAMLESS_ATOKEN,
      rewardToken: RewardToken.OG_POINTS,
      isWrapped: true,
    },
    {
      name: 'SEAM Farm 1: Soswap SEAM/USDC LP',
      address: '0x0324c763deB573B4cb7D7236d63937Cc276c1df7',
      stakingToken: StakingToken.SO_SWAP,
      rewardToken: RewardToken.SEAM,
      isWrapped: false,
      poolAddress:
        'https://soswap.rai.finance/#/add/0x1C7a460413dD4e964f96D8dFC56E7223cE88CD85/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      // Staked pool token: https://basescan.org/address/0x11e438b489e9e97e0252acd83aaa0a57ab611911
    },
    {
      name: 'SEAM Farm 2: SushiSwap SEAM/WETH LP',
      address: '0x6C6515133125C38675CE0126E9fc75382410AeB8',
      stakingToken: StakingToken.SUSHI_SWAP,
      rewardToken: RewardToken.SEAM,
      isWrapped: false,
      poolAddress: 'https://www.sushi.com/pool/8453%3A0x54cd16e80d9c2b553701463f1b70626202b0ad9f',
      // Staked pool token: https://basescan.org/address/0x54cd16e80d9c2b553701463f1b70626202b0ad9f
    },
    // TODO
    // {
    //   name: 'ETH Beehive V7 (UniswapV2 ETH-AMPL)',
    //   address: '0x5Ec6f02D0b657E4a56d6020Bc21F19f2Ca13EcA9',
    //   stakingToken: StakingToken.UNISWAP_V2,
    //   rewardToken: RewardToken.FORTH,
    //   isWrapped: false,
    //   poolAddress: 'https://app.uniswap.org/#/add/v2/0xD46bA6D942050d489DBd938a2C909A5d5039A161/ETH',
    //   // staked pool address: 0xc5be99A02C6857f9Eac67BbCE58DF5572498F40c
    // },
    // {
    //   name: 'ETH Trinity V3 (BalancerV2 WBTC-WETH-WAMPL)',
    //   address: '0x13ED22A00576E41B64B686857B484987a3Ad1A3B',
    //   stakingToken: StakingToken.BALANCER_WEIGHTED_POOL_V2,
    //   rewardToken: RewardToken.AMPL,
    //   isWrapped: false,
    //   poolAddress: 'https://app.balancer.fi/#/pool/0xd4e2af4507b6b89333441c0c398edffb40f86f4d0001000000000000000002ab',
    //   // staked pool address: 0xd4E2af4507B6B89333441C0c398edfFB40f86f4D
    //   // poolID:0xd4e2af4507b6b89333441c0c398edffb40f86f4d0001000000000000000002ab
    //   // vault: 0xba12222222228d8ba445958a75a0704d566bf2c8
    // },
    // {
    //   name: 'ETH Splendid Pilot (AAVEV2 aAMPL)',
    //   address: '0x1Fee4745E70509fBDc718beDf5050F471298c1CE',
    //   stakingToken: StakingToken.AAVE_V2_AMPL,
    //   rewardToken: RewardToken.AMPL,
    //   isWrapped: true,
    //   poolAddress:
    //     'https://app.aave.com/reserve-overview/?underlyingAsset=0xd46ba6d942050d489dbd938a2c909a5d5039a161&marketName=proto_mainnet',
    //   // staked pool address: 0x1e6bb68acec8fefbd87d192be09bb274170a0548
    // },
  ],
  [Network.BaseTestNet]: [
    {
      name: 'Test',
      address: '0x18ec4E75E276981bd0c1929DC400DBEA60Ea7bF5',
      stakingToken: StakingToken.MOCK,
      rewardToken: RewardToken.MOCK,
      isWrapped: false,
    },
    {
      name: 'WETH aToken - OG Points',
      address: '0x1887f68767aC948c5d4AD94A95062D5Fe47CbA90',
      stakingToken: StakingToken.SEAMLESS_ATOKEN,
      rewardToken: RewardToken.OG_POINTS,
      isWrapped: true,
    },
    {
      name: 'USDC aToken - OG Points',
      address: '0xc8Ae4370818c4566E5993E7Dd9429D217330FE26',
      stakingToken: StakingToken.SEAMLESS_ATOKEN,
      rewardToken: RewardToken.OG_POINTS,
      isWrapped: false,
    },
  ],
}

const additionalTokens: AppAdditionalTokensList = {
  [Network.Base]: [],
  [Network.BaseTestNet]: [],
}

export const activeNetworks: Network[] = [Network.Base, Network.BaseTestNet] // TODO

export function getConnectionConfig(networkId: number | null): ConnectionConfig {
  return networkConfig[networkId as Network] || networkConfig[Network.Base]
}

export function getGeysersConfigList(networkId: number): GeyserConfig[] {
  return geyserList[networkId as Network] || geyserList[Network.Base]
}

export function getAdditionalTokensList(networkId: number): AdditionalTokenConfig[] {
  return additionalTokens[networkId as Network] || additionalTokens[Network.Base]
}
