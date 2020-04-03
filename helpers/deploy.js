const { contract, web3: ozWeb3 } = require('@openzeppelin/test-environment');

module.exports = function (artifacts) {
  const getContract = artifacts ? artifacts.require.bind(artifacts) : contract.fromArtifact.bind(contract);

  const OwnedUpgradeabilityProxyFactory = getContract('OwnedUpgradeabilityProxyFactory');
  const WhitelistedTokenSaleFactory = getContract('WhitelistedTokenSaleFactory');
  const TokenSaleRegistryFactory = getContract('TokenSaleRegistryFactory');
  const WhitelistedTokenSale = getContract('WhitelistedTokenSale');
  const TokenSaleRegistry = getContract('TokenSaleRegistry');

  const web3 = artifacts ? TokenSaleRegistry.web3 : ozWeb3;
  const { getEventArg } = require('@galtproject/solidity-test-chest')(web3);

  WhitelistedTokenSale.numberFormat = 'String';

  return {
    async deployWhitelistedTokenSale(_tokenToSell, from) {
      const [proxyFactory, tokenSaleImpl, tokenSaleRegistryImpl] = await Promise.all([
        OwnedUpgradeabilityProxyFactory.new({from}),
        WhitelistedTokenSale.new({from}),
        TokenSaleRegistry.new({from})
      ]);
      await Promise.all([
        tokenSaleImpl.initialize(from, from, from),
        tokenSaleRegistryImpl.initialize(from)
      ]);
      const [tokenSaleFactory, tokenSaleRegistryFactory] = await Promise.all([
        WhitelistedTokenSaleFactory.new(proxyFactory.address, tokenSaleImpl.address, {from}),
        TokenSaleRegistryFactory.new(proxyFactory.address, tokenSaleRegistryImpl.address, {from})
      ]);

      let res = await tokenSaleRegistryFactory.build({from});
      const tokenSaleRegistry = await TokenSaleRegistry.at(getEventArg(res, 'Build', 'result'));
      res = await tokenSaleFactory.build(_tokenToSell, tokenSaleRegistry.address, {from});
      const tokenSale = await WhitelistedTokenSale.at(getEventArg(res, 'Build', 'result'))
      return {tokenSaleRegistry, tokenSale};
    }
  }
};