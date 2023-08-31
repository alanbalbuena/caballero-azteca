import React, { useState, useRef } from 'react'
import { ref, set } from 'firebase/database';
import * as XLSX from 'xlsx'
import { db } from '../util/firebase';
import moment from 'moment';

export default function BDAdmin() {
  const [fileProductos, setFileProductos] = useState()
  const [fileClientes, setFileClientes] = useState()
  const [fileCobranza, setFileCobranza] = useState()
  const refProductos = useRef();
  const refClientes = useRef();
  const refCobranza = useRef();

  const handleChangeProductos = (event) => setFileProductos(event.target.files[0])
  const handleChangeClientes = (event) => setFileClientes(event.target.files[0])
  const handleChangeCobranza = (event) => setFileCobranza(event.target.files[0])
  const reset = () => {
    refProductos.current.value = '';
    refClientes.current.value = '';
    refCobranza.current.value = '';
  }
  function handleSubmit(tipo) {
    let objRef;
    if (fileProductos != null && tipo === 'productos') {
      objRef = ref(db, 'Producto')
    } else if (fileClientes != null && tipo === 'clientes') {
      objRef = ref(db, 'Cliente')
    } else if (fileCobranza != null && tipo === 'cobranza') {
      objRef = ref(db, 'Cobranza')
    } else {
      return null;
    }

    var clientesReader = new FileReader();
    clientesReader.readAsBinaryString(tipo === 'productos' ? fileProductos : tipo === 'clientes' ? fileClientes : fileCobranza);
    clientesReader.onload = async function (e) {
      let data = e.target.result;
      let workbook = XLSX.read(data, { type: "binary" });
      workbook.SheetNames.forEach(async sheet => {
        let rowObject = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheet]);
        var json = '';
        if (tipo === 'clientes' || tipo === 'productos') {
          rowObject.forEach((row) => {
            if (row.hasOwnProperty('code')) {
              row.code = row.code.toString()
            }
          })
          json = JSON.parse(JSON.stringify(rowObject))
        } else if (tipo === 'cobranza') {
          let list = [];
          rowObject.forEach((row) => {
            list.push({
              fechaEmision: row.hasOwnProperty('fechaEmision') ? moment(new Date((row.fechaEmision - 25568)*86400*1000)).format('DD/MM/YYYY') : '',
              factura: row.hasOwnProperty('factura') ? row.factura : '',
              notaCredito: row.hasOwnProperty('notaCredito') ? row.notaCredito : '',
              codigoCliente: row.hasOwnProperty('codigoCliente') ? row.codigoCliente : '',
              nombreCliente: row.hasOwnProperty('nombreCliente') ? row.nombreCliente : '',
              importeFactura: row.hasOwnProperty('importeFactura') ? row.importeFactura : '',
              importeNotaCredito: row.hasOwnProperty('importeNotaCredito') ? row.importeNotaCredito : '',
              importePorPagar: row.hasOwnProperty('importePorPagar') ? row.importePorPagar : '',
              abono: row.hasOwnProperty('abono') ? row.abono : '',
              saldo: row.hasOwnProperty('saldo') ? row.saldo : '',
              efectivo: row.hasOwnProperty('efectivo') ? row.efectivo : '',
              otros: row.hasOwnProperty('otros') ? row.otros : '',
              observaciones: row.hasOwnProperty('observaciones') ? row.observaciones : '',
              vencidas: row.hasOwnProperty('vencidas') ? row.vencidas : '',
              agente: row.hasOwnProperty('agente') ? row.agente : '',
              ruta: row.hasOwnProperty('ruta') ? row.ruta : '',
            })
            json = JSON.parse(JSON.stringify(list))
          })
        }

        if (window.confirm("Estas seguro que deseas actualizar la base de datos?")) {
          set(objRef, json)
            .then(() => {
              alert("Base de datos   actualizada correctamente.")
            })
            .catch((error) => {
              alert("No se ha podido actualizar la base de datos. ERROR: " + error)
            })
        }
      });
    };
  }

  return (
    <div>
      <div className="mt-8">
        <div className="border border-dark mx-auto w-11/12 md:w-2/4 rounded py-8 px-4 md:px-8">
          <label className="block">Productos:</label>
          <input type="file" className="mt-1 mb-3 p-1 w-1/2" onChange={handleChangeProductos} ref={refProductos} />
          <button className="bg-green-400 hover:bg-green-500 w-1/2 py-2 text-white" onClick={() => handleSubmit('productos')}>SUBIR PRODUCTOS</button>
          <label className="block">Clientes:</label>
          <input type="file" className="mt-1 mb-3 p-1 w-1/2" onChange={handleChangeClientes} ref={refClientes} />
          <button className="bg-green-400 hover:bg-green-500 w-1/2 py-2 text-white" onClick={() => handleSubmit('clientes')}>SUBIR CLIENTES</button>
          <label className="block">Cobranza:</label>
          <input type="file" className="mt-1 mb-3 p-1 w-1/2" onChange={handleChangeCobranza} ref={refCobranza} />
          <button className="bg-green-400 hover:bg-green-500 w-1/2 py-2 text-white" onClick={() => handleSubmit('cobranza')}>SUBIR COBRANZA</button>
          <button className="bg-blue-400 hover:bg-blue-500 w-full py-2 text-white" onClick={() => reset()}>LIMPIAR</button>

        </div>
      </div>
    </div>
  );
}