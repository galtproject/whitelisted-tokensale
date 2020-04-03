<h3 align="center">Whitelisted ERC20 TokenSale Contracts (@whitelisted-tokensale)</h3><div align="center"></div>

[@whitelisted-tokensale](https://github.com/galtproject/whitelisted-tokensale) is a set of Ethereum smart contracts for the sale of ERC20 tokens for others ERC20 tokens with specific rates. 

Smart contracts have Administrators and Managers roles. These roles are designed to:
- manage the whitelist of customers;
- add and remove ERC20 tokens for which sale is carried out;
- define exchange rates;
- set a wallet where tokens received from the sale will be sent;
- pause tokens sale if necessary.

:construction: **[@whitelisted-tokensale](https://github.com/galtproject/whitelisted-tokensale) stage: :tada:Ethereum Mainnet:tada:**

:bomb: **Security review status: At the moment, [@whitelisted-tokensale](https://github.com/galtproject/whitelisted-tokensale) contracts are deployed on the Ethereum mainnet. Nonetheless it is still experimental software that has not yet been publicly audited. Use it on your own risk!**

## Features
- many Tokensale can use one Registry smart contract to check customers to be in whitelist;
- rates settings with possibility to define 1/1, 2/1, 1/2 or any other value;
- instant sending received fund to defined wallet;
- admins and Managers roles for parameter management of Tokensale and Registry;
- ability to pause Tokensale by admins;
- simple and flexible onchain customers and tokens lists logic by using EnumerableSet by OpenZeppelin.

## Usage

* `make cleanup` - remove solidity build artifacts
* `make compile` - compile solidity files, executes `make cleanup` before compilation
* `make test` - run tests
* `make lint` - run solidity and javascript linters

For more information check out `Makefile`
