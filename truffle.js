const Ganache = require('ganache-core');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const web3 = require('web3');

function getProvider(rpc) {
  return function() {
    const provider = new web3.providers.WebsocketProvider(rpc);
    return new HDWalletProvider(process.env.DEPLOYMENT_KEY, provider);
  };
}

const config = {
  networks: {
    local: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*'
    },
    kovan: {
      gasPrice: 1000 * 1000 * 1000,
      gasLimit: 10 * 1000 * 1000,
      provider: getProvider('wss://wss-rpc.kovan.galtproject.io'),
      // provider: getProvider('https://kovan.poa.network'),
      // provider: getProvider('wss://kovan.infura.io/ws/v3/83ea24ff57c3420abe37f03312bbafc1'),
      websockets: true,
      skipDryRun: true,
      network_id: '42'
    },
    test: {
      // https://github.com/trufflesuite/ganache-core#usage
      provider: Ganache.provider({
        unlocked_accounts: [0, 1, 2, 3, 4, 5],
        total_accounts: 30,
        debug: true,
        vmErrorsOnRPCResponse: true,
        default_balance_ether: 5000000,
        // 7 800 000
        gasLimit: 0x7704c0
      }),
      skipDryRun: true,
      network_id: '*'
    }
  },
  compilers: {
    solc: {
      version: process.env.SOLC || 'native',
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      },
      evmVersion: 'petersburg'
    }
  }
};

if (process.env.SOLIDITY_COVERAGE === 'yes') {
  delete config.networks.test;
}

module.exports = config;
