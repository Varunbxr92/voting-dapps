const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { ethers } = require("hardhat");

async function main() {
  const voting = await ethers.deployContract("Voting");
  await voting.waitForDeployment();
  const address = await voting.getAddress();

  console.log("Voting deployed at:", address);

  const envPath = path.join(__dirname, "../backend/.env");
  const parsed = fs.existsSync(envPath)
    ? dotenv.parse(fs.readFileSync(envPath))
    : {};

  parsed.RPC_URL = parsed.RPC_URL || "http://127.0.0.1:8545";
  parsed.CONTRACT_ADDRESS = address;

  const envString = Object.entries(parsed)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  fs.writeFileSync(envPath, envString);
  console.log("Updated backend/.env with new CONTRACT_ADDRESS");
  console.log("Restart backend server to use new address.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});