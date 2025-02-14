# Notes

## Localhost node forking Base Mainnet

Run node, with Base mainnet fork in `hardhat.config.ts`:

```bash
npx hardhat node
```

Deploy, placeholder addresses grabbed from outputs of the hardhat tasks:

```bash
npx hardhat deploy --mock --network localhost
npx hardhat create-vault --network localhost
npx hardhat --network localhost create-geyser --stakingtoken {mockBAL} --rewardtoken {mockAMPLAddress}  --floor 0 --ceiling 10000 --time 360
npx hardhat --network localhost fund-geyser --geyser {gayserAddress} --amount 10 --duration 31536000
```

## Base Goerli via Tenderly RPC

Deploy:

```bash
npx hardhat deploy --network base-goerli --mock
npx hardhat --network base-goerli create-vault
npx hardhat --network base-goerli create-geyser --stakingtoken 0x75602e8a08FAf915987589CB7fE59136aE35b0fc --rewardtoken 0x39e47c370411cE01fa09A81A8C842FAE66929976  --floor 0 --ceiling 10000000 --time 3600
npx hardhat --network base-goerli fund-geyser --geyser 0x18ec4E75E276981bd0c1929DC400DBEA60Ea7bF5 --amount 876 --duration 31536000
```

## Base Goerli: using aTokens

Assumes `deploy` and `create-vault` task was run to initalize factories:

```bash
# old weth aToken
npx hardhat --network base-goerli create-geyser --stakingtoken 0xf4781a935Fe1F177f9ef65C69Fc64706a19e9F25 --rewardtoken 0x980d0cbb2e314c496b808cac88a8a4e8893161e1  --floor 10000000 --ceiling 1000000000 --time 3600

# usdc aToken
npx hardhat --network base-goerli create-geyser --stakingtoken 0x6a3639B76cfA1C47f7d4794c87cA791A8294AFC8 --rewardtoken 0x980d0cbb2e314c496b808cac88a8a4e8893161e1  --floor 10000000 --ceiling 1000000000 --time 3600

# new weth aToken
npx hardhat --network base-goerli create-geyser --stakingtoken 0x4fc8603DAFFA1391F31c1F55b45d54E1424D6C82 --rewardtoken 0x980d0cbb2e314c496b808cac88a8a4e8893161e1  --floor 10000000000000000 --ceiling 100000000000000000000 --time 3600
```

**The following deposits 1 million reward tokens (with 1e18) decimals. The deploy script scales by 1e9, then internally the contract scaled by 1000. An amount of `100000000000 = 1e11` will scale to `1e23`. Can change the way scripts work.**

```bash
# old weth
npx hardhat --network base-goerli fund-geyser --geyser 0x74d0a42e4578F19Ab79ab5a948F5588bb655023E --amount 100000000000 --duration 31536000

# usdc geyser (changed parseUnits inside fund-geyser command on the fly due to lower decimals)
npx hardhat --network base-goerli fund-geyser --geyser 0xc8Ae4370818c4566E5993E7Dd9429D217330FE26 --amount 1 --duration 31536000

# new weth
npx hardhat --network base-goerli fund-geyser --geyser 0x1887f68767aC948c5d4AD94A95062D5Fe47CbA90 --amount 1000000 --duration 31536000
```

## Tenderly: Base fork v2

Deploy factories:

```bash
$ npx hardhat deploy --network tenderly

Deploying PowerSwitchFactory
  to 0xE0B1c72863dE480B1A9B0b92750deCFd494D8480
  in 0x740d9310403e54f34af489209737f6786b1419af946d3318c749ebb4c43c8b58
Deploying RewardPoolFactory
  to 0x91D2409B5a4434863221795E009f064d90E8e056
  in 0xaa1410d2a02ba99dc65cd95037d14ed4fee27c0f7e2ebe61ac2fbe203ac4a135
Deploying UniversalVault
  to 0x46469a3ABf2Ccac3c7249d6540c7eccdF5646496
  in 0xd30ad163d093a07646cf3fc2bc18cbd6d7b5ba55e28b654d212b7763ec59bc5f
Deploying VaultFactory
  to 0xa1Ed2275F3a4aB09EFC94B94F50D9e73b22D2e9F
  in 0x21537c4fb41c6dbf43c2406aa6ba75ea430c309b5d09529ac8369ee8048f087d
Deploying GeyserRegistry
  to 0x5780092FcA7BA471Bd58480Ea83A487649C57772
  in 0x43812881af793ff69f394d474902dbaab0824dc90781daa597f20e4b9444398a
Deploying RouterV1
  to 0xA576981bd534e229390B68fc8c0f0BCF101F6103
  in 0xef1d848594b8be780d171df1f956546006cb7211b0aa5534f44f73b17faac34e
Saving config to ./sdk/deployments/tenderly/factories-1693507365.json
```

Create vault:

```bash
$ npx hardhat create-vault --network tenderly

Deploying UniversalVault
  to 0x41A5f26bd28c8576884b89e869ff7D0C7B06F59D
  in 0xe0683f5aef462f13e2f8001c2d94606ab9b0a97f862ce070d86e20ed71ea5eae
```

### Impersonate `OG Points`

Acquire funds in our tenderly fork of Base mainnet. `OG Points` at `0x178898686F23a50CCAC17962df41395484804a6B`:

```bash
$ npx hardhat mint-reward-token --network tenderly --token 0x178898686f23a50ccac17962df41395484804a6b --admin 0x1099a1b84678493bc6c6f737aa3ffe5bcf488bf9 --destination 0xB232B987FB0AC10A31faAa01F45408cA58D28253 --amount 10000
```

Check for `OG Points` assets:

```bash
$ npx hardhat check-balance --network tenderly --token 0x178898686f23a50ccac17962df41395484804a6b
```

### WETH Geyser

This part assumes we have deployed a wrapped aToken contract:

```bash
$ npx hardhat --network tenderly create-geyser --stakingtoken 0x91366f8dD9F4191F6310318813D548EeAc4aA740 --rewardtoken 0x178898686f23a50ccac17962df41395484804a6b  --floor 50 --ceiling 100 --time 15552000

Deploying Geyser
  to proxy 0x2942AAC0Ee36288671eFdB558dAD63ABA99F7eD0
  to implementation 0x510393Bac3905781086CdfA879d4cBF4F7901629
  with upgreadability admin 0x6aE1d838327499fD42A708F1CeA8CE3b8D7975e4
  in 0x9c0005ea723fe6687243bb43627f06ea47e6b465d47b94e6916da6adb438517c
  staking token 0x91366f8dD9F4191F6310318813D548EeAc4aA740
  reward token 0x178898686f23a50ccac17962df41395484804a6b
  reward floor 50
  reward ceiling 100
Register Geyser Instance
initialize geyser
Register Vault Factory
```

Before funding the geyser, we must allow the ourselves and the geyser to transfer our non-transferrable reward token:

```bash
$ npx hardhat allow-transfer --network tenderly --token 0x178898686f23a50ccac17962df41395484804a6b --admin 0x1099a1b84678493bc6c6f737aa3ffe5bcf488bf9 --target 0xB232B987FB0AC10A31faAa01F45408cA58D28253

$ npx hardhat allow-transfer --network tenderly --token 0x178898686f23a50ccac17962df41395484804a6b --admin 0x1099a1b84678493bc6c6f737aa3ffe5bcf488bf9 --target 0x2942AAC0Ee36288671eFdB558dAD63ABA99F7eD0
```

Fund geyser, refer to bold section above for decimals:

```bash
$ npx hardhat --network tenderly fund-geyser --geyser 0x2942AAC0Ee36288671eFdB558dAD63ABA99F7eD0 --amount 622080 --decimals 18 --duration 2592000
```

Now test a deposit by running the frontend with subgraph node... More on this later

### USDC Geyser

Assumes geyser factories & vaults are set up, and minted `OG Points` through impersonation in the instructions above. We need to impersonate and mint `USDC`:

