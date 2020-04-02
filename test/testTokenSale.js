const { accounts, contract, web3 } = require('@openzeppelin/test-environment');
// const { assert } = require('chai');

const MintableErc20Token = contract.fromArtifact('ERC20Mintable');

const { ether, assertRevert } = require('@galtproject/solidity-test-chest')(web3);

const { deployWhitelistedTokensale } = require('../helpers/deploy');

MintableErc20Token.numberFormat = 'String';

// const { utf8ToHex } = web3.utils;
// const bytes32 = utf8ToHex;

describe('WhitelistedTokensale', () => {
  const [owner, bob, charlie, dan, minter, fakeCVManager] = accounts;
  let hodler;

  beforeEach(async function() {
    this.mainToken = await MintableErc20Token.new();
    await this.mainToken.mint(owner, ether(1000));

    this.daiToken = await MintableErc20Token.new();
    await this.daiToken.mint(bob, ether(1000));

    this.tusdToken = await MintableErc20Token.new();
    await this.tusdToken.mint(bob, ether(1000));

    this.xchfToken = await MintableErc20Token.new();
    await this.xchfToken.mint(bob, ether(1000));

    const {tokensaleRegistry, tokensale} = await deployWhitelistedTokensale(this.mainToken.address);
    this.tokenSaleRegistry = tokensaleRegistry;
    this.tokenSale = tokensale;

    await this.tokenSale.addToken(this.daiToken.address, '1', '1', {from: owner});
    await this.tokenSale.addToken(this.tusdToken.address, '1', '2', {from: owner});
    await this.tokenSale.addToken(this.xchfToken.address, '2', '1', {from: owner});
  });

  describe('deposits/withdrawals', () => {
    it('should allow making deposit several times while withdrawal only once', async function() {
      await this.mainToken.approve(this.daiToken.address, ether(42), { from: charlie });
      await assertRevert(
        this.tokenSale.buyTokens(this.daiToken.address, charlie, ether(42), { from: charlie }),
        'TokensaleRegistry: Msg sender is not in whitelist'
      );
    });
  });
});
