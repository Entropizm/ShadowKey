// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

contract ERC5564Registry {
  event StealthMetaAddressSet(address indexed registrant, uint256 indexed scheme, bytes stealthMetaAddress);
  mapping(address => mapping(uint256 => bytes)) public stealthMetaAddressOf;

  function registerKeys(uint256 scheme, bytes memory stealthMetaAddress) external {
    stealthMetaAddressOf[msg.sender][scheme] = stealthMetaAddress;
    emit StealthMetaAddressSet(msg.sender, scheme, stealthMetaAddress);
  }

  function registerKeysOnBehalf(address registrant, uint256 scheme, bytes memory signature, bytes memory stealthMetaAddress) external {
  }
}