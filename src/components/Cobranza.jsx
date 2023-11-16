import React, { useState, useMemo } from 'react'
import { MaterialReactTable } from "material-react-table";
import { urlSiteGround } from '../util/firebase';
import { Form, Tab, Tabs } from 'react-bootstrap';
import { useEffect } from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

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
    const [rutasAgente, setRutasAgente] = useState([])
    const [dataCobranza, setDataCobranza] = useState(auxData)
    const [dataCobranzaGeneral, setDataCobranzaGeneral] = useState([])
    const [checkSeleccionado, setCheckSeleccionado] = useState('vencida')
    const [key, setKey] = useState('hojaCobranza');

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
    }, [key]);


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

    const nombreFormat = (str) => str.normalize("NFD").split(' ').join('_').toLowerCase();

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
                accessorKey: 'nombre_del_agente',
                header: 'Agente',
                filterVariant:'select',
                filterSelectOptions: jsonVendedores
            },
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

    return (
        <>
            <div className='container mt-3'>
                <div className="card shadow">
                    <div className="card-header">Cobranza</div>
                    <div className='container mt-3'>
                        <Tabs id="controlled-tab-example" activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
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
                                            enableSorting={false}
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
                            <Tab eventKey="cobranzaGeneral" title="Cobranza General">
                                <div className='card-body'>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <MaterialReactTable
                                            columns={columnsGeneral}
                                            data={dataCobranzaGeneral}
                                            enableTopToolbar={false}
                                            enableColumnActions={true}
                                            enableStickyHeader={true}
                                            enablePagination={true}
                                            enableSorting={false}
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
                        </Tabs>
                    </div>

                </div>
            </div >
        </>
    )
}
