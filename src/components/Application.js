import React, { useContext } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import { UserContext } from "../providers/UserProvider";
import PasswordReset from "./PasswordReset";
import BDAdmin from "./BDAdmin";
import Usuarios from "./Usuarios";
import ListaFolios from "./ListaFolios";
import Clientes from "./Clientes";
import NavBar from "./NavBar";

function Application() {

  const user = useContext(UserContext);

  return (

    user ?
    <>
    <NavBar/>
      <Router>
        <Route path="/" exact component={ListaFolios} />
        <Route path="/adminbd" component={BDAdmin} />
        <Route path="/usuarios" component={Usuarios} />
      </Router>
      </>
      :
      
      <Router>
        <Route path="/" exact component={SignIn} />
        <Route path="/signUp" component={SignUp} />
        <Route path="/passwordReset" component={PasswordReset} />
      </Router>

  );
}

export default Application;