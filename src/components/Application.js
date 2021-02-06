import React, { useContext } from "react";
import { Router } from "@reach/router";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import UserProvider from "../providers/UserProvider";
import ProfilePage from "./ProfilePage";
import { UserContext } from "../providers/UserProvider";
import PasswordReset from "./PasswordReset";
import { Suspense } from "react";
import ListaFolios from "./ListaFolios";
import BDAdmin from "./BDAdmin";
import { Route, Switch } from "react-router-dom";
function Application() {

  const user = useContext(UserContext);

  return (


        user ?
        
        <Router>
          <ProfilePage path="/" />
          <BDAdmin path="adminbd" />
        </Router>
     
      :
        <Router>
          <SignUp path="signUp" />
          <SignIn path="/" />
          <PasswordReset path = "passwordReset" />
        </Router>
      
  );
}

export default Application;