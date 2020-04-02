const ERC20Token = artifacts.require('ERC20Token');
const pIteration = require('p-iteration');
const web3Utils = require('web3-utils');
const fs = require('fs');
const path = require('path');

const { deployWhitelistedTokensale } = require('../helpers/deploy')(artifacts);

module.exports = function(deployer, network, accounts) {

  deployer.then(async () => {
    const owner = '0xB844C65F3E161061bA5D5dD8497B3C04B71c4c83';
    const wallet = '0xB844C65F3E161061bA5D5dD8497B3C04B71c4c83';
    const mainToken = await ERC20Token.new('CARToken', 'CART', '18');

    const testStableToken1 = await ERC20Token.new('TESTStable 1', 'TST1', '18');
    const testStableToken2 = await ERC20Token.new('TESTStable 2', 'TST2', '18');

    await testStableToken1.mint(owner, web3Utils.toWei((10 ** 6).toString(), 'ether'));
    await testStableToken2.mint(owner, web3Utils.toWei((10 ** 6).toString(), 'ether'));

    const {tokensaleRegistry, tokensale} = await deployWhitelistedTokensale(mainToken.address, accounts[0]);

    await mainToken.mint(tokensale.address, web3Utils.toWei((10 ** 6).toString(), 'ether'));

    await tokensaleRegistry.addAdmin(owner);
    await tokensale.addAdmin(owner);
    await tokensale.setWallet(wallet);
    await tokensale.addCustomerToken(testStableToken1.address, '1', '1');
    await tokensale.addCustomerToken(testStableToken2.address, '1', '1');

    await tokensaleRegistry.removeAdmin(accounts[0]);
    await tokensale.removeAdmin(accounts[0]);

    await pIteration.forEachSeries([mainToken, testStableToken1, testStableToken2, tokensale, tokensaleRegistry], (contract) =>{
      return contract.transferOwnership(owner);
    });

    const contractsData = {
      mainTokenAddress: mainToken.address,
      testStableToken1Address: testStableToken1.address,
      testStableToken2Address: testStableToken2.address,
      tokensaleAddress: tokensale.address,
      tokensaleAbi: tokensale.abi,
      tokensaleRegistryAddress: tokensaleRegistry.address,
      tokensaleRegistryAbi: tokensaleRegistry.abi
    };

    fs.writeFileSync(path.join(__dirname, 'deployed', network + '.json'), JSON.stringify(contractsData, null, 2));
  });
};
