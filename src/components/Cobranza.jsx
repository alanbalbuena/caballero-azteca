import React, { useState, useMemo } from 'react'
import { onValue, push, ref } from "firebase/database"
import { db } from "../util/firebase"
import dataCobranzaJson from './dataCobranza.json'
import { MaterialReactTable } from "material-react-table";

import '../App.css';

export default function Cobranza() {
    const [cobranza, setCobranza] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectRuta, setselectRuta] = useState('00')
    const [selectAgente, setselectAgente] = useState('00')
    const [rutasAgente, setRutasAgente] = useState([])
    const [cobranzaFiltrada, setCobranzaFiltrada] = useState([])
    const [dataCobranza, setDataCobranza] = useState(dataCobranzaJson)
    const [saldo, setSaldo] = useState(
        {
            saldo: 0,
            efectivo: 0,
            transferencia: 0,
            numeroCheques: 0,
            cheque: 0,
            cobranzaEfectiva: 0,
            porcentajeCobrado: 0,
            porcentajeNoCobrado: 0

        })

    let jsonVendedores = [
        { nombre: 'cesar_ramirez', rutas: [{ nombre: 'LOCAL' }, { nombre: 'CHAPALA' }] },
        { nombre: 'rodolfo_castellanos', rutas: [{ nombre: 'LOCAL' }] },
        { nombre: 'horacio_tejeda', rutas: [{ nombre: 'ZAC1' }, { nombre: 'COLIMA', nombre: 'LOCAL' }] },
        { nombre: 'horacio_guerrero', rutas: [{ nombre: 'LOCAL' }, { nombre: 'SAN MARCOS' }, { nombre: 'SAN GABRIEL' }] },
        { nombre: 'omar_rivas', rutas: [{ nombre: 'TEPIC' }, { nombre: 'VALLARTA' }, { nombre: 'TUITO' }] },
        { nombre: 'alfredo_arreola', rutas: [{ nombre: 'ZAMORA' }, { nombre: 'ZAC2' }, { nombre: 'SAN BLAS' }, { nombre: 'ROSARIO' }] },
        { nombre: 'cesar_serrano', rutas: [{ nombre: 'AGUASCALIENTES' }] },
        { nombre: 'juan_cruz', rutas: [{ nombre: 'TECO LA HUERTA' }, { nombre: 'MANZANILLO' }] },
        { nombre: 'enrique_rivera', rutas: [{ nombre: 'LOCAL' }] },
        { nombre: 'carlos_bautista', rutas: [{ nombre: 'AGUASCALIENTES' }] },
    ]

    /* useEffect(() => {
        onValue(ref(db, 'Cobranza'), (snapshot) => {
            setCobranza(snapshot.val())
            setIsLoading(true);
        })
    }, []); */

    const handleSelectAgente = (agente) => {
        setselectAgente(agente)
        for (let i = 0; i < jsonVendedores.length; i++) {
            if (jsonVendedores[i].nombre === agente) {
                setRutasAgente(jsonVendedores[i].rutas)
                break
            }
        }
    }

    const handleBuscar = () => {
        let auxJson = []
        let auxSaldo =
        {
            saldo: 0,
            efectivo: 0,
            transferencia: 0,
            numeroCheques: 0,
            cheque: 0,
            cobranzaEfectiva: 0,
            porcentajeCobrado: 0,
            porcentajeNoCobrado: 0
        }

        for (let i = 0; i < dataCobranza.length; i++) {
            if (nombreFormat(dataCobranza[i].agente) === selectAgente) {
                if (selectRuta === dataCobranza[i].ruta || selectRuta === '00') {
                    auxJson.push(dataCobranza[i])

                    auxSaldo = {
                        saldo: auxSaldo.saldo += dataCobranza[i].saldo,
                        efectivo: auxSaldo.efectivo += dataCobranza[i].metodoPago === 'efectivo' ? dataCobranza[i].pago : 0,
                        transferencia: auxSaldo.transferencia += dataCobranza[i].metodoPago === 'transferencia' ? dataCobranza[i].pago : 0,
                        cheque: auxSaldo.cheque += dataCobranza[i].metodoPago === 'cheque' ? dataCobranza[i].pago : 0,
                        numeroCheques: dataCobranza[i].metodoPago === 'cheque' ? auxSaldo.numeroCheques + 1 : auxSaldo.numeroCheques + 0,
                        cobranzaEfectiva: auxSaldo.cobranzaEfectiva += dataCobranza[i].pago,
                        porcentajeCobrado: Math.round((auxSaldo.cobranzaEfectiva / auxSaldo.saldo) * 100),
                        porcentajeNoCobrado: Math.round(((auxSaldo.saldo - auxSaldo.cobranzaEfectiva) / auxSaldo.saldo) * 100)
                    }
                }
            }
        }
        setSaldo(auxSaldo)
        setCobranzaFiltrada(auxJson)
    }

    const nombreFormat = (str) => str.normalize("NFD").split(' ').join('_').toLowerCase();

    function currencyFormat(num) {
        return num === 0 ? '$0' : '$' + parseFloat(num).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }

    const columns = useMemo(
        () => [
            {
                accessorKey: 'fechaEmision',
                header: 'Fecha Emision',
            },
            {
                accessorKey: 'factura',
                header: 'Factura',
            },
            {
                accessorKey: 'notaCredito',
                header: 'N.C.',
            },
            {
                accessorKey: 'nombreCliente',
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
            {
                accessorKey: 'metodoPago',
                header: 'Metodo',
            },
            {
                accessorKey: 'banco',
                header: 'Banco',
            },
            {
                accessorKey: 'fechaPago',
                header: 'Fecha Pago',
            },
            {
                accessorKey: 'numeroCheque',
                header: 'Numero Cheque',
            },
            {
                accessorKey: 'obervaciones',
                header: 'Obervaciones',
            },
        ],
        [],
    );

    return (
        <>
            <div className='container mt-3'>
                <div className="card shadow">
                    <div className="card-header">Cobranza</div>
                    <div className="card-body row">
                        <div className='col-6'>
                            <div className='row mb-3'>
                                <div className="col-6">
                                    <select className="form-select" value={selectAgente} onChange={e => handleSelectAgente(e.target.value)}>
                                        <option value='00'>Selecciona un Agente</option>
                                        {
                                            jsonVendedores.map((v, index) => (
                                                <option key={index} value={v.nombre}>{v.nombre}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                                <div className="col-auto">
                                    <button className='btn btn-primary' onClick={handleBuscar}>Buscar</button>
                                </div>
                            </div>
                            <div className='row mb-3'>
                                <div className="col-6">
                                    <select className="form-select" value={selectRuta} onChange={e => setselectRuta(e.target.value)}>
                                        <option value='00'>Selecciona una Ruta</option>
                                        {
                                            rutasAgente.map((r, index) => (
                                                <option key={index} value={r.nombre}>{r.nombre}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className='col-3'>
                            <p className='mb-0'>Efectivo Cobrado: {currencyFormat(saldo.efectivo)}</p>
                            <p className='mb-0'>Numero de Cheques: {saldo.numeroCheques}</p>
                            <p className='mb-0'>Cheques: {currencyFormat(saldo.cheque)}</p>
                            <p className='mb-0'>Transferencia: {currencyFormat(saldo.transferencia)}</p>
                        </div>
                        <div className='col-3'>
                            <p className='mb-0'>Cartera por Cobrar: {currencyFormat(saldo.saldo)}</p>
                            <p className='mb-0'>Cobranza Efectiva: {currencyFormat(saldo.cobranzaEfectiva)} {saldo.porcentajeCobrado}%</p>
                            <p className='mb-0'>Saldo: {currencyFormat(saldo.saldo)} {saldo.porcentajeNoCobrado}%</p>
                        </div>
                    </div>
                    {/*  <div className='container'>
                        <table className="table table-sm table-bordered">
                            <thead>
                                <tr>
                                    <th scope="col">Fecha Emision</th>
                                    <th scope="col">Factura</th>
                                    <th scope="col">N.C.</th>
                                    <th scope="col">Codigo Cliente</th>
                                    <th scope="col">Nombre Cliente</th>
                                    <th scope="col">$ Factura</th>
                                    <th scope="col">$ N.C.</th>
                                    <th scope="col">$ Por Pagar</th>
                                    <th scope="col">Abono</th>
                                    <th scope="col">Saldo</th>
                                    <th scope="col">Efectivo</th>
                                    <th scope="col">Otros</th>
                                    <th scope="col">Obervaciones</th>
                                    <th scope="col">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    cobranzaFiltrada.map((c, index) => (
                                        <tr key={index}>
                                            <td>{c.fechaEmision}</td>
                                            <td>{c.factura}</td>
                                            <td>{c.notaCredito}</td>
                                            <td>{c.codigoCliente}</td>
                                            <td>{c.nombreCliente}</td>
                                            <td>{currencyFormat(c.importeFactura)}</td>
                                            <td>{currencyFormat(c.importeNotaCredito)}</td>
                                            <td>{currencyFormat(c.importePorPagar)}</td>
                                            <td>{currencyFormat(c.abono)}</td>
                                            <td>{currencyFormat(c.saldo)}</td>
                                            <td>{currencyFormat(c.efectivo)}</td>
                                            <td>{currencyFormat(c.otros)}</td>
                                            <td>{c.observaciones}</td>
                                            <td>{c.vencidas ? 'Vencida' : ''}</td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div> */}
                    <div className='card-body'>
                        <MaterialReactTable
                            columns={columns}
                            data={cobranzaFiltrada}
                            enableTopToolbar={false}
                            enableColumnActions={false}
                            enableSorting={false}
                            initialState={{
                                showColumnFilters: false,
                                density: 'compact',
                                columnVisibility: { key: false, status: true },
                                /* sorting: [
                                { id: 'key', desc: true },
                              ],  */
                            }}
                            defaultColumn={{
                                size: 30, //make columns wider by default
                            }}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}
