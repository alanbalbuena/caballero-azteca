import React from 'react';
import { Link } from "react-router-dom";
import { signOut, getAuth } from "firebase/auth";
import logo from '../logo-caballero-azteca.jpg';
import { useNavigate } from "react-router-dom";

function NavBar(prop) {
  const navigate = useNavigate();

  function close() {
    signOut(getAuth()).then(() => {
      navigate('/login')
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
              {
                prop.permisos === 'superusuario'
                  ? <>
                    <Link className="nav-link" to="/folios">Folios</Link>
                    <Link className="nav-link" to="/reporteVentas">Reporte de Ventas</Link>
                    <Link className="nav-link" to="/adminbd">Base de datos</Link>
                    <Link className="nav-link" to="/usuarios">Usuarios</Link>
                    <Link className="nav-link" to="/clientes">Clientes</Link>
                    <Link className="nav-link" to="/cobranza">Cobranza</Link>
                    {/* <Link className="nav-link" to="/bancos">Bancos</Link> */}
                    <Link className="nav-link" to="/pagos">Pagos</Link>
                  </>
                  : ''
              }
              {
                prop.permisos === 'administrador'
                  ? <>
                    <Link className="nav-link" to="/folios">Folios</Link>                    
                  </>
                  : ''
              }
              {
                prop.permisos === 'almacen'
                  ? <>
                    <Link className="nav-link" to="/folios">Folios</Link>                    
                  </>
                  : ''
              }
              {
                prop.permisos === 'cobranza'
                  ? <>
                    <Link className="nav-link" to="/adminbd">Base de datos</Link>
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
