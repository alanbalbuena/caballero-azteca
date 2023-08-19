import React from 'react'
import { Component } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import * as XLSX from 'xlsx'
import db from '../util/firebase';
import Login from './Login';

class BDAdmin extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.fileInputOne = React.createRef();
    this.fileInputTwo = React.createRef();
  }

  eliminarbd(bd) {
    return new Promise(resolve => {
      setTimeout(() => {
        bd.remove()
        resolve(true);
      }, 15000);
    });
  }

  async handleSubmit(event) {
    event.preventDefault();
    var clientesRef = db.ref("Cliente");
    var productoRef = db.ref("Producto");
    var file;
    var clientesReader;

    if (this.fileInputOne.current.files[0] != null) {

      file = this.fileInputOne.current.files[0];
      clientesReader = new FileReader();
      clientesReader.readAsBinaryString(file);
      clientesReader.onload = async function (e) {
        let data = e.target.result;
        let workbook = XLSX.read(data, { type: "binary" });
        workbook.SheetNames.forEach(async sheet => {
          let rowObject = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheet]);
          var json = JSON.parse(JSON.stringify(rowObject))
          try {
            alert("Eliminando base de datos anterior de prodcutos. Espere 15 segundos.");
            let productosRemover = await new Promise(resolve => {
              setTimeout(() => {
                productoRef.remove()
                productoRef.set("")
                resolve(true);
              }, 10000);
            });
            if (productosRemover) {
              productoRef.set(json);
              alert("Base de datos de PRODUCTOS actualizada correctamente.")
              this.fileInputOne = null;
            }
          } catch (error) {
            alert("No se ha podido actualizar la base de datos. ERROR: " + error)
            console.error(error);
          }
        });
      };
    }

    if (this.fileInputTwo.current.files[0] != null) {
      file = this.fileInputTwo.current.files[0];
      clientesReader = new FileReader();
      clientesReader.readAsBinaryString(file);
      clientesReader.onload = async function (e) {
        let data = e.target.result;
        let workbook = XLSX.read(data, { type: "binary" });
        workbook.SheetNames.forEach(async sheet => {
          let rowObject = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheet]);
          var json = JSON.parse(JSON.stringify(rowObject))
          try {
            alert("Eliminando base de datos anterior de clientes. Espere 15 segundos.");
            let clientsRemove = await new Promise(resolve => {
              setTimeout(() => {
                clientesRef.remove()
                clientesRef.set("")
                resolve(true);
              }, 10000);
            });
            if (clientsRemove) {
              clientesRef.set(json);
              alert("Base de datos de CLIENTES actualizada correctamente.")
              this.fileInputTwo = null;
            }
          } catch (error) {
            alert("No se ha podido actualizar la base de datos. ERROR: " + error)
            console.error(error);
          }
        });
      };
    }
  }

  render() {

    const user = true;

    return (
      user ?
        <div>
          <div className="mt-8">
            <div className="border border-dark mx-auto w-11/12 md:w-2/4 rounded py-8 px-4 md:px-8">
              <form className="" onSubmit={this.handleSubmit}>
                <label htmlFor="userEmail" className="block">Productos:</label>
                <input type="file" className="my-1 p-1 w-full" name="userEmail" id="userEmail" ref={this.fileInputOne} />
                <label htmlFor="userPassword" className="block">Clientes:</label>
                <input type="file" className="mt-1 mb-3 p-1 w-full" name="userPassword" placeholder="Password" id="userPassword" text="Clientes" ref={this.fileInputTwo} />
                <button className="bg-green-400 hover:bg-green-500 w-full py-2 text-white" type="submit">SUBIR</button>
              </form>
            </div>
          </div>
        </div>
        :
        <Login />
    );
  }

}

export default BDAdmin;