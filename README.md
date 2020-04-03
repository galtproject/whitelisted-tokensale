# Whitelisted ERC20 Crowdsale
Set of Ethereum smart contracts for sell ERC20 tokens by other ERC20 with specific rates. Smart contracts have admins 
and managers roles for adding customers to whitelist and ERC20 tokens for accept payments.

## Features
- Many Tokensale can use one Registry smart contract to check customers to be in whitelist
- Rates settings with possibility to define 1/1, 2/1, 1/2 or any other value
- Instant sending received fund to defined wallet
- Admins and Managers roles for parameter management of Tokensale and Registry
- Ability to pause Tokensale by admins
- Simple and flexible onchain customers and tokens lists logic by using EnumerableSet by OpenZeppelin
