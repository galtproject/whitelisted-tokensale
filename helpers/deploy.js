const { contract, web3 } = require('@openzeppelin/test-environment');
const { assert } = require('chai');

const OwnedUpgradeabilityProxyFactory = contract.fromArtifact('OwnedUpgradeabilityProxyFactory');
const WhitelistedTokensaleFactory = contract.fromArtifact('WhitelistedTokensaleFactory');
const TokensaleRegistryFactory = contract.fromArtifact('TokensaleRegistryFactory');
const WhitelistedTokensale = contract.fromArtifact('WhitelistedTokensale');
const TokensaleRegistry = contract.fromArtifact('TokensaleRegistry');

async function deployWhitelistedTokensale(_tokenToSell) {
  const proxyFactory = await OwnedUpgradeabilityProxyFactory.new();
  const tokensaleImpl = await WhitelistedTokensale.new();
  const tokensaleRegistryImpl = await TokensaleRegistry.new();

  const tokensaleFactory = await WhitelistedTokensaleFactory.new(proxyFactory.address, tokensaleImpl.address);
  const tokensaleRegistryFactory = await TokensaleRegistryFactory.new(proxyFactory.address, tokensaleRegistryImpl.address);

  const tokensaleRegistry = await tokensaleRegistryFactory.build();
  const tokensale = await tokensaleFactory.build(_tokenToSell, tokensaleRegistry.address);
  return {tokensaleRegistry, tokensale};
}

module.exports = {
  deployWhitelistedTokensale
};