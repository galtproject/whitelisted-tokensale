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
import "../WhitelistedTokensale.sol";


contract WhitelistedTokensaleFactory is Ownable {
    address public implementation;
    IOwnedUpgradeabilityProxyFactory internal ownedUpgradeabilityProxyFactory;

    constructor(IOwnedUpgradeabilityProxyFactory _factory, address _impl) public {
        ownedUpgradeabilityProxyFactory = _factory;
        implementation = _impl;
    }

    function build(address _tokenToSell, address _tokensaleRegistry) external onlyOwner returns (WhitelistedTokensale) {
        IOwnedUpgradeabilityProxy proxy = ownedUpgradeabilityProxyFactory.build();

        proxy.upgradeToAndCall(
            implementation,
            abi.encodeWithSignature(
                "initialize(address,address)",
                _tokenToSell,
                _tokensaleRegistry
            )
        );

        proxy.transferProxyOwnership(msg.sender);

        WhitelistedTokensale tokensale = WhitelistedTokensale(address(proxy));
        tokensale.addAdmin(msg.sender);

        return tokensale;
    }
}