import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import React, { useMemo, useState } from 'react'
import { useEffect } from 'react';
import { urlSiteGround } from '../util/firebase';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';

export default function Pagos() {
  const [pagosData, setPagosData] = useState([])
  const [mostrarModalAgregarPago, setMostrarModalAgregarPago] = useState(false)

  useEffect(() => {
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
  }, [])


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
        accessorKey: 'banco',
        header: 'Banco',
      },
      {
        accessorKey: 'monto',
        header: 'Monto',
      },
      {
        accessorKey: 'facturas',
        header: 'Facturas',
      },

    ],
    [],
  )

  const table = useMaterialReactTable({
    columns: columns,
    data: pagosData,
    enableTopToolbar: false,
    enableColumnActions: false,
    enableSorting: false,
    initialState: {
      showColumnFilters: false,
      density: 'compact',

    },
    defaultColumn: {
      size: 30, //make columns wider by default
    }
  });

  const ModalAgregarPago = () => {
    return (
      <Modal show={mostrarModalAgregarPago} onHide={() => setMostrarModalAgregarPago(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Pago</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Metodo de Pago</Form.Label>
              <Form.Select autoFocus>
                <option>Selecciona un metodo de pago</option>
                <option value="1">Cheque</option>
                <option value="2">Transferencia</option>
                <option value="3">Efectivo</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" >
              <Form.Label>Banco</Form.Label>
              <Form.Select>
                <option>Selecciona un Banco</option>
                <option value="1"></option>
                <option value="2">Hsbc</option>
                <option value="3">Banorte</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Monto</Form.Label>
              <Form.Control type="number"/>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Facturas</Form.Label>
              <Form.Control type="email" />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setMostrarModalAgregarPago(false)}>
            Cerrar
          </Button>
          <Button variant="primary" onClick={() => setMostrarModalAgregarPago(false)}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  return (
    <>
      <div className='container mt-3'>
        <div className="card shadow">
          <div className="card-header">Pagos</div>
          <div className='card-body'>
            <div className='mb-2'>
              <Row>
                <Col md={{ offset: 10 }}>
                  <Button onClick={() => setMostrarModalAgregarPago(true)}>Agregar Pago</Button>
                </Col>
              </Row>
            </div>
            <MaterialReactTable table={table} />
            <ModalAgregarPago />
          </div>
        </div>
      </div>
    </>
  )
}
