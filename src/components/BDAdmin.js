import React, { useState, useRef } from 'react'
import { ref, set } from 'firebase/database';
import * as XLSX from 'xlsx'
import { db, urlSiteGround } from '../util/firebase';
import moment from 'moment';
import { useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

export default function BDAdmin(props) {
  const [file, setFile] = useState()
  const [ultimoFolio, setUltimoFolio] = useState({})
  const [cargandoProductos, setCargandoProductos] = useState(false)
  const [cargandoClientes, setCargandoClientes] = useState(false)
  const [cargandoProductosNewBD, setCargandoProductosNewBD] = useState(false)
  const [cargandoFacturas, setCargandoFacturas] = useState(false)
  const [cargandoRemisiones, setCargandoRemisiones] = useState(false)
  const [tablasActualizadas, setTablasActualizadas] = useState({})
  const [actualizar, setActualizar] = useState(true)

  const refProductos = useRef();
  const refClientes = useRef();
  const refFacturas = useRef();
  const refRemisiones = useRef();
  const refVentas = useRef();
  const refBancos = useRef();

  const handleChange = (event) => setFile(event.target.files[0])

  useEffect(() => {
    fetch(urlSiteGround + 'ultimoFolio.php')
      .then((response) => response.json())
      .then((json) => {
        setUltimoFolio(json)
      })

    fetch(urlSiteGround + 'tablasActualizadas.php')
      .then((response) => response.json())
      .then((json) => {
        setTablasActualizadas(json)
      })
  }, [actualizar]);

  const reset = () => {
    if (refProductos.current !== undefined) {
      refProductos.current.value = ''
    }
    if (refClientes.current !== undefined) {
      refClientes.current.value = ''
    }
    if (refFacturas.current !== undefined) {
      refFacturas.current.value = ''
    }
    if (refRemisiones.current !== undefined) {
      refRemisiones.current.value = ''
    }
    if (refVentas.current !== undefined) {
      refVentas.current.value = ''
    }
    if (refBancos.current !== undefined) {
      refBancos.current.value = ''
    }

  }

  const handleSubmit = async (tipo) => {

    if (file === null) return null
    let objRef = ref(db, tipo)

    var json = ''
    if (tipo === 'Cliente' || tipo === 'Producto') {

      let data = await getDataExcel()

      data.forEach((row) => {

        row.agenteCobro = row.hasOwnProperty('agenteCobro') ? row.agenteCobro.toString() : row.agenteCobro
        row.agenteVenta = row.hasOwnProperty('agenteVenta') ? row.agenteVenta.toString() : row.agenteVenta
        row.calle = row.hasOwnProperty('calle') ? row.calle.toString() : row.calle
        row.code = row.hasOwnProperty('code') ? row.code.toString() : row.code
        row.colonia = row.hasOwnProperty('colonia') ? row.colonia.toString() : row.colonia
        row.cp = row.hasOwnProperty('cp') ? row.cp.toString() : row.cp
        row.email = row.hasOwnProperty('email') ? row.email.toString() : row.email
        row.estado = row.hasOwnProperty('estado') ? row.estado.toString() : row.estado
        row.municipio = row.hasOwnProperty('municipio') ? row.municipio.toString() : row.municipio
        row.numeroExterior = row.hasOwnProperty('numeroExterior') ? row.numeroExterior.toString() : row.numeroExterior
        row.numeroInterior = row.hasOwnProperty('numeroInterior') ? row.numeroInterior.toString() : row.numeroInterior
        row.razon = row.hasOwnProperty('razon') ? row.razon.toString() : row.razon
        row.rfc = row.hasOwnProperty('rfc') ? row.rfc.toString() : row.rfc
        row.ruta = row.hasOwnProperty('ruta') ? row.ruta.toString() : row.ruta
        row.telefono = row.hasOwnProperty('telefono') ? row.telefono.toString() : row.telefono

      })
      json = JSON.parse(JSON.stringify(data))
    }

    if (window.confirm("Estas seguro que deseas actualizar la base de datos de " + tipo + "?")) {
      set(objRef, json)
        .then(() => {
          alert("Base de datos actualizada correctamente.")
          reset()
        })
        .catch((error) => {
          alert("No se ha podido actualizar la base de datos. ERROR: " + error)
        })
    }
  }

  const handleVentas = async () => {
    setCargandoProductosNewBD(true)
    let data = await getDataExcel()

    data.forEach((row) => {
      const auxFecha = new Date((row['fecha'] - 25568) * 86400 * 1000)
      var dia = auxFecha.getDate()
      var mes = auxFecha.getMonth() + 1
      const ano = auxFecha.getFullYear()

      dia = dia < 10 ? ("0" + dia) : dia
      mes = mes < 10 ? ("0" + mes) : mes

      row['fecha'] = ano + "-" + dia + "-" + mes;

      //row['fecha'] = typeof (row['fecha']) === "number" ? moment(new Date((row['fecha'] - 25568) * 86400 * 1000)).format('YYYY-MM-DD') : row['fecha'].replaceAll("/", "-").split("-").reverse().join("-")
    })
    enviarBaseDatos('actualizarVentas.php', data)

    //console.log(data);
  }

  const handleBancos = async () => {

    if (file === null) return null

    let dataExcel = await getDataExcel()
    let list = []

    dataExcel.forEach((row) => {
      list.push({
        fecha: row.hasOwnProperty('FECHA') ? row['FECHA'] : '',
        tipo: row.hasOwnProperty('TIPO') ? row['TIPO'] : '',
        deposito: row.hasOwnProperty('DEPOSITO') ? row['DEPOSITO'] : 0,
        retiro: row.hasOwnProperty('RETIRO') ? row['RETIRO'] : 0,
        saldo: row.hasOwnProperty('SALDO') ? row['SALDO'] : 0,
        concepto: row.hasOwnProperty('CONCEPTO') ? row['CONCEPTO'] : '',
      })
    })

    enviarBaseDatos('bancos.php', list)
  }

  const handleFacturas = async () => {

    if (file === null) return null
    setCargandoFacturas(true)
    let dataExcel = await getDataExcel()
    let list = []

    dataExcel.forEach((row) => {

      list.push({
        fechaEmision: row.hasOwnProperty('FECHA DE EMISION') ? moment(new Date((row['FECHA DE EMISION'] - 25568) * 86400 * 1000)).format('YYYY-MM-DD') : '',
        numeroFactura: row.hasOwnProperty('NUMERO DE FACTURA') ? row['NUMERO DE FACTURA'] : '',
        notaCredito: row.hasOwnProperty('NUMERO NOTA CREDITO') ? row['NUMERO NOTA CREDITO'] : '',
        codigoCliente: row.hasOwnProperty('CODIGO CLIENTE') ? row['CODIGO CLIENTE'] : '',
        nombreCliente: row.hasOwnProperty('NOMBRE CLIENTE') ? row['NOMBRE CLIENTE'] : '',
        importeFactura: row.hasOwnProperty('IMPORTE FACTURA') ? row['IMPORTE FACTURA'] !== '' ? row['IMPORTE FACTURA'] : 0 : 0,
        importeNotaCredito: row.hasOwnProperty('IMPORTE NOTA CREDITO') ? row['IMPORTE NOTA CREDITO'] !== '' ? row['IMPORTE NOTA CREDITO'] : 0 : 0,
        importePorPagar: row.hasOwnProperty('IMPORTE POR PAGAR') ? row['IMPORTE POR PAGAR'] !== '' ? row['IMPORTE POR PAGAR'] : 0 : 0,
        pago: row.hasOwnProperty('PAGO') ? row['PAGO'] !== '' ? row['PAGO'] : 0 : 0,
        fechaPago: row.hasOwnProperty('FECHA DE PAGO') ? moment(new Date((row['FECHA DE PAGO'] - 25568) * 86400 * 1000)).format('YYYY-MM-DD') : '',
        formaPago: row.hasOwnProperty('FORMA DE PAGO') ? row['FORMA DE PAGO'] : '',
        numeroCheque: row.hasOwnProperty('NUMERO DE CHEQUE') ? row['NUMERO DE CHEQUE'] : '',
        chEntregadoOficina: row.hasOwnProperty('CH ENTREGADO EN OFICINA') ? moment(new Date((row['CH_ENTREGADO EN OFICINA'] - 25568) * 86400 * 1000)).format('YYYY-MM-DD') : '',
        abono: row.hasOwnProperty('ABONO') ? row['ABONO'] !== '' ? row['ABONO'] : 0 : 0,
        fechaAbono: row.hasOwnProperty('FECHA DE ABONO') ? moment(new Date((row['FECHA DE ABONO'] - 25568) * 86400 * 1000)).format('YYYY-MM-DD') : '',
        formaPagoAbono: row.hasOwnProperty('FORMA DE PAGO ABONO') ? row['FORMA DE PAGO ABONO'] : '',
        saldo: row.hasOwnProperty('SALDO') ? row['SALDO'] !== '' ? row['SALDO'] : 0 : 0,
        statusVencida: row.hasOwnProperty('STATUS VENCIDA') ? row['STATUS VENCIDA'] : '',
        statusBloqueado: row.hasOwnProperty('STATUS BLOQUEADO') ? row['STATUS BLOQUEADO'] : '',
        nombreAgente: row.hasOwnProperty('NOMBRE DEL AGENTE') ? row['NOMBRE DEL AGENTE'] : '',
        ruta: row.hasOwnProperty('RUTA') ? row['RUTA'] : '',
        numeroAgente: row.hasOwnProperty('NUMERO DE AGENTE') ? row['NUMERO DE AGENTE'] : '',
        entregada: row.hasOwnProperty('ENTREGADA') ? row['ENTREGADA'] : '',
      })
    })

    enviarBaseDatos('facturas.php', list)
  }

  const handleRemisiones = async () => {

    if (file === null) return null
    setCargandoRemisiones(true)

    let dataExcel = await getDataExcel()
    let list = []

    dataExcel.forEach((row) => {

      list.push({
        fechaEmision: row.hasOwnProperty('FECHA DE EMISION') ? moment(new Date((row['FECHA DE EMISION'] - 25568) * 86400 * 1000)).format('YYYY-MM-DD') : '',
        numeroRemision: row.hasOwnProperty('NUMERO DE REMISION') ? row['NUMERO DE REMISION'] : '',
        codigoCliente: row.hasOwnProperty('CODIGO CLIENTE') ? row['CODIGO CLIENTE'] : '',
        nombreCliente: row.hasOwnProperty('NOMBRE CLIENTE') ? row['NOMBRE CLIENTE'] : '',
        importeRemision: row.hasOwnProperty('IMPORTE REMISION') ? row['IMPORTE REMISION'] !== '' ? row['IMPORTE REMISION'] : 0 : 0,
        importeAjusteFaltante: row.hasOwnProperty('IMPORTE DE AJUSTE FALTANTE O PRONTO PAGO') ? row['IMPORTE DE AJUSTE FALTANTE O PRONTO PAGO'] !== '' ? row['IMPORTE DE AJUSTE FALTANTE O PRONTO PAGO'] : 0 : 0,
        importePorPagar: row.hasOwnProperty('IMPORTE POR PAGAR') ? row['IMPORTE POR PAGAR'] !== '' ? row['IMPORTE POR PAGAR'] : 0 : 0,
        pago: row.hasOwnProperty('PAGO') ? row['PAGO'] !== '' ? row['PAGO'] : 0 : 0,
        fechaPago: row.hasOwnProperty('FECHA DE PAGO') ? moment(new Date((row['FECHA DE PAGO'] - 25568) * 86400 * 1000)).format('YYYY-MM-DD') : '',
        formaPago: row.hasOwnProperty('FORMA DE PAGO') ? row['FORMA DE PAGO'] : '',
        numeroCheque: row.hasOwnProperty('NUMERO DE CHEQUE') ? row['NUMERO DE CHEQUE'] : '',
        chEntregadoOficina: row.hasOwnProperty('CH ENTREGADO EN OFICINA') ? moment(new Date((row['CH_ENTREGADO EN OFICINA'] - 25568) * 86400 * 1000)).format('YYYY-MM-DD') : '',
        abono: row.hasOwnProperty('ABONO') ? row['ABONO'] !== '' ? row['ABONO'] : 0 : 0,
        fechaAbono: row.hasOwnProperty('FECHA DE ABONO') ? moment(new Date((row['FECHA DE ABONO'] - 25568) * 86400 * 1000)).format('YYYY-MM-DD') : '',
        formaPagoAbono: row.hasOwnProperty('FORMA DE PAGO ABONO') ? row['FORMA DE PAGO ABONO'] : '',
        saldo: row.hasOwnProperty('SALDO') ? row['SALDO'] !== '' ? row['SALDO'] : 0 : 0,
        statusVencida: row.hasOwnProperty('STATUS VENCIDA') ? row['STATUS VENCIDA'] : '',
        statusBloqueado: row.hasOwnProperty('STATUS BLOQUEADO') ? row['STATUS BLOQUEADO'] : '',
        nombreAgente: row.hasOwnProperty('NOMBRE DEL AGENTE') ? row['NOMBRE DEL AGENTE'] : '',
        ruta: row.hasOwnProperty('RUTA') ? row['RUTA'] : '',
        numeroAgente: row.hasOwnProperty('NUMERO DE AGENTE') ? row['NUMERO DE AGENTE'] : '',
      })
    })

    enviarBaseDatos('remisiones.php', list)
    //console.log(list)
  }

  const enviarBaseDatos = (url, data) => {
    const requestOptions = {
      mode: 'no-cors',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };

    fetch(urlSiteGround + url, requestOptions)
      .then(response => {
        if (response.status === 200 || response.status === 0) {
          alert("se inserto correctamente")
        } else if (response.status === 400) {
          alert("hubo un error al intentar insertar en la base de datos")
        }
      }).catch(error => {
        console.log(error)
      }).finally(() => {
        reset()
        setCargandoClientes(false)
        setCargandoFacturas(false)
        setCargandoProductos(false)
        setCargandoProductosNewBD(false)
        setCargandoRemisiones(false)
        setActualizar(actualizar ? false : true)
      })
  }

  const getDataExcel = async () => {

    return new Promise((resolve, reject) => {
      var reader = new FileReader()
      reader.readAsBinaryString(file)
      reader.onload = async function (e) {
        let data = e.target.result
        let workbook = XLSX.read(data, { type: "binary" })
        workbook.SheetNames.forEach(async sheet => {
          let dataArray = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheet])
          resolve(dataArray)
        })
      }
    })
  }

  function BotonCargando() {
    return (
      <Button variant="primary" disabled>
        <Spinner
          as="span"
          animation="border"
          size="sm"
          role="status"
          aria-hidden="true"
        />
        Loading...
      </Button>
    )
  }

  function UltimaActualizacion({data}) {
    return (
      <div className='col-2' style={{color:'darkgray'}}>
        <p>{data}</p>
      </div>
    )
  }
  return (
    <>
      <div className='container ' style={{ marginTop: '20px' }}>
        <div className="card shadow">
          <div className="card-header">Subir Base de datos</div>
          <div className="card-body">
            {
              props.permisos === 'superusuario' ?
                <>
                  <div className="mb-3 row">
                    <label className="form-label">Productos</label>
                    <div className='col-6'>
                      <input className="form-control" type="file" onChange={handleChange} ref={refProductos} />
                    </div>
                    <div className='col-2'>
                      <button className='form-control btn btn-success' onClick={() => handleSubmit('Producto')}>Subir Productos</button>
                    </div>
                  </div>
                  <div className="mb-3 row">
                    <label className="form-label">Clientes</label>
                    <div className='col-6'>
                      <input className="form-control" type="file" onChange={handleChange} ref={refClientes} />
                    </div>
                    <div className='col-2'>
                      <button className='form-control btn btn-success' onClick={() => handleSubmit('Cliente')}>Subir Clientes</button>
                    </div>
                  </div>
                  <div className="mb-3 row">
                    <label className="form-label">Productos Nueva BD</label>
                    <div className='col-6'>
                      <input className="form-control" type="file" onChange={handleChange} ref={refVentas} />
                    </div>
                    <div className='col-2'>
                      {
                        cargandoProductosNewBD
                          ? <BotonCargando />
                          : <button className='form-control btn btn-success' onClick={() => handleVentas()}>Productos New BD</button>
                      }

                    </div>
                    <UltimaActualizacion data={tablasActualizadas.tbl_ventas} />
                    <div className='col-2'>
                      <p>{ultimoFolio.folio}</p>
                    </div>
                  </div>
                </>
                : <></>
            }

            <div className="mb-3 row">
              <label className="form-label">Facturas</label>
              <div className='col-6'>
                <input className="form-control" type="file" onChange={handleChange} ref={refFacturas} />
              </div>
              <div className='col-2'>
                {
                  cargandoFacturas
                    ? <BotonCargando />
                    : <button className='form-control btn btn-success' onClick={() => handleFacturas()}>Subir Facturas</button>
                }
              </div>
              <UltimaActualizacion data={tablasActualizadas.tbl_facturas} />
            </div>
            <div className="mb-3 row">
              <label className="form-label">Remisiones</label>
              <div className='col-6'>
                <input className="form-control" type="file" onChange={handleChange} ref={refRemisiones} />
              </div>
              <div className='col-2'>
                {
                  cargandoRemisiones
                    ? <BotonCargando />
                    : <button className='form-control btn btn-success' onClick={() => handleRemisiones()}>Subir Remisiones</button>
                }
              </div>
              <UltimaActualizacion data={tablasActualizadas.tbl_remisiones} />
            </div>

            {/* <div className="mb-3 row">
              <label className="form-label">Bancos</label>
              <div className='col-6'>
                <input className="form-control" type="file" onChange={handleChange} ref={refBancos} />
              </div>
              <div className='col-2'>
                <button className='form-control btn btn-success' onClick={() => handleBancos()}>Bancos</button>
              </div>
            </div> */}
            <br />
            <button className="col-2 btn btn-primary" onClick={() => reset()}>LIMPIAR</button>
          </div>
        </div>
      </div>
    </>
  )
}