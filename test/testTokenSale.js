const {accounts, contract, web3} = require('@openzeppelin/test-environment');
const {assert} = require('chai');

const MintableErc20Token = contract.fromArtifact('ERC20Mintable');
const NewTokensaleRegistryVer = contract.fromArtifact('NewTokensaleRegistryVer');
const NewWhitelistedTokensaleVer = contract.fromArtifact('NewWhitelistedTokensaleVer');
const OwnedUpgradeabilityProxy = contract.fromArtifact('OwnedUpgradeabilityProxy');

const {ether, assertRevert} = require('@galtproject/solidity-test-chest')(web3);

const {deployWhitelistedTokensale} = require('../helpers/deploy')();

MintableErc20Token.numberFormat = 'String';

// const { utf8ToHex } = web3.utils;
// const bytes32 = utf8ToHex;

describe('WhitelistedTokensale', () => {
  const [owner, bob, charlie, dan, wallet, alice] = accounts;

  beforeEach(async function () {
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
    await this.tokenSale.addCustomerToken(this.tusdToken.address, '1', '2', {from: owner});
    await this.tokenSale.addCustomerToken(this.xchfToken.address, '2', '1', {from: owner});
  });

  describe('initiate', () => {
    it('should initialized successfully', async function () {
      assert.equal(await this.tokenSaleRegistry.initialized(), true);
      assert.equal(await this.tokenSale.initialized(), true);

      assert.equal(await this.tokenSaleRegistry.isAdmin(owner), true);
      assert.equal(await this.tokenSaleRegistry.owner(), owner);
      assert.equal(await this.tokenSale.isAdmin(owner), true);
      assert.equal(await this.tokenSale.owner(), owner);

      assert.equal(await this.tokenSale.wallet(), wallet);
      assert.equal(await this.tokenSale.tokenToSell(), this.mainToken.address);
      assert.sameMembers(await this.tokenSale.getCustomerTokenList(), [
        this.daiToken.address,
        this.tusdToken.address,
        this.xchfToken.address
      ]);
      assert.equal(await this.tokenSale.getCustomerTokenCount(), '3');
      assert.equal(await this.tokenSale.isTokenAvailable(this.daiToken.address), true);
      assert.equal(await this.tokenSale.isTokenAvailable(dan), false);
    });
  });

  describe('administrate', () => {
    it('should add and remove admins correctly', async function () {
      assert.equal(await this.tokenSaleRegistry.isAdmin(dan), false);
      assert.equal(await this.tokenSaleRegistry.isManager(dan), false);
      assert.equal(await this.tokenSaleRegistry.isCustomerInWhiteList(bob), false);

      await assertRevert(
        this.tokenSaleRegistry.addCustomerToWhiteList(bob, {from: dan}),
        'Managered: Msg sender is not admin or manager'
      );

      await assertRevert(
        this.tokenSaleRegistry.removeCustomerFromWhiteList(bob, {from: dan}),
        'Managered: Msg sender is not admin or manager'
      );

      await assertRevert(
        this.tokenSaleRegistry.addManager(alice, {from: dan}),
        'Administrated: Msg sender is not admin'
      );

      await assertRevert(
        this.tokenSaleRegistry.removeManager(alice, {from: dan}),
        'Administrated: Msg sender is not admin'
      );

      await this.tokenSaleRegistry.addAdmin(dan, {from: owner});

      await assertRevert(
        this.tokenSaleRegistry.addAdmin(alice, {from: dan}),
        'Ownable: caller is not the owner'
      );
      await assertRevert(
        this.tokenSaleRegistry.removeAdmin(alice, {from: dan}),
        'Ownable: caller is not the owner'
      );

      assert.equal(await this.tokenSaleRegistry.isAdmin(dan), true);

      await this.tokenSaleRegistry.addCustomerToWhiteList(bob, {from: dan});

      assert.equal(await this.tokenSaleRegistry.isCustomerInWhiteList(bob), true);

      assert.equal(await this.tokenSaleRegistry.isManager(alice), false);
      await this.tokenSaleRegistry.addManager(alice, {from: dan});
      assert.equal(await this.tokenSaleRegistry.isManager(alice), true);
    });

    it('should add and remove managers correctly', async function () {
      assert.equal(await this.tokenSaleRegistry.isManager(dan), false);
      assert.equal(await this.tokenSaleRegistry.isCustomerInWhiteList(bob), false);

      await assertRevert(
        this.tokenSaleRegistry.addCustomerToWhiteList(bob, {from: dan}),
        'Managered: Msg sender is not admin or manager'
      );

      await this.tokenSaleRegistry.addManager(dan, {from: owner});

      assert.equal(await this.tokenSaleRegistry.isManager(dan), true);

      await this.tokenSaleRegistry.addCustomerToWhiteList(bob, {from: dan});

      assert.equal(await this.tokenSaleRegistry.isCustomerInWhiteList(bob), true);
    });
  });

  describe('buyTokens', () => {
    it('should successfully buyTokens', async function () {
      await this.tokenSaleRegistry.addCustomerToWhiteList(bob, {from: owner});

      await this.daiToken.approve(this.tokenSale.address, ether(42), {from: bob});

      assert.equal(await this.daiToken.allowance(bob, this.tokenSale.address), ether(42));

      await this.tokenSale.buyTokens(this.daiToken.address, bob, ether(42), {from: bob});

      assert.equal(await this.mainToken.balanceOf(bob), ether(42));
      assert.equal(await this.daiToken.balanceOf(bob), ether(1000 - 42));
      assert.equal(await this.daiToken.balanceOf(wallet), ether(42));

      let tokenInfo = await this.tokenSale.customerTokenInfo(this.daiToken.address);
      assert.equal(tokenInfo.totalReceived, ether(42));
      assert.equal(tokenInfo.totalSold, ether(42));

      // buy by another person(dan) for customer (bob)
      await this.daiToken.approve(this.tokenSale.address, ether(42), {from: dan});
      await this.tokenSale.buyTokens(this.daiToken.address, bob, ether(42), {from: dan});
      assert.equal(await this.mainToken.balanceOf(bob), ether(84));
      assert.equal(await this.daiToken.balanceOf(dan), ether(1000 - 42));
      assert.equal(await this.daiToken.balanceOf(wallet), ether(84));

      tokenInfo = await this.tokenSale.customerTokenInfo(this.daiToken.address);
      assert.equal(tokenInfo.totalReceived, ether(84));
      assert.equal(tokenInfo.totalSold, ether(84));
    });

    it('should successfully buyTokens with rate 1/2', async function () {
      await this.tokenSaleRegistry.addCustomerToWhiteList(bob, {from: owner});

      await this.tusdToken.approve(this.tokenSale.address, ether(42), {from: bob});

      assert.equal(await this.tusdToken.allowance(bob, this.tokenSale.address), ether(42));

      await this.tokenSale.buyTokens(this.tusdToken.address, bob, ether(42), {from: bob});

      assert.equal(await this.mainToken.balanceOf(bob), await this.tokenSale.getTokenAmount(
        this.tusdToken.address,
        ether(42)
      ));
      assert.equal(await this.mainToken.balanceOf(bob), ether(21));
      assert.equal(await this.tusdToken.balanceOf(bob), ether(1000 - 42));
      assert.equal(await this.tusdToken.balanceOf(wallet), ether(42));

      let tokenInfo = await this.tokenSale.customerTokenInfo(this.tusdToken.address);
      assert.equal(tokenInfo.totalReceived, ether(42));
      assert.equal(tokenInfo.totalSold, ether(21));

      // buy again, but by 10 tokens
      await this.tusdToken.approve(this.tokenSale.address, ether(10), {from: bob});
      await this.tokenSale.buyTokens(this.tusdToken.address, bob, ether(10), {from: bob});

      assert.equal(await this.mainToken.balanceOf(bob), ether(21 + 5));
      assert.equal(await this.tusdToken.balanceOf(bob), ether(1000 - 42 - 10));
      assert.equal(await this.tusdToken.balanceOf(wallet), ether(42 + 10));

      tokenInfo = await this.tokenSale.customerTokenInfo(this.tusdToken.address);
      assert.equal(tokenInfo.totalReceived, ether(42 + 10));
      assert.equal(tokenInfo.totalSold, ether(21 + 5));
    });

    it('should successfully buyTokens with rate 2/1', async function () {
      await this.tokenSaleRegistry.addCustomerToWhiteList(bob, {from: owner});

      await this.xchfToken.approve(this.tokenSale.address, ether(42), {from: bob});

      assert.equal(await this.xchfToken.allowance(bob, this.tokenSale.address), ether(42));

      await this.tokenSale.buyTokens(this.xchfToken.address, bob, ether(42), {from: bob});

      assert.equal(await this.mainToken.balanceOf(bob), ether(84));
      assert.equal(await this.xchfToken.balanceOf(bob), ether(1000 - 42));
      assert.equal(await this.xchfToken.balanceOf(wallet), ether(42));

      const tokenInfo = await this.tokenSale.customerTokenInfo(this.xchfToken.address);
      assert.equal(tokenInfo.totalReceived, ether(42));
      assert.equal(tokenInfo.totalSold, ether(84));

      await assertRevert(
        this.tokenSale.updateCustomerToken(this.xchfToken.address, '4', '1', {from: bob}),
        'Administrated: Msg sender is not admin'
      );

      // update rates and by again
      await this.tokenSale.updateCustomerToken(this.xchfToken.address, '4', '1', { from: owner });

      await this.xchfToken.approve(this.tokenSale.address, ether(10), {from: bob});
      await this.tokenSale.buyTokens(this.xchfToken.address, bob, ether(10), {from: bob});

      assert.equal(await this.mainToken.balanceOf(bob), ether(84 + 40));
      assert.equal(await this.xchfToken.balanceOf(bob), ether(1000 - 42 - 10));
      assert.equal(await this.xchfToken.balanceOf(wallet), ether(42 + 10));
    });

    it('pause should work properly', async function () {
      await assertRevert(
        this.tokenSale.pause({from: dan}),
        'Administrated: Msg sender is not admin'
      );

      await this.tokenSale.pause({from: owner});

      await this.tokenSaleRegistry.addCustomerToWhiteList(bob, {from: owner});

      await this.daiToken.approve(this.tokenSale.address, ether(42), {from: bob});

      await assertRevert(
        this.tokenSale.buyTokens(this.daiToken.address, bob, ether(42), {from: bob}),
        'Pausable: paused'
      );

      await this.tokenSale.unpause({from: owner});

      await this.daiToken.approve(this.tokenSale.address, ether(42), {from: bob});
      await this.tokenSale.buyTokens(this.daiToken.address, bob, ether(42), {from: bob});
    });

    it('should prevent buyTokens with unacceptable conditions', async function () {
      await this.daiToken.approve(this.tokenSale.address, ether(42), {from: charlie});

      await assertRevert(
        this.tokenSale.buyTokens(this.daiToken.address, charlie, ether(42), {from: charlie}),
        'TokensaleRegistry: Recipient is not in whitelist'
      );

      await assertRevert(
        this.tokenSaleRegistry.addCustomerToWhiteList(charlie, {from: charlie}),
        'Managered: Msg sender is not admin or manager'
      );

      await this.tokenSaleRegistry.addCustomerToWhiteList(charlie, {from: owner});

      await assertRevert(
        this.tokenSale.buyTokens(this.daiToken.address, charlie, ether(42), {from: charlie}),
        'SafeERC20: low-level call failed'
      );

      await assertRevert(
        this.tokenSale.buyTokens(this.daiToken.address, bob, ether(42), {from: charlie}),
        'TokensaleRegistry: Recipient is not in whitelist'
      );
    });

    it('should correctly upgrade tokensale and registry', async function () {
      await this.tokenSaleRegistry.addManager(dan, {from: owner});
      await this.tokenSaleRegistry.addCustomerToWhiteList(bob, {from: owner});

      const newTokensaleImpl = await NewWhitelistedTokensaleVer.new({from: owner});
      const newTokensaleRegistryImpl = await NewTokensaleRegistryVer.new({from: owner});

      await newTokensaleImpl.initialize(owner, owner, owner, {from: owner});
      await newTokensaleRegistryImpl.initialize(owner, {from: owner});

      const tokenSaleToUpgrade = await OwnedUpgradeabilityProxy.at(this.tokenSale.address);
      await tokenSaleToUpgrade.upgradeTo(newTokensaleImpl.address, {from: owner});

      const tokenSaleRegistryToUpgrade = await OwnedUpgradeabilityProxy.at(this.tokenSaleRegistry.address);
      await tokenSaleRegistryToUpgrade.upgradeTo(newTokensaleRegistryImpl.address, {from: owner});

      const newTokensaleVer = await NewWhitelistedTokensaleVer.at(this.tokenSale.address);
      const newTokensaleRegistryVer = await NewTokensaleRegistryVer.at(this.tokenSaleRegistry.address);

      //check the new features
      assert.equal(await newTokensaleVer.getCustomerTokenCount(), '999');
      await newTokensaleVer.setFoo('foo');
      assert.equal(await newTokensaleVer.bar(), 'foo');

      assert.equal(await newTokensaleRegistryVer.getCustomersWhiteListCount(), '999');
      await newTokensaleRegistryVer.setRegistryFoo('foo2');
      assert.equal(await newTokensaleRegistryVer.registryBar(), 'foo2');

      // check the previous state
      assert.equal(await newTokensaleVer.wallet(), wallet);
      assert.equal(await newTokensaleVer.tokenToSell(), this.mainToken.address);
      assert.sameMembers(await newTokensaleVer.getCustomerTokenList(), [
        this.daiToken.address,
        this.tusdToken.address,
        this.xchfToken.address
      ]);
      assert.equal(await newTokensaleVer.isTokenAvailable(this.daiToken.address), true);
      assert.equal(await newTokensaleVer.isTokenAvailable(dan), false);

      assert.equal(await newTokensaleRegistryVer.isManager(dan), true);
      assert.equal(await newTokensaleRegistryVer.isCustomerInWhiteList(bob), true);
      assert.sameMembers(await newTokensaleRegistryVer.getCustomersWhiteList(), [bob]);
    });
  });
});
