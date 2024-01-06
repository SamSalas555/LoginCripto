import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import 'bootstrap/dist/css/bootstrap.min.css';
import pdfMake from 'pdfmake/build/pdfmake'; // Importa pdfMake
import pdfFonts from 'pdfmake/build/vfs_fonts'; // Importa los fonts
import forge from 'node-forge';
import { Container, Row, Col, Form, Button , Card} from 'react-bootstrap';
import  {db} from '../config/firebase'


// Get a database reference to our blog
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
  const [verificationPrivateKeyFile, setVerificationPrivateKeyFile] = useState(null);
  const [verificationPublicKeyFile, setVerificationPublicKeyFile] = useState(null);
  const [fileForVerification, setFileForVerification] = useState(null);
  const [receiverPublicKeyFile, setReceiverPublicKeyFile] = useState(null);
 
  useEffect(() => {
    // Generar llaves al cargar la página
    checkKeysExistence();
  }, []);

  function checkKeysExistence() {
    const usuario = currentUser.uid;

    // Retrieve the user's data from Firebase
    ref.child(usuario).once('value', (snapshot) => {
      const userData = snapshot.val();

      if (!userData || !userData.publicKey || !userData.privateKey) {
        // Keys don't exist, generate and save new keys
        generateKeys();
      } else {
        // Keys already exist, set them in your component state
        
        setPublicKey(userData.publicKey);
        setPrivateKey(userData.privateKey);
      }
    });
  }

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
        console.log(usuario);
    
        // Accede al valor específico que deseas, por ejemplo, la clave pública
        const publick = usuario.publicKey; // Replace with your actual property name
        
        // Create a Blob containing the public key
        const publicKeyBlob = new Blob([publick], { type: 'text/plain' });
    
        // Display the public key
        setPublick(publick);
    
        // Create a download link
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(publicKeyBlob);
        downloadLink.download = 'public_key.pem';
        downloadLink.textContent = 'Download Public Key';
    
        // Append the link to the document
        document.body.appendChild(downloadLink);
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


 
  function handleFileSelectionForSigning(event) {
    setSelectedFile(event.target.files[0]);
  }

  function handleFileSelectionForVerification(event) {
    const file = event.target.files[0];
    console.log('Archivo seleccionado para verificación:', file);
    setFileForVerification(file);
  }
  // ******************CARGAR LLAVE PUBLICA DEL RECEPTOR PARA RSA********/
  function handleReceiverPublicKeySelection(event) {
    const receiverPublicKeyFile = event.target.files[0];
    setReceiverPublicKeyFile(receiverPublicKeyFile);
  }

  function handleVerificationKeySelection(event) {
    const keyFile = event.target.files[0];
    console.log('Archivo de clave pública seleccionado:', keyFile);
    setVerificationPublicKeyFile(keyFile);
  }
  
  function handleVerificationPrivateKeySelection(event) {
    const keyFile = event.target.files[0];
    setVerificationPrivateKeyFile(keyFile);
  }
  function handleVerificationPublicKeySelection(event) {
    const keyFile = event.target.files[0];
    setVerificationPublicKeyFile(keyFile);
  }

  function signFile() {
    if (!selectedFile || !publicKey || !receiverPublicKeyFile) {
      console.error('Seleccione un archivo y genere una llave primero.');
      return;
    }
  
    const reader = new FileReader();
    reader.onload = function () {
      const fileContents = reader.result; //contenido
     
      // ***************Generar una clave AES de 128bits y un IV aleatorio***********
      const asKey = forge.random.getBytesSync(16);
      const iv = forge.random.getBytesSync(16);

      // -------------------CIFRAR CON RSA LA LLAVE Y EL VECTOR IV -----------------
      // Obtener la clave pública del receptor
      const publicKeyReceiverFileReader = new FileReader();
      publicKeyReceiverFileReader.onload = function () {
        const publicKeyReceiverContents = publicKeyReceiverFileReader.result;
        const publicKeyReceiverObj = forge.pki.publicKeyFromPem(publicKeyReceiverContents);

      // Cifrar la clave AES y el IV con RSA
        const encryptedAesKey = publicKeyReceiverObj.encrypt(aesKey, 'RSA-OAEP');
        const encryptedIV = publicKeyReceiverObj.encrypt(iv, 'RSA-OAEP');


      //Crear el cifrador AES en modo CBC
        const cipher = forge.cipher.createCipher('AES-CBC', asKey);
        cipher.start({iv});
        cipher.update(forge.util.createBuffer(fileContents,'utf8'));
        cipher.finish();
        const encrypted = cipher.output.getBytes();

      //HASH DEL CONTENIDO CIFRADO
        const privateKeyp = forge.pki.privateKeyFromPem(privateKey);
        const md = forge.md.sha256.create();
        md.update(encrypted, 'utf8');

        //Firmar el contenido cifrado utilizando la clave privada
        var signature = privateKeyp.sign(md);
      // ******************************************************************************

     /* //HASH DEL CONTENIDO
      console.log('Clave privada almacenada:', privateKey);
      const privateKeyp = forge.pki.privateKeyFromPem(privateKey);
      const md = forge.md.sha256.create();
      md.update(fileContents, 'utf8');
      
      var signature = privateKeyp.sign(md); // Firmar el contenido del archivo*/
      console.log("Mensaje original: " + fileContents);
      console.log("Digesto: "); //agregar el digesto del contenido

      // **************CODIFICAR FIRMA Y EL CONTENIDO CIFRADO ************************
        signature = forge.util.encode64(signature);
        const encodedEncrypted = forge.util.encode64(encrypted);
        const encodedEncryptedAesKey = forge.util.encode64(encryptedAesKey);
        const encodedEncryptedIV = forge.util.encode64(encryptedIV);
        // ******************************************************************************
        //signature = forge.util.encode64(signature);
        console.log("Firma: " + signature);
        console.log('tamaño de firma:', signature.length);
      
    
      // Crear un Blob con el contenido original y la firma al final, incluyendo delimitadores
        const signedContent = encodedEncryptedAesKey + "\n"+encodedEncryptedIV+"\n"+ encodedEncrypted + "\n" + signature;
      // const signedContent = fileContents + "\n" + signature;
        const signedBlob = new Blob([signedContent], { type: 'text/plain' });
    
        const link = document.createElement('a');
        link.href = URL.createObjectURL(signedBlob); // Establecer el Blob como el enlace de descarga
        link.download = 'archivo_firmado_cifrado.txt'; // Nombre del archivo descargado
        link.click(); // Simular clic en el enlace para descargar
      };
      publicKeyReceiverFileReader.readAsText(receiverPublicKeyFile);
    };
    reader.readAsText(selectedFile);
  }

  /*function verifySignature() {
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
        const publicKey = forge.pki.publicKeyFromPem(publicKeyContents);
        console.log('Contenido de la clave pública:', publicKeyContents);
  
  
        const md = forge.md.sha256.create();
        md.update(plaintext, 'utf8');

        var firma = forge.util.decode64(signature);
        const fileHash = md.digest().getBytes();
        const encodeFileHash = forge.util.encode64(fileHash);
        console.log('Hash del contenido:', fileHash);
        console.log('encode Hash del contenido:', encodeFileHash);
        try{        
                const isValid = publicKey.verify(fileHash, firma);
                console.log('La firma es válida:', isValid);
                  if (isValid) {
                    alert('La firma es válida.');      
                   } else {         
                    alert('La firma no es válida.');    
                  }     
              }catch{
                alert('La firma no es válida.'); 
              }
        };
  
       
      publicKeyReader.readAsText(verificationPublicKeyFile);
    };
    reader.readAsText(fileForVerification);
  }*/
  function verifySignature() {
    if (!fileForVerification || !verificationPrivateKeyFile || !verificationPublicKeyFile) {
      console.error('Seleccione los archivos necesarios para la verificación de la firma.');
      return;
    }
  
    const reader = new FileReader();
    reader.onload = function () {
      const fileContents = reader.result;
  
      // Separar las secciones del archivo cifrado
      const sections = fileContents.split('\n');
  
      const encodedEncryptedAesKey = sections[0];
      const encodedEncryptedIV = sections[1];
      const encodedEncrypted = sections[2];
      const signature = sections[3];
  
      // Decodificar la firma y el texto cifrado
      const decodedSignature = forge.util.decode64(signature);
      const encrypted = forge.util.decode64(encodedEncrypted);
  
      // Leer la clave privada para descifrar la aesKey y el IV
      const privateKeyReader = new FileReader();
      privateKeyReader.onload = function () {
        const privateKeyContents = privateKeyReader.result;
        const privateKey = forge.pki.privateKeyFromPem(privateKeyContents);
  
        // Descifrar la aesKey y el IV utilizando RSA
        const aesKey = privateKey.decrypt(forge.util.decode64(encodedEncryptedAesKey), 'RSA-OAEP');
        const iv = privateKey.decrypt(forge.util.decode64(encodedEncryptedIV), 'RSA-OAEP');
  
        // Crear un descifrador AES en modo CBC
        const decipher = forge.cipher.createDecipher('AES-CBC', aesKey);
        decipher.start({ iv });
        decipher.update(forge.util.createBuffer(encrypted));
        decipher.finish();
        const decrypted = decipher.output.getBytes();
  
        // Leer la clave pública para la verificación de la firma
        const publicKeyReader = new FileReader();
        publicKeyReader.onload = function () {
          const publicKeyContents = publicKeyReader.result;
          const publicKey = forge.pki.publicKeyFromPem(publicKeyContents);
  
          // Verificar la firma del contenido descifrado
          const md = forge.md.sha256.create();
          md.update(decrypted, 'utf8');
          const fileHash = md.digest().getBytes();
  
          try {
            const isValid = publicKey.verify(fileHash, decodedSignature);
            console.log('La firma es válida:', isValid);
            if (isValid) {
              alert('La firma es válida.');
            } else {
              alert('La firma no es válida.');
            }
          } catch {
            alert('La firma no es válida.');
          }
        };
  
        publicKeyReader.readAsText(verificationPublicKeyFile);
      };
  
      privateKeyReader.readAsText(verificationPrivateKeyFile);
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
        </div>
        <Container>
              {/* Sección para firmar archivo */}
      <Row className="mb-3">
        <Col>
          <Form.Group controlId="formFile" className="mb-3 keys">
            <Form.Label>Archivo a Firmar</Form.Label>
            <Form.Control type="file" onChange={handleFileSelectionForSigning} />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="formFile" className="mb-3 keys">
            <Form.Label>Llave Pública del Receptor</Form.Label>
            <Form.Control type="file" onChange={handleReceiverPublicKeySelection} />
          </Form.Group>
        </Col>
        <Col className="text-center mb-3 align-middle">
          <Button
            type="button"
            className="align-middle buttonssd" 
            onClick={signFile}
          >
            Generar Archivo Firmado
          </Button>
        </Col>
      </Row>
       <Button
          type="button"
          className="w-100 btn-lg btn-custom"
          id="generate-keys"
          onClick={showKey}
        >
          Muestra llaves
        </Button>
        <p className='keys'
        >{publick}</p>

      {/* Sección para verificar firma */}
      <Row className="mb-3">
        <Col>
          <Form.Group controlId="formFile" className="mb-3 keys ">
            <Form.Label>Archivo Firmado a Verificar</Form.Label>
            <Form.Control type="file" onChange={handleFileSelectionForVerification} />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="formFile" className="mb-3 keys">
            <Form.Label>Llave Pública</Form.Label>
            <Form.Control type="file" onChange={handleVerificationKeySelection} />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="formFile" className="mb-3 keys">
            <Form.Label>Llave Privada del Receptor</Form.Label>
            <Form.Control type="file" onChange={handleVerificationPrivateKeySelection} />
          </Form.Group>
        </Col>
        <Col className="text-center mb-3 align-middle">
          <Button className="align-middle buttonssd" onClick={verifySignature}>
            Verificar Firma
          </Button>
        </Col>
      </Row>
    </Container>
    

      </main>
      </div>
    </div>
  );

  }
