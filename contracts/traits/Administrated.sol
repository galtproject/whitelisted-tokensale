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
import "@galtproject/libs/contracts/traits/OwnableAndInitializable.sol";


contract Administrated is OwnableAndInitializable {
    using EnumerableSet for EnumerableSet.AddressSet;

    EnumerableSet.AddressSet internal admins;

    modifier onlyAdmin() {
        require(isAdmin(msg.sender), "WhitelistedTokensale: Msg sender is not admin");
        _;
    }
    constructor() public {
    }

    function addAdmin(address _admin) onlyOwner external {
        admins.add(_admin);
    }

    function removeAdmin(address _admin) onlyOwner external {
        admins.remove(_admin);
    }

    function isAdmin(address _admin) public view returns (bool) {
        return admins.contains(_admin);
    }
}
