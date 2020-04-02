/*
 * Copyright ©️ 2018-2020 Galt•Project Society Construction and Terraforming Company
 * (Founded by [Nikolai Popeka](https://github.com/npopeka)
 *
 * Copyright ©️ 2018-2020 Galt•Core Blockchain Company
 * (Founded by [Nikolai Popeka](https://github.com/npopeka) by
 * [Basic Agreement](ipfs/QmaCiXUmSrP16Gz8Jdzq6AJESY1EAANmmwha15uR3c1bsS)).
 */

pragma solidity ^0.5.13;

import "./Administrated.sol";


contract Managered is Administrated {

    event AddManager(address indexed manager, address indexed admin);
    event RemoveManager(address indexed manager, address indexed admin);

    using EnumerableSet for EnumerableSet.AddressSet;

    EnumerableSet.AddressSet internal managers;

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
        emit AddManager(_manager, msg.sender);
    }

    function removeManager(address _manager) onlyAdmin external {
        managers.remove(_manager);
        emit RemoveManager(_manager, msg.sender);
    }

    function isManager(address _manager) public view returns (bool) {
        return managers.contains(_manager);
    }

    function getManagerList() external view returns(address[] memory) {
        return managers.enumerate();
    }

    function getManagerCount() external view returns(uint256) {
        return managers.length();
    }
}
