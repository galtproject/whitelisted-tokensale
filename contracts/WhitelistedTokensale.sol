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
import "./traits/Pausable.sol";


contract WhitelistedTokensale is Administrated, IWhitelistedTokensale, Pausable {
  using EnumerableSet for EnumerableSet.AddressSet;
  using SafeERC20 for IERC20;
  using SafeMath for uint256;

  EnumerableSet.AddressSet internal customerTokens;

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

  constructor() public {
  }

  function initialize(address _owner, address _tokenToSell, address _tokensaleRegistry)
    public
    initializeWithOwner(_owner)
  {
    tokenToSell = IERC20(_tokenToSell);
    tokensaleRegistry = ITokensaleRegistry(_tokensaleRegistry);
  }

  function setTokensaleRegistry(ITokensaleRegistry _tokensaleRegistry) onlyAdmin external {
    tokensaleRegistry = _tokensaleRegistry;
    emit SetTokensaleRegistry(address(_tokensaleRegistry), msg.sender);
  }

  function setWallet(address _wallet) onlyAdmin external {
    wallet = _wallet;
    emit SetWallet(_wallet, msg.sender);
  }

  function addCustomerToken(address _token, uint256 _rateMul, uint256 _rateDiv) onlyAdmin external {
    customerTokens.add(_token);
    tokenInfo[_token].rateMul = _rateMul;
    tokenInfo[_token].rateDiv = _rateDiv;
    emit AddCustomerToken(_token, _rateMul, _rateDiv, msg.sender);
  }

  function updateCustomerToken(address _token, uint256 _rateMul, uint256 _rateDiv) onlyAdmin external {
    tokenInfo[_token].rateMul = _rateMul;
    tokenInfo[_token].rateDiv = _rateDiv;
    emit UpdateCustomerToken(_token, _rateMul, _rateDiv, msg.sender);
  }

  function removeCustomerToken(address _token) onlyAdmin external {
    customerTokens.remove(_token);
    emit RemoveCustomerToken(_token, msg.sender);
  }

  function buyTokens(IERC20 _customerToken, address _customerAddress, uint256 _weiAmount) external whenNotPaused {
    require(wallet != address(0), "WhitelistedTokensale: wallet is null");
    require(isTokenAvailable(address(_customerToken)), "WhitelistedTokensale: _customerToken is not available");

    tokensaleRegistry.validateWhitelistedCustomer(_customerAddress);

    uint256 _resultTokenAmount = getTokenAmount(address(_customerToken), _weiAmount);

    _customerToken.safeTransferFrom(msg.sender, wallet, _weiAmount);

    tokenToSell.safeTransfer(_customerAddress, _resultTokenAmount);

    emit BuyTokens(msg.sender, _customerAddress, address(_customerToken), _weiAmount, _resultTokenAmount);
  }

  function getTokenAmount(address _customerToken, uint256 _weiAmount) public view returns (uint256) {
    TokenInfo storage _tokenInfo = tokenInfo[_customerToken];
    return _weiAmount.mul(_tokenInfo.rateMul).div(_tokenInfo.rateDiv);
  }

  function isTokenAvailable(address _customerToken) public view returns (bool) {
    return customerTokens.contains(_customerToken);
  }

  function getCustomerTokenList() external view returns(address[] memory) {
    return customerTokens.enumerate();
  }

  function getCustomerTokenCount() external view returns(uint256) {
    return customerTokens.length();
  }
}
