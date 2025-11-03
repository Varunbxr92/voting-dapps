# Voting DApp (Local Only)

A full-stack decentralized voting application built entirely for local testing. 
The project showcases a Solidity smart contract, Hardhat tooling, a Node.js + Web3 backend, 
and a React frontend. 
Only the contract owner can add candidates,
every address may vote once, 
and anyone can query live results.

---

## Tech Stack

| Layer        | Tools / Libraries                           |
|--------------|----------------------------------------------|
| Smart Contract | Solidity 0.8.24, Hardhat, Ethers.js v6       |
| Deployment      | Hardhat Network (local Ganache-style chain) |
| Backend         | Node.js, Express, Web3.js 4.x, Morgan, Dotenv |
| Frontend        | React (Create React App), Axios             |
| Testing         | Hardhat Test Suite (Mocha + Chai)           |

---

## Prerequisites

- **Node.js** ≥ 18.x (tested on Node 22.x)
- **npm** ≥ 9.x
- **Git**

Verify:

```bash
node -v
npm -v
git --version
git clone https://github.com/<your-user>/voting-dapp.git
cd voting-dapp
npm install
cd backend
npm install
cd ..
cd frontend
npm install
cd ..
```

These are the above steps need to be performed initially in order to download the dependencies.
Then we need to compile the contract and copy the generated ABI

```   bash
npx hardhat compile
cp artifacts/contracts/Voting.sol/Voting.json backend/artifacts.json

```
---
Next step is to start the hardhat node: 

```   bash
npx hardhat node
```
while still being in the root directory,it will return almost 20 addresses, now we need to deploy our smart contract for that we need to open another tab of the terminal

```   bash
npm run deploy:local
```
which will give the address to the deployed contract which we need to copy to the .env file of the backend service, copy the deployed contract address and replace in .env file of backend

RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=0x...   # Replace here
OWNER_PRIVATE_KEY=0x...  # set once (first account from Hardhat node), copy the first private key from the command executed earlier (npx hardhat node)

---

After this step, we need to start the backend server and frontend in separate new terminal tab

```   bash
cd backend
npm run dev
```
it should start running on localhost and on port :4000, if your port is occupied please kill the process else you might have to change the config of 
frontend on which it will interact with the backend service.

Then in next step in new tab

```   bash
cd frontend
npm start
```

You can see your UI at : http://127.0.0.1:3000, you can add the Candidate either from UI or from curl request
---

Video Demo Link:

https://drive.google.com/drive/folders/1RFgBrrAWH9ovMN8_WhUzDxyNQihTdlQe?usp=sharing

