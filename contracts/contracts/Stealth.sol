// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

function onePlus(uint x) pure returns (uint) {
    unchecked { return 1 + x; }
}

interface IERC5564Announcer {
  event Announcement(uint256 indexed schemeId, address indexed stealthAddress, address indexed caller, bytes ephemeralPubKey, bytes metadata);
  function announce(uint256 schemeId, address stealthAddress, bytes memory ephemeralPubKey, bytes memory metadata) external;
}


interface ITransferFrom {
    function transferFrom(address from, address to, uint256 tokensOrTokenId) external;
}

interface IERC20Allowance {
    function allowance(address tokenOwner, address spender) external view returns (uint remaining);
}

interface IERC721OwnerOf {
    function ownerOf(uint256 tokenId) external view returns (address owner);
}

struct TokenInfo {
    bool isERC721;
    address token;
    uint value;
}

contract Stealth {
    bytes4 private constant TRANSFERFROM_SELECTOR = 0x23b872dd;

    IERC5564Announcer announcer;

    error NothingToTransfer();
    error TransferFailure();
    error NotERC721TokenOwner();
    error InsufficientERC20Allowance();

    constructor(address payable _announcer) {
        announcer = IERC5564Announcer(_announcer);
    }

    function transferEthAndAnnounce(uint256 schemeId, address recipient, bytes memory ephemeralPubKey, uint8 viewTag) external payable {
        if (msg.value == 0) {
            revert NothingToTransfer();
        }
        bytes memory metadata = new bytes(57);
        uint i;
        uint j;
        metadata[j++] = bytes1(viewTag);
        for (; i < 24; i = onePlus(i)) {
            metadata[j++] = 0xee;
        }
        bytes32 msgValueInBytes = bytes32(msg.value);
        for (i = 0; i < 32; i = onePlus(i)) {
            metadata[j++] = msgValueInBytes[i];
        }
        (bool sent, ) = recipient.call{value: msg.value}("");
        if (!sent) {
            revert TransferFailure();
        }
        announcer.announce(schemeId, recipient, ephemeralPubKey, metadata);
    }

    function transferAndAnnounce(uint256 schemeId, address recipient, bytes memory ephemeralPubKey, uint8 viewTag, TokenInfo[] calldata tokenInfo) external payable {
        if (tokenInfo.length == 0 && msg.value == 0) {
            revert NothingToTransfer();
        }
        bytes memory metadata = new bytes(1 + (56 * (tokenInfo.length + (msg.value > 0 ? 1 : 0))));
        uint i;
        uint j;
        metadata[j++] = bytes1(viewTag);
        if (msg.value > 0) {
            for (; i < 24; i = onePlus(i)) {
                metadata[j++] = 0xee;
            }
            bytes32 msgValueInBytes = bytes32(msg.value);
            for (i = 0; i < 32; i = onePlus(i)) {
                metadata[j++] = msgValueInBytes[i];
            }
            (bool sent, ) = recipient.call{value: msg.value}("");
            if (!sent) {
                revert TransferFailure();
            }
        }
        for (i = 0; i < tokenInfo.length; i = onePlus(i)) {
            bytes memory selectorAndTokenContractInBytes = abi.encodePacked(TRANSFERFROM_SELECTOR, tokenInfo[i].token);
            uint k;
            for (k = 0; k < 24; k = onePlus(k)) {
                metadata[j++] = selectorAndTokenContractInBytes[k];
            }
            bytes32 valueInBytes = bytes32(tokenInfo[i].value);
            for (k = 0; k < 32; k = onePlus(k)) {
                metadata[j++] = valueInBytes[k];
            }

            if (tokenInfo[i].isERC721) {
                address owner = IERC721OwnerOf(tokenInfo[i].token).ownerOf(tokenInfo[i].value);
                if (owner != msg.sender) {
                    revert NotERC721TokenOwner();
                }
            } else {
                uint allowance = IERC20Allowance(tokenInfo[i].token).allowance(msg.sender, address(this));
                if (allowance < tokenInfo[i].value) {
                    revert InsufficientERC20Allowance();
                }
            }
            ITransferFrom(tokenInfo[i].token).transferFrom(msg.sender, recipient, tokenInfo[i].value);
        }
        announcer.announce(schemeId, recipient, ephemeralPubKey, metadata);
    }
}