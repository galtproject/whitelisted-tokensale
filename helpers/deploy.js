const { contract, web3 } = require('@openzeppelin/test-environment');
const { assert } = require('chai');

const OwnedUpgradeabilityProxyFactory = contract.fromArtifact('OwnedUpgradeabilityProxyFactory');
const WhitelistedTokensaleFactory = contract.fromArtifact('WhitelistedTokensaleFactory');
const TokensaleRegistryFactory = contract.fromArtifact('TokensaleRegistryFactory');
const WhitelistedTokensale = contract.fromArtifact('WhitelistedTokensale');
const TokensaleRegistry = contract.fromArtifact('TokensaleRegistry');

WhitelistedTokensale.numberFormat = 'String';

const { getEventArg } = require('@galtproject/solidity-test-chest')(web3);

async function deployWhitelistedTokensale(_tokenToSell, from) {
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

module.exports = {
  deployWhitelistedTokensale
};