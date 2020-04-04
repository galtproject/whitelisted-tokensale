/*
 * Copyright ©️ 2018-2020 Galt•Project Society Construction and Terraforming Company
 * (Founded by [Nikolai Popeka](https://github.com/npopeka)
 *
 * Copyright ©️ 2018-2020 Galt•Core Blockchain Company
 * (Founded by [Nikolai Popeka](https://github.com/npopeka) by
 * [Basic Agreement](ipfs/QmaCiXUmSrP16Gz8Jdzq6AJESY1EAANmmwha15uR3c1bsS)).
 */

pragma solidity ^0.5.13;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@galtproject/libs/contracts/proxy/unstructured-storage/OwnedUpgradeabilityProxy.sol";
import "@galtproject/libs/contracts/proxy/unstructured-storage/interfaces/IOwnedUpgradeabilityProxyFactory.sol";
import "@galtproject/libs/contracts/proxy/unstructured-storage/interfaces/IOwnedUpgradeabilityProxy.sol";

// This contract will be included into the current one
import "../WhitelistedTokenSale.sol";


contract WhitelistedTokenSaleFactory is Ownable {
    event Build(address result);

    address public implementation;
    IOwnedUpgradeabilityProxyFactory internal ownedUpgradeabilityProxyFactory;

    constructor(IOwnedUpgradeabilityProxyFactory _factory, address _impl) public {
        ownedUpgradeabilityProxyFactory = _factory;
        implementation = _impl;
    }

    function build(address _tokenToSell, address _tokenSaleRegistry) external onlyOwner returns (WhitelistedTokenSale) {
        IOwnedUpgradeabilityProxy proxy = ownedUpgradeabilityProxyFactory.build();

        proxy.upgradeToAndCall(
            implementation,
            abi.encodeWithSignature(
                "initialize(address,address,address)",
                address(this),
                _tokenToSell,
                _tokenSaleRegistry
            )
        );

        WhitelistedTokenSale tokenSale = WhitelistedTokenSale(address(proxy));
        tokenSale.addAdmin(msg.sender);

        proxy.transferProxyOwnership(msg.sender);
        tokenSale.transferOwnership(msg.sender);

        emit Build(address(proxy));

        return tokenSale;
    }
}