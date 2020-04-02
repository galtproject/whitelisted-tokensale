const { contract, web3: ozWeb3 } = require('@openzeppelin/test-environment');

module.exports = function (artifacts) {
  const getContract = artifacts ? artifacts.require.bind(artifacts) : contract.fromArtifact.bind(contract);

  const OwnedUpgradeabilityProxyFactory = getContract('OwnedUpgradeabilityProxyFactory');
  const WhitelistedTokensaleFactory = getContract('WhitelistedTokensaleFactory');
  const TokensaleRegistryFactory = getContract('TokensaleRegistryFactory');
  const WhitelistedTokensale = getContract('WhitelistedTokensale');
  const TokensaleRegistry = getContract('TokensaleRegistry');

  const web3 = artifacts ? TokensaleRegistry.web3 : ozWeb3;
  const { getEventArg } = require('@galtproject/solidity-test-chest')(web3);

  WhitelistedTokensale.numberFormat = 'String';

  return {
    async deployWhitelistedTokensale(_tokenToSell, from) {
      const proxyFactory = await OwnedUpgradeabilityProxyFactory.new({from});
      const tokensaleImpl = await WhitelistedTokensale.new({from});
      const tokensaleRegistryImpl = await TokensaleRegistry.new({from});

      const tokensaleFactory = await WhitelistedTokensaleFactory.new(proxyFactory.address, tokensaleImpl.address, {from});
      const tokensaleRegistryFactory = await TokensaleRegistryFactory.new(proxyFactory.address, tokensaleRegistryImpl.address, {from});

      let res = await tokensaleRegistryFactory.build({from});
      const tokensaleRegistry = await TokensaleRegistry.at(getEventArg(res, 'Build', 'result'));
      res = await tokensaleFactory.build(_tokenToSell, tokensaleRegistry.address, {from});
      const tokensale = await WhitelistedTokensale.at(getEventArg(res, 'Build', 'result'))
      return {tokensaleRegistry, tokensale};
    }
  }
};