```bash
$ npx hardhat mint-erc20-token --network tenderly --token 0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca --admin 0x4200000000000000000000000000000000000010 --destination 0xB232B987FB0AC10A31faAa01F45408cA58D28253 --amount 1000000
```

Check for `USDC` assets:

```bash
$ npx hardhat check-balance --network tenderly --token 0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca
```

Now, assuming we have a wrapped aToken contract we create the geyser:

```bash
$ npx hardhat --network tenderly create-geyser --stakingtoken 0xf84e14984Dccf4D27267f597dC4BF74b334015b7 --rewardtoken 0x178898686f23a50ccac17962df41395484804a6b  --floor 50 --ceiling 100 --time 15552000

Deploying Geyser
  to proxy 0xc240964354AC1283e1E518ccF398E603633CCFb8
  to implementation 0x510393Bac3905781086CdfA879d4cBF4F7901629
  with upgreadability admin 0x6aE1d838327499fD42A708F1CeA8CE3b8D7975e4
  in 0xbdd293f8d83ff06afae2ed5fa9dd2d39b7072f26c5868513997b2d2545a02e31
  staking token 0xf84e14984Dccf4D27267f597dC4BF74b334015b7
  reward token 0x178898686f23a50ccac17962df41395484804a6b
  reward floor 50
  reward ceiling 100
Register Geyser Instance
initialize geyser
Register Vault Factory
```

Allow the new geyser to transfer `OG Points`. We should already have transfer role for ourselves from section above:

```bash
$ npx hardhat allow-transfer --network tenderly --token 0x178898686f23a50ccac17962df41395484804a6b --admin 0x1099a1b84678493bc6c6f737aa3ffe5bcf488bf9 --target 0xc240964354AC1283e1E518ccF398E603633CCFb8
```

Now fund the geyser:

```bash
$ npx hardhat --network tenderly fund-geyser --geyser 0xc240964354AC1283e1E518ccF398E603633CCFb8 --amount 622080 --decimals 18 --duration 2592000
```

Now test a deposit by running the frontend with subgraph node... More on this later

### USDC Geyser (redeploy fixed decimals)

```bash
$ npx hardhat --network tenderly create-geyser --stakingtoken 0xD3C0a1B34ef8B5d38cc10694Fe5ABd3D1353eB61 --rewardtoken 0x178898686f23a50ccac17962df41395484804a6b  --floor 50 --ceiling 100 --time 15552000

Deploying Geyser
  to proxy 0xaf9B41Db8356D1431047d89caEC153398D1d2c99
  to implementation 0x510393Bac3905781086CdfA879d4cBF4F7901629
  with upgreadability admin 0x6aE1d838327499fD42A708F1CeA8CE3b8D7975e4
  in 0xbc157743ef6e8a8f597b1de0adb4f215f87cdcb83b8e2305bf5f86b4d9c3cd03
  staking token 0xD3C0a1B34ef8B5d38cc10694Fe5ABd3D1353eB61
  reward token 0x178898686f23a50ccac17962df41395484804a6b
  reward floor 50
  reward ceiling 100
Register Geyser Instance
initialize geyser
Register Vault Factory
```

Allow the new geyser to transfer `OG Points`. We should already have transfer role for ourselves from section above:

```bash
$ npx hardhat allow-transfer --network tenderly --token 0x178898686f23a50ccac17962df41395484804a6b --admin 0x1099a1b84678493bc6c6f737aa3ffe5bcf488bf9 --target 0xaf9B41Db8356D1431047d89caEC153398D1d2c99
```

Now fund the geyser:

```bash
$ npx hardhat --network tenderly fund-geyser --geyser 0xaf9B41Db8356D1431047d89caEC153398D1d2c99 --amount 622080 --decimals 18 --duration 2592000
```

## Base Mainnet

Deploy factories:

