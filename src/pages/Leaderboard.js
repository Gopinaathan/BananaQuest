import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getFirestore, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import app from "../services/firebaseConfig";
import Confetti from "react-confetti";
import "./styles/Leaderboard.css";

function Leaderboard() {
  const [activeLevel, setActiveLevel] = useState("easy");
  const [scores, setScores] = useState({ easy: [], medium: [], hard: [] });
  const { user } = useAuth();
  const navigate = useNavigate();
  const db = getFirestore(app);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    } else {
      fetchScores();
    }
  }, [user, navigate]);

  const fetchScores = async () => {
    const levels = ["easy", "medium", "hard"];
    const newScores = { easy: [], medium: [], hard: [] };

    await Promise.all(
      levels.map(async (level) => {
        try {
          const scoresRef = collection(db, "scores");
          const q = query(
            scoresRef,
            where("level", "==", level),
            orderBy("score", "desc"),
            limit(5)
          );
          const querySnapshot = await getDocs(q);
          let levelScores = querySnapshot.docs.map((doc) => doc.data());

          newScores[level] = levelScores;
        } catch (error) {
          console.error(`Firestore Query Error for ${level}:`, error.message);
          console.warn(`⚠️ Ensure the required Firestore index is created!`);

          // Temporary Fix: Fetch without ordering and sort in JavaScript
          const scoresRef = collection(db, "scores");
          const q = query(scoresRef, where("level", "==", level));
          const querySnapshot = await getDocs(q);
          let levelScores = querySnapshot.docs.map((doc) => doc.data());

          // Sort manually (descending order)
          levelScores.sort((a, b) => b.score - a.score);
          newScores[level] = levelScores.slice(0, 5); // Keep only top 5 scores
        }
      })
    );

    setScores(newScores);
  };

  if (!user) {
    return null; // or show a loading spinner
  }

  return (
    <div className="scoreboard-container">
      {/* 🎉 Confetti Background */}
      <Confetti width={window.innerWidth} height={window.innerHeight} numberOfPieces={150} gravity={0.3} />

      <h1 className="scoreboard-title">🏆 Banana Quest Leaderboard 🏆</h1>

      <div className="level-tabs">
        {["easy", "medium", "hard"].map((level) => (
          <button
            key={level}
            className={`level-tab ${activeLevel === level ? "active" : ""}`}
            onClick={() => setActiveLevel(level)}
          >
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </button>
        ))}
      </div>

      <div className="table-container">
        <table className="scoreboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Username</th>
              <th className="hide-mobile">Email</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {scores[activeLevel].map((player, index) => (
              <tr key={index} className={index < 3 ? `top-${index + 1}` : ""}>
                <td>
                  {index < 3 ? (
                    <span className="trophy">{index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}</span>
                  ) : (
                    index + 1
                  )}
                </td>
                <td>{player.username}</td>
                <td className="hide-mobile">{player.email}</td>
                <td>{player.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Leaderboard;