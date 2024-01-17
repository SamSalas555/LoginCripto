// TwoFactorAuth.js
import React, { useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'

export default function TwoFactorAuth() {
  const { currentUser, logout } = useAuth()
  const codeRef = useRef();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  async function handleVerifyCode() {
    setError('');
    setLoading(true);

    try {
        const formData = new FormData();
        formData.append('codigo', codeRef.current.value);
        formData.append('uid', currentUser.uid);
      
        const response = await fetch('http://localhost:5000/verificar_codigo', {
          method: 'POST',
          body: formData,
        });
      
        const data = await response.json();
        console.log(data.status)
      
        if (data.status =="True") {
          // Redirigir a Dashboard si la verificación es exitosa
          history.push('/dashboard');
        } else {
          // Redirigir a Login si la verificación falla
          history.push('/');
        }
      } catch (error) {
        // Manejar errores
        console.error('Error al verificar el código:', error);
      }
      

    setLoading(false);
  }

  return (
    <div>
      <section className="login">
        <div className="loginContainer">
          <h1>Verificación de Dos Factores</h1>
          {error && <h1>{error}</h1>}
          <form>
            <label>Código de Verificación</label>
            <input type="text" required ref={codeRef} />
            <div className="btnContainer">
              <button type="button" onClick={handleVerifyCode} disabled={loading}>
                Verificar Código
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
