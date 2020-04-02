/*
 * Copyright ©️ 2018-2020 Galt•Project Society Construction and Terraforming Company
 * (Founded by [Nikolai Popeka](https://github.com/npopeka)
 *
 * Copyright ©️ 2018-2020 Galt•Core Blockchain Company
 * (Founded by [Nikolai Popeka](https://github.com/npopeka) by
 * [Basic Agreement](ipfs/QmaCiXUmSrP16Gz8Jdzq6AJESY1EAANmmwha15uR3c1bsS)).
 */

pragma solidity ^0.5.13;


interface IWhitelistedTokensale {
    event SetTokensaleRegistry(address indexed tokensaleRegistry, address indexed admin);
    event SetWallet(address indexed wallet, address indexed admin);
    event AddToken(address indexed token, uint256 _rateMul, uint256 _rateDiv, address indexed admin);
    event UpdateToken(address indexed token, uint256 _rateMul, uint256 _rateDiv, address indexed admin);
    event RemoveToken(address indexed token, address indexed admin);
    event BuyTokens(address indexed spender, address indexed customer, address indexed token, uint256 tokenAmount, uint256 resultAmount);
}