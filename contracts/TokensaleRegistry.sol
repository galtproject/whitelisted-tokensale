/*
 * Copyright ©️ 2018-2020 Galt•Project Society Construction and Terraforming Company
 * (Founded by [Nikolai Popeka](https://github.com/npopeka)
 *
 * Copyright ©️ 2018-2020 Galt•Core Blockchain Company
 * (Founded by [Nikolai Popeka](https://github.com/npopeka) by
 * [Basic Agreement](ipfs/QmaCiXUmSrP16Gz8Jdzq6AJESY1EAANmmwha15uR3c1bsS)).
 */

pragma solidity ^0.5.13;

import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import "./interfaces/ITokenSaleRegistry.sol";
import "./traits/Managed.sol";


contract TokenSaleRegistry is Managed, ITokenSaleRegistry {
  using EnumerableSet for EnumerableSet.AddressSet;

  EnumerableSet.AddressSet internal customersWhiteList;

  function initialize(address _owner) external initializeWithOwner(_owner) {

  }

  function addCustomerToWhiteList(address _customer) onlyAdminOrManager external {
    customersWhiteList.add(_customer);
    emit AddWhitelistedCustomer(_customer, msg.sender);
  }

  function removeCustomerFromWhiteList(address _customer) onlyAdminOrManager external {
    customersWhiteList.remove(_customer);
    emit RemoveWhitelistedCustomer(_customer, msg.sender);
  }

  function isCustomerInWhiteList(address _customer) external view returns(bool) {
    return customersWhiteList.contains(_customer);
  }

  function validateWhitelistedCustomer(address _customer) external view {
    require(customersWhiteList.contains(_customer), "TokenSaleRegistry: Recipient is not in whitelist");
  }

  function getCustomersWhiteList() external view returns(address[] memory) {
    return customersWhiteList.enumerate();
  }

  function getCustomersWhiteListCount() external view returns(uint256) {
    return customersWhiteList.length();
  }
}
