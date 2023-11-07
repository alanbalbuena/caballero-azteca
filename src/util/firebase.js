import { initializeApp } from "firebase/app";
import { getDatabase, } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const entornoPruduccion = true;
const entornoPruduccionSiteGround = true;

const firebaseConfigTest = {  
  apiKey: "AIzaSyD5ceEqOwx_vgWHhuuAhrAk8nQ6fbVYIGM",
  authDomain: "caballero-azteca-ventas.firebaseapp.com",
  databaseURL: "https://caballero-azteca-ventas-testing.firebaseio.com",
  projectId: "caballero-azteca-ventas",
  storageBucket: "caballero-azteca-ventas-testing",
  messagingSenderId: "232273736551",
  appId: "1:232273736551:web:bc5e373f23be8dddf635c2",
  measurementId: "G-9HJ2J1FX4J"
};

const firebaseConfigProd = {
  apiKey: "AIzaSyD5ceEqOwx_vgWHhuuAhrAk8nQ6fbVYIGM",
  authDomain: "caballero-azteca-ventas.firebaseapp.com",
  databaseURL: "https://caballero-azteca-ventas.firebaseio.com",
  projectId: "caballero-azteca-ventas",
  storageBucket: "caballero-azteca-ventas.appspot.com",
  messagingSenderId: "232273736551",
  appId: "1:232273736551:web:bc5e373f23be8dddf635c2",
  measurementId: "G-9HJ2J1FX4J"
};
// Initialize Firebase
var firebase = null;
export default firebase = initializeApp(entornoPruduccion ? firebaseConfigProd : firebaseConfigTest);
export const db = getDatabase(firebase);
export const auth = getAuth();
export const varStorage = getStorage();

export const urlSiteGround = entornoPruduccionSiteGround ? "https://admin.caballeroazteca.com/" : "http://localhost/caballeroazteca/"
 
