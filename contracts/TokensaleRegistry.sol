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
import "./interfaces/ITokensaleRegistry.sol";
import "./traits/Managered.sol";


contract TokensaleRegistry is Managered, ITokensaleRegistry {
  using EnumerableSet for EnumerableSet.AddressSet;

  EnumerableSet.AddressSet public customersWhiteList;

  function addCustomerToWhiteList(address _customer) onlyAdminOrManager external {
    customersWhiteList.add(_customer);
  }

  function removeCustomerFromWhiteList(address _customer) onlyAdminOrManager external {
    customersWhiteList.remove(_customer);
  }

  function isCustomerInWhiteList(address _customer) external returns(bool) {
    return customersWhiteList.contains(_customer);
  }

  function validateWhitelistedCustomer(address _customer) external {
    require(customersWhiteList.contains(_customer), "TokensaleRegistry: Msg sender is not in whitelist");
    _;
  }
}
