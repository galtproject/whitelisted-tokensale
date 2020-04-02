const { accounts, contract, web3 } = require('@openzeppelin/test-environment');
const { assert } = require('chai');

const MintableErc20Token = contract.fromArtifact('ERC20Mintable');

const { ether, assertRevert } = require('@galtproject/solidity-test-chest')(web3);

const { deployWhitelistedTokensale } = require('../helpers/deploy');

MintableErc20Token.numberFormat = 'String';

// const { utf8ToHex } = web3.utils;
// const bytes32 = utf8ToHex;

describe('WhitelistedTokensale', () => {
  const [owner, bob, charlie, dan, wallet, fakeCVManager] = accounts;

  beforeEach(async function() {
    this.mainToken = await MintableErc20Token.new();
    await this.mainToken.mint(owner, ether(1000));

    this.daiToken = await MintableErc20Token.new();
    await this.daiToken.mint(bob, ether(1000));
    await this.daiToken.mint(dan, ether(1000));

    this.tusdToken = await MintableErc20Token.new();
    await this.tusdToken.mint(bob, ether(1000));
    await this.tusdToken.mint(dan, ether(1000));

    this.xchfToken = await MintableErc20Token.new();
    await this.xchfToken.mint(bob, ether(1000));
    await this.xchfToken.mint(dan, ether(1000));

    const {tokensaleRegistry, tokensale} = await deployWhitelistedTokensale(this.mainToken.address, owner);
    this.tokenSaleRegistry = tokensaleRegistry;
    this.tokenSale = tokensale;

    await this.mainToken.mint(this.tokenSale.address, ether(1000));

    await this.tokenSale.setWallet(wallet, {from: owner});

    await this.tokenSale.addCustomerToken(this.daiToken.address, '1', '1', {from: owner});
    await this.tokenSale.addCustomerToken(this.daiToken.address, '1', '1', {from: owner});
    await this.tokenSale.addCustomerToken(this.tusdToken.address, '1', '2', {from: owner});
    await this.tokenSale.addCustomerToken(this.xchfToken.address, '2', '1', {from: owner});
  });

  describe('buyTokens', () => {
    it('should successfully buyTokens', async function() {
      await this.tokenSaleRegistry.addCustomerToWhiteList(bob, {from: owner});

      await this.daiToken.approve(this.tokenSale.address, ether(42), { from: bob });

      assert.equal(await this.daiToken.allowance(bob, this.tokenSale.address), ether(42));

      const res = await this.tokenSale.buyTokens(this.daiToken.address, bob, ether(42), { from: bob });

      assert.equal(await this.mainToken.balanceOf(bob), ether(42));
      assert.equal(await this.daiToken.balanceOf(bob), ether(1000 - 42));
      assert.equal(await this.daiToken.balanceOf(wallet), ether(42));
    });

    it('should prevent buyTokens with unacceptable conditions', async function() {
      await this.daiToken.approve(this.tokenSale.address, ether(42), { from: charlie });

      await assertRevert(
        this.tokenSale.buyTokens(this.daiToken.address, charlie, ether(42), { from: charlie }),
        'TokensaleRegistry: Recipient is not in whitelist'
      );

      await assertRevert(
        this.tokenSaleRegistry.addCustomerToWhiteList(charlie, { from: charlie }),
        'Managered: Msg sender is not admin or manager'
      );

      await this.tokenSaleRegistry.addCustomerToWhiteList(charlie, {from: owner});

      await assertRevert(
        this.tokenSale.buyTokens(this.daiToken.address, charlie, ether(42), { from: charlie }),
        'SafeERC20: low-level call failed'
      );

      await assertRevert(
        this.tokenSale.buyTokens(this.daiToken.address, bob, ether(42), { from: charlie }),
        'TokensaleRegistry: Recipient is not in whitelist'
      );
    });
  });
});
