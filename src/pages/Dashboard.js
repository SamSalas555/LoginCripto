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
  const [selectedFile, setSelectedFile] = useState(null);
  const [signature, setSignature] = useState('');
  const [verificationPublicKeyFile, setVerificationPublicKeyFile] = useState(null);


  useEffect(() => {
    // Generar llaves al cargar la página
    generateKeys();
  }, []);

  function generateKeys() {
    const keys = forge.pki.rsa.generateKeyPair({ bits: 2048 });
    const publicKeyPem = forge.pki.publicKeyToPem(keys.publicKey);
    const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);
    
    setPublicKey(publicKeyPem);
    setPrivateKey(privateKeyPem);

    localStorage.setItem('privateKey', privateKeyPem); 
    //localStorage.setItem('privateKey', privateKeyPem); 
    console.log('Public Key:', publicKeyPem);
    console.log('Private Key:', privateKeyPem);
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


  function handleFileSelection(event) {
    setSelectedFile(event.target.files[0]);
  }

  function handleVerificationKeySelection(event) {
    setVerificationPublicKeyFile(event.target.files[0]);
  }


  function signFile() {
    if (!selectedFile || !publicKey) {
      console.error('Seleccione un archivo y genere una llave primero.');
      return;
    }
  
    const reader = new FileReader();
    reader.onload = function () {
      const fileContents = reader.result;
  
      const md = forge.md.sha256.create();
      md.update(fileContents, 'utf8');
      console.log("Hash antes de firmar", md.getBytes);
  
      const privateKey = forge.pki.privateKeyFromPem(localStorage.getItem('privateKey')); // Obtener la clave privada
  
      const signature = privateKey.sign(md); // Firmar el contenido del archivo
  
      // Crear un Blob con el contenido original y la firma al final, incluyendo delimitadores
      const signedContent = fileContents + '\n\n-----BEGIN SIGNATURE-----\n' + signature + '\n-----END SIGNATURE-----\n';
      const signedBlob = new Blob([signedContent], { type: 'text/plain' });
  
      const link = document.createElement('a');
      link.href = URL.createObjectURL(signedBlob); // Establecer el Blob como el enlace de descarga
      link.download = 'archivo_firmado.txt'; // Nombre del archivo descargado
      link.click(); // Simular clic en el enlace para descargar
  
      console.log('FIRMA1:', signature);
    };
    reader.readAsText(selectedFile);
  }
  

  //-**************VERIFICAR*********
  function verifySignature() {
    if (!selectedFile || !verificationPublicKeyFile) {
      console.error('Seleccione un archivo y cargue el archivo de llave pública para verificar.');
      return;
    }
  
    const reader = new FileReader();
    reader.onload = function () {
      const fileContents = reader.result;
  
      const parts = fileContents.split('\n\n-----BEGIN SIGNATURE-----\n');
      if (parts.length !== 2) {
        console.error('El archivo no contiene una firma válida.');
        return;
      }
  
      const fileData = parts[0];
      console.log(`contenido: ${fileData}}`);
      const signature = parts[1].replace('-----END SIGNATURE-----\n', '');
      console.log(`firma: ${signature}`);

      const publicKeyReader = new FileReader();
      publicKeyReader.onload = function () {
        const publicKeyContents = publicKeyReader.result;
        console.log(`llave pub: ${publicKeyContents}`);

        const keys = forge.pki.publicKeyFromPem(publicKeyContents);
        

        const md = forge.md.sha256.create();
        md.update(fileData, 'utf8');
        const fileHash = md.digest().getBytes();
        console.log('Hash del contenido:', fileHash);

  
        const isValid = keys.verify(fileHash, signature);
        console.log('La firma es válida:', isValid);
        if (isValid) {
          alert('La firma es válida.');
        } else {
          alert('La firma no es válida.');
        }
      };
      publicKeyReader.readAsText(verificationPublicKeyFile);
    };
    reader.readAsText(selectedFile);
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
        <input type="file" onChange={handleFileSelection} />
        </div>
        <Button
          type="button"
          className="mx-auto d-block w-30 btn-lg btn-outline-primary"
          id="sign-txt"
          onClick={signFile}
        >
          Generar archivo firmado
        </Button>
       <input type="file" onChange={handleFileSelection} />
       <input type="file" onChange={handleVerificationKeySelection} />
        <Button onClick={verifySignature}>Verificar Firma</Button>
    
      </main>
      <p className='keys  '>{publick}</p>
      </div>
    </div>
  );

}
