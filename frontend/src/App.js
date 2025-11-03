import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const api = axios.create({
  baseURL:
    process.env.REACT_APP_BACKEND_URL?.trim() || "http://localhost:4000",
});

function App() {
  const [candidates, setCandidates] = useState([]);
  const [newCandidate, setNewCandidate] = useState("");
  const [voteIndex, setVoteIndex] = useState("");
  const [voterKey, setVoterKey] = useState("");
  const [winner, setWinner] = useState("");
  const [status, setStatus] = useState("");

  const fetchCandidates = async () => {
    try {
      const res = await api.get("/candidates");
      setCandidates(res.data.candidates);
    } catch (error) {
      setStatus(
        `Failed to load candidates: ${
          error.response?.data?.error || error.message
        }`
      );
    }
  };

  const fetchWinner = async () => {
    try {
      const res = await api.get("/winner");
      setWinner(res.data.winner);
    } catch (err) {
      setWinner(`Error: ${err.response?.data?.error || err.message}`);
    }
  };

  useEffect(() => {
    fetchCandidates();
    fetchWinner();
  }, []);

  const addCandidate = async (e) => {
    e.preventDefault();
    if (!newCandidate.trim()) return;
    setStatus("Adding");
    try {
      const res = await api.post("/candidates", {
        name: newCandidate.trim(),
      });
      setStatus(`Candidate added (tx ${res.data.txHash.slice(0, 10)}...)`);
      setNewCandidate("");
      await fetchCandidates();
    } catch (err) {
      setStatus(`Error: ${err.response?.data?.error || err.message}`);
    }
  };

  const castVote = async (e) => {
    e.preventDefault();
    if (voteIndex === "" || !voterKey.trim()) return;
    setStatus("Cast Your Vote");
    try {
      const res = await api.post("/vote", {
        candidateIndex: Number(voteIndex),
        voterPrivateKey: voterKey.trim(),
      });
      setStatus(`Vote sent (tx ${res.data.txHash.slice(0, 10)}...)`);
      setVoteIndex("");
      setVoterKey("");
      await fetchCandidates();
      await fetchWinner();
    } catch (err) {
      setStatus(`Error: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <div className="app">
      <h1>Voting DApps Dashboard</h1>

      <section>
        <h2>Candidates</h2>
        <button onClick={fetchCandidates}>Refresh</button>
        <ul>
          {candidates.map((c, idx) => (
            <li key={idx}>
              <strong>{c.name}</strong> — votes {c.voteCount}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Add Candidate (owner)</h2>
        <form onSubmit={addCandidate}>
          <input
            type="text"
            placeholder="Candidate name"
            value={newCandidate}
            onChange={(e) => setNewCandidate(e.target.value)}
          />
          <button type="submit">Add Candidate</button>
        </form>
      </section>

      <section>
        <h2>Vote</h2>
        <p>Use a Hardhat test private key (for demo only!)</p>
        <form onSubmit={castVote}>
          <input
            type="number"
            placeholder="Candidate index"
            value={voteIndex}
            onChange={(e) => setVoteIndex(e.target.value)}
          />
          <textarea
            placeholder="Voter private key (0x...)"
            value={voterKey}
            onChange={(e) => setVoterKey(e.target.value)}
            rows={2}
          />
          <button type="submit">Vote</button>
        </form>
      </section>

      <section>
        <h2>Winner</h2>
        <button onClick={fetchWinner}>Refresh winner</button>
        <p>{winner || "No winner yet"}</p>
      </section>

      {status && (
        <section className="status">
          <strong>Status:</strong> {status}
        </section>
      )}

    </div>
  );
}

export default App;