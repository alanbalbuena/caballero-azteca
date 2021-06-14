import React, { useContext } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import ProfilePage from "./ProfilePage";
import { UserContext } from "../providers/UserProvider";
import PasswordReset from "./PasswordReset";
import BDAdmin from "./BDAdmin";

function Application() {

  const user = useContext(UserContext);

  return (

    user ?

      <Router>
        <Route path="/" exact component={ProfilePage} />
        <Route path="/adminbd" component={BDAdmin} />
      </Router>

      :
      
      <Router>
        <Route path="/" exact component={SignIn} />
        <Route path="/signUp" component={SignUp} />
        <Route path="/passwordReset" component={PasswordReset} />
      </Router>

  );
}

export default Application;