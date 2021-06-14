import React, { useState, useEffect } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";
import { db, auth } from "../util/firebase";

const NavBar = (props) => {

  const [permisos, setPermisos] = useState()
  const [usuario, setUsuario] = useState()

  useEffect(() => {

    auth.onAuthStateChanged(user => {

      if (user) {

        const userRef = db.ref('/Usuario/' + user.uid)
        var snapshotObtenido = [];

        userRef.on('value', (snapshot) => {
          snapshotObtenido = snapshot.val();
          setPermisos(snapshotObtenido.permisos)
          setUsuario(snapshotObtenido)
        });

      }
    }).bind(this);

  }, [])

  function close() {
    auth.signOut()
    window.location.reload();
  }

  return (
    <nav className="col-sm-12 navbar navbar-expand-lg navbar-light bg-light">
      <div
        style={{
          background: `url('https://firebasestorage.googleapis.com/v0/b/caballero-azteca-ventas.appspot.com/o/src%2Flogo.png?alt=media&token=9db8fc2e-3896-4646-9c15-ef9508763e4b')  no-repeat center center`,
          backgroundSize: "fit",
          height: "150px",
          width: "150px"
        }}
        className=""></div>
      <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarNavDropdown">
        <ul className="navbar-nav">
          <li className="nav-item">
            <Link
              className="nav-link"
              to={{
                pathname: '/',
                state: {
                  tipo: 'folios'
                }
              }}
            >
              <strong>Folios</strong></Link>
          </li>
          <li className="nav-item">
            <Link
              className="nav-link"
              to={{
                pathname: '/',
                state: {
                  tipo: 'cotizaciones'
                }
              }}
            >
              <strong>Cotizaciones</strong></Link>
          </li>
          {
            permisos === "superusuario" &&
            <li className="nav-item">
              <Link className="nav-link" to="/adminbd"><strong>Bases de datos</strong></Link>
            </li>
          }

        </ul>
        <ul className="ml-auto">
          <li>
            <button className="mx-auto pull-right btn btn-danger"
              onClick={() => { close() }}><Link to="/">Cerrar sesion</Link></button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
