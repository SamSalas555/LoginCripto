import React, { useContext, useState, useEffect } from "react";
import { auth } from '../config/firebase';
import { useHistory } from 'react-router-dom';

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  function signup(email, password) {
    return auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        userCredential.user.sendEmailVerification();
      });
  }

  function login(email, password) {
    return auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
  
        // Verifica si el correo electrónico está verificado
        if (!user.emailVerified) {
          history.push('/verificar-correo')
        }
  
        // Si el correo está verificado, devuelve el usuario
        return user;
      });
  }

  function logout() {
    return auth.signOut();
  }

  function resetPassword(email) {
    return auth.sendPasswordResetEmail(email);
  }

  function updateEmail(email) {
    return currentUser.updateEmail(email);
  }

  function updatePassword(password) {
    return currentUser.updatePassword(password);
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      setLoading(false);
      console.log(user);
      // Redirige si el correo no está verificado
      if (user && !user.emailVerified) {
        history.push('/verificar-correo');  // Ajusta la ruta según tu configuración
      }
    });

    return unsubscribe;
  }, [history]);

  const value = {
    currentUser,
    login,
    signup,
    logout,
    resetPassword,
    updateEmail,
    updatePassword
  };

  return (
    <AuthContext.Provider value={value}>
      { !loading && children }
    </AuthContext.Provider>
  );
}
