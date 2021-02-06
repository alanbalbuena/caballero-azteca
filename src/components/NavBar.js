import React, { useState, useEffect } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { UserContext } from "../providers/UserProvider";
import {auth} from "../util/firebase";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from '@reach/router';

const NavBar = () => {
    const user = UserContext;
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
              <a className="nav-link " href="/"><Link to="/"><strong>Folios</strong></Link></a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/"><Link to="/adminbd"><strong>Bases de datos</strong></Link></a>
            </li>
          </ul>
          <ul className = "ml-auto">
            <li>
              <button className = "mx-auto pull-right btn btn-danger" 
              onClick = {() => {auth.signOut()}}><Link to='/'>Cerrar sesion</Link></button>
            </li>
          </ul>
        </div>
      </nav>
      );
};

export default NavBar;
