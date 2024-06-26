import React, { useState, useEffect } from "react";
import BDAdmin from "./components/BDAdmin";
import Usuarios from "./components/Usuarios";
import ListaFolios from "./components//ListaFolios";
import Clientes from "./components/Clientes";
import Ejemplo from "./components/ejemplo";
import Login from "./components/Login";
import { Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar";
import { auth, db } from "./util/firebase";
import Cobranza from "./components/Cobranza";
import ReporteVentas from "./components/ReporteVentas";
import { onValue, ref } from "firebase/database";
import { useAuthState } from "react-firebase-hooks/auth";
import Bancos from "./components/Bancos";
import Pagos from "./components/Pagos";

export default function App() {

  const [banera, setBandera] = useState(false)
  const [nombreUsuario, setNombreUsuario] = useState()
  const [permisos, setPermisos] = useState()
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      let userRef = ref(db, '/Usuario/' + user.uid)
      onValue(userRef, (snapshot) => {
        setPermisos(snapshot.val().permisos);
        setBandera(true);
        setNombreUsuario(user.displayName);
      });
    }
  }, [user])

  return (
    banera ?
      <>
        <NavBar permisos={permisos} />
        <Routes>
          <Route path="/folios" element={<ListaFolios nombre={nombreUsuario} permisos={permisos} />} />
          <Route path="/" exact element={<ListaFolios nombre={nombreUsuario} permisos={permisos} />} />
          <Route path="/adminbd" element={<BDAdmin permisos={permisos}/>} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/cobranza" element={<Cobranza nombre={nombreUsuario} permisos={permisos} />} />
          <Route path="/ejemplo" element={<Ejemplo />} />
          <Route path="/reporteVentas" element={<ReporteVentas />} />
          <Route path="/login" element={<Login />} />
          <Route path="/bancos" element={<Bancos />} />
          <Route path="/pagos" element={<Pagos />} />
        </Routes>
      </>
      :
   
       <Routes>
        <Route path="*" element={<Login />} />
      </Routes> 
  );

}
