/*
 * Copyright ©️ 2018-2020 Galt•Project Society Construction and Terraforming Company
 * (Founded by [Nikolai Popeka](https://github.com/npopeka)
 *
 * Copyright ©️ 2018-2020 Galt•Core Blockchain Company
 * (Founded by [Nikolai Popeka](https://github.com/npopeka) by
 * [Basic Agreement](ipfs/QmaCiXUmSrP16Gz8Jdzq6AJESY1EAANmmwha15uR3c1bsS)).
 */

pragma solidity ^0.5.13;


interface IWhitelistedTokenSale {
  event SetTokenSaleRegistry(address indexed tokenSaleRegistry, address indexed admin, bool enabled);
  event SetWallet(address indexed wallet, address indexed admin);
  event UpdateCustomerToken(address indexed token, uint256 rateMul, uint256 rateDiv, address indexed admin);
  event RemoveCustomerToken(address indexed token, address indexed admin);
  event BuyTokens(address indexed spender, address indexed customer, address indexed token, uint256 tokenAmount, uint256 resultAmount);
}