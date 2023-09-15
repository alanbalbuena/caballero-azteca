import { limitToLast, onValue, query, ref } from 'firebase/database'
import React, { useEffect } from 'react'
import { useState } from 'react'
import { auth, db } from '../util/firebase'

export default function Ejemplo() {

  const [data, setData] = useState([])
  const refFoliolimit2 = query(ref(db, 'Folio'), limitToLast(2))
  const [permisos, setPermisos] = useState('');

  useEffect(() => {
    onValue(refFoliolimit2, (snapshot) => {
      let auxData = []
      snapshot.forEach((childSnapshot) => {
        auxData.push(childSnapshot.val())
      })
      setData(auxData)
    })
  }, [])

  /*  onAuthStateChanged(auth, user => {
     if (user) {
       setBandera(true);
       setNombreUsuario(user.displayName);
     }
   }) */

  return (
    <>
      <h1>{permisos}</h1>
      {/* {
        data.map((d, index) => (
          <p key={index}>{d.folio}</p>
        ))
      } */}
    </>
  )

}
