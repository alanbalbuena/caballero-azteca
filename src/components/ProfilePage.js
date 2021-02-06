import React, { useContext } from "react";
import { UserContext } from "../providers/UserProvider";
import NavBar from "./NavBar";
import ListaFolios from "./ListaFolios";

class ProfilePage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};               
    const user = UserContext;
  }

  render() {
    return (
      <div>
        <NavBar/>
        <div className = "mx-auto col-md-12">
            <ListaFolios/>
          </div>
        </div>
    )
  }
}

export default ProfilePage;
