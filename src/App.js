import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Levels from "./pages/Levels";
import Game from "./pages/Game";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Scoreboard from "./pages/Leaderboard";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/game" element={<Game />} />
          <Route path="/levels" element={<Levels />} />
          <Route path="/leaderboard" element={<Scoreboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;