// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Voting {
    
    struct Candidate {
        string name;
        uint256 voteCount;
    }

    address public owner;
    Candidate[] private candidates;
    mapping(address => bool) public hasVoted;

    event CandidateAdded(uint256 indexed candidateId, string name);
    event VoteCast(address indexed voter, uint256 indexed candidateId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner Can access this");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // create 

    function createCandidate(string calldata name) external onlyOwner {
        require(bytes(name).length > 0, "Name required to create add a candidate");
        candidates.push(Candidate({name: name, voteCount: 0}));
        emit CandidateAdded(candidates.length - 1, name);
    }

    // voting 

    function vote(uint256 candidateIndex) external {
        require(!hasVoted[msg.sender], "You already voted");
        require(candidateIndex < candidates.length, "Candidate Doesn't exist");
        hasVoted[msg.sender] = true;
        candidates[candidateIndex].voteCount += 1;
        emit VoteCast(msg.sender, candidateIndex);
    }


// candidate names
    function getCandidateList()
        external
        view
        returns (Candidate[] memory)
    {
        return candidates;
    }


// Winner of the voting
    function getWinner()
        external
        view
        returns (string memory winnerName)
    {
        require(candidates.length > 0, "No candidates added");
        uint256 winningVoteCount = 0;
        uint256 winningCandidateId = 0;

        for (uint256 i = 0; i < candidates.length; i++) {
            if (candidates[i].voteCount > winningVoteCount) {
                winningVoteCount = candidates[i].voteCount;
                winningCandidateId = i;
            }
        }

        winnerName = candidates[winningCandidateId].name;
    }
}