```bash
$ npx hardhat deploy --network base-mainnet

Deploying PowerSwitchFactory
  to 0x272b77C7316daE8675beb5710d124f635f073E01
  in 0xfdc22932534a78a91f3a09822ce516637cee21ac2b18302f82e1e22f642992f8
Deploying RewardPoolFactory
  to 0x56908a201Eb6a4c4A35B833e5e9749650228FF5e
  in 0x77bfee6e6e2732ca915107294a368cd088709a52c3511e11ececbf5b2f9c537f
Deploying UniversalVault
  to 0xe8Bb3FC413114EfbAeeECbb16A96CDdE4938AF77
  in 0x0a2a00f6c5717e531ca75726d7e89bb2c0723ff46fc2e453e8f66754118a12de
Deploying VaultFactory
  to 0x40292D35b48Ff625C648c2A7F0c9e42cd07cd0B0
  in 0x64b9e16cd01995b7ba1cc8c239548e04e3e2451b0b7daa2dd72329b41c9cf1c6
Deploying GeyserRegistry
  to 0xD5815fC3D736120d07a1fA92bA743c1167dA89d8
  in 0xf5e6b1ee4981b75c5678f06ff058e67137abf51b9e1c7d45cf457a76d58c2db9
Deploying RouterV1
  to 0x59a11C2f543790b8ce1A2DC46C4ad08A4536BdC8
  in 0x0faafbfe465602e321b979fadce88b6975d6900b2e8c5cf011198e3f3af90ee5
Locking template
Saving config to ./sdk/deployments/base-mainnet/factories-1694025457.json
```

Create vault:

```bash
$ npx hardhat --network base-mainnet create-vault

Deploying UniversalVault
  to 0x9fF9536D993D3f398B51ca9148a1d7F8eBaC4280
  in 0xe36690dd801814dcfb6ea9517866add2067a425f1b54ead3728b8d44d074bfb0
```

Create wsUSDbC geyser:

```bash
$ npx hardhat --network base-mainnet create-geyser --stakingtoken 0x7A595538b91D40B411A32a9c6668D8f63c130f0c --rewardtoken 0x5607718c64334eb5174CB2226af891a6ED82c7C6 --floor 50 --ceiling 100 --time 15552000 --finalOwner 0xA1b5f2cc9B407177CD8a4ACF1699fa0b99955A22

Deploying Geyser
  to proxy 0xac42efBd7A86464Ff2B9d3C2FBdc622A77c7B3EC
  to implementation 0x52EfbBD14c5a4059E2108734E5d746aD19160564
  with upgreadability admin 0xaC6D0e95c84329B6AF75C0D58c9b34A85Ee521a9
  in 0x17d7c3ac4de38b8a463c63b8a6132bdd8e006e5e75acfbfb0f6135c5feb66542
  staking token 0x7A595538b91D40B411A32a9c6668D8f63c130f0c
  reward token 0x5607718c64334eb5174CB2226af891a6ED82c7C6
  reward floor 50
  reward ceiling 100
Register Geyser Instance
initialize geyser
Register Vault Factory
Transfer ownership
```

Create wsWETH geyser:

```bash
$ npx hardhat --network base-mainnet create-geyser --stakingtoken 0xAf72867FB2bFBb55FD44773733a7bc03963f701f --rewardtoken 0x5607718c64334eb5174CB2226af891a6ED82c7C6 --floor 50 --ceiling 100 --time 15552000 --finalowner 0xA1b5f2cc9B407177CD8a4ACF1699fa0b99955A22

Deploying Geyser
  to proxy 0x9f5AF07189B4aE59845D36a2b0562478870fa915
  to implementation 0x52EfbBD14c5a4059E2108734E5d746aD19160564
  with upgreadability admin 0xaC6D0e95c84329B6AF75C0D58c9b34A85Ee521a9
  in 0x659de54f13953f61943666a250e4b5fe9b85acd101273963724de0ba3a4cb59f
  staking token 0xAf72867FB2bFBb55FD44773733a7bc03963f701f
  reward token 0x5607718c64334eb5174CB2226af891a6ED82c7C6
  reward floor 50
  reward ceiling 100
Register Geyser Instance
initialize geyser
Register Vault Factory
Transfer ownership
```
