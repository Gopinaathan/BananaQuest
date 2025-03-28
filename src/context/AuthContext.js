import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import app from "../services/firebaseConfig";
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const auth = getAuth(app);

  const login = (user) => {
    setUser(user);
    Cookies.set('user', JSON.stringify(user), { expires: 7 }); 
  };

  const logout = () => {
    setUser(null);
    Cookies.remove('user');
  };

  useEffect(() => {
    const userFromCookie = Cookies.get('user');
    if (userFromCookie) {
      setUser(JSON.parse(userFromCookie));
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        login(user);
      } else {
        logout();
      }
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};