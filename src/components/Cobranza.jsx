import React, { useState, useMemo, useRef } from 'react'
import { MaterialReactTable } from "material-react-table";
import { urlSiteGround } from '../util/firebase';
import { Button, Form, InputGroup, Modal, Row, Tab, Tabs } from 'react-bootstrap';
import { useEffect } from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Box } from '@mui/material';
import { ExportToCsv } from 'export-to-csv';

export default function Cobranza() {
    const auxData = {
        vencidas: [],
        totales: {
            efectivo: '',
            numeroCheques: '',
            cheque: '',
            transferencia: '',
            saldoPorCobrar: '',
            nuevoSaldo: '',
            cobranzaEfectiva: '',
            porcentajeCobrado: '',
            porcentajeNoCobrado: '',

        }
    }

    const [selectAgente, setselectAgente] = useState('00')
    const [dataCobranza, setDataCobranza] = useState(auxData)
    const [dataCobranzaGeneral, setDataCobranzaGeneral] = useState([])
    const [checkSeleccionado, setCheckSeleccionado] = useState('vencida')
    const [key, setKey] = useState('cobranzaGeneral')
    const [mostrarModalAgregarPago, setMostrarModalAgregarPago] = useState(false)
    const [facturasPorPagar, setFacturasPorPagar] = useState([])
    const [metodoPago, setMetodoPago] = useState('cheque')
    const [bancoReceptor, setBancoReceptor] = useState('hsbc')
    const [bancoCheque, setBancoCheque] = useState('bancomer')
    const [fechaCheque, setFechaCheque] = useState('')
    const [numeroCheque, setNumeroCheque] = useState('')
    const [montoaPagar, setMontoaPagar] = useState(0)
    const refInputPagoFactura = useRef([])

    let jsonVendedores = [
        'Cesar Ramirez',
        'Rodolfo Castellanos',
        'Horacio Tejeda',
        'Horacio Guerrero',
        'Omar Rivas',
        'Alfredo Arreola',
        'Cesar Serrano',
        'Juan Cruz',
        'Enrique Rivera',
        'Carlos Bautista',
    ]

    useEffect(() => {
        if (key === 'cobranzaGeneral') {
            obtenerCobranzaGeneral()
        }
    }, [key]);

    const obtenerCobranzaGeneral = () => {
        fetch(urlSiteGround + "cobranzaGeneral.php")
            .then(response => response.json())
            .then(respuesta => {
                if (respuesta.codigo === 200) {
                    setDataCobranzaGeneral(respuesta.vencidas)
                } else {
                    alert(respuesta.mensaje)
                }

            }).catch(error => {
                alert("Ocurrio un error al consultar el endpoint cobranzaGeneral.php" + error);
            })
    }

    const handleSelectAgente = (agente) => {
        setselectAgente(agente)
    }

    const handleBuscar = () => {

        setDataCobranza(auxData)
        const data = {
            nombreAgente: selectAgente,
            statusVencida: checkSeleccionado
        }
        const requestOptions = {
            method: "POST",
            headers: { "Content-type": "application/x-www-form-urlencoded" },
            body: JSON.stringify(data)
        }

        fetch(urlSiteGround + "cobranza.php", requestOptions)
            .then(response => response.json())
            .then(respuesta => {
                if (respuesta.codigo === 200) {
                    let saldoPorCobrar = 0
                    let cobranzaEfectiva = 0
                    respuesta.vencidas.map((d) => {
                        saldoPorCobrar += parseFloat(d.saldo)
                        cobranzaEfectiva += d.pago === null ? 0 : parseFloat(d.pago)
                        d.saldo = currencyFormat(d.saldo)
                    })

                    respuesta.totales.transferencia = respuesta.totales.transferencia === null ? 0 : respuesta.totales.transferencia
                    respuesta.totales.cheque = respuesta.totales.cheque === null ? 0 : respuesta.totales.cheque
                    respuesta.totales.efectivo = respuesta.totales.efectivo === null ? 0 : respuesta.totales.efectivo
                    respuesta.totales.numeroCheques = respuesta.totales.numeroCheques === null ? 0 : respuesta.totales.numeroCheques
                    respuesta.totales.saldoPorCobrar = saldoPorCobrar
                    respuesta.totales.cobranzaEfectiva = cobranzaEfectiva
                    respuesta.totales.porcentajeCobrado = ((cobranzaEfectiva / saldoPorCobrar) * 100).toFixed(2)
                    respuesta.totales.nuevoSaldo = saldoPorCobrar - cobranzaEfectiva
                    respuesta.totales.porcentajeNoCobrado = ((respuesta.totales.nuevoSaldo / saldoPorCobrar) * 100).toFixed(2)

                    setDataCobranza(respuesta)
                } else {
                    alert(respuesta.mensaje)
                }
            })
            .catch(error => {
                alert("Ocurrio un error al consultar el endpoint cobranza.php" + error);
            })
    }

    function currencyFormat(num) {
        return num === 0 ? '$0' : '$' + parseFloat(num).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }

    const columns = useMemo(
        () => [
            {
                accessorKey: 'fecha_de_emision',
                header: 'Fecha Emision',
            },
            {
                accessorKey: 'numero_de_factura',
                header: 'Factura',
            },
            {
                accessorKey: 'nombre_cliente',
                header: 'Nombre Cliente',
            },
            {
                accessorKey: 'saldo',
                header: 'Saldo',
            },
            {
                accessorKey: 'pago',
                header: 'Pago',
            },

        ],
        [],
    )

    const columnsGeneral = useMemo(
        () => [
            {
                accessorFn: (originalRow) => new Date(originalRow.fecha_de_emision), //convert to date for sorting and filtering
                id: 'fecha_de_emision',
                header: 'Fecha Emision',
                filterVariant: 'date-range',
                Cell: ({ cell }) => cell.getValue().toLocaleDateString(), // convert back to string for display
            },
            /* {
                accessorKey: 'fecha_de_emision',
                header: 'Fecha Emision',
            }, */
            {
                accessorKey: 'nombre_del_agente',
                header: 'Agente',
                filterVariant: 'select',
                filterSelectOptions: jsonVendedores
            },
            {
                accessorKey: 'numero_de_factura',
                header: 'Factura',
            },
            {
                accessorKey: 'nombre_cliente',
                header: 'Nombre Cliente',
            },
            {
                accessorKey: 'saldo',
                header: 'Saldo',
            },
            {
                accessorKey: 'pago',
                header: 'Pago',
            },
            /* {
                accessorKey: 'status_vencida',
                header: 'Status',
                filterVariant:'select',
                filterSelectOptions: ['VENCIDA','NOVENCIDA']
            }, */
            {
                accessorKey: 'ruta',
                header: 'Ruta',
            },
            {
                accessorKey: 'entregada',
                header: 'Entregada',
            },

        ],
        [],
    )

    const MostrarModal = (rows) => {
        setMostrarModalAgregarPago(true)

        let suma = 0
        let jsonFacturasPorPagar = []

        rows.map((r) => {
            jsonFacturasPorPagar.push({
                numeroFactura: r.original.numero_de_factura,
                saldo: r.original.saldo
            })
            suma += parseFloat(r.original.saldo)
        })

        setFacturasPorPagar(jsonFacturasPorPagar)
        setMontoaPagar(suma)
    }

    const sumarFacturas = () => {
        let suma = 0
        refInputPagoFactura.current.map(f => {
            suma += parseFloat(f.value)
        })
        setMontoaPagar(suma)

    }

    const insertarPagos = () => {

        const data = {
            pago: {
                metodoPago: metodoPago,
                bancoReceptor: metodoPago === 'transferencia' ? bancoReceptor : '',
                bancoCheque: metodoPago === 'cheque' ? bancoCheque : '',
                fechaCheque: metodoPago === 'cheque' ? fechaCheque : '',
                numeroCheque: metodoPago === 'cheque' ? numeroCheque : '',
            },
            facturas: []
        }

        for (let i = 0; i < facturasPorPagar.length; i++) {
            data.facturas[i] = {
                monto: refInputPagoFactura.current[i].value,
                numeroFactura: facturasPorPagar[i].numeroFactura
            }
        }

        const requestOptions = {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(data)
        }

        fetch(urlSiteGround + 'pagos.php', requestOptions)
            .then(response => response.json())
            .then(respuesta => {
                if (respuesta.codigo === 200) {
                    setMostrarModalAgregarPago(false)
                    obtenerCobranzaGeneral()
                } else {
                    alert(respuesta.mensaje)
                }
            }).catch(error => {
                console.log(error)
            })
    }

    const handleExportarHojaCobranza = ()=>{
        const csvOptionsPagos = {
            fieldSeparator: ',',
            quoteStrings: '"',
            decimalSeparator: '.',
            showLabels: true,
            useBom: true,
            useKeysAsHeaders: false,
            filename: 'HOJA COBRANZA',
            headers: ['FECHA EMISION','FACTURA', 'NOMBRE CLIENTE', 'SALDO', 'PAGO'],
          };
      
          const csvExporterPagos = new ExportToCsv(csvOptionsPagos);
      
          csvExporterPagos.generateCsv(dataCobranza.vencidas);
    }

    return (
        <>
            <div className='container mt-3'>
                <div className="card shadow">
                    <div className="card-header">Cobranza</div>
                    <div className='container mt-3'>
                        <Tabs id="controlled-tab-example" activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
                            <Tab eventKey="cobranzaGeneral" title="Cobranza General">
                                <div className='card-body'>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <MaterialReactTable
                                            columns={columnsGeneral}
                                            data={dataCobranzaGeneral}
                                            enableTopToolbar={true}
                                            enableColumnActions={true}
                                            enableStickyHeader={true}
                                            enablePagination={true}
                                            enableRowSelection
                                            enableSorting={true}
                                            renderTopToolbarCustomActions={({ table }) => (
                                                <Box sx={{ display: 'flex', gap: '1rem', p: '0.5rem', flexWrap: 'wrap' }}>
                                                    <Button
                                                        disabled={
                                                            !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
                                                        }
                                                        //only export selected rows
                                                        onClick={() => MostrarModal(table.getSelectedRowModel().rows)}

                                                        variant="primary"
                                                    >
                                                        Agregar Pago
                                                    </Button>
                                                </Box>
                                            )}
                                            initialState={{
                                                showColumnFilters: true,
                                                density: 'compact',

                                            }}
                                            defaultColumn={{
                                                size: 30,
                                            }}
                                        />
                                    </LocalizationProvider>
                                </div>
                            </Tab>
                            <Tab eventKey="hojaCobranza" title="Hoja Cobranza">
                                <div className=" row">
                                    <div className='col-6'>
                                        <div className='row mb-3'>
                                            <div className="col-6">
                                                <select className="form-select" value={selectAgente} onChange={e => handleSelectAgente(e.target.value)}>
                                                    <option value='00'>Selecciona un Agente</option>
                                                    {
                                                        jsonVendedores.map((nombre, index) => (
                                                            <option key={index} value={nombre}>{nombre}</option>
                                                        ))
                                                    }
                                                </select>
                                            </div>
                                            <div className="col-auto">
                                                <button className='btn btn-primary' onClick={handleBuscar}>Buscar</button>
                                            </div>
                                            <div className="col-auto">
                                                <button className='btn btn-success' onClick={handleExportarHojaCobranza}>Exportar Excel</button>
                                            </div>
                                        </div>
                                        <div className='row'>
                                            <Form>
                                                <Form.Check
                                                    type='radio'
                                                    label='Vencidas'
                                                    onChange={() => setCheckSeleccionado('vencida')}
                                                    checked={checkSeleccionado === 'vencida'}
                                                    inline
                                                />

                                                <Form.Check
                                                    type='radio'
                                                    label='No Vencidas'
                                                    onChange={() => setCheckSeleccionado('no vencida')}
                                                    checked={checkSeleccionado === 'no vencida'}
                                                    inline
                                                />

                                                <Form.Check
                                                    type='radio'
                                                    label='Todas'
                                                    onChange={() => setCheckSeleccionado('todas')}
                                                    checked={checkSeleccionado === 'todas'}
                                                    inline
                                                />
                                            </Form>
                                        </div>
                                    </div>
                                    <div className='col-3'>
                                        <p className='mb-0'>Efectivo Cobrado: {dataCobranza.totales.efectivo === '' ? '' : currencyFormat(dataCobranza.totales.efectivo)}</p>
                                        <p className='mb-0'>Numero de Cheques: {dataCobranza.totales.numeroCheques === '' ? '' : dataCobranza.totales.numeroCheques}</p>
                                        <p className='mb-0'>Cheques: {dataCobranza.totales.cheque === '' ? '' : currencyFormat(dataCobranza.totales.cheque)}</p>
                                        <p className='mb-0'>Transferencia: {dataCobranza.totales.transferencia === '' ? '' : currencyFormat(dataCobranza.totales.transferencia)}</p>
                                    </div>
                                    <div className='col-3'>
                                        <p className='mb-0'>Cartera por Cobrar: {dataCobranza.totales.saldoPorCobrar === '' ? '' : currencyFormat(dataCobranza.totales.saldoPorCobrar)}</p>
                                        <p className='mb-0'>Cobranza Efectiva: {dataCobranza.totales.cobranzaEfectiva === '' ? '' : currencyFormat(dataCobranza.totales.cobranzaEfectiva)} {dataCobranza.totales.porcentajeCobrado === '' ? '' : dataCobranza.totales.porcentajeCobrado}%</p>
                                        <p className='mb-0'>Saldo: {dataCobranza.totales.nuevoSaldo === '' ? '' : currencyFormat(dataCobranza.totales.nuevoSaldo)} {dataCobranza.totales.porcentajeNoCobrado === '' ? '' : dataCobranza.totales.porcentajeNoCobrado}%</p>
                                    </div>
                                    <div className='card-body'>
                                        <MaterialReactTable
                                            columns={columns}
                                            data={dataCobranza.vencidas}
                                            enableTopToolbar={false}
                                            enableColumnActions={false}
                                            enableStickyHeader={true}
                                            enablePagination={false}
                                            enableSorting={true}
                                            initialState={{
                                                showColumnFilters: false,
                                                density: 'compact',
                                                columnVisibility: { key: false, status: true },
                                            }}
                                            defaultColumn={{
                                                size: 30,
                                            }}
                                        />
                                    </div>
                                </div>
                            </Tab>
                        </Tabs>
                    </div>
                    <Modal show={mostrarModalAgregarPago} onHide={() => setMostrarModalAgregarPago(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Agregar Pago</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form>
                                {
                                    facturasPorPagar.map((factura, index) => (
                                        <InputGroup className="mb-3" key={index}>
                                            <InputGroup.Text >Factura {factura.numeroFactura}</InputGroup.Text>
                                            <Form.Control style={{ textAlign: 'right' }} value={currencyFormat(factura.saldo)} disabled />
                                            <Form.Control style={{ textAlign: 'right' }} ref={e => refInputPagoFactura.current[index] = e} type="number" onChange={sumarFacturas} defaultValue={factura.saldo} />
                                        </InputGroup>
                                    ))
                                }
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
                                    <Row>
                                        <Form.Group className="mb-3 col-6">
                                            <Form.Label>Fecha Cheque</Form.Label>
                                            <Form.Control type="date" onChange={e => setFechaCheque(e.target.value)} />
                                        </Form.Group>
                                        <Form.Group className="mb-3 col-6">
                                            <Form.Label>Numero de Cheque</Form.Label>
                                            <Form.Control type="number" onChange={e => setNumeroCheque(e.target.value)} />
                                        </Form.Group>
                                    </Row>
                                    : <></>}
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column md={{ offset: 6 }}>Total</Form.Label>
                                    <Form.Label column >{currencyFormat(montoaPagar)}</Form.Label>
                                </Form.Group>
                            </Form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setMostrarModalAgregarPago(false)}>
                                Cerrar
                            </Button>
                            <Button variant="primary" onClick={insertarPagos}>
                                Guardar
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </div >
        </>
    )
}
