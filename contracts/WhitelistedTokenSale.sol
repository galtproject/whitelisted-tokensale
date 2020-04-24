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
import "./interfaces/IWhitelistedTokenSale.sol";
import "./interfaces/ITokenSaleRegistry.sol";
import "./traits/Administrated.sol";
import "./traits/Pausable.sol";


contract WhitelistedTokenSale is Administrated, IWhitelistedTokenSale, Pausable {
  using EnumerableSet for EnumerableSet.AddressSet;
  using SafeERC20 for IERC20;
  using SafeMath for uint256;

  EnumerableSet.AddressSet internal customerTokens;

  IERC20 public tokenToSell;
  ITokenSaleRegistry public tokenSaleRegistry;

  address public wallet;

  struct TokenInfo {
    uint256 rateMul;
    uint256 rateDiv;
    uint256 totalReceived;
    uint256 totalSold;
  }

  mapping(address => TokenInfo) public customerTokenInfo;

  constructor() public {
  }

  function initialize(address _owner, address _tokenToSell, address _tokenSaleRegistry) public initializer {
    Ownable.initialize(_owner);
    tokenToSell = IERC20(_tokenToSell);
    tokenSaleRegistry = ITokenSaleRegistry(_tokenSaleRegistry);
  }

  function setTokenSaleRegistry(ITokenSaleRegistry _tokenSaleRegistry) external onlyAdmin {
    tokenSaleRegistry = _tokenSaleRegistry;
    emit SetTokenSaleRegistry(address(_tokenSaleRegistry), msg.sender);
  }

  function setWallet(address _wallet) external onlyAdmin {
    wallet = _wallet;
    emit SetWallet(_wallet, msg.sender);
  }

  function addOrUpdateCustomerToken(address _token, uint256 _rateMul, uint256 _rateDiv) external onlyAdmin {
    require(_rateMul > 0 && _rateDiv > 0, "WhitelistedTokenSale: incorrect rate");
    customerTokens.add(_token);
    customerTokenInfo[_token].rateMul = _rateMul;
    customerTokenInfo[_token].rateDiv = _rateDiv;
    emit UpdateCustomerToken(_token, _rateMul, _rateDiv, msg.sender);
  }

  function removeCustomerToken(address _token) external onlyAdmin {
    customerTokens.remove(_token);
    emit RemoveCustomerToken(_token, msg.sender);
  }

  function buyTokens(IERC20 _customerToken, address _customerAddress, uint256 _weiAmount) external whenNotPaused {
    require(wallet != address(0), "WhitelistedTokenSale: wallet is null");
    require(_weiAmount > 0, "WhitelistedTokenSale: weiAmount can't be null");
    require(isTokenAvailable(address(_customerToken)), "WhitelistedTokenSale: _customerToken is not available");

    tokenSaleRegistry.validateWhitelistedCustomer(_customerAddress);

    uint256 _resultTokenAmount = getTokenAmount(address(_customerToken), _weiAmount);
    require(_resultTokenAmount > 0, "WhitelistedTokenSale: _resultTokenAmount can't be null");

    TokenInfo storage _tokenInfo = customerTokenInfo[address(_customerToken)];
    _tokenInfo.totalReceived = _tokenInfo.totalReceived.add(_weiAmount);
    _tokenInfo.totalSold = _tokenInfo.totalSold.add(_resultTokenAmount);

    emit BuyTokens(msg.sender, _customerAddress, address(_customerToken), _weiAmount, _resultTokenAmount);

    _customerToken.safeTransferFrom(msg.sender, wallet, _weiAmount);

    tokenToSell.safeTransfer(_customerAddress, _resultTokenAmount);
  }

  function getTokenAmount(address _customerToken, uint256 _weiAmount) public view returns (uint256) {
    TokenInfo storage _tokenInfo = customerTokenInfo[_customerToken];
    return _weiAmount.mul(_tokenInfo.rateMul).div(_tokenInfo.rateDiv);
  }

  function isTokenAvailable(address _customerToken) public view returns (bool) {
    return customerTokens.contains(_customerToken);
  }

  function getCustomerTokenList() external view returns (address[] memory) {
    return customerTokens.enumerate();
  }

  function getCustomerTokenCount() external view returns (uint256) {
    return customerTokens.length();
  }
}
