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
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./interfaces/IWhitelistedTokensale.sol";
import "./interfaces/ITokensaleRegistry.sol";
import "@galtproject/libs/contracts/traits/OwnableAndInitializable.sol";


contract Administrated is OwnableAndInitializable {
    EnumerableSet.AddressSet public admins;

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
        return admins.contains.remove(_admin);
    }
}
