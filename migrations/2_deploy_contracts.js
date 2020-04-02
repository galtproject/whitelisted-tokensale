// eslint-disable-next-line no-unused-vars

const { deployWhitelistedTokensale } = require('../helpers/deploy');

module.exports = function(deployer) {

  deployer.then(async () => {
    const mainToken = await MintableErc20Token.new();

    const {tokensaleRegistry, tokensale} = await deployWhitelistedTokensale(mainToken.address, owner);

  });
};
