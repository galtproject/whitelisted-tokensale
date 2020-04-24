const ERC20Token = artifacts.require('ERC20Token');
const pIteration = require('p-iteration');
const web3Utils = require('web3-utils');
const fs = require('fs');
const path = require('path');

const { deployWhitelistedTokenSale } = require('../helpers/deploy')(artifacts);

module.exports = function(deployer, network, accounts) {

  deployer.then(async () => {
    const owner = '0xB844C65F3E161061bA5D5dD8497B3C04B71c4c83';
    const wallet = '0xB844C65F3E161061bA5D5dD8497B3C04B71c4c83';
    const mainToken = await ERC20Token.new('CARToken', 'CART', '18');

    const testStableToken1 = await ERC20Token.new('TESTStable 1', 'TST1', '18');
    const testStableToken2 = await ERC20Token.new('TESTStable 2', 'TST2', '18');

    await testStableToken1.mint(owner, web3Utils.toWei((10 ** 6).toString(), 'ether'));
    await testStableToken2.mint(owner, web3Utils.toWei((10 ** 6).toString(), 'ether'));

    const {tokenSaleRegistry, tokenSale} = await deployWhitelistedTokenSale(mainToken.address, accounts[0], owner);

    await tokenSale.addAdmin(accounts[0]);

    await Promise.all([
      mainToken.mint(tokenSale.address, web3Utils.toWei((10 ** 6).toString(), 'ether')),
      tokenSaleRegistry.addAdmin(owner),
      tokenSale.addAdmin(owner),
      tokenSale.setWallet(wallet),
      tokenSale.addOrUpdateCustomerToken(testStableToken1.address, '1', '1'),
      tokenSale.addOrUpdateCustomerToken(testStableToken2.address, '1', '1')
    ]);

    await Promise.all([
      tokenSaleRegistry.removeAdmin(accounts[0]),
      tokenSale.removeAdmin(accounts[0])
    ]);

    await Promise.all([
      tokenSaleRegistry.transferOwnership(owner),
      tokenSale.transferOwnership(owner)
    ]);

    const contractsData = {
      mainTokenAddress: mainToken.address,
      testStableToken1Address: testStableToken1.address,
      testStableToken2Address: testStableToken2.address,
      tokenSaleAddress: tokenSale.address,
      tokenSaleAbi: tokenSale.abi,
      tokenSaleRegistryAddress: tokenSaleRegistry.address,
      tokenSaleRegistryAbi: tokenSaleRegistry.abi
    };

    const deployDirectory = `${__dirname}/../deployed`;
    if (!fs.existsSync(deployDirectory)) {
      fs.mkdirSync(deployDirectory);
    }

    fs.writeFileSync(path.join(deployDirectory, network + '.json'), JSON.stringify(contractsData, null, 2));
  });
};
