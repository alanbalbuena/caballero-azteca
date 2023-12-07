import React, { useMemo, useState, useRef, useEffect } from "react";
import { onValue, ref, query, limitToLast, orderByKey, update, remove, orderByChild, equalTo, } from "firebase/database";
import { db, urlSiteGround } from "../util/firebase";
import { MaterialReactTable } from "material-react-table";
import { ExportToCsv } from 'export-to-csv';
import { Box, IconButton, Button } from '@mui/material';
import { useReactToPrint } from 'react-to-print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import VerifiedIcon from '@mui/icons-material/Verified';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import InfoIcon from '@mui/icons-material/Info';
import logo from '../logo-caballero-azteca.jpg'
import '../Styles/Components/pdf.css'
import { Col, Container, ModalBody, Row, Modal } from "react-bootstrap";

export default function ListaFolios(prop) {
  const [nombreUsuario] = useState(prop.nombre)
  const [userPermiso] = useState(prop.permisos)
  const [listaFolios, setListaFolios] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [dataPdf, setDataPdf] = useState({})
  const [marcaDeAgua, setMarcaDeAgua] = useState('')
  const [textoConIva, setTextoConIva] = useState('')
  const [firmaElectronica, setFirmaElectronica] = useState('')
  const [selectNumeroRegistros, setSelectNumeroRegistros] = useState('00')
  const inputFolioValue = useRef(null)

  useEffect(() => {
    getFolios()
  }, []);

  const columns = useMemo(
    () => [
      {
        accessorKey: "key",
        header: "Key",

      },
      {
        accessorKey: "fecha",
        header: "Fecha",
        size: 10,
      },
      {
        accessorKey: "folio",
        header: "Folio",
        size: 10,
      },
      {
        accessorKey: "vendedor",
        header: "Vendedor",
        size: 10,
      },
      {
        accessorKey: "cliente",
        header: "Cliente",
        size: 10,
      },
      {
        accessorKey: "ruta",
        header: "Ruta",
        size: 10,
      },
      {
        accessorKey: "total",
        header: "Total",
        size: 10,
      },
      {
        accessorKey: "status",
        header: "Estatus",
        filterVariant: 'select',
        filterSelectOptions: [
          { text: 'Autorizado', value: 'autorizado' },
          { text: 'Sin Autorizar', value: 'noautorizado' },
          { text: 'Impreso', value: 'impreso' },
        ],
        size: 10,
      },

    ],
    []
  );

  const handleDelete = async (key, id) => {
    if (window.confirm("***ALERTA!!! ESTAS A PUNTO DE ELIMINAR EL SIGUIENTE FOLIO " + id)) {
      remove(ref(db, 'Folio/' + key))
        .then(
          console.log("Registro eliminado correctamente")
        ).catch((error) => {
          alert("Error al intentar borrar en la base de datos. error-> " + error)
        })
    }
  }

  function autorizar(data) {
    handleCloseModalAutorizacion(true)
    if (data.status === "noautorizado") {
      if (window.confirm("Desea autorizar el folio: " + data.folio + "?")) {
        update(ref(db, 'Folio/' + data.key), {
          status: 'autorizado',
          historial: data.historial + ' -> Autorizado por: ' + nombreUsuario,
        }).catch(error => {
          alert("Error al actualizar estado de folio." + error)
        })
      }
    } else {
      alert("Ya se encuentra autorizado.")
    }
  }

  const getFolios = (consulta) => {
    if (consulta !== '') {
      setIsLoading(true)
      let foliosRef = null;
      if (userPermiso === 'vendedor' && selectNumeroRegistros !== '00') {
        foliosRef = query(ref(db, 'Folio'), orderByChild('vendedor/nombre'), equalTo(nombreUsuario), limitToLast(parseInt(selectNumeroRegistros)))
      } else if (consulta === 'limitado' && selectNumeroRegistros !== '00') {
        foliosRef = query(ref(db, 'Folio'), limitToLast(parseInt(selectNumeroRegistros)), orderByKey())
      } else if (consulta === 'sinautorizar') {
        foliosRef = query(ref(db, 'Folio'), orderByChild('status'), equalTo('noautorizado'))
      } else if (consulta === 'sinimprimir') {
        foliosRef = query(ref(db, 'Folio'), orderByChild('status'), equalTo('autorizado'))
      } else if (consulta === 'folio') {
        foliosRef = query(ref(db, 'Folio'), orderByChild('folio'), equalTo(inputFolioValue.current.value.trim()))
      } else {
        setIsLoading(false)
        return false
      }

      onValue(foliosRef, (snapshot) => {
        let list = []
        snapshot.forEach((childSnapshot) => {
          var key = childSnapshot.key;
          var data = childSnapshot.val();

          if (data.status === 'noautorizado') {
            fetch(urlSiteGround + 'validar-autorizacion-automatica.php?codigoCliente=' + data.codigoCliente)
              .then((response) => response.json())
              .then((json) => {
                if (json[0].status === '') {
                  update(ref(db, 'Folio/' + key), {
                    status: 'autorizado',
                    historial: data.historial + ' -> Autorizado por: Automaticamente',
                  })
                }
              })
          }

          list.push({
            key: key,
            fecha: data.fecha,
            folio: data.folio,
            vendedor: data.vendedor.nombre === undefined ? data.vendedor : data.vendedor.nombre,
            cliente: data.razon,
            ruta: data.ruta,
            total: data.total,
            rfc: data.rfc,
            domicilio: data.domicilio,
            estado: data.estado,
            email: data.email,
            status: data.status,
            ciudad: data.ciudad,
            historial: data.historial,
            telefono: data.telefono,
            observaciones: data.observaciones,
            codigoCliente: data.codigoCliente,
            tipoDocumento: data.tipoDocumento,
            productos: data.listaDeProductos.sort((a, b) => a.marca > b.marca ? 1 : -1),
          })
        })

        setListaFolios(list.reverse())
        setIsLoading(false)
      })

    }
  }

  const csvOptionsFolios = {
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalSeparator: '.',
    showLabels: true,
    useBom: true,
    useKeysAsHeaders: false,
    filename: 'PEDIDOS',
    headers: ['FECHA', 'FOLIO', 'ID CLIENTE', 'CLIENTE', 'IMPORTE', 'CIUDAD', 'RUTA', 'VENDEDOR', 'FACTURA'],
  };

  const csvOptionsProductos = {
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalSeparator: '.',
    showLabels: true,
    useBom: true,
    useKeysAsHeaders: false,
    filename: 'PRODUCTOS',
    headers: ['folio', 'codigo', 'cantidad', 'marca', 'articulo', 'precio', 'totalSinIva', 'documento', 'fecha', 'agente', 'cliente'],
  };

  const csvExporterFolios = new ExportToCsv(csvOptionsFolios);
  const csvExporterProductos = new ExportToCsv(csvOptionsProductos);

  const handleExportRows = (rows) => {
    let listFolios = [];
    let listProductos = [];

    rows.map((f) => {
      f.original.productos.map((p) => {
        let dataProducto = {
          folio: f.original.folio,
          codigo: p.code,
          cantidad: p.cantidad,
          marca: p.marca,
          articulo: p.nombre,
          precio: f.original.tipoDocumento === 'Factura' ? p.precio : (p.precio / 1.16).toFixed(2),
          totalSinIva: f.original.tipoDocumento === 'Factura' ? p.precio * p.cantidad : ((p.precio / 1.16) * p.cantidad).toFixed(2),
          documento: f.original.tipoDocumento,
          fecha: f.original.fecha.split("-").reverse().join("-"),
          agente: f.original.vendedor,
          cliente: f.original.codigoCliente,
        }

        listProductos.push(dataProducto);
        return null;
      })

      let dataFolio = {
        fecha: f.original.fecha,
        folio: f.original.folio,
        codigoCliente: f.original.codigoCliente,
        cliente: f.original.cliente,
        total: f.original.tipoDocumento === 'Factura' ? f.original.total : (f.original.total / 1.16).toFixed(2),
        ciudad: f.original.ciudad,
        ruta: f.original.ruta,
        vendedor: f.original.vendedor,
        factura: f.original.tipoDocumento,
      }

      listFolios.push(dataFolio);
      return null;
    })

    csvExporterFolios.generateCsv(listFolios.reverse());
    csvExporterProductos.generateCsv(listProductos.reverse());
    return null
  }

  const obtenerTextoAutorizado = (texto) => {
    let position1 = texto.search("Autorizado por");
    texto = texto.substring(position1);
    let position2 = texto.search("->") > 0 ? texto.search("->") : texto.length;
    texto = texto.substring(0, position2);
    return texto;
  }

  const generarPdf = (folio, formato) => {
    setMarcaDeAgua(formato === 'generico' ? 'DOCUMENTO NO VALIDO' : '');
    setTextoConIva(folio.tipoDocumento === 'Factura' ? '(SIN IVA)' : '');
    setFirmaElectronica(formato === 'original' ? obtenerTextoAutorizado(folio.historial) : '');
    setDataPdf(folio)
    setTimeout(() => {
      handlePrint()
      if (formato === 'original' && folio.status === 'autorizado') {
        update(ref(db, 'Folio/' + folio.key),
          {
            status: 'impreso',
            historial: folio.historial + ' -> Impreso por: ' + nombreUsuario,
          })
      }
    }, 10);
  }

  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Visitor Pass',
    onAfterPrint: () => {
      console.log('Printed PDF successfully!')
    },
  });

  function currencyFormat(num) {
    return '$' + parseFloat(num).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
  }

  const [open, setOpen] = useState(false)
  const [openModalAutorizacion, setOpenModalAutorizacion] = useState(false)
  const [historial, setHistorial] = useState('')
  const handleOpen = (historial) => {
    setOpen(true);
    setHistorial(historial)
  }

  const [estadoCuenta, setEstadoCuenta] = useState({ 'bloqueado': [], 'vencido': [], 'novencido': [], 'saldos': {}, })
  const [folioActual, setFolioActual] = useState({})
  const handleOpenModalAutorizacion = (data) => {
    fetch(urlSiteGround + 'estadoCuenta.php?codigoCliente=' + "'" + data.codigoCliente + "'")
      .then((response) => response.json())
      .then((json) => {
        setFolioActual(data)
        setEstadoCuenta(json)

      })
    setOpenModalAutorizacion(true)
  }

  const handleClose = () => setOpen(false);
  const handleCloseModalAutorizacion = () => setOpenModalAutorizacion(false);

  return (
    <>
      <div className='container mt-3'>
        <div className="card shadow">
          <div className="card-header">Folios</div>
          <div className="card-body">
            <div className="row mb-3">
              <div className="col-12 col-lg d-flex mb-3">
                <select className="form-select" value={selectNumeroRegistros} onChange={e => setSelectNumeroRegistros(e.target.value)}>
                  <option value='00'>Numero de Registros</option>
                  <option value='10'>10</option>
                  <option value='20'>20</option>
                  <option value='50'>50</option>
                  <option value='100'>100</option>
                  <option value='150'>150</option>
                  <option value='200'>200</option>
                </select>
                <button className='btn btn-primary' onClick={() => selectNumeroRegistros !== '00' ? getFolios('limitado') : false} >Buscar</button>
              </div>
              <div className="col-12 col-lg d-flex mb-3">
                <input type="text" className="form-control" placeholder="Numero de Folio" ref={inputFolioValue} />
                <button className='btn btn-primary' onClick={() => inputFolioValue.current.value !== '' ? getFolios('folio') : false} >Buscar</button>
              </div>
              <div className="col" style={{ textAlign: "center" }}>
                <button className='btn btn-primary me-2' onClick={() => getFolios('sinautorizar')} >Sin Autorizar</button>
                <button className='btn btn-primary' onClick={() => getFolios('sinimprimir')} >Sin imprimir</button>
              </div>
            </div>
            <MaterialReactTable
              columns={columns}
              data={listaFolios}
              initialState={{
                showColumnFilters: true,
                density: 'compact',
                columnVisibility: { key: false, status: false },
                /* sorting: [
                { id: 'key', desc: true },
              ],  */
              }}
              enableTopToolbar={true} //hide top toolbar
              state={{ isLoading }} //or showSkeletons
              positionActionsColumn="last"
              enableRowActions
              enableRowSelection
              renderTopToolbarCustomActions={({ table }) => (
                <Box sx={{ display: 'flex', gap: '1rem', p: '0.5rem', flexWrap: 'wrap' }}>
                  <Button
                    disabled={
                      !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
                    }
                    //only export selected rows
                    onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
                    startIcon={<FileDownloadIcon />}
                    variant="contained"
                  >
                    Exportar Excel
                  </Button>
                </Box>
              )}
              renderRowActions={({ row }) => (
                <Box>
                  <IconButton onClick={() => { generarPdf(row.original, 'generico') }}>
                    <PictureAsPdfIcon color='primary' />
                  </IconButton>
                  <IconButton onClick={() => handleExportRows([row])}>
                    <TextSnippetIcon color="success" />
                  </IconButton>
                  <IconButton disabled={(row.original.status === 'noautorizado' || row.original.status === 'impreso') ? (userPermiso === 'superusuario' && row.original.status !== 'noautorizado' ? false : true) : false} onClick={() => { generarPdf(row.original, 'original') }}>
                    <LocalPrintshopIcon color={row.original.status === 'impreso' ? 'primary' : 'disabled'} />
                  </IconButton>
                  <IconButton disabled={userPermiso === 'superusuario' ? false : true} onClick={() => handleOpenModalAutorizacion(row.original)}>
                    <VerifiedIcon color={row.original.status === 'noautorizado' ? 'disabled' : 'success'} />
                  </IconButton>
                  {
                    userPermiso === 'superusuario'
                      ?
                      <IconButton disabled={userPermiso === 'superusuario' ? false : true} onClick={() => handleOpen(row.original.historial)}>
                        <InfoIcon color="info" />
                      </IconButton>
                      : ''
                  }
                  {
                    userPermiso === 'superusuario'
                      ?
                      <IconButton disabled={userPermiso === 'superusuario' ? false : true} onClick={() => handleDelete(row.original.key, row.original.folio)}>
                        <DeleteForeverIcon color='error' />
                      </IconButton>
                      : ''
                  }

                </Box>
              )}
              renderDetailPanel={({ row }) => (
                <>
                  <Box
                    sx={{
                      display: 'grid',
                      margin: 'auto',
                      gridTemplateColumns: '1fr 1fr',
                      width: '100%',
                      marginLeft: '200px'
                    }}
                  >
                    <table>
                      <thead>
                        <tr>
                          <th>Codigo</th>
                          <th>Cantidad</th>
                          <th>Marca</th>
                          <th>Nombre</th>
                          <th>Precio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {row.original.productos.map((pro, index) => (
                          <tr key={index}>
                            <td>{pro.code}</td>
                            <td>{pro.cantidad}</td>
                            <td>{pro.marca}</td>
                            <td>{pro.nombre}</td>
                            <td>{pro.precio}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                  </Box>
                  <Box style={{ display: 'grid', marginLeft: '200px' }}>
                    <strong style={{ marginTop: '30px' }}>OBSERVACIONES: {row.original.observaciones}</strong>
                  </Box>
                </>
              )}
            />
          </div>
        </div>
      </div>
      <div style={{ marginBottom: '900px' }} />

      <Modal show={open} onHide={handleClose} aria-labelledby="contained-modal-title-vcenter">
        <Container style={{textAlign:'center'}}>
          <Modal.Header>
            <Modal.Title>Historial</Modal.Title>
          </Modal.Header>
          <Modal.Body>{historial}</Modal.Body>
        </Container>
      </Modal>

      <Modal show={openModalAutorizacion} onHide={handleCloseModalAutorizacion} aria-labelledby="contained-modal-title-vcenter">
        <ModalBody style={{ fontSize: '15px', textAlign: 'center' }}>
          <Container>
            <Row>
              <p>{folioActual.cliente}</p>
            </Row>
            <Row>
              <Col>
                <p># cliente: {folioActual.codigoCliente}</p>
              </Col>
              <Col>
                <p>Credito: {currencyFormat(estadoCuenta.saldos['limiteCredito'])}</p>
              </Col>
            </Row>
          </Container>

          <Container>
            {/* TABLA PARA FACTURAS BLOQUEADAS */}
            {estadoCuenta.bloqueado.length !== 0 ?
              <>
                <table style={{ width: '100%' }}>
                  <thead>
                    <tr style={{ backgroundColor: "#F3F3F3", textAlign: 'center' }}>
                      <th>Fecha</th>
                      <th>Factura</th>
                      <th>Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estadoCuenta.bloqueado.map((f, index) => (
                      <tr key={index}>
                        <td style={{ padding: "3px" }}>{f.FECHA_DE_EMISION}</td>
                        <td style={{ padding: "3px" }}>{f.NUMERO_DE_FACTURA}</td>
                        <td style={{ padding: "3px" }}>{currencyFormat(f.SALDO)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th style={{ textAlign: "right" }} colSpan="2">Total Bloqueado:</th>
                      <td>{currencyFormat(estadoCuenta.saldos['BLOQUEADO'])}</td>
                    </tr>
                  </tfoot>
                </table>
                <br />
              </>
              : <></>
            }

            {/* TABLA PARA FACTURAS VENCIDAS */}
            {estadoCuenta.vencido.length !== 0 ?
              <>
                <table style={{ width: '100%' }}>
                  <thead>
                    <tr style={{ backgroundColor: "#F3F3F3", textAlign: 'center' }}>
                      <th>Fecha</th>
                      <th>Factura</th>
                      <th>Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estadoCuenta.vencido.map((f, index) => (
                      <tr key={index}>
                        <td style={{ padding: "3px" }}>{f.FECHA_DE_EMISION}</td>
                        <td style={{ padding: "3px" }}>{f.NUMERO_DE_FACTURA}</td>
                        <td style={{ padding: "3px" }}>{currencyFormat(f.SALDO)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th style={{ textAlign: "right" }} colSpan="2">Total Vencido :</th>
                      <td>{currencyFormat(estadoCuenta.saldos['VENCIDO'])}</td>
                    </tr>
                  </tfoot>
                </table>
                <br />
              </>
              : <></>
            }

            {/* TABLA PARA FACTURAS NO VENCIDAS */}
            {estadoCuenta.novencido.length !== 0 ?
              <>
                <table style={{ width: '100%' }}>
                  <thead>
                    <tr style={{ backgroundColor: "#F3F3F3", textAlign: 'center' }}>
                      <th>Fecha</th>
                      <th>Factura</th>
                      <th>Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estadoCuenta.novencido.map((f, index) => (
                      <tr key={index}>
                        <td style={{ padding: "3px" }}>{f.FECHA_DE_EMISION}</td>
                        <td style={{ padding: "3px" }}>{f.NUMERO_DE_FACTURA}</td>
                        <td style={{ padding: "3px" }}>{currencyFormat(f.SALDO)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th style={{ textAlign: "right" }} colSpan="2">Total No vencido:</th>
                      <td>{currencyFormat(estadoCuenta.saldos['NO_VENCIDO'])}</td>
                    </tr>
                  </tfoot>
                </table>
                <br />
              </>
              : <></>
            }
          </Container>

          <button className='btn btn-primary' onClick={() => autorizar(folioActual)} autoFocus>Autorizar</button>
        </ModalBody>
      </Modal>

      <div className='containerPDF' ref={componentRef}>
        {
          Object.entries(dataPdf).length === 0
            ?
            <></>
            :
            <>
              <div className='cabecera'>
                <img className='logo' src={logo} alt='logo' />
                <div className='titulo'>
                  <h5>DISTRIBUIDORA FERRETERA CABALLERO AZTECA, S. A. DE C. V.</h5>
                  <p>JOSEMARIACOSS #1278-A</p>
                  <p>TEL. 38 23 76 32; FAX. 38 54 36 97</p>
                  <p>GUADALAJARA, JALISCO</p>
                  <p>Fecha y hora: {dataPdf.fecha}</p>
                </div>
              </div>
              <p>Informacion General</p>
              <table className="tblPdf">
                <tbody>
                  <tr>
                    <td className='infGral'>FOLIO:</td>
                    <td>{dataPdf.folio}</td>
                  </tr>
                  <tr>
                    <td className='infGral'>VENDEDOR:</td>
                    <td>{dataPdf.vendedor}</td>
                  </tr>
                  <tr>
                    <td className='infGral'>RUTA:</td>
                    <td>{dataPdf.ruta}</td>
                  </tr>
                  <tr>
                    <td className='infGral'>FACTURA O REGISTRO:</td>
                    <td>{dataPdf.tipoDocumento}</td>
                  </tr>
                </tbody>
              </table>
              <div className='marcaAgua'>{marcaDeAgua}</div>
              <p>Informacion sobre el cliente</p>
              <table className="tblPdf">
                <tbody>
                  <tr>
                    <td style={{ width: '10%' }}>CODIGO:</td>
                    <td style={{ width: '20%' }}>{dataPdf.codigoCliente}</td>
                    <td style={{ width: '10%' }}>RAZON:</td>
                    <td style={{ width: '60%' }}>{dataPdf.cliente}</td>
                  </tr>
                  <tr>
                    <td>RFC:</td>
                    <td>{dataPdf.rfc}</td>
                    <td>DOMICILIO:</td>
                    <td>{dataPdf.domicilio}</td>
                  </tr>
                  <tr>
                    <td>CIUDAD:</td>
                    <td>{dataPdf.ciudad}</td>
                    <td>ESTADO:</td>
                    <td>{dataPdf.estado}</td>
                  </tr>
                  <tr>
                    <td>TELEFONO:</td>
                    <td>{dataPdf.telefono}</td>
                    <td>EMAIL:</td>
                    <td>{dataPdf.email}</td>
                  </tr>
                </tbody>
              </table>
              <table className="tblPdf">
                <thead>
                  <tr>
                    <th>CANTIDAD</th>
                    <th>CODIGO</th>
                    <th>MARCA</th>
                    <th>DESCRIPCION DEL ARTICULO</th>
                    <th>PRECIO {textoConIva}</th>
                  </tr>
                </thead>
                <tbody>
                  {dataPdf.productos.map((p, index) => (
                    <tr key={index}>
                      <td>{p.cantidad}</td>
                      <td>{p.code}</td>
                      <td>{p.marca}</td>
                      <td>{p.nombre}</td>
                      <td>{currencyFormat(p.precio)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p>Total: {currencyFormat(dataPdf.total)}</p>
              <p>Observaciones: {dataPdf.observaciones}</p>
              <p className="firmaElectronica">{firmaElectronica}</p>
            </>
        }
      </div>
    </>
  );
}