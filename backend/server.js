import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import Web3 from "web3";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Setup Web3 provider
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC_URL));

// Load ABI
const votingArtifact = JSON.parse(
  readFileSync(new URL("./artifacts.json", import.meta.url))
);
const votingAbi = votingArtifact.abi;
const contract = new web3.eth.Contract(
  votingAbi,
  process.env.CONTRACT_ADDRESS
);

// Add owner account (for createCandidate)
const ownerPrivateKey = process.env.OWNER_PRIVATE_KEY?.trim();
if (!ownerPrivateKey) {
  throw new Error("OWNER_PRIVATE_KEY is missing in .env");
}

const ownerAccount = web3.eth.accounts.privateKeyToAccount(ownerPrivateKey);
web3.eth.accounts.wallet.add(ownerAccount);
contract.options.from = ownerAccount.address;

console.log("Owner account loaded:", ownerAccount.address);

// ROUTES

/**
 * POST /candidates
 * body: { "name": "Candidate name" }
 * Uses owner to add candidate
 */
app.post("/candidates", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name required" });

    const gasEstimate = await contract.methods
      .createCandidate(name)
      .estimateGas({ from: ownerAccount.address });

    const receipt = await contract.methods
      .createCandidate(name)
      .send({ from: ownerAccount.address, gas: gasEstimate });

    res.json({
      message: "Candidate added",
      txHash: receipt.transactionHash,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /candidates
 * returns array of { name, voteCount }
 */
app.get("/candidates", async (req, res) => {
  try {
   const candidatesRaw = await contract.methods.getCandidateList().call();

    const candidates = candidatesRaw.map((candidate) => ({
      name: candidate.name,
      voteCount: Number(candidate.voteCount), // or candidate.voteCount.toString()
    }));

    res.json({ candidates });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /vote
 * body: { "candidateIndex": 0, "voterPrivateKey": "0x..." }
 * Signs vote tx with provided private key.
 */
app.post("/vote", async (req, res) => {
  try {
    const { candidateIndex, voterPrivateKey } = req.body;
    if (!Number.isInteger(candidateIndex) || candidateIndex < 0) {
      return res.status(400).json({ error: "candidateIndex must be a non-negative integer" });
    }
    if (typeof voterPrivateKey !== "string" || !/^0x[0-9a-fA-F]{64}$/.test(voterPrivateKey.trim())) {
      return res.status(400).json({ error: "Invalid voterPrivateKey" });
    }

    const voterAccount = web3.eth.accounts.privateKeyToAccount(voterPrivateKey.trim());
    web3.eth.accounts.wallet.add(voterAccount);
    console.log("Voting from:", voterAccount.address);

    const tx = contract.methods.vote(candidateIndex);
    const gasEstimate = await tx.estimateGas({ from: voterAccount.address });
    const receipt = await tx.send({ from: voterAccount.address, gas: gasEstimate });

    web3.eth.accounts.wallet.remove(voterAccount.address);

    res.json({
      message: "Vote cast",
      voter: voterAccount.address,
      txHash: receipt.transactionHash,
    });
  } catch (error) {
    console.error("Vote failed:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /winner
 */
app.get("/winner", async (req, res) => {
  try {
    const winner = await contract.methods.getWinner().call();
    res.json({ winner });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Voting backend listening on http://localhost:${PORT}`)
);