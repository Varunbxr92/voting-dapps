const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting", function () {
  async function deployVotingFixture() {
    const [owner, voter1, voter2] = await ethers.getSigners();
    const voting = await ethers.deployContract("Voting");
    await voting.waitForDeployment();

    return { voting, owner, voter1, voter2 };
  }

  it("sets deployer as owner", async function () {
    const { voting, owner } = await deployVotingFixture();
    expect(await voting.owner()).to.equal(owner.address);
  });

  it("owner can add candidates", async function () {
    const { voting } = await deployVotingFixture();
    await expect(voting.createCandidate("Varun"))
      .to.emit(voting, "CandidateAdded")
      .withArgs(0, "Varun");
  });

  it("non-owner cannot add candidates", async function () {
    const { voting, voter1 } = await deployVotingFixture();
    await expect(
      voting.connect(voter1).createCandidate("Nayan")
    ).to.be.revertedWith("Only owner Can access this");
  });

  it("allows users to vote once and prevents double voting", async function () {
    const { voting, owner, voter1 } = await deployVotingFixture();
    await voting.createCandidate("Varun");
    await voting.createCandidate("Nayan");

    await expect(voting.connect(voter1).vote(1))
      .to.emit(voting, "VoteCast")
      .withArgs(voter1.address, 1);

    await expect(
      voting.connect(voter1).vote(0)
    ).to.be.revertedWith("You already voted");

    const candidates = await voting.getCandidateList();
    expect(candidates[1].voteCount).to.equal(1n);
  });

  it("rejects invalid candidate indices", async function () {
    const { voting, voter1 } = await deployVotingFixture();
    await voting.createCandidate("Varun");
    await expect(
      voting.connect(voter1).vote(5)
    ).to.be.revertedWith("Candidate Doesn't exist");
  });

  it("returns the winner", async function () {
    const { voting, voter1, voter2 } = await deployVotingFixture();
    await voting.createCandidate("Varun");
    await voting.createCandidate("Nayan");

    await voting.connect(voter1).vote(0);
    await voting.connect(voter2).vote(0);

    expect(await voting.getWinner()).to.equal("Varun");
  });
});