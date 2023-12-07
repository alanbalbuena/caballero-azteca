import { MaterialReactTable, } from 'material-react-table'
import React, { useMemo, useState } from 'react'
import { useEffect } from 'react';
import { urlSiteGround } from '../util/firebase';
import { Button, Form, Modal, Row } from 'react-bootstrap';
import { Box, IconButton } from '@mui/material';
import { DeleteForever } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import { ExportToCsv } from 'export-to-csv';

export default function Pagos() {
  const [pagosData, setPagosData] = useState([])
  const [mostrarModalActualizarPago, setMostrarModalActualizarPago] = useState(false)
  const [bancoReceptor, setBancoReceptor] = useState('')
  const [bancoCheque, setBancoCheque] = useState('')
  const [fechaCheque, setFechaCheque] = useState('')
  const [fechaCobroCheque, setFechaCobroCheque] = useState('')
  const [numeroCheque, setNumeroCheque] = useState('')
  const [metodoPago, setMetodoPago] = useState('')
  const [id, setId] = useState('')

  useEffect(() => {
    buscarPagos()
  }, [])

  const buscarPagos = () => {
    fetch(urlSiteGround + 'pagos.php')
      .then((response) => response.json())
      .then((json) => {
        if (json.codigo === 200) {
          setPagosData(json.pagos)
        } else {
          alert(json.mensaje)
        }
      }).catch((error) => {
        alert(error)
      })
  }

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'Id',
      },
      {
        accessorKey: 'fechaCaptura',
        header: 'Fecha Captura',
      },
      {
        accessorKey: 'metodoPago',
        header: 'Metodo Pago',
      },
      {
        accessorKey: 'bancoReceptor',
        header: 'Banco Receptor',
      },
      {
        accessorKey: 'monto',
        header: 'Monto',
      },
      {
        accessorKey: 'facturas',
        header: 'Facturas',
      },
      {
        accessorKey: 'nombre_cliente',
        header: 'Cliente',
      },
      {
        accessorKey: 'nombre_del_agente',
        header: 'Agente',
      },
      {
        accessorKey: 'bancoCheque',
        header: 'Banco Cheque',
      },
      {
        accessorKey: 'fechaCheque',
        header: 'Fecha Cheque',
      },
      {
        accessorKey: 'numeroCheque',
        header: 'Numero Cheque',
      },
      {
        accessorKey: 'fechaCobroCheque',
        header: 'Fecha Cobro Cheque',
      },

    ],
    [],
  )

  const handleDelete = (row) => {
    if (window.confirm("***ALERTA!!! ESTAS SEGURO QUE QUIERES ELIMINAR ESTE PAGO?")) {
      const requestOptions = {
        method: "DELETE",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ id: row.original.id })
      }

      fetch(urlSiteGround + "pagos.php", requestOptions)
        .then(response => response.json())
        .then(respuesta => {
          if (respuesta.codigo === 200) {
            alert(respuesta.mensaje)
            buscarPagos()

          } else {
            alert(respuesta.mensaje)
          }

        }).catch(error => {
          alert("Ocurrio un error al consultar el endpoint pagos.php" + error);
        })
    }
  }

  const actualizarPago = () => {
    const data = {
      id: id,
      metodoPago: metodoPago,
      bancoReceptor: metodoPago === 'transferencia' ? bancoReceptor : '',
      bancoCheque: metodoPago === 'cheque' ? bancoCheque : '',
      numeroCheque: metodoPago === 'cheque' ? numeroCheque : '',
      fechaCheque: metodoPago === 'cheque' ? fechaCheque : '',
      fechaCobroCheque: metodoPago === 'cheque' ? fechaCobroCheque : ''
    }

    const requestOptions = {
      method: "PUT",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(data)
    }

    fetch(urlSiteGround + "pagos.php", requestOptions)
      .then(response => response.json())
      .then(respuesta => {
        if (respuesta.codigo === 200) {
          alert(respuesta.mensaje)
          buscarPagos()
          setMostrarModalActualizarPago(false)
        } else {
          alert(respuesta.mensaje)
        }

      }).catch(error => {
        alert("Ocurrio un error al consultar el endpoint pagos.php" + error);
      })
  }

  const abrirModalActualizarPago = (row) => {

    setMetodoPago(row.original.metodoPago)
    setBancoReceptor(row.original.bancoReceptor)
    setBancoCheque(row.original.bancoCheque)
    setFechaCheque(row.original.fechaCheque)
    setNumeroCheque(row.original.numeroCheque)
    setFechaCobroCheque(row.original.fechaCobroCheque)
    setId(row.original.id)

    setMostrarModalActualizarPago(true)
  }

  const handleExportarPagos = () => {
    const csvOptionsPagos = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true,
      useBom: true,
      useKeysAsHeaders: false,
      filename: 'PAGOS',
      headers: ['ID','FECHA CAPTURA', 'METODO PAGO', 'BANCO RECEPTOR', 'MONTO', 'FACTURAS', 'CLIENTE', 'AGENTE', 'BANCO CHEQUE', 'FECHA CHEQUE', 'NUMERO CHEQUE', 'FECHA COBRO CHEQUE'],
    };

    const csvExporterPagos = new ExportToCsv(csvOptionsPagos);

    csvExporterPagos.generateCsv(pagosData);

  }


  return (
    <>
      <div className='container mt-3'>
        <div className="card shadow">
          <div className="card-header">Pagos</div>
          <div className='card-body'>
            <div className='mb-3' style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className='btn btn-success' onClick={handleExportarPagos}>Exportar Excel</button>
            </div>
            <MaterialReactTable
              columns={columns}
              data={pagosData}
              enableTopToolbar={false}
              enableColumnActions={true}
              enableSorting={false}
              enableRowActions
              positionActionsColumn="last"
              initialState={{
                showColumnFilters: true,
                density: 'compact',
                columnVisibility: { id: false },
              }}
              defaultColumn={{
                size: 30
              }}
              renderRowActions={({ row }) => (
                <Box>
                  <IconButton onClick={() => abrirModalActualizarPago(row)}>
                    <EditIcon color='info' />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(row)}>
                    <DeleteForever color='error' />
                  </IconButton>
                </Box>
              )}
            />

            <Modal show={mostrarModalActualizarPago} onHide={() => setMostrarModalActualizarPago(false)}>
              <Modal.Header closeButton>
                <Modal.Title>Actualizar Pago</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  <Row>
                    <Form.Group className="mb-3 col-6">
                      <Form.Label>Metodo de Pago</Form.Label>
                      <Form.Select autoFocus value={metodoPago} onChange={e => setMetodoPago(e.target.value)}>
                        <option value="cheque">Cheque</option>
                        <option value="transferencia">Transferencia</option>
                        <option value="efectivo">Efectivo</option>
                      </Form.Select>
                    </Form.Group>
                    {metodoPago === 'efectivo' ? <></> : metodoPago === 'transferencia' ?
                      <Form.Group className="mb-3 col-6">
                        <Form.Label>Banco Receptor</Form.Label>
                        <Form.Select value={bancoReceptor} onChange={e => setBancoReceptor(e.target.value)}>
                          <option value="hsbc">Hsbc</option>
                          <option value="banorte">Banorte</option>
                        </Form.Select>
                      </Form.Group>
                      :
                      <Form.Group className="mb-3 col-6">
                        <Form.Label>Banco del Cheque</Form.Label>
                        <Form.Select value={bancoCheque} onChange={e => setBancoCheque(e.target.value)}>
                          <option value="hsbc">Hsbc</option>
                          <option value="banorte">Banorte</option>
                          <option value="banamex">Banamex</option>
                          <option value="banregio">Banregio</option>
                          <option value="bancomer">Bancomer</option>
                          <option value="bajio">Bajio</option>
                        </Form.Select>
                      </Form.Group>
                    }
                  </Row>
                  {metodoPago === 'cheque' ?
                    <>
                      <Row>
                        <Form.Group className="mb-3 col-6">
                          <Form.Label>Fecha del Cheque</Form.Label>
                          <Form.Control type="date" onChange={e => setFechaCheque(e.target.value)} value={fechaCheque} />
                        </Form.Group>
                        <Form.Group className="mb-3 col-6">
                          <Form.Label>Numero de Cheque</Form.Label>
                          <Form.Control type="number" onChange={e => setNumeroCheque(e.target.value)} value={numeroCheque} />
                        </Form.Group>
                      </Row>
                      <Row>
                        <Form.Group className="mb-3 col-6">
                          <Form.Label>Fecha de Cobro</Form.Label>
                          <Form.Control type="date" onChange={e => setFechaCobroCheque(e.target.value)} value={fechaCobroCheque} />
                        </Form.Group>
                      </Row>
                    </>
                    : <></>}
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setMostrarModalActualizarPago(false)}>
                  Cerrar
                </Button>
                <Button variant="primary" onClick={() => actualizarPago()}>
                  Guardar
                </Button>
              </Modal.Footer>
            </Modal>
          </div>
        </div>
      </div>
    </>
  )
}
