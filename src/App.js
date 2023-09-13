import React, { useState, useEffect } from "react";
import BDAdmin from "./components/BDAdmin";
import Usuarios from "./components/Usuarios";
import ListaFolios from "./components//ListaFolios";
import Example from "./components/ejemplo";
import Clientes from "./components/Clientes";
import Login from "./components/Login";
import { Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./util/firebase";
import Cobranza from "./components/Cobranza";
import ReporteVentas from "./components/ReporteVentas";
import { onValue, ref } from "firebase/database";

export default function App() {

  const [banera, setBandera] = useState(false)
  const [nombreUsuario, setNombreUsuario] = useState()
  const [permisos, setPermisos] = useState()

  onAuthStateChanged(auth, user => {
    if (user) {
      setBandera(true);
      setNombreUsuario(user.displayName);

      let userRef = ref(db, '/Usuario/' + auth.currentUser.uid)
      onValue(userRef, (snapshot) => {
        let data = snapshot.val();
        setPermisos(data.permisos);
      });
    }
  }).bind(this);

  return (
    banera ?
      <>
        <NavBar permisos={permisos}/>
        <Routes>
          <Route path="/folios" element={<ListaFolios nombre={nombreUsuario} />} />
          <Route path="/adminbd" element={<BDAdmin />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/ejemplo" element={<Example />} />
          <Route path="/cobranza" element={<Cobranza />} />
          <Route path="/reporteVentas" element={<ReporteVentas />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </>
      :
      <Routes>
        <Route path="/" exact element={<Login />} />
        <Route path="*" element={<Login />} />
      </Routes>
  );

}
