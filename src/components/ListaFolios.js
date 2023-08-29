import React, { useEffect, useMemo, useState, useRef } from "react";
import { onValue, ref, query, limitToLast, onChildChanged, orderByKey, update, remove, orderByChild, equalTo } from "firebase/database";
import { db, auth } from "../util/firebase";
import { MaterialReactTable } from "material-react-table";
import { ExportToCsv } from 'export-to-csv';
import { Box, IconButton, Button } from '@mui/material';
import { useReactToPrint } from 'react-to-print';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import VerifiedIcon from '@mui/icons-material/Verified';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import InfoIcon from '@mui/icons-material/Info';
import logo from '../logo-caballero-azteca.jpg'
import '../Styles/Components/pdf.css'

export default function ListaFolios(prop) {
  const [nombreUsuario] = useState(prop.nombre);
  const [listaFolios, setListaFolios] = useState([]);
  const [userPermiso, setUserPermiso] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [dataPdf, setDataPdf] = useState({});
  const [marcaDeAgua, setMarcaDeAgua] = useState('');
  const [textoConIva, setTextoConIva] = useState('');
  const [firmaElectronica, setFirmaElectronica] = useState('');
  const numeroRegistros = 300;
  //const foliosRef = query(ref(db, 'Folio'), limitToLast(3), orderByKey());

  useEffect(() => {
    getFolios();
  }, []);

  onChildChanged(ref(db, 'Folio'), () => {
    getFolios();
  });

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
    if (window.confirm("Desea eliminar el folio " + id)) {
      remove(ref(db, 'Folio/' + key))
        .then(
          console.log("Registro eliminado correctamente")
        ).catch((error) => {
          alert("Error al intentar borrar en la base de datos. error-> " + error)
        })
    }
  }

  function autorizar(data) {
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

  function getFolios() {
    const userRef = ref(db, '/Usuario/' + auth.currentUser.uid)
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      setUserPermiso(data.permisos)

      let foliosRef = null;
      if (data.permisos === 'vendedor') {
        foliosRef = query(ref(db, 'Folio'), orderByChild('vendedor/nombre'), equalTo(data.nombre), limitToLast(100));
      } else {
        foliosRef = query(ref(db, 'Folio'), limitToLast(numeroRegistros), orderByKey());
      }

      onValue(foliosRef, (snapshot) => {
        let list = []
        snapshot.forEach((childSnapshot) => {
          var key = childSnapshot.key;
          var data = childSnapshot.val();
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
          });
        });
        setListaFolios(list.reverse());
        setIsLoading(false);
      });

    });


  }

  const csvOptionsFolios = {
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalSeparator: '.',
    showLabels: true,
    useBom: true,
    useKeysAsHeaders: false,
    filename: 'Folios',
    headers: ['Fecha', 'Folio', 'Codigo Cliente', 'Cliente', 'Importe sin iva', 'Agente', 'Ruta', 'Ciudad', 'Observaciones'],
  };

  const csvOptionsProductos = {
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalSeparator: '.',
    showLabels: true,
    useBom: true,
    useKeysAsHeaders: false,
    filename: 'Productos',
    headers: ['Folio', 'Cantidad', 'Codigo', 'Marca', 'Producto', 'Precio U', 'Sub Total', 'Tipo', 'Fecha', 'Agente', 'Codigo cliente', 'Nombre cliente', 'Ruta', 'Observaciones'],
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
          cantidad: p.cantidad,
          code: p.code,
          marca: p.marca,
          nombre: p.nombre,
          precio: f.original.tipoDocumento === 'factura' ? p.precio : (p.precio / 1.16).toFixed(2),
          subTotal: f.original.tipoDocumento === 'factura' ? p.precio * p.cantidad : ((p.precio / 1.16) * p.cantidad).toFixed(2),
          tipoDocumento: f.original.tipoDocumento,
          fecha: f.original.fecha,
          vendedor: f.original.vendedor,
          codigoCliente: f.original.codigoCliente,
          cliente: f.original.cliente,
          ruta: f.original.ruta,
          observaciones: f.original.observaciones,
        }

        listProductos.push(dataProducto);
        return null;
      })

      let dataFolio = {
        fecha: f.original.fecha,
        folio: f.original.folio,
        codigoCliente: f.original.codigoCliente,
        cliente: f.original.cliente,
        total: f.original.tipoDocumento === 'factura' ? f.original.total : (f.original.total / 1.16).toFixed(2),
        vendedor: f.original.vendedor,
        ruta: f.original.ruta,
        ciudad: f.original.ciudad,
        observaciones: f.original.observaciones,
      }

      listFolios.push(dataFolio);
      return null;
    })

    csvExporterFolios.generateCsv(listFolios);
    csvExporterProductos.generateCsv(listProductos);
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
    setTextoConIva(folio.tipoDocumento === 'factura' ? '(SIN IVA)' : '');
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

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  const [open, setOpen] = useState(false);
  const [historial, setHistorial] = useState('');
  const handleOpen = (historial) => {
    setOpen(true);
    setHistorial(historial)
  }
  const handleClose = () => setOpen(false);

  return (
    <>
      <div style={{ marginBottom: '900px' }}>
        <MaterialReactTable
          columns={columns}
          data={listaFolios}
          initialState={{
            showColumnFilters: true,
            density: 'compact',
            columnVisibility: { key: false, status: true },
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
              <IconButton disabled={(row.original.status === 'noautorizado' || row.original.status === 'impreso') ? (userPermiso === 'superusuario' && row.original.status != 'noautorizado' ? false : true) : false} onClick={() => { generarPdf(row.original, 'original') }}>
                <LocalPrintshopIcon color={row.original.status === 'impreso' ? 'primary' : 'disabled'} />
              </IconButton>
              <IconButton disabled={userPermiso === 'superusuario' ? false : true} onClick={() => autorizar(row.original)}>
                <VerifiedIcon color={row.original.status === 'noautorizado' ? 'disabled' : 'success'} />
              </IconButton>
              {
                userPermiso === 'superusuario'
                  ?
                  <IconButton disabled={userPermiso === 'superusuario' ? false : true} onClick={() => handleDelete(row.original.key, row.original.folio)}>
                    <DeleteForeverIcon color='error' />
                  </IconButton>
                  : ''
              }
              {
                userPermiso === 'superusuario'
                  ?
                  <IconButton disabled={userPermiso === 'superusuario' ? false : true} onClick={() => handleOpen(row.original.historial)}>
                    <InfoIcon color="info" />
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
              <Box style={{display:'grid', marginLeft:'200px'}}>
                <strong style={{ marginTop: '30px' }}>OBSERVACIONES: {row.original.observaciones}</strong>
              </Box>
            </>
          )}
        />
      </div>

      {Object.entries(dataPdf).length === 0
        ?
        <></>
        :
        <div className='containerPDF' ref={componentRef}>

          <div className='header'>
            <img className='logo' src={logo} alt='logo' />
            <div className='titulo'>
              <h3>DISTRIBUIDORA FERRETERA CABALLERO AZTECA, S. A. DE C. V.</h3>
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
                <td style={{ width: '40%' }}>{dataPdf.codigoCliente}</td>
                <td style={{ width: '10%' }}>RAZON:</td>
                <td style={{ width: '40%' }}>{dataPdf.cliente}</td>
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
        </div>
      }

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Historial
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {historial}
          </Typography>
        </Box>
      </Modal>

    </>

  );
}