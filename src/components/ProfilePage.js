import React, {Component} from "react";
import NavBar from "./NavBar";
import ListaFolios from "./ListaFolios";

class ProfilePage extends Component {

  render(){
    return (
      <div>
        <NavBar/>
        <div className="mx-auto col-md-12">
            <ListaFolios location={this.props.location}/>
        </div>
      </div>
    )
  }

}

export default ProfilePage;
