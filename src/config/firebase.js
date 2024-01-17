import firebase from "firebase/app";
import 'firebase/auth'
import 'firebase/database'

const app = firebase.initializeApp({
    apiKey: "AIzaSyCtjyPSdiPDugGxMJg9xBZ9h_MGopcMyGA",
    authDomain: "crypto-a8c97.firebaseapp.com",
    databaseURL: "https://crypto-a8c97-default-rtdb.firebaseio.com",
    projectId: "crypto-a8c97",
    storageBucket: "crypto-a8c97.appspot.com",
    messagingSenderId: "103602409758",
    appId: "1:103602409758:web:9d5ab4403272fdb853790f"
})
export const db = app.database()
export const auth = app.auth()
export default app