import React, { useState } from 'react'
import { ref, set } from 'firebase/database';
import "bootstrap/dist/css/bootstrap.min.css";
import * as XLSX from 'xlsx'
import { db } from '../util/firebase';

export default function BDAdmin() {
  const [file, setFile] = useState()
  const productoRef = ref(db, 'Producto');
  //const clientesRef = ref(db,'Cliente');

  function handleFileChange(event) {
    setFile(event.target.files[0])
  };

  function handleSubmit(event) {
    event.preventDefault();

    var clientesReader;

    if (file != null) {

      clientesReader = new FileReader();
      clientesReader.readAsBinaryString(file);
      clientesReader.onload = async function (e) {
        let data = e.target.result;
        let workbook = XLSX.read(data, { type: "binary" });
        workbook.SheetNames.forEach(async sheet => {
          let rowObject = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheet]);
          rowObject.forEach((row) => {
            if (row.hasOwnProperty('code')) {
              row.code = row.code.toString()
            }
          })
          var json = JSON.parse(JSON.stringify(rowObject))
          if (window.confirm("Estas seguro que deseas actualizar la base de datos?")) {
            set(productoRef, json)
              .then(() => {
                alert("Base de datos de PRODUCTOS actualizada correctamente.")
              })
              .catch((error) => {
                alert("No se ha podido actualizar la base de datos. ERROR: " + error)
              })
          }
        });
      };
    }

    /* if (fileInputTwo.current.files[0] != null) {
      file = fileInputTwo.current.files[0];
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
              fileInputTwo = null;
            }
          } catch (error) {
            alert("No se ha podido actualizar la base de datos. ERROR: " + error)
            console.error(error);
          }
        });
      };
    } */
  }


  return (
    <div>
      <div className="mt-8">
        <div className="border border-dark mx-auto w-11/12 md:w-2/4 rounded py-8 px-4 md:px-8">
          <form className="" >
            <label className="block">Productos:</label>
            <input type="file" className="my-1 p-1 w-full" onChange={handleFileChange} />
            <label className="block">Clientes:</label>
            <input type="file" className="mt-1 mb-3 p-1 w-full"/>
            <button className="bg-green-400 hover:bg-green-500 w-full py-2 text-white" onClick={handleSubmit}>SUBIR</button>
          </form>
        </div>
      </div>
    </div>
  );
}