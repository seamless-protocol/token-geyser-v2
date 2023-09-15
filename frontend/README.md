# token-geyser-v2-ui

Jump to

- [Known workarounds](#known-workarounds)
- [Required Setup](#required-setup)
- [Stats Calculation](#stats)
- [User Flows](#user-flows)
- [Withdraw Unlocked Balance When Unstaking](#withdraw-unlocked-balance-when-unstaking)
- [Dev Specific Configuration](#dev-specific-configuration)
- [Development and Deployment](#development-and-deployment-documentation)

## Known Workarounds

- `let mounted = true` in `useEffect` is a workaround for supressing the warning saying that a state update on an unmounted component is not possible: https://stackoverflow.com/questions/53949393/cant-perform-a-react-state-update-on-an-unmounted-component
- react-spring has a bug where floating point numbers are casted as integers on re-render (e.g. '1.0' gets shown as '1' on re-render). This is a temporary work-around, see https://github.com/pmndrs/react-spring/issues/1564
- Opening a modal right after closing a previous one can mess up the `overflow-y` of the page. As a workaround, there is a delay before the second modal is opened (see the function `handleConfirmUnstake` under `src/components/GeyserStakeView.tsx`)

## Required Setup

The following are the main elements that need to be configured prior to deploying

1. [GraphQL Endpoint for subgraph](#graphql-endpoint)
2. [Environment variable `NODE_ENV`](#process-environment)
3. [Geysers configuration](#geyser-specific-configuration)
4. [List of additional tokens for vault management](#list-of-additional-tokens)
5. [Infura Project ID](#ethereum-provider)

## GraphQL Endpoint

To make sure that the application can fetch data from the subgraph,
the correct endpoint need to be passed to the GraphQL client.
Replace the value of `GEYSER_SUBGRAPH_NAME` under `src/constants.ts` with the name of the deployed subgraph.
The initialization of the GraphQL client can be found under `src/queries/client.ts`.

## Process Environment

Make sure that the environment variable `NODE_ENV` is set to something other than `development` when deploying to production.

## Farms Specific Configuration

### List of Farmss

Under `src/config/app.ts`, it is possible to add or remove geysers that will be shown in the UI.
To add a geyser, append an object with the following properties to the `geyserList` object:

```
name: string
address: string
stakingToken: StakingToken
rewardToken: RewardToken
```

The types `StakingToken` and `RewardToken` are explained below

### Staking Token

Staking tokens (LP tokens) will have customizable logic for calculating their price, displaying their symbol, displaying their name, etc. Staking tokens from V1 have been ported over. They are under `src/utils/stakingToken.ts`.

#### Adding a new staking token

To add a new staking token, first add a new member to the enum `StakingToken` under `src/constants.ts`.
Then, under `src/utils/stakingToken.ts`, add a new case handler to the function `getStakingTokenInfo`,
and write a function that will return `Promise<StakingTokenInfo>`.

#### Example

Say we want to add a new staking token called `LP`. The following changes will need to be made:

Under `src/constants.ts`

```
export enum StakingToken {
  ...
  LP,
}
```

Under `src/utils/stakingToken.ts`

```
export const getStakingTokenInfo = async (...) => {
  ...
  switch (token) {
    ...
    case StakingToken.LP:
      return getLP(tokenAddress, signerOrProvider)
    ...
  }
}

const getLP = async (...): Promise<StakingTokenInfo> => {
  ...
  return {
    address: '0x...',
    name: 'LP Token',
    ...
  }
}
```

### Reward Token

Similarly, reward tokens also have customizable logic. Currently, the only reward token is AMPL.

#### Adding a new reward token

To add a new reward token, first add a new member to the enum `RewardToken` under `src/constants.ts`.
Then, under `src/utils/rewardToken.ts`, add a new case handler to the function `getRewardTokenInfo`,
and write a function that will return `Promise<RewardTokenInfo>`.

#### Example

Say we want to add a new reward token called `REW`. The following changes will need to be made:

Under `src/constants.ts`

```
export enum RewardToken {
  ...
  REW,
}
```

Under `src/rewardToken.ts`

```
export const getRewardTokenInfo = async (...) => {
  ...
  switch (token) {
    ...
    case RewardToken.REW:
      return getREW(tokenAddress, signerOrProvider)
    ...
  }
}

const getREW = async (...): Promise<RewardTokenInfo> => {
  ...
  return {
    address: '0x...',
    name: 'Reward Token',
    ...
  }
}
```

## List of Additional Tokens

Users can withdraw unlocked tokens from their vaults. By default, all reward and staking tokens
from all configured geysers will be shown on the UI. It is possible to show more by adding
token information to the `mainnetAdditionalTokens` list under `src/config/additionalTokens.ts`
with the following properties:

```
address: string   // the address of the token
enabled: boolean  // whether or not to show this token
```

Note that it is assumed that the token is an ERC20 token.

### Example

Say we want to show the `WETH` balance of users' vaults. The following changes will need to be made:

Under `src/config/additionalTokens.ts`

```
const mainnetAdditionalTokens = [
  ...
  {
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    enabled: true,
  },
]
```

## Ethereum Provider

To use Infura as provider, replace the value of `TENDERLY_PROJECT_ID` under `src/constants.ts` with your Infura Project ID. This is only used for mainnet.

## Stats

User and geyser stats calculations are ported over from V1. The accounting math can be found under `src/utils/stats.ts`.

## User Flows

### New Users

A new user will be able to connect their wallet to the dApp. Upon their first stake action, a new vault will be created for them.

### Staking

A stake action will first make the user deposit tokens to their vault, and stake (i.e. lock) the deposited amount to a geyser. We note that this is independent of the prior unlocked amount in the vault. Also note that a new vault will be created for the user if they do not have an existing one.

For instance, if a vault has a total balance of 5 tokens, all of which is unlocked, and the user wants to stake 4 tokens, then the user will still have to deposit 4 tokens into the vault, and they will be staked in the geyser.

The end result is that the vault will have a total balance of 9 tokens, where 5 tokens are unlocked. The user is therefore not encouraged to have unlocked balances in their vaults.

### Unstaking

Upon clicking on the unstake button, the transaction to unstake (i.e. unlock) the specified amount will be submitted. If the transaction goes through, two more transactions will be submitted: one transaction to withdraw the specified amount of staking token from the vault to the user wallet, and another to withdraw the rewards gained from the unstaking. In the instance where a withdraw transaction fails or is rejected, the user can go manually withdraw the unlocked balance from their vault using the vault management view.

### Vault Management

A user can manage their vaults through the vault management view. This view will show a list of tokens and their corresponding total balance & unlocked balance in the vault. The list of tokens includes all the staking and reward tokens of the specified geysers, as well as additional tokens that can be configured (see [here](#list-of-additional-tokens)).

It is possible for the user to withdraw the unlocked balance of a token from their vault to their wallet through this view.

## Withdraw Unlocked Balance When Unstaking

One edge case that comes up in the current unstake flow is that the staking tokens might be staked into different geyser programs (maybe external ones). If that is the case, then unstaking, say, 5 tokens from a geyser does not always imply that 5 tokens will be unlocked after the unstaking. As it currently stands, if this scenario were to arise, the transaction to withdraw the staking tokens will fail, and the user can withdraw the actual unlocked balance from their vault using the vault management view.

However, the functionality to withdraw exactly the unlocked balance is implemented in the code, but it is simply not used. If the decision is to enable this functionality, the following changes are required:

To withdraw the entire unlocked balance of staking tokens after unstaking, under `src/constants.ts`, set `WITHDRAW_UNLOCKED_STAKING_TOKENS_WHEN_UNSTAKING` to `true`

```
export const WITHDRAW_UNLOCKED_STAKING_TOKENS_WHEN_UNSTAKING = true
```

To withdraw the entire unlocked balance of reward tokens after unstaking, under `src/constants.ts`, set `WITHDRAW_UNLOCKED_REWARD_TOKENS_WHEN_UNSTAKING` to `true`

```
export const WITHDRAW_UNLOCKED_REWARD_TOKENS_WHEN_UNSTAKING = true
```

Note that withdrawing the entire unlocked balance also means withdrawing any previously unlocked tokens in the vault that are independent from the tokens gained as a result of the current unstaking action.

## Dev Specific Configuration

When working with MetaMask, it will expect a `chainId` or `networkId` of 1337 for local networks.
See `src/context/Web3Context.tsx` and search for `process.env.NODE_ENV === 'development'`,
those are the places where the `chainId` are explicitly set when in dev mode to connect to local network.

# Development and Deployment Documentation

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
\*\*

## Deployment in IPFS

This app is actively deployed in IPFS. To deploy a new version, follow the next step of intstructions:

1. Create an Infura account and create a new project with IPFS steps enabled with a custom gateway. (This is an upgraded account)
2. Install IPFS CLI: https://blog.infura.io/post/ipfs-file-upload-client-tool
3. Run `yarn build`
4. Run ./ipfs-upload-client --id <INFURA_PROJECT_ID> --secret <INFURA_PROJECT_SECRET> --source <POINT_TO_BUILD_FOLDER>
5. Use the the gateway from step one to access the hosted ipfs which will look like below:
   https://seamless-protocol.infura-ipfs.io/ipfs/QmcDp4k9siuUsVrtYxk4drq66JkfVyetdcbGzxWkpYxKQc/
6. Click into the IPFS link within the address bar to get the direct and use this to point a custom domain to it.
   https://bafybeigoimqumlwxnexnacekz2g7ztuuljxj2uqgggaslvlmorxdkowybe.ipfs.dweb.link/
