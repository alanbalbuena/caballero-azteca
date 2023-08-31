import React, { useState, useEffect } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { Link, useNavigate } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import { onAuthStateChanged, signOut, getAuth } from "firebase/auth";
import { db, auth } from '../util/firebase';

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
    <nav className="container navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <a className="navbar-brand" href="/">
          <img src='https://firebasestorage.googleapis.com/v0/b/caballero-azteca-ventas.appspot.com/o/src%2Flogo.png?alt=media&token=9db8fc2e-3896-4646-9c15-ef9508763e4b' alt="logo"></img>
        </a>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/folios">Folios</Link>
            </li>
            {/*<li className="nav-item">
              <Link className="nav-link" to='/cotizaciones'>Cotizaciones</Link>
            </li> */}
            {
              permisos === "superusuario" &&
              <li className="nav-item">
                <Link className="nav-link" to="/adminbd">Bases de datos</Link>
              </li>
            }
            {
              permisos === "superusuario" &&
              <li className="nav-item">
                <Link className="nav-link" to="/usuarios">Usuarios</Link>
              </li>
            }
            {
              permisos === "superusuario" &&
              <li className="nav-item">
                <Link className="nav-link" to="/clientes">Clientes</Link>
              </li>
            }
            {
              permisos === "superusuario" &&
              <li className="nav-item">
                <Link className="nav-link" to="/cobranza">Cobranza</Link>
              </li>
            }
            {/* <li className="nav-item">
              <Link className="nav-link" to="/ejemplo">Ejemplo</Link>
            </li> */}
          </ul>
          <ul className="ml-auto">
            <li>
              <button className="mx-auto pull-right btn btn-danger"
                onClick={() => { close() }}>Cerrar sesion</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
