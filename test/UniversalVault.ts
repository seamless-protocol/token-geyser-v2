import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { expect } from 'chai'
import { Contract } from 'ethers'
import { ethers } from 'hardhat'
import {
  createInstance,
  deployContract,
  ETHER,
  signPermission,
  transferNFT,
} from './utils'

enum DelegateType {
  Succeed,
  Revert,
  RevertWithMessage,
  OOG,
}

describe('UniversalVault', function () {
  let accounts: SignerWithAddress[],
    owner: SignerWithAddress,
    recipient: SignerWithAddress,
    delegate: SignerWithAddress
  let factory: Contract, vault: Contract

  beforeEach(async function () {
    // prepare signers
    accounts = await ethers.getSigners()
    owner = accounts[0]
    recipient = accounts[1]
    delegate = accounts[2]

    // deploy template
    const template = await deployContract('UniversalVault')

    // deploy factory
    factory = await deployContract('VaultFactory', [template.address])

    // deploy instance
    vault = await createInstance('UniversalVault', factory, owner)
  })

  describe('nft', function () {
    it('should succeed', async function () {
      expect(await vault.nft()).to.eq(factory.address)
    })
  })

  describe('getNonce', function () {
    it('should succeed', async function () {
      expect(await vault.getNonce()).to.eq(0)
    })
  })

  describe('owner', function () {
    it('should succeed', async function () {
      expect(await vault.owner()).to.eq(owner.address)
    })
  })

  describe('getLockSetCount', function () {
    it('should succeed', async function () {
      expect(await vault.getLockSetCount()).to.eq(0)
    })
  })

  describe('getLockAt', function () {
    it('should fail when no locks', async function () {
      await expect(vault.getLockAt(0)).to.be.revertedWith(
        'EnumerableSet: index out of bounds',
      )
    })
  })

  describe('getBalanceDelegated', function () {
    it('should succeed', async function () {
      expect(
        await vault.getBalanceDelegated(
          ethers.constants.AddressZero,
          ethers.constants.AddressZero,
        ),
      ).to.deep.eq(0)
    })
  })

  describe('getBalanceLocked', function () {
    it('should succeed', async function () {
      expect(
        await vault.getBalanceLocked(ethers.constants.AddressZero),
      ).to.deep.eq(0)
    })
  })

  describe('checkBalances', function () {
    it('should succeed', async function () {
      expect(await vault.checkBalances()).to.be.true
    })
  })

  describe('lock', function () {
    let ERC20: Contract
    const totalSupply = ethers.utils.parseEther('10')
    beforeEach(async function () {
      ERC20 = await deployContract('MockERC20', [owner.address, totalSupply])
      await ERC20.connect(owner).transfer(vault.address, ETHER)
    })
    describe('with incorrect permission', function () {
      it('should fail when wrong signer', async function () {
        // get nonce
        const vaultNonce = await vault.getNonce()
        // craft permission
        const permission = ethers.utils.solidityKeccak256(
          ['string', 'address', 'address', 'address', 'uint256', 'uint256'],
          [
            'lock',
            vault.address,
            delegate.address,
            ERC20.address,
            ETHER,
            vaultNonce,
          ],
        )
        // sign permission
        const signedPermission = await recipient.signMessage(
          ethers.utils.arrayify(permission),
        )
        await expect(
          vault.connect(delegate).lock(ERC20.address, ETHER, signedPermission),
        ).to.be.revertedWith('ERC1271: Invalid signature')
      })
      it('should fail when wrong function signature', async function () {
        const permission = await signPermission(
          'unlock',
          owner,
          vault,
          delegate.address,
          ERC20.address,
          ETHER,
        )
        await expect(
          vault.connect(delegate).lock(ERC20.address, ETHER, permission),
        ).to.be.revertedWith('ERC1271: Invalid signature')
      })
      it('should fail when wrong delegate', async function () {
        const permission = await signPermission(
          'lock',
          owner,
          vault,
          recipient.address,
          ERC20.address,
          ETHER,
        )
        await expect(
          vault.connect(delegate).lock(ERC20.address, ETHER, permission),
        ).to.be.revertedWith('ERC1271: Invalid signature')
      })
      it('should fail when wrong token', async function () {
        const permission = await signPermission(
          'lock',
          owner,
          vault,
          delegate.address,
          recipient.address,
          ETHER,
        )
        await expect(
          vault.connect(delegate).lock(ERC20.address, ETHER, permission),
        ).to.be.revertedWith('ERC1271: Invalid signature')
      })
      it('should fail when wrong amount', async function () {
        const permission = await signPermission(
          'lock',
          owner,
          vault,
          delegate.address,
          ERC20.address,
          ETHER.div(2),
        )
        await expect(
          vault.connect(delegate).lock(ERC20.address, ETHER, permission),
        ).to.be.revertedWith('ERC1271: Invalid signature')
      })
      it('should fail when wrong nonce', async function () {
        // get nonce
        const vaultNonce = await vault.getNonce()
        // craft permission
        const permission = ethers.utils.solidityKeccak256(
          ['string', 'address', 'address', 'address', 'uint256', 'uint256'],
          [
            'lock',
            vault.address,
            delegate.address,
            ERC20.address,
            ETHER,
            vaultNonce.add(1),
          ],
        )
        // sign permission
        const signedPermission = await owner.signMessage(
          ethers.utils.arrayify(permission),
        )
        await expect(
          vault.connect(delegate).lock(ERC20.address, ETHER, signedPermission),
        ).to.be.revertedWith('ERC1271: Invalid signature')
      })
    })
    describe('with correct permission', function () {
      it('should succeed', async function () {
        const permission = await signPermission(
          'lock',
          owner,
          vault,
          delegate.address,
          ERC20.address,
          ETHER,
        )
        await vault.connect(delegate).lock(ERC20.address, ETHER, permission)
      })
      it('should create lock if new delegate-token pair', async function () {
        const permission = await signPermission(
          'lock',
          owner,
          vault,
          delegate.address,
          ERC20.address,
          ETHER,
        )
        await vault.connect(delegate).lock(ERC20.address, ETHER, permission)

        expect(await vault.getLockSetCount()).to.be.eq(1)
        const lockData = await vault.getLockAt(0)
        expect(lockData.delegate).to.be.eq(delegate.address)
        expect(lockData.token).to.be.eq(ERC20.address)
        expect(lockData.balance).to.be.eq(ETHER)
        expect(
          await vault.getBalanceDelegated(ERC20.address, delegate.address),
        ).to.be.eq(ETHER)
        expect(await vault.getBalanceLocked(ERC20.address)).to.be.eq(ETHER)
      })
      it('should update lock if existing delegate-token pair', async function () {
        const permission1 = await signPermission(
          'lock',
          owner,
          vault,
          delegate.address,
          ERC20.address,
          ETHER.div(2),
        )
        await vault
          .connect(delegate)
          .lock(ERC20.address, ETHER.div(2), permission1)

        const permission2 = await signPermission(
          'lock',
          owner,
          vault,
          delegate.address,
          ERC20.address,
          ETHER.div(2),
        )
        await vault
          .connect(delegate)
          .lock(ERC20.address, ETHER.div(2), permission2)

        expect(await vault.getLockSetCount()).to.be.eq(1)
        const lockData = await vault.getLockAt(0)
        expect(lockData.delegate).to.be.eq(delegate.address)
        expect(lockData.token).to.be.eq(ERC20.address)
        expect(lockData.balance).to.be.eq(ETHER)
        expect(
          await vault.getBalanceDelegated(ERC20.address, delegate.address),
        ).to.be.eq(ETHER)
        expect(await vault.getBalanceLocked(ERC20.address)).to.be.eq(ETHER)
      })
      it('should fail if insufficient vault balance on new lock', async function () {
        const permission1 = await signPermission(
          'lock',
          owner,
          vault,
          delegate.address,
          ERC20.address,
          ETHER,
        )
        await vault.connect(delegate).lock(ERC20.address, ETHER, permission1)

        const permission2 = await signPermission(
          'lock',
          owner,
          vault,
          delegate.address,
          ERC20.address,
          ETHER.div(2),
        )
        await expect(
          vault
            .connect(delegate)
            .lock(ERC20.address, ETHER.div(2), permission2),
        ).to.be.revertedWith('UniversalVault: insufficient balance')
      })
      it('should fail if insufficient vault balance on existing lock', async function () {
        const permission = await signPermission(
          'lock',
          owner,
          vault,
          delegate.address,
          ERC20.address,
          ETHER.mul(2),
        )
        await expect(
          vault.connect(delegate).lock(ERC20.address, ETHER.mul(2), permission),
        ).to.be.revertedWith('UniversalVault: insufficient balance')
      })
      it('should bump nonce', async function () {
        const permission = await signPermission(
          'lock',
          owner,
          vault,
          delegate.address,
          ERC20.address,
          ETHER,
        )
        await vault.connect(delegate).lock(ERC20.address, ETHER, permission)

        expect(await vault.getNonce()).to.be.eq(1)
      })
      it('should emit event', async function () {
        const permission = await signPermission(
          'lock',
          owner,
          vault,
          delegate.address,
          ERC20.address,
          ETHER,
        )
        await expect(
          vault.connect(delegate).lock(ERC20.address, ETHER, permission),
        )
          .to.emit(vault, 'Locked')
          .withArgs(delegate.address, ERC20.address, ETHER)
      })
    })
    describe('when owner is ERC1271 compatible smart contract', function () {
      it('should succeed', async function () {
        // todo
      })
    })
  })

  describe('unlock', function () {
    let ERC20: Contract
    const totalSupply = ethers.utils.parseEther('10')
    beforeEach(async function () {
      ERC20 = await deployContract('MockERC20', [owner.address, totalSupply])
      await ERC20.connect(owner).transfer(vault.address, ETHER)
      const permission = await signPermission(
        'lock',
        owner,
        vault,
        delegate.address,
        ERC20.address,
        ETHER,
      )
      await vault.connect(delegate).lock(ERC20.address, ETHER, permission)
    })
    describe('with incorrect permission', function () {
      it('should fail when wrong signer', async function () {
        // get nonce
        const vaultNonce = await vault.getNonce()
        // craft permission
        const permission = ethers.utils.solidityKeccak256(
          ['string', 'address', 'address', 'address', 'uint256', 'uint256'],
          [
            'unlock',
            vault.address,
            delegate.address,
            ERC20.address,
            ETHER,
            vaultNonce,
          ],
        )
        // sign permission
        const signedPermission = await recipient.signMessage(
          ethers.utils.arrayify(permission),
        )
        await expect(
          vault
            .connect(delegate)
            .unlock(ERC20.address, ETHER, signedPermission),
        ).to.be.revertedWith('ERC1271: Invalid signature')
      })
      it('should fail when wrong function signature', async function () {
        const permission = await signPermission(
          'lock',
          owner,
          vault,
          delegate.address,
          ERC20.address,
          ETHER,
        )
        await expect(
          vault.connect(delegate).unlock(ERC20.address, ETHER, permission),
        ).to.be.revertedWith('ERC1271: Invalid signature')
      })
      it('should fail when wrong delegate', async function () {
        const permission = await signPermission(
          'unlock',
          owner,
          vault,
          recipient.address,
          ERC20.address,
          ETHER,
        )
        await expect(
          vault.connect(delegate).unlock(ERC20.address, ETHER, permission),
        ).to.be.revertedWith('ERC1271: Invalid signature')
      })
      it('should fail when wrong token', async function () {
        const permission = await signPermission(
          'unlock',
          owner,
          vault,
          delegate.address,
          recipient.address,
          ETHER,
        )
        await expect(
          vault.connect(delegate).unlock(ERC20.address, ETHER, permission),
        ).to.be.revertedWith('ERC1271: Invalid signature')
      })
      it('should fail when wrong amount', async function () {
        const permission = await signPermission(
          'unlock',
          owner,
          vault,
          delegate.address,
          ERC20.address,
          ETHER.div(2),
        )
        await expect(
          vault.connect(delegate).unlock(ERC20.address, ETHER, permission),
        ).to.be.revertedWith('ERC1271: Invalid signature')
      })
      it('should fail when wrong nonce', async function () {
        // get nonce
        const vaultNonce = await vault.getNonce()
        // craft permission
        const permission = ethers.utils.solidityKeccak256(
          ['string', 'address', 'address', 'address', 'uint256', 'uint256'],
          [
            'unlock',
            vault.address,
            delegate.address,
            ERC20.address,
            ETHER,
            vaultNonce.add(1),
          ],
        )
        // sign permission
        const signedPermission = await owner.signMessage(
          ethers.utils.arrayify(permission),
        )
        await expect(
          vault
            .connect(delegate)
            .unlock(ERC20.address, ETHER, signedPermission),
        ).to.be.revertedWith('ERC1271: Invalid signature')
      })
    })
    describe('with correct permission', function () {
      it('should succeed', async function () {
        const permission = await signPermission(
          'unlock',
          owner,
          vault,
          delegate.address,
          ERC20.address,
          ETHER,
        )
        await vault.connect(delegate).unlock(ERC20.address, ETHER, permission)
      })
      it('should fail if lock does not exist', async function () {
        const permission = await signPermission(
          'unlock',
          owner,
          vault,
          recipient.address,
          ERC20.address,
          ETHER,
        )
        await expect(
          vault.connect(recipient).unlock(ERC20.address, ETHER, permission),
        ).to.be.revertedWith('UniversalVault: missing lock')
      })
      it('should update lock balance if amount < balance', async function () {
        const permission = await signPermission(
          'unlock',
          owner,
          vault,
          delegate.address,
          ERC20.address,
          ETHER.div(2),
        )
        await vault
          .connect(delegate)
          .unlock(ERC20.address, ETHER.div(2), permission)

        expect(await vault.getLockSetCount()).to.be.eq(1)
        const lockData = await vault.getLockAt(0)
        expect(lockData.delegate).to.be.eq(delegate.address)
        expect(lockData.token).to.be.eq(ERC20.address)
        expect(lockData.balance).to.be.eq(ETHER.div(2))
        expect(
          await vault.getBalanceDelegated(ERC20.address, delegate.address),
        ).to.be.eq(ETHER.div(2))
        expect(await vault.getBalanceLocked(ERC20.address)).to.be.eq(
          ETHER.div(2),
        )
      })
      it('should delete lock if amount >= balance', async function () {
        const permission = await signPermission(
          'unlock',
          owner,
          vault,
          delegate.address,
          ERC20.address,
          ETHER.mul(2),
        )
        await vault
          .connect(delegate)
          .unlock(ERC20.address, ETHER.mul(2), permission)

        expect(await vault.getLockSetCount()).to.be.eq(0)
        await expect(vault.getLockAt(0)).to.be.revertedWith(
          'EnumerableSet: index out of bounds',
        )
        expect(
          await vault.getBalanceDelegated(ERC20.address, delegate.address),
        ).to.be.eq(0)
        expect(await vault.getBalanceLocked(ERC20.address)).to.be.eq(0)
      })
      it('should bump nonce', async function () {
        const permission = await signPermission(
          'unlock',
          owner,
          vault,
          delegate.address,
          ERC20.address,
          ETHER,
        )
        await vault.connect(delegate).unlock(ERC20.address, ETHER, permission)

        expect(await vault.getNonce()).to.be.eq(2)
      })
      it('should emit event', async function () {
        const permission = await signPermission(
          'unlock',
          owner,
          vault,
          delegate.address,
          ERC20.address,
          ETHER,
        )
        await expect(
          vault.connect(delegate).unlock(ERC20.address, ETHER, permission),
        )
          .to.emit(vault, 'Unlocked')
          .withArgs(delegate.address, ERC20.address, ETHER)
      })
    })
    describe('when owner is ERC1271 compatible smart contract', function () {
      it('should succeed', async function () {
        // todo
      })
    })
  })

  describe('rageQuit', function () {
    let ERC20: Contract, MockDelegate: Contract
    const totalSupply = ethers.utils.parseEther('10')
    beforeEach(async function () {
      ERC20 = await deployContract('MockERC20', [owner.address, totalSupply])
      await ERC20.connect(owner).transfer(vault.address, ETHER)
      MockDelegate = await deployContract('MockDelegate')
      const permission = await signPermission(
        'lock',
        owner,
        vault,
        MockDelegate.address,
        ERC20.address,
        ETHER,
      )
      await MockDelegate.lock(vault.address, ERC20.address, ETHER, permission)
    })
    describe('as non-owner', function () {
      beforeEach(async function () {
        await MockDelegate.setDelegateType(DelegateType.Succeed)
      })
      it('should fail', async function () {
        await expect(
          vault.connect(recipient).rageQuit(delegate.address, ERC20.address),
        ).to.be.revertedWith('OwnableERC721: caller is not the owner')
      })
    })
    describe('with insufficient gas forwarded', function () {
      let gasLimit: number
      beforeEach(async function () {
        gasLimit = (await vault.RAGEQUIT_GAS()).toNumber()
        await MockDelegate.setDelegateType(DelegateType.Succeed)
      })
      it('should fail', async function () {
        await expect(
          vault
            .connect(owner)
            .rageQuit(MockDelegate.address, ERC20.address, { gasLimit }),
        ).to.be.revertedWith('UniversalVault: insufficient gas')
      })
    })
    describe('delegate with success', function () {
      beforeEach(async function () {
        await MockDelegate.setDelegateType(DelegateType.Succeed)
      })
      it('should succeed', async function () {
        await vault.connect(owner).rageQuit(MockDelegate.address, ERC20.address)
      })
      it('should fail when lock does not exist', async function () {
        await expect(
          vault.connect(owner).rageQuit(recipient.address, ERC20.address),
        ).to.be.revertedWith('UniversalVault: missing lock')
      })
      it('should delete lock data', async function () {
        await vault.connect(owner).rageQuit(MockDelegate.address, ERC20.address)

        expect(await vault.getLockSetCount()).to.be.eq(0)
        await expect(vault.getLockAt(0)).to.be.revertedWith(
          'EnumerableSet: index out of bounds',
        )
        expect(
          await vault.getBalanceDelegated(ERC20.address, MockDelegate.address),
        ).to.be.eq(0)
        expect(await vault.getBalanceLocked(ERC20.address)).to.be.eq(0)
      })
      it('should emit event', async function () {
        await expect(
          vault.connect(owner).rageQuit(MockDelegate.address, ERC20.address),
        )
          .to.emit(vault, 'RageQuit')
          .withArgs(MockDelegate.address, ERC20.address, true, '')
      })
      it('should return data', async function () {
        const returnData = await vault
          .connect(owner)
          .callStatic.rageQuit(MockDelegate.address, ERC20.address)

        expect(returnData.notified).to.be.true
        expect(returnData.error).to.be.eq('')
      })
    })
    describe('delegate with revert', function () {
      beforeEach(async function () {
        await MockDelegate.setDelegateType(DelegateType.Revert)
      })
      it('should succeed', async function () {
        await vault.connect(owner).rageQuit(MockDelegate.address, ERC20.address)
      })
      it('should delete lock data', async function () {
        await vault.connect(owner).rageQuit(MockDelegate.address, ERC20.address)

        expect(await vault.getLockSetCount()).to.be.eq(0)
        await expect(vault.getLockAt(0)).to.be.revertedWith(
          'EnumerableSet: index out of bounds',
        )
        expect(
          await vault.getBalanceDelegated(ERC20.address, MockDelegate.address),
        ).to.be.eq(0)
        expect(await vault.getBalanceLocked(ERC20.address)).to.be.eq(0)
      })
      it('should emit event', async function () {
        await expect(
          vault.connect(owner).rageQuit(MockDelegate.address, ERC20.address),
        )
          .to.emit(vault, 'RageQuit')
          .withArgs(MockDelegate.address, ERC20.address, false, '')
      })
      it('should return data', async function () {
        const returnData = await vault
          .connect(owner)
          .callStatic.rageQuit(MockDelegate.address, ERC20.address)

        expect(returnData.notified).to.be.false
        expect(returnData.error).to.be.eq('')
      })
    })
    describe('delegate with revert message', function () {
      beforeEach(async function () {
        await MockDelegate.setDelegateType(DelegateType.RevertWithMessage)
      })
      it('should succeed', async function () {
        await vault.connect(owner).rageQuit(MockDelegate.address, ERC20.address)
      })
      it('should delete lock data', async function () {
        await vault.connect(owner).rageQuit(MockDelegate.address, ERC20.address)

        expect(await vault.getLockSetCount()).to.be.eq(0)
        await expect(vault.getLockAt(0)).to.be.revertedWith(
          'EnumerableSet: index out of bounds',
        )
        expect(
          await vault.getBalanceDelegated(ERC20.address, MockDelegate.address),
        ).to.be.eq(0)
        expect(await vault.getBalanceLocked(ERC20.address)).to.be.eq(0)
      })
      it('should emit event', async function () {
        await expect(
          vault.connect(owner).rageQuit(MockDelegate.address, ERC20.address),
        )
          .to.emit(vault, 'RageQuit')
          .withArgs(
            MockDelegate.address,
            ERC20.address,
            false,
            'MockDelegate: revert with message',
          )
      })
      it('should return data', async function () {
        const returnData = await vault
          .connect(owner)
          .callStatic.rageQuit(MockDelegate.address, ERC20.address)

        expect(returnData.notified).to.be.false
        expect(returnData.error).to.be.eq('MockDelegate: revert with message')
      })
    })
    describe('delegate with out of gas error', function () {
      beforeEach(async function () {
        await MockDelegate.setDelegateType(DelegateType.OOG)
      })
      it('should succeed', async function () {
        await vault.connect(owner).rageQuit(MockDelegate.address, ERC20.address)
      })
      it('should delete lock data', async function () {
        await vault.connect(owner).rageQuit(MockDelegate.address, ERC20.address)

        expect(await vault.getLockSetCount()).to.be.eq(0)
        await expect(vault.getLockAt(0)).to.be.revertedWith(
          'EnumerableSet: index out of bounds',
        )
        expect(
          await vault.getBalanceDelegated(ERC20.address, MockDelegate.address),
        ).to.be.eq(0)
        expect(await vault.getBalanceLocked(ERC20.address)).to.be.eq(0)
      })
      it('should emit event', async function () {
        await expect(
          vault.connect(owner).rageQuit(MockDelegate.address, ERC20.address),
        )
          .to.emit(vault, 'RageQuit')
          .withArgs(MockDelegate.address, ERC20.address, false, '')
      })
      it('should return data', async function () {
        const returnData = await vault
          .connect(owner)
          .callStatic.rageQuit(MockDelegate.address, ERC20.address)

        expect(returnData.notified).to.be.false
        expect(returnData.error).to.be.eq('')
      })
    })
    describe('delegate is EOA', function () {
      beforeEach(async function () {
        await MockDelegate.unlock(
          vault.address,
          ERC20.address,
          ETHER,
          await signPermission(
            'unlock',
            owner,
            vault,
            MockDelegate.address,
            ERC20.address,
            ETHER,
          ),
        )
        const permission = await signPermission(
          'lock',
          owner,
          vault,
          delegate.address,
          ERC20.address,
          ETHER,
        )
        await vault.connect(delegate).lock(ERC20.address, ETHER, permission)
      })
      it('should succeed', async function () {
        await vault.connect(owner).rageQuit(delegate.address, ERC20.address)
      })
      it('should delete lock data', async function () {
        await vault.connect(owner).rageQuit(delegate.address, ERC20.address)

        expect(await vault.getLockSetCount()).to.be.eq(0)
        await expect(vault.getLockAt(0)).to.be.revertedWith(
          'EnumerableSet: index out of bounds',
        )
        expect(
          await vault.getBalanceDelegated(ERC20.address, delegate.address),
        ).to.be.eq(0)
        expect(await vault.getBalanceLocked(ERC20.address)).to.be.eq(0)
      })
      it('should emit event', async function () {
        await expect(
          vault.connect(owner).rageQuit(delegate.address, ERC20.address),
        )
          .to.emit(vault, 'RageQuit')
          .withArgs(delegate.address, ERC20.address, false, '')
      })
      it('should return data', async function () {
        const returnData = await vault
          .connect(owner)
          .callStatic.rageQuit(delegate.address, ERC20.address)

        expect(returnData.notified).to.be.false
        expect(returnData.error).to.be.eq('')
      })
    })
  })

  describe('externalCall', function () {
    describe('as non-owner', function () {
      it('should fail', async function () {
        await expect(
          vault.connect(recipient).externalCall(recipient.address, 0, '0x'),
        ).to.be.revertedWith('OwnableERC721: caller is not the owner')
      })
    })
    describe('as owner', function () {
      it('should succeed', async function () {
        await vault.connect(owner).externalCall(recipient.address, 0, '0x')
      })
    })
    describe('with calldata', function () {
      it('should succeed', async function () {
        const calldata = (await vault.populateTransaction.owner()).data
        await vault.connect(owner).externalCall(vault.address, 0, calldata)
      })
      it('should fail if calldata too short', async function () {
        const calldata = (await vault.populateTransaction.owner()).data
        await expect(
          vault
            .connect(owner)
            .externalCall(vault.address, 0, calldata?.slice(0, -2)),
        ).to.be.revertedWith('UniversalVault: calldata too short')
      })
    })
    describe('with revert', function () {
      it('should bubble revert message', async function () {
        const calldata = (
          await vault.populateTransaction.rageQuit(
            ethers.constants.AddressZero,
            ethers.constants.AddressZero,
          )
        ).data
        await expect(
          vault.connect(owner).externalCall(vault.address, 0, calldata),
        ).to.be.revertedWith('OwnableERC721: caller is not the owner')
      })
    })
    describe('after ownership transferred', function () {
      beforeEach(async function () {
        await transferNFT(
          factory,
          owner,
          owner.address,
          recipient.address,
          vault.address,
        )
      })
      it('should fail for previous owner', async function () {
        await expect(
          vault.connect(owner).externalCall(recipient.address, 0, '0x'),
        ).to.be.revertedWith('OwnableERC721: caller is not the owner')
      })
      it('should succeed for new owner', async function () {
        await vault.connect(recipient).externalCall(recipient.address, 0, '0x')
      })
    })
  })
  describe('ERC20', function () {
    let ERC20: Contract
    const totalSupply = ethers.utils.parseEther('10')
    beforeEach(async function () {
      ERC20 = await deployContract('MockERC20', [owner.address, totalSupply])
      await ERC20.connect(owner).transfer(vault.address, ETHER)
    })
    describe('ERC20:transfer', function () {
      it('should succeed', async function () {
        const calldata = (
          await ERC20.populateTransaction.transfer(recipient.address, ETHER)
        ).data
        await vault.connect(owner).externalCall(ERC20.address, 0, calldata)
      })
      it('should transfer tokens', async function () {
        const calldata = (
          await ERC20.populateTransaction.transfer(recipient.address, ETHER)
        ).data
        await vault.connect(owner).externalCall(ERC20.address, 0, calldata)

        expect(await ERC20.balanceOf(recipient.address)).to.be.eq(ETHER)
      })
      it('should fail if insufficient unlocked balance', async function () {
        const permission = await signPermission(
          'lock',
          owner,
          vault,
          delegate.address,
          ERC20.address,
          ETHER.div(2),
        )
        await vault
          .connect(delegate)
          .lock(ERC20.address, ETHER.div(2), permission)

        const calldata = (
          await ERC20.populateTransaction.transfer(recipient.address, ETHER)
        ).data
        await expect(
          vault.connect(owner).externalCall(ERC20.address, 0, calldata),
        ).to.be.revertedWith('UniversalVault: insufficient balance locked')
      })
    })
    describe('ERC20:approve', function () {
      it('should fail', async function () {
        const calldata = (
          await ERC20.populateTransaction.approve(recipient.address, ETHER)
        ).data
        await expect(
          vault.connect(owner).externalCall(ERC20.address, 0, calldata),
        ).to.be.revertedWith('UniversalVault: cannot make ERC20 approval')
      })
    })
    describe('ERC20:transferFrom', function () {
      beforeEach(async function () {
        await ERC20.connect(owner).approve(vault.address, ETHER)
      })
      it('should succeed', async function () {
        const calldata = (
          await ERC20.populateTransaction.transferFrom(
            owner.address,
            recipient.address,
            ETHER,
          )
        ).data
        await vault.connect(owner).externalCall(ERC20.address, 0, calldata)
      })
      it('should transfer tokens', async function () {
        const calldata = (
          await ERC20.populateTransaction.transferFrom(
            owner.address,
            recipient.address,
            ETHER,
          )
        ).data
        await vault.connect(owner).externalCall(ERC20.address, 0, calldata)

        expect(await ERC20.balanceOf(recipient.address)).to.be.eq(ETHER)
      })
    })
  })
  describe('ETH', function () {
    describe('ETH:receive', function () {
      it('should succeed', async function () {
        await owner.sendTransaction({
          to: vault.address,
          value: ETHER,
        })
      })
      it('should receive correct amount', async function () {
        await owner.sendTransaction({
          to: vault.address,
          value: ETHER,
        })
        expect(await ethers.provider.getBalance(vault.address)).to.eq(ETHER)
      })
    })
    describe('ETH:send', function () {
      it('should succeed', async function () {
        await vault
          .connect(owner)
          .externalCall(owner.address, ETHER, '0x', { value: ETHER })
      })
      it('should send correct amount', async function () {
        await vault
          .connect(owner)
          .externalCall(owner.address, ETHER, '0x', { value: ETHER })
        expect(await ethers.provider.getBalance(vault.address)).to.eq(0)
      })
    })
  })
})