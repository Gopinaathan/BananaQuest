import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import app from "../services/firebaseConfig";
import axios from 'axios';
import "./styles/Welcome.css";

function Welcome() {
  const [quote, setQuote] = useState('');
  const [author, setAuthor] = useState('');
  const navigate = useNavigate();
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/levels");
      }
    });

    
    async function fetchQuote() {
      try {
        const response = await axios.get("https://dummyjson.com/quotes/random");
        setQuote(response.data.quote);
        setAuthor(response.data.author);
      } catch (error) {
        console.error("Error fetching the quote:", error);
      }
    }

    fetchQuote();

    return () => unsubscribe();
  }, [auth, navigate]);

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1 className="welcome-title">
          Welcome to
          <span className="title-special">Banana Quest</span>
        </h1>
        
        {/* Displaying the fetched random quote */}
        <div className="quote-container">
          <p className="quote-text">"{quote}"</p>
          <p className="quote-author">-{author}</p>
        </div>

        <div className="welcome-buttons">
          <button className="game-btn btn-primary" onClick={() => navigate("/auth")}>
            <span className="btn-text">Login</span>
          </button>
          <button className="game-btn btn-secondary" onClick={() => navigate("/levels")}>
            <span className="btn-text">Play as Guest</span>
          </button>
        </div>
      </div>
      <div className="decoration-element left"></div>
      <div className="decoration-element right"></div>
    </div>
  );
}

export default Welcome;
