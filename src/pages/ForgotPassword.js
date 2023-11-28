import React, { useRef, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ForgotPassword() {
  const emailRef = useRef();
  const { resetPassword } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const history = useHistory();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setMessage('');
      setError('');
      setLoading(true);
      await resetPassword(emailRef.current.value);
      setMessage('Checa tu bandeja de entrada y sigue las instrucciones');
      // Redirige a la página con instrucciones
      history.push('/success-password');
    } catch {
      setError('Fallo al restaurar tu password');
    }

    setLoading(false);
  }

  return (
    <div>
      <section className="login">
        <h1>Etiqueta</h1>
        <div className="loginContainer">
          <h1>Recuperar contraseña</h1>
          {error && <h1>{error}</h1>}
          {message && <p>{message}</p>}
          <form onSubmit={handleSubmit}>
            <label>Email</label>
            <input
              type='email'
              autoFocus
              required
              ref={emailRef}
            />
            <div className="btnContainer">
              <button type='submit' disabled={loading}>Restaurar password</button>
              <p><Link to='/home'><span>Regresear</span></Link></p>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
