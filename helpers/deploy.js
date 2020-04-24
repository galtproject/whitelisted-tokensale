const { contract, web3: ozWeb3 } = require('@openzeppelin/test-environment');
const { ZWeb3, SimpleProject, Contracts } = require('@openzeppelin/upgrades');

module.exports = function (artifacts) {
  const getContract = artifacts ? artifacts.require.bind(artifacts) : Contracts.getFromLocal.bind(contract);
  const getResultContract = artifacts ? artifacts.require.bind(artifacts) : contract.fromArtifact.bind(contract);

  if (!artifacts) {
    ZWeb3.initialize(ozWeb3.currentProvider);
  }
  const WhitelistedTokenSale = getContract('WhitelistedTokenSale');
  const TokenSaleRegistry = getContract('TokenSaleRegistry');

  WhitelistedTokenSale.numberFormat = 'String';

  return {
    async deployWhitelistedTokenSale(_tokenToSell, from, proxyAdmin) {
      const tokenSaleProject = new SimpleProject('TokenSale', null, { from });

      const tokenSaleRegistry = await tokenSaleProject.createProxy(TokenSaleRegistry, {
        initArgs: [from],
        admin: proxyAdmin
      });
      const tokenSale = await tokenSaleProject.createProxy(WhitelistedTokenSale, {
        initArgs: [from, _tokenToSell, tokenSaleRegistry.address],
        admin: proxyAdmin
      });
      return {
        tokenSaleRegistry: await getResultContract('TokenSaleRegistry').at(tokenSaleRegistry._address),
        tokenSale: await getResultContract('WhitelistedTokenSale').at(tokenSale._address)
      };
    }
  }
};