const { ethers } = require("hardhat");

async function main() {
  const voting = await ethers.deployContract("Voting");
  await voting.waitForDeployment();

  console.log("Voting contract deployed to:", await voting.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});