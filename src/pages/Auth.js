import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import app from "../services/firebaseConfig";
import "./styles/Auth.css";
import { useAuth } from "../context/AuthContext";

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const auth = getAuth(app);
  const db = getFirestore(app);


  // Email Validation
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  // Password Validation
  const validatePassword = (password) => {
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
    return re.test(password);
  };

  // Username Validation
  const validateUsername = (username) => {
    const re = /^[a-zA-Z0-9]{3,}$/;
    return re.test(username);
  };


  // Handle Success Redirection
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
        if (!isLogin) {
          setIsLogin(true); // Switch to login page after successful registration
        } else {
          navigate("/levels"); // Redirect to levels page after login
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, isLogin, navigate]);


  // Form Submission Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!isLogin) {
      if (!validateUsername(username)) {
        setError("Username must be at least 3 characters long and contain only letters and numbers.");
        return;
      }
      if (!validateEmail(email)) {
        setError("Please enter a valid email address.");
        return;
      }
      if (!validatePassword(password)) {
        setError("Password must be at least 6 characters long, contain at least one number, one lowercase and one uppercase letter.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match!");
        return;
      }
    } else {
      if (!validateEmail(email)) {
        setError("Please enter a valid email address.");
        return;
      }
      if (!validatePassword(password)) {
        setError("Password must be at least 6 characters long, contain at least one number, one lowercase and one uppercase letter.");
        return;
      }
    }

    try {
      let userCredential;
      if (isLogin) {
        // User Login
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        setSuccessMessage("Login successful!");
        setSuccess(true);
      } else {
        // User Registration
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        setSuccessMessage("Registration successful!");
        setSuccess(true);


        // Save user details in Firestore
        const user = userCredential.user;
        await setDoc(doc(db, "users", user.uid), {
          username: username,
          email: user.email,
        });

        // Clear Form Fields
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setUsername("");

        return; // Prevent login redirection immediately
      }

      
      // Save Auth Token
      const token = await userCredential.user.getIdToken();
      localStorage.setItem("token", token);
      login(userCredential.user);
    } catch (error) {
      setError(error.message);
    }
  };

  // Toggle Between Login & Signup
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setSuccess(false);
  };

  return (
    <div className="auth-container">
      <div className={`auth-card ${success ? "success" : ""}`}>
        <h2 className="auth-title">{isLogin ? "Welcome Back!" : "Join the Quest!"}</h2>
        <p className="auth-subtitle">
          {isLogin ? "Continue your banana adventure!" : "Create an account to start collecting bananas!"}
        </p>
        
        {success ? (
          <div className="success-message">
            <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
              <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
            <p>{successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="input-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength="3"
                  pattern="[a-zA-Z0-9]+"
                />
              </div>
            )}
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
                pattern="^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$"
              />
            </div>
            {!isLogin && (
              <div className="input-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength="6"
                  pattern="^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$"
                />
              </div>
            )}
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="auth-button">
              {isLogin ? "Login" : "Create Account"}
            </button>
          </form>
        )}
        
        {!success && (
          <p className="auth-switch">
            {isLogin ? "New to Banana Quest? " : "Already have an account? "}
            <button className="switch-button" onClick={toggleAuthMode}>
              {isLogin ? "Join Now" : "Login Here"}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

export default Auth;
