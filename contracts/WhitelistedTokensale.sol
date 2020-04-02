/*
 * Copyright ©️ 2018-2020 Galt•Project Society Construction and Terraforming Company
 * (Founded by [Nikolai Popeka](https://github.com/npopeka)
 *
 * Copyright ©️ 2018-2020 Galt•Core Blockchain Company
 * (Founded by [Nikolai Popeka](https://github.com/npopeka) by
 * [Basic Agreement](ipfs/QmaCiXUmSrP16Gz8Jdzq6AJESY1EAANmmwha15uR3c1bsS)).
 */

pragma solidity ^0.5.13;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./interfaces/IWhitelistedTokensale.sol";
import "./interfaces/ITokensaleRegistry.sol";
import "./traits/Administrated.sol";


contract WhitelistedTokensale is Administrated, IWhitelistedTokensale {
  using EnumerableSet for EnumerableSet.AddressSet;
  using SafeERC20 for IERC20;
  using SafeMath for uint256;

  EnumerableSet.AddressSet public customersWhiteList;
  EnumerableSet.AddressSet public tokens;

  IERC20 public tokenToSell;
  ITokensaleRegistry public tokensaleRegistry;

  address public wallet;

  struct TokenInfo {
    uint256 rateMul;
    uint256 rateDiv;
    uint256 totalReceived;
    uint256 totalSold;
  }

  mapping(address => TokenInfo) public tokenInfo;

  constructor(address _tokenToSell, address _tokensaleRegistry) public {
    tokenToSell = IERC20(_tokenToSell);
    tokensaleRegistry = ITokensaleRegistry(_tokensaleRegistry);
  }

  function setTokensaleRegistry(ITokensaleRegistry _tokensaleRegistry) onlyAdmin external {
    tokensaleRegistry = _tokensaleRegistry;
  }

  function addToken(address _token, uint256 rateMul, uint256 rateDiv) onlyAdmin external {
    tokens.add(_token);
    tokenInfo[_token].rateMul = _rateMul;
    tokenInfo[_token].rateDiv = _rateDiv;
  }

  function updateToken(address _token, uint256 rateMul, uint256 rateDiv) onlyAdmin external {
    tokenInfo[_token].rateMul = _rateMul;
    tokenInfo[_token].rateDiv = _rateDiv;
  }

  function removeToken(address _token) onlyAdmin external {
    tokens.remove(_token);
  }

  function buyTokens(IERC20 _customerToken, address _customerAddress, uint256 _weiAmount) external {
    require(isTokenAvailable(address(_customerToken)), "WhitelistedTokensale: _customerToken is not available");

    tokensaleRegistry.validateWhitelistedCustomer(_customerAddress);

    uint256 _resultTokenAmount = getTokenAmount(address(_customerToken), _weiAmount);

    _customerToken.safeTransferFrom(_customerAddress, wallet, _weiAmount);

    tokenToSell.safeTransfer(_customerAddress, _resultTokenAmount);
  }

  function getTokenAmount(address _customerToken, uint256 _weiAmount) public view returns (uint256) {
    TokenInfo storage _tokenInfo = tokenInfo[_customerToken];
    return _weiAmount.mul(_tokenInfo.rateMul).div(_tokenInfo.rateDiv);
  }

  function isTokenAvailable(address _customerToken) public view returns (bool) {
    return tokens.contains(_customerToken);
  }
}
