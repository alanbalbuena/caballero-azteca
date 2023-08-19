import React ,{ useState, useEffect }from "react";
import BDAdmin from "./components/BDAdmin";
import Usuarios from "./components/Usuarios";
import ListaFolios from "./components//ListaFolios";
import Example from "./components/ejemplo";
import Clientes from "./components/Clientes";
import Login from "./components/Login";
import { Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./util/firebase";

export default function App() {

  const [banera, setBandera] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, user => {
      if (user) {
        setBandera(true);
        
      }
    }).bind(this);

  }, [])

  return (
    banera ?
      <>
        <NavBar />
        <Routes>
          <Route path="/folios" element={<ListaFolios />} />
          <Route path="/adminbd" element={<BDAdmin />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/ejemplo" element={<Example />} />
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
