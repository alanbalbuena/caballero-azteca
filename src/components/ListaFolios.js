import React, { useEffect, useMemo, useState } from "react";
import { onValue, ref, query, limitToLast, onChildChanged, orderByKey, update } from "firebase/database";
import { ref as xref, getDownloadURL } from "firebase/storage";
import { varStorage, db, auth } from "../util/firebase";
import { MaterialReactTable } from "material-react-table";
import { ExportToCsv } from 'export-to-csv';
import { Box, IconButton, Button } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import VerifiedIcon from '@mui/icons-material/Verified';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import printJS from 'print-js'


export default function ListaFolios() {
  const [listaFolios, setListaFolios] = useState([]);
  const [userPermiso, setUserPermiso] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const foliosRef = query(ref(db, 'Folio'), limitToLast(100), orderByKey());

  //onst foliosRef = ref(db, 'Folio');

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



  /* const peticionDelete = async (id) => {

    var ref = this.state.tipo === "folios" ? db.ref("Folio") : db.ref("Cotizacion");

    if (window.confirm("Desea eliminar el folio " + id)) {
      ref.on('child_added', (snapshot) => {
        let folios = snapshot.val();
        if (folios.folio === id) {
          ref.child(snapshot.key).remove();
        }
      });
    }
  }; */

  const obtenerFolio = (data, tipo) => {
    if (data.status === "autorizado" && window.confirm("Desea cambiar el status del folio: " + data.folio + " a IMPRESO?")) {

      update(ref(db, '/Folio/' + data.key), {
        status: 'impreso'
      }).then(
        descargarArchivo(data, tipo),
      ).catch(error => {
        alert("Error al intentar cambiar a status de impreso." + error)
      })
    } else if (data.status === "noautorizado") {
      alert("Folio: " + data.folio + " no esta autorizado.")
    } else if (data.status === "impreso") {
      descargarArchivo(data, tipo)
    }
  }

  function descargarArchivo(data, archivo) {
    var fileType = (archivo === 'excel') ? "CAPedido.xls" : "CAPedido.pdf";
    var usuario = data.folio.substring(1, 3);
    var tipo = data.folio.substring(0, 1);
    var storageRef = xref(varStorage, usuario + "/" + tipo + "/" + data.folio + "/" + fileType);

    getDownloadURL(storageRef)
      .then(function (url) {
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = function (event) {
        };
        xhr.open('GET', url);
        xhr.send();
        window.open(url, '_blank');
        //printJS(url)

      }).catch(function (error) {
        alert("Hubo un error al intentar descargar el archivo")
      })
  }

  function autorizar(data) {
    if (data.status === "noautorizado") {
      if (window.confirm("Desea autorizar el folio: " + data.folio + "?")) {
        update(ref(db, 'Folio/' + data.key), {
          status: 'autorizado'
        }).catch(error => {
          alert("Error al actualizar estado de folio." + error)
        })
      }
    } else {
      alert("Ya se encuentra autorizado.")
    }
  }

  function obtenerPermisoUsuario() {
    const userRef = ref(db, '/Usuario/' + auth.currentUser.uid)
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      setUserPermiso(data.permisos)
    });

  }



  function getFolios() {
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
          status: data.status,
          productos: data.listaDeProductos,
        });
      });
      setListaFolios(list.reverse());
      setIsLoading(false);
    });
  }

  useEffect(() => {
    getFolios();
    obtenerPermisoUsuario();
  }, []);

  onChildChanged(foliosRef, () => {
    getFolios();
  });

  const csvOptionsFolios = {
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalSeparator: '.',
    showLabels: true,
    useBom: true,
    useKeysAsHeaders: false,
    filename: 'Folios',
    headers: ['Fecha', 'Folio', 'Vendedor', 'Cliente', 'Ruta', 'Total'],
  };

  const csvOptionsProductos = {
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalSeparator: '.',
    showLabels: true,
    useBom: true,
    useKeysAsHeaders: false,
    filename: 'Productos',
    headers: ['Folio', 'Codigo', 'Cantidad', 'Marca', 'Nombre', 'Precio'],
  };

  const csvExporterFolios = new ExportToCsv(csvOptionsFolios);
  const csvExporterProductos = new ExportToCsv(csvOptionsProductos);

  const handleExportRows = (rows) => {
    let listFolios = [];
    let listProductos = [];

    rows.map((row) => {
      row.original.productos.map((pro) => {
        let data = {
          folio: row.original.folio,
          cantidad: pro.cantidad,
          code: pro.code,
          marca: pro.marca,
          nombre: pro.nombre,
          precio: pro.precio,
        }
        listProductos.push(data);
        return null;
      })

      delete row.original.key;
      delete row.original.productos;
      delete row.original.status;
      listFolios.push(row.original)
      return null;
    })

    csvExporterFolios.generateCsv(listFolios);
    csvExporterProductos.generateCsv(listProductos);
    return null
  }

  const disabledButton = (status) => {
    if (userPermiso === 'superusuario') {
      return status === 'noautorizado' ? true : false
    } else {
      return false;
    }
  }

  return (
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
          <IconButton disabled={disabledButton(row.original.status)} onClick={() => obtenerFolio(row.original, "pdf")}>
            <PictureAsPdfIcon color={row.original.status === 'noautorizado' ? 'disabled' : 'primary'} />
          </IconButton>
          <IconButton onClick={() => obtenerFolio(row.original, "excel")}>
            <TextSnippetIcon color="success" />
          </IconButton>
          <IconButton disabled={row.original.status === 'noautorizado' ? true : false} onClick={() => obtenerFolio(row.original, "pdf")}>
            <LocalPrintshopIcon color={row.original.status === 'impreso' ? 'primary' : 'disabled'} />
          </IconButton>
          <IconButton disabled={userPermiso === 'superusuario' ? false : true} onClick={() => autorizar(row.original)}>
            <VerifiedIcon color={row.original.status === 'noautorizado' ? 'disabled' : 'success'} />
          </IconButton>
        </Box>
      )}
      renderDetailPanel={({ row }) => (
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
      )}
    />
  );
}