/*
 * Copyright ©️ 2018-2020 Galt•Project Society Construction and Terraforming Company
 * (Founded by [Nikolai Popeka](https://github.com/npopeka)
 *
 * Copyright ©️ 2018-2020 Galt•Core Blockchain Company
 * (Founded by [Nikolai Popeka](https://github.com/npopeka) by
 * [Basic Agreement](ipfs/QmaCiXUmSrP16Gz8Jdzq6AJESY1EAANmmwha15uR3c1bsS)).
 */

pragma solidity ^0.5.13;

import "./Administered.sol";


contract Managered is Administered {
    EnumerableSet.AddressSet public managers;

    modifier onlyAdminOrManager() {
        require(isAdmin(msg.sender) || isManager(msg.sender), "Managered: Msg sender is not admin or manager");
        _;
    }

    modifier onlyManager() {
        require(isManager(msg.sender), "Managered: Msg sender is not manager");
        _;
    }

    function addManager(address _manager) onlyAdmin external {
        managers.add(_manager);
    }

    function removeManager(address _manager) onlyAdmin external {
        managers.remove(_manager);
    }

    function isManager(address _manager) public view returns (bool) {
        return managers.contains.remove(_manager);
    }
}
