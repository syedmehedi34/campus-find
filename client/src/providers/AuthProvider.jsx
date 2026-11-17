/* eslint-disable react-refresh/only-export-components */

import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";

import { createContext, useContext, useEffect, useState } from "react";

import app from "../firebase/firebase.init";
import Loader from "../components/Loader";

export const AuthContext = createContext();

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Register
  const createNewUser = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Login
  const signInUser = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Google Login
  const signInWithGoogle = () => {
    return signInWithPopup(auth, googleProvider);
  };

  // Logout
  const logOut = () => {
    return signOut(auth);
  };

  // Reset Password
  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  // Update Profile
  const updateUser = async (updatedData) => {
    if (!auth.currentUser) {
      throw new Error("No authenticated user found");
    }

    await updateProfile(auth.currentUser, updatedData);

    setUser({ ...auth.currentUser });
  };

  // Auth State Observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Context Values
  const authInfo = {
    user,
    setUser,
    loading,
    setLoading,
    createNewUser,
    signInUser,
    signInWithGoogle,
    logOut,
    updateUser,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={authInfo}>
      {loading ? <Loader /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthProvider;
