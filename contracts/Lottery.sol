// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

contract Lottery {
    address public manager;
    address payable[] public players;
    uint public prizePool;
    

    constructor() {
        manager = msg.sender;
    }

    event moneySent(address _from, address _to, uint _amount);

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
        prizePool = address(this).balance;
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
        require(players.length > 0 , 'No players');

        uint index = random() % players.length;
        players[index].transfer(prizePool);

        emit moneySent(msg.sender, players[index], prizePool);
        // players = new address payable[](0);
        delete players;
        delete prizePool;
    }

    modifier restricted() {
        require(msg.sender == manager, "You are not the manager");
        _;
    }
}
