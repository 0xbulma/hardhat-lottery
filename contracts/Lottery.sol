// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

contract Lottery {
    address public manager;
    address payable[] public players;

    constructor() {
        manager = msg.sender;
    }

    function getPlayers() public view returns (address payable[] memory) {
        return players;
    }

    function enter() public payable {
        // check if the player hasn't already registered to the lottery
        for (uint i = 0; i < players.length; i++) {
            require(
                payable(msg.sender) != players[i],
                "409: the player has already registered to the lottery."
            );
        }

        require(
            msg.value >= .01 ether,
            "Please enter with 0.01 Ether at minimum"
        );
        players.push(payable(msg.sender));
    }

    function random() private view returns (uint256) {
        return
            uint(
                keccak256(
                    abi.encodePacked(block.difficulty, block.timestamp, players)
                )
            );
        // sudo random do not use in production
    }

    function pickWinner() public restricted {
        uint index = random() % players.length;
        players[index].transfer(address(this).balance);
        // players = new address payable[](0);
        delete players;
    }

    modifier restricted() {
        require(msg.sender == manager, "You are not the manager");
        _;
    }
}
