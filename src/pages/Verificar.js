import React from 'react'
import { Link } from 'react-router-dom'

const Verificar = () => {
  return (
    <div>
         <section className="login">
        <div className="loginContainer" >
          <h1>Verifique su correo antes de continuar</h1>
          <div className="btnContainer">
              <button><Link to='/'>Volver a Inicio</Link></button>
            </div>
        </div>
        </section>
    </div>
  )
}

export default Verificar