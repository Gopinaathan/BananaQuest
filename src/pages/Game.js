import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import Timer from "../components/Timer";
import app from "../services/firebaseConfig";
import "./styles/Game.css";

const Game = () => {
  const [quizData, setQuizData] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3); // 3 lives
  const [isAnswered, setIsAnswered] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  const timerRef = useRef(null);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const level = queryParams.get("level") || "medium";

  const auth = getAuth(app);
  const db = getFirestore(app);

  // Fetch initial score from Firestore
  const fetchInitialScore = async () => {
    const user = auth.currentUser;
    if (user) {
      const scoreDocRef = doc(db, "scores", `${user.uid}_${level}`);
      const scoreDoc = await getDoc(scoreDocRef);
      if (scoreDoc.exists()) {
        setScore(scoreDoc.data().score || 0);
      }
    }
  };

  const fetchQuizData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("https://marcconrad.com/uob/banana/api.php");
      const data = await response.json();
      setQuizData({ ...data, options: generateOptions(data.solution) });
      setIsAnswered(false);
      setSelectedAnswer(null);
    } catch (err) {
      setError("Failed to load question. Please try again.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInitialScore();
    fetchQuizData();
  }, []);

  const generateOptions = (correctAnswer) => {
    const options = new Set();
    options.add(correctAnswer);
    while (options.size < 5) {
      options.add(Math.floor(Math.random() * 10) + 1);
    }
    return Array.from(options).sort(() => Math.random() - 0.5);
  };

  const saveScoreToFirestore = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const scoreDocRef = doc(db, "scores", `${user.uid}_${level}`);
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        // Fetch username from Firestore
        const username = userDoc.exists() ? userDoc.data().username : "Anonymous";

        await setDoc(
          scoreDocRef,
          {
            username, // Include the username
            email: user.email,
            score,
            level,
          },
          { merge: true }
        );
        console.log("Score saved to Firestore:", score);
      } catch (error) {
        console.error("Error saving score:", error);
      }
    }
  };

  const handleAnswerSelect = (answer) => {
    if (!quizData || isAnswered || isTimeUp || gameOver) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);

    if (answer === quizData.solution) {
      setScore((prevScore) => prevScore + 2);
    } else {
      setLives((prevLives) => {
        const newLives = prevLives - 1;
        if (newLives <= 0) {
          setGameOver(true);
          saveScoreToFirestore();
          timerRef.current.stopTimer(); // Stop the timer
        }
        return newLives;
      });
    }
  };

  const handleNextQuestion = () => {
    if (isTimeUp || lives <= 0 || gameOver) return;
    fetchQuizData();
  };

  const handleTimeUp = () => {
    setIsTimeUp(true);
    setGameOver(true);
    saveScoreToFirestore();
  };

  const handleRestart = () => {
    setScore(0);
    setLives(3);
    setIsTimeUp(false);
    setGameOver(false);
    fetchQuizData();
  };

  return (
    <div className="game-container">
      <div className="game-content">
        <div className="score-board">
          <div className="score">
            <span className="score-label">Score</span>
            <span className="score-value">{score}</span>
          </div>
          <div className="lives">
            <span className="lives-label">Lives</span>
            <span className="lives-value">{"❤️".repeat(lives)}</span>
          </div>
          <div className="level">
            <span className="level-label">Level</span>
            <span className="level-value">{level.charAt(0).toUpperCase() + level.slice(1)}</span>
          </div>
        </div>

        {loading && <div className="loading">Loading your next challenge... 🍌</div>}
        {error && <p className="error">{error}</p>}

        {quizData && !loading && (
          <div className="quiz-container">
            <div className="question-image">
              <img src={quizData.question || "/placeholder.svg"} alt="Quiz Question" />
            </div>

            <div className="question-section">
              <p className="question-text">What's the missing number?</p>
              {!gameOver && (
                <Timer ref={timerRef} level={level} onTimeUp={handleTimeUp} />
              )}
              {gameOver && <p className="game-over">Game Over!</p>}
            </div>

            {!gameOver && (
              <div className="answer-section">
                {quizData.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={isAnswered || isTimeUp}
                    className={`option-button ${isAnswered
                        ? option === quizData.solution
                          ? "correct"
                          : option === selectedAnswer
                            ? "incorrect"
                            : ""
                        : ""
                      }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {isAnswered && !gameOver && (
              <div className="feedback-section">
                <p className={selectedAnswer === quizData.solution ? "correct" : "incorrect"}>
                  {selectedAnswer === quizData.solution
                    ? "✨ Correct! +2 points"
                    : `❌ The correct answer was ${quizData.solution}`}
                </p>
                <button onClick={handleNextQuestion} className="next-button">
                  Next Challenge 🍌
                </button>
              </div>
            )}

            {gameOver && (
              <div className="feedback-section">
                <p className="game-over">
                  {isTimeUp ? "⌛ Time's up!" : "💔 No lives left!"}
                  <br />
                  Final Score: {score}
                </p>
                <button onClick={handleRestart} className="next-button">
                  Restart Game 🍌
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;