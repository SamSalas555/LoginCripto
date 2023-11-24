import React from 'react'
import { Link } from 'react-router-dom'

const success = () => {
  return (
    <div>
         <section className="login">
        <div className="loginContainer" >
          <h1>Su enlace para restablecer contrseña ha sido enviado revise su bandeja de entrada</h1>
          <div className="btnContainer">
              <button><Link to='/'>Continuar</Link></button>
            </div>
        </div>
        </section>
    </div>
  )
}

export default success