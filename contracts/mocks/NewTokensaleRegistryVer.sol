/*
 * Copyright ©️ 2018-2020 Galt•Project Society Construction and Terraforming Company
 * (Founded by [Nikolai Popeka](https://github.com/npopeka)
 *
 * Copyright ©️ 2018-2020 Galt•Core Blockchain Company
 * (Founded by [Nikolai Popeka](https://github.com/npopeka) by
 * [Basic Agreement](ipfs/QmaCiXUmSrP16Gz8Jdzq6AJESY1EAANmmwha15uR3c1bsS)).
 */

pragma solidity ^0.5.13;

import "../TokenSaleRegistry.sol";


contract NewTokenSaleRegistryVer is TokenSaleRegistry {

    string public registryBar;

    function getCustomersWhiteListCount() external view returns(uint256) {
        return 999;
    }

    function setRegistryFoo(string calldata _bar) external {
        registryBar = _bar;
    }
}