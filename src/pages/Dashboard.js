import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Card, Button } from 'react-bootstrap'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import pdfMake from 'pdfmake/build/pdfmake'; // Importa pdfMake
import pdfFonts from 'pdfmake/build/vfs_fonts'; // Importa los fonts
import forge from 'node-forge';


// Asigna los fonts a pdfMake
pdfMake.vfs = pdfFonts.pdfMake.vfs;

export default function Dashboard() {

  const [error, setError] = useState('')
  const { currentUser, logout } = useAuth()
  const history = useHistory()


  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [signature, setSignature] = useState('');
  const [verificationPublicKeyFile, setVerificationPublicKeyFile] = useState(null);
  const [fileForVerification, setFileForVerification] = useState(null);
 
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
    localStorage.setItem('publicKey', publicKeyPem);
    console.log('Public Key:', publicKeyPem);
    console.log('Private Key:', privateKeyPem);

    const publicKeyBlob = new Blob([publicKeyPem], { type: 'text/plain' });

   // Crear un enlace de descarga
   const link = document.createElement('a');
   link.href = URL.createObjectURL(publicKeyBlob);
    link.download = 'llave_publica.pem'; // Nombre del archivo descargado
    link.click(); // Simular clic en el enlace para descargar
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


 
  function handleFileSelectionForSigning(event) {
    setSelectedFile(event.target.files[0]);
  }

  function handleFileSelectionForVerification(event) {
    const file = event.target.files[0];
    console.log('Archivo seleccionado para verificación:', file);
    setFileForVerification(file);
  }
  
  function handleVerificationKeySelection(event) {
    const keyFile = event.target.files[0];
    console.log('Archivo de clave pública seleccionado:', keyFile);
    setVerificationPublicKeyFile(keyFile);
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
      const fileHash = md.digest().getBytes();
      var encodeFileHash = forge.util.encode64(fileHash);

      console.log('Hash del archivo:', fileHash);
      console.log("hash decode: ", encodeFileHash);
  
      const storedPrivateKey = localStorage.getItem('privateKey');
      console.log('Clave privada almacenada:', storedPrivateKey);
      const privateKey = forge.pki.privateKeyFromPem(storedPrivateKey);
      var signature = privateKey.sign(md); // Firmar el contenido del archivo
      signature = forge.util.encode64(signature);
      console.log('FIRMA generada en signFile:', signature);
      console.log('tamaño de firma:', signature.length);
  
      // Crear un Blob con el contenido original y la firma al final, incluyendo delimitadores
      const signedContent = fileContents +  signature;
      const signedBlob = new Blob([signedContent], { type: 'text/plain' });
  
      const link = document.createElement('a');
      link.href = URL.createObjectURL(signedBlob); // Establecer el Blob como el enlace de descarga
      link.download = 'archivo_firmado.txt'; // Nombre del archivo descargado
      link.click(); // Simular clic en el enlace para descargar
    };
    reader.readAsText(selectedFile);
  }

  function verifySignature() {
    if (!fileForVerification || !verificationPublicKeyFile) {
      console.error('Seleccione un archivo y cargue el archivo de llave pública para verificar.');
      return;
    }
  
    const reader = new FileReader();
    reader.onload = function () {
      const fileContents = reader.result;
  
     var plaintext = fileContents.slice(0,fileContents.length-345);
     console.log("Plaintext:",plaintext);
     var signature = fileContents.slice(fileContents.length-344, fileContents.length);
     console.log("Signature:",signature);

      const publicKeyReader = new FileReader();
      publicKeyReader.onload = function () {
        const publicKeyContents = publicKeyReader.result;
        console.log('Contenido de la clave pública:', publicKeyContents);
  
        const publicKey = forge.pki.publicKeyFromPem(publicKeyContents);
  
        const md = forge.md.sha256.create();
        md.update(plaintext, 'utf8');
        const fileHash = md.digest().getBytes();
        const encodeFileHash = forge.util.encode64(fileHash);
        console.log('Hash del contenido:', fileHash);
        console.log('encode Hash del contenido:', encodeFileHash);
  
        const isValid = publicKey.verify(fileHash, signature);
        console.log('La firma es válida:', isValid);
        if (isValid) {
          alert('La firma es válida.');
        } else {
          alert('La firma no es válida.');
        }
      };
      publicKeyReader.readAsText(verificationPublicKeyFile);
    };
    reader.readAsText(fileForVerification);
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
        <input type="file" onChange={handleFileSelectionForSigning} />
        </div>
         <Button
          type="button"
          className="mx-auto d-block w-30 btn-lg btn-outline-primary"
          id="sign-txt"
          onClick={signFile}
        >
          Generar archivo firmado
        </Button>

   
       <input type="file" onChange={handleFileSelectionForVerification} />
       <input type="file" onChange={handleVerificationKeySelection} />
        <Button onClick={verifySignature}>Verificar Firma</Button>
    

      </main>
      </div>
    </div>
  );

  }
