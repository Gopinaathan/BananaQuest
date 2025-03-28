import { useNavigate } from "react-router-dom";
import "./styles/Levels.css";

function Levels() {
  const navigate = useNavigate();

  const handleLevelSelect = (level) => {
    navigate(`/game?level=${level}`);
  };

  return (
    <div className="levels-container">
      <h2 className="levels-title">Select Your Adventure</h2>
      <ul className="levels-list">
        <li>
          <button className="level-button easy" onClick={() => handleLevelSelect("easy")}>
            <span className="level-name">Easy</span>
            <span className="level-description">Beginner's Bunch</span>
          </button>
        </li>
        <li>
          <button className="level-button medium" onClick={() => handleLevelSelect("medium")}>
            <span className="level-name">Medium</span>
            <span className="level-description">Banana Bonanza</span>
          </button>
        </li>
        <li>
          <button className="level-button hard" onClick={() => handleLevelSelect("hard")}>
            <span className="level-name">Hard</span>
            <span className="level-description">Monkey Madness</span>
          </button>
        </li>
      </ul>
    </div>
  );
}

export default Levels;