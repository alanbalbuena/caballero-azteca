import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import { onAuthStateChanged, signOut, getAuth } from "firebase/auth";
import { db, auth } from '../util/firebase';
import logo from '../logo-caballero-azteca.jpg';

function NavBar() {
  const navigate = useNavigate();
  const [permisos, setPermisos] = useState()

  useEffect(() => {
    onAuthStateChanged(auth, user => {
      if (user) {
        let userRef = ref(db, '/Usuario/' + auth.currentUser.uid)
        onValue(userRef, (snapshot) => {
          let data = snapshot.val();
          setPermisos(data.permisos);
        }, {
          onlyOnce: true
        });
      } else {
        navigate('/');
      }
    }).bind(this);

  })


  function close() {
    signOut(getAuth()).then(() => {
      window.location.reload(false);
    }).catch((error) => {
      console.log("ocurrio el siguiente error al intentar cerrar sesion: " + error);
    });
  }

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container">
          <img style={{ width: '150px' }} src={logo} alt="logo"></img>
          <div className="collapse navbar-collapse" id="navbarText">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <Link className="nav-link" to="/folios">Folios</Link>
              {
                permisos === 'superusuario'
                  ? <>
                    <Link className="nav-link" to="/adminbd">Base de datos</Link>
                    <Link className="nav-link" to="/usuarios">Usarios</Link>
                    <Link className="nav-link" to="/clientes">Clientes</Link>
                    <Link className="nav-link" to="/cobranza">Cobranza</Link>
                    <Link className="nav-link" to="/reporteVentas">Reporte de Ventas</Link>
                  </>
                  : ''
              }
            </ul>
            <button className='btn btn-danger' onClick={() => { close() }}>Cerrar sesion</button> 
          </div>
        </div>
      </nav>
    </>
  );
};

export default NavBar;
