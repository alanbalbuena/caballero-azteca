import firebase from 'firebase';

const firebaseConfig = {
  apiKey: "AIzaSyD5ceEqOwx_vgWHhuuAhrAk8nQ6fbVYIGM",
  authDomain: "caballero-azteca-ventas.firebaseapp.com",
  databaseURL: "https://caballero-azteca-ventas.firebaseio.com",
  projectId: "caballero-azteca-ventas",
  storageBucket: "caballero-azteca-ventas.appspot.com",
  messagingSenderId: "232273736551",
  appId: "1:232273736551:web:8f2f92bcd26f6f4df635c2",
  measurementId: "G-WLZ6ZS74NV"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
export const db = firebase.database();
export const storage = firebase.storage();

export default firebase;

const provider = new firebase.auth.GoogleAuthProvider();

export const signInWithGoogle = () => {
  auth.signInWithPopup(provider);
};

export const generateUserDocument = async (user, additionalData) => {

  if (!user) return;

  const currentuser = auth.currentUser.uid;
  const userRef = db.ref('/Usuario/' + currentuser)
  var snapshotObtenido = [];

  userRef.on('value', (snapshot) => {
    snapshotObtenido = snapshot.val();
  });

  return getUserDocument(user.uid);
};

const getUserDocument = async uid => {

  const currentuser = auth.currentUser.uid;
  const userRef = db.ref('/Usuario/' + currentuser)
  var snapshotObtenido = [];

  userRef.on('value', (snapshot) => {
    snapshotObtenido = snapshot.val();
  });


  if (!uid) return null;
  try {

    const userDocument = auth.currentUser.uid;
    return {
      uid,
      ...snapshotObtenido
    };
  } catch (error) {
    console.error("Error fetching user", error);
  }
};
