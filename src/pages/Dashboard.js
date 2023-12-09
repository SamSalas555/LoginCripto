import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Card, Button } from 'react-bootstrap'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import pdfMake from 'pdfmake/build/pdfmake'; // Importa pdfMake
import pdfFonts from 'pdfmake/build/vfs_fonts'; // Importa los fonts
import forge from 'node-forge';
import app, {appli} from '../config/firebase'

// Import Admin SDK
import { getDatabase } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js';

// Get a database reference to our blog
const db = getDatabase(appli);
const ref = db.ref('users')






// Asigna los fonts a pdfMake
pdfMake.vfs = pdfFonts.pdfMake.vfs;

export default function Dashboard() {

  const [error, setError] = useState('')
  const { currentUser, logout } = useAuth()
  const history = useHistory()

  const [publick, setPublick] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');

  function generateKeys() {
    const keys = forge.pki.rsa.generateKeyPair({ bits: 2048 });
    const publicKeyPem = forge.pki.publicKeyToPem(keys.publicKey);
    const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);
    
    setPublicKey(publicKeyPem);
    setPrivateKey(privateKeyPem);

    console.log('Public Key:', publicKeyPem);
    console.log('Private Key:', privateKeyPem);
    const usuario = currentUser.uid;
    ref.child(usuario).set({
      publicKey: publicKeyPem ,
      privateKey: privateKeyPem
    });}


    function showKey() {
    var userRef = db.ref('users/' + currentUser.uid);
    userRef.on('value', function(snapshot) {
    // Recupera los datos del usuario
    var usuario = snapshot.val();
    console.log(usuario)
    // Accede al valor específico que deseas, por ejemplo, el nombre
    var publicks = usuario.publicKey;
    console.log(publick)
    setPublick(publicks);
  });
  }

  async function handleLogout() {
    setError('')

    try {
      await logout()
      history.push('/')
    } catch {
      setError('Hubo un fallo al salir')
    }
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
          className="w-100 btn-lg btn-custom"
          id="generate-keys"
          onClick={generateKeys}
        >
          Genera llaves
        </Button>
        <Button
          type="button"
          className="w-100 btn-lg btn-custom"
          id="generate-keys"
          onClick={showKey}
        >
          Muestra llaves
        </Button>
      </main>
      <p className='keys  '>{publick}</p>
      </div>
    </div>
  );

}
