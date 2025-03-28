import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import app from "../services/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import "./styles/Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const auth = getAuth(app);
  const { user } = useAuth();


  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("token");
      localStorage.removeItem("profilePhoto");
      navigate("/auth");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  
  return (
    <div className="navbar-wrapper">
      <nav className="navbar">
        <h1 className="game-title" onClick={() => navigate("/")}>
          <span className="title-highlight">Banana</span> Quest
        </h1>
        <ul className="nav-links">
          <li onClick={() => navigate("/")}>Home</li>
          <li onClick={() => navigate("/leaderboard")}>Leaderboard</li>
          <li onClick={() => navigate("/profile")}>Profile</li>
          <li className="nav-button" onClick={user ? handleLogout : () => navigate("/auth")}>
            {user ? "Logout" : "Login"}
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Navbar;