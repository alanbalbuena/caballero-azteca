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
              fechaEmision: row.hasOwnProperty('fechaEmision') ? moment(new Date((row.fechaEmision - 25568) * 86400 * 1000)).format('DD/MM/YYYY') : '',
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
    <>
      <div className='container ' style={{marginTop:'20px'}}>
        <div className="card shadow">
          <div className="card-header">Subir Base de datos</div>
          <div className="card-body">
            <div className="mb-3 row">
              <label className="form-label">Productos</label>
              <div className='col-6'>
                <input className="form-control" type="file" onChange={handleChangeProductos} ref={refProductos} />
              </div>
              <div className='col-2'>
                <button className='form-control btn btn-success' onClick={() => handleSubmit('productos')}>Subir Productos</button>
              </div>
            </div>
            <div className="mb-3 row">
              <label className="form-label">Clientes</label>
              <div className='col-6'>
                <input className="form-control" type="file" onChange={handleChangeClientes} ref={refClientes} />
              </div>
              <div className='col-2'>
                <button className='form-control btn btn-success' onClick={() => handleSubmit('Clientes')}>Subir Clientes</button>
              </div>
            </div>
            <div className="mb-3 row">
              <label className="form-label">Cobranza</label>
              <div className='col-6'>
                <input className="form-control" type="file" onChange={handleChangeCobranza} ref={refCobranza} />
              </div>
              <div className='col-2'>
                <button className='form-control btn btn-success' onClick={() => handleSubmit('cobranza')}>Subir Cobranza</button>
              </div>
            </div>
            <br/>
            <button className="col-2 btn btn-primary" onClick={() => reset()}>LIMPIAR</button>
          </div>
        </div>
      </div>
    </>
  );
}