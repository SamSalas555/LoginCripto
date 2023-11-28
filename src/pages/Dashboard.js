import React, { useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Card, Button } from 'react-bootstrap'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import pdfMake from 'pdfmake/build/pdfmake'; // Importa pdfMake
import pdfFonts from 'pdfmake/build/vfs_fonts'; // Importa los fonts

// Asigna los fonts a pdfMake
pdfMake.vfs = pdfFonts.pdfMake.vfs;

export default function Dashboard() {

  const [error, setError] = useState('')
  const { currentUser, logout } = useAuth()
  const history = useHistory()

  async function handleLogout() {
    setError('')

    try {
      await logout()
      history.push('/')
    } catch {
      setError('Hubo un fallo al salir')
    }
  }

   // Función para generar el PDF
   function generatePDF() {
    const loremIpsumText =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

    // Definir la estructura del documento con estilos
    const documentDefinition = {
      content: [
        { text: 'Documento Personalizado', fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
        { text: loremIpsumText, fontSize: 12, margin: [0, 0, 0, 10] },
      ],
    };

    // Generar el documento PDF y abrirlo
    pdfMake.createPdf(documentDefinition).open();
  }
  return (
    <div className="hero">
      <nav>
        <h2>Bienvenido {currentUser.email}</h2>
        <div className="menu">
          <button><Link to='/update-profile'>Perfil</Link></button>
          <button onClick={handleLogout}>Salir</button>
        </div>
      </nav>
      {error && <h1>{error}</h1>}

      <div className="container mt-5">
      <main id="pdf-content">
        <div className="row row-cols-1 row-cols-md-3 text-center">
          <div className="col">
            <Card className="mb-4 rounded-3 shadow">
              <Card.Header>
                <Card.Title>Criptografía Clásica</Card.Title>
              </Card.Header>
              <Card.Body>
                <Card.Text>
                  La criptografía clásica es conocida también como criptografía no computarizada o mejor dicho no digitalizada. Los métodos utilizados eran variados, algunos muy simples y otros muy complicados de criptoanalizar para su época.
                </Card.Text>
                <Button variant="primary" className="w-100 btn-lg btn-custom">Aprende más</Button>
              </Card.Body>
            </Card>
          </div>
          <div className="col">
            <Card className="mb-4 rounded-3 shadow">
              <Card.Header>
                <Card.Title>Criptografía Moderna</Card.Title>
              </Card.Header>
              <Card.Body>
                <Card.Text>
                  Se centra en resolver los problemas que puedan surgir en cualquier tipo de computación distribuida, la seguridad de la información digital o en transacciones. Surge tras la aparición de los primeros computadores.
                </Card.Text>
                <Button variant="primary" className="w-100 btn-lg btn-custom">Aprende más</Button>
              </Card.Body>
            </Card>
          </div>
          <div className="col">
            <Card className="mb-4 rounded-3 shadow">
              <Card.Header>
                <Card.Title>Cripto chismes</Card.Title>
              </Card.Header>
              <Card.Body>
                <Card.Text>
                  ¡Explora el fascinante mundo del secreto y la seguridad en nuestro exclusivo rincón de Cripto Chisme! Adéntrate en el intrigante universo de la criptografía y descubre algunas historias interesantes sobre la criptografía.
                </Card.Text>
                <Button variant="primary" className="w-100 btn-lg btn-custom">Aprende más</Button>
              </Card.Body>
            </Card>
          </div>
        </div>
         <Button
          type="button"
          className="mx-auto d-block w-30 btn-lg btn-outline-primary"
          id="generate-pdf-button"
          onClick={generatePDF}
           // Agregar la función al hacer clic
        >
          Genera un documento
        </Button>
      </main>
      </div>
    </div>
  );
  }
