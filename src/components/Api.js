import { db } from "../util/firebase";
import { query, ref, orderByChild, onValue } from "firebase/database";



export const saludo = () => {
  return "holasss"
};



export const getUsuarios = () => {
  const usuariosRef = query(ref(db, 'Usuario'), orderByChild('usuario'));
  onValue(usuariosRef, (snapshot) => {
    let list = []
    snapshot.forEach((childSnapshot) => {
      var key = childSnapshot.key;
      var data = childSnapshot.val();
      list.push({
        key: key,
        nombre: data.nombre,
        usuario: data.usuario,
        password: data.password,
        email: data.email,
        permisos: data.permisos,
        telefono: data.telefono
      });
  return list;
    });
  }, {
    onlyOnce: true
  })
}



