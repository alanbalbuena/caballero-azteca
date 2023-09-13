import { limitToLast, onValue, query, ref, equalTo, orderByChild } from 'firebase/database';
import React, { useState, useEffect } from 'react'
import { db } from '../util/firebase';
import dataFolios from './dataFolios';
import { ExportToCsv } from "export-to-csv";

export default function ReporteVentas() {
    const [listVentas, setListVentas] = useState([])
    const [listTotalPorCliente, setListTotalPorCliente] = useState([])
    const [rutasAgente, setRutasAgente] = useState([])
    const [dataFoliosjson, setDataFoliosJson] = useState(dataFolios)
    const [selectMes, setselectMes] = useState('00')
    const [selectRuta, setselectRuta] = useState('00')
    const [selectMarca, setselectMarca] = useState('00')
    const [selectAgente, setselectAgente] = useState('00')

    let jsonMarcas = [
        { nombre: '.' },
        { nombre: 'ALBATROS' },
        { nombre: 'ALMET' },
        { nombre: 'BARRETO' },
        { nombre: 'BELLOTA' },
        { nombre: 'BORO' },
        { nombre: 'BRONCES FINOS' },
        { nombre: 'BROTIMEX' },
        { nombre: 'BRUNA' },
        { nombre: 'DEVCON' },
        { nombre: 'ELPRO' },
        { nombre: 'FAMA' },
        { nombre: 'FLEXIMATIC' },
        { nombre: 'FRANCIA' },
        { nombre: 'FUNDICIONES' },
        { nombre: 'FUSION' },
        { nombre: 'FXN' },
        { nombre: 'HECORT' },
        { nombre: 'IUSA' },
        { nombre: 'LINMEX' },
        { nombre: 'MARDUCK' },
        { nombre: 'METALFLU' },
        { nombre: 'MEXICHEM' },
        { nombre: 'MIBER' },
        { nombre: 'MUELLER' },
        { nombre: 'NACOBRE' },
        { nombre: 'OMEGA' },
        { nombre: 'OXAL' },
        { nombre: 'PLASTITRIM' },
        { nombre: 'PRESTO' },
        { nombre: 'SERRATOS' },
        { nombre: 'SIAMP' },
        { nombre: 'SOLVER' },
        { nombre: 'SURTEK' },
        { nombre: 'VARIOS' },
    ]

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
        { nombre: 'total_x_marca' },
    ]

    let jsonMeses = [
        { nombre: 'Enero', valor: '01' },
        { nombre: 'Febrero', valor: '02' },
        { nombre: 'Marzo', valor: '03' },
        { nombre: 'Abril', valor: '04' },
        { nombre: 'Mayo', valor: '05' },
        { nombre: 'Junio', valor: '06' },
        { nombre: 'Julio', valor: '07' },
        { nombre: 'Agosto', valor: '08' },
        { nombre: 'Septiembre', valor: '09' },
        { nombre: 'Octubre', valor: '10' },
        { nombre: 'Noviembre', valor: '11' },
        { nombre: 'Diciembre', valor: '12' },
    ]

    let jsonVentas = [{}]
    for (var i = 0; i < jsonMarcas.length; i++) {
        jsonVentas[i] = {
            marca: jsonMarcas[i].nombre,
            cesar_ramirez: 0,
            rodolfo_castellanos: 0,
            horacio_tejeda: 0,
            horacio_guerrero: 0,
            omar_rivas: 0,
            alfredo_arreola: 0,
            cesar_serrano: 0,
            juan_cruz: 0,
            enrique_rivera: 0,
            carlos_bautista: 0,
            total_x_marca: 0,
        }
    }

    let jsonTotales = [{
        cesar_ramirez: 0,
        rodolfo_castellanos: 0,
        horacio_tejeda: 0,
        horacio_guerrero: 0,
        omar_rivas: 0,
        alfredo_arreola: 0,
        cesar_serrano: 0,
        juan_cruz: 0,
        enrique_rivera: 0,
        carlos_bautista: 0,
        total_x_marca: 0,
    }]

    const handleBuscar = () => {
        let foliosRef = query(ref(db, 'Folio'), limitToLast(1500));

        onValue(foliosRef, (snapshot) => {
            snapshot.forEach((childSnapshot) => {
                let data = childSnapshot.val();
                let folioMes = data.fecha.substring(3, 5)
                let ano = data.fecha.substring(6, 10)
                if (folioMes === selectMes && ano === '2023') {
                    let nombre = nombreFormat((data.vendedor.nombre === undefined ? data.vendedor : data.vendedor.nombre).replace(" ", "_"));
                    if (nombre !== 'soporte' && nombre !== 'luis_guillermo' && nombre !== 'javier_salas') {
                        if (selectAgente === nombre || selectAgente === '00') {
                            if (selectRuta === data.ruta || selectRuta === '00') {
                                data.listaDeProductos.forEach(p => {
                                    if (selectMarca === p.marca || selectMarca === '00') {
                                        for (let i = 0; i < jsonMarcas.length; i++) {
                                            if (p.marca === jsonMarcas[i].nombre) {
                                                let monto = data.tipoDocumento === 'Factura' ? p.precio * p.cantidad : ((p.precio / 1.16) * p.cantidad)
                                                jsonVentas[i][nombre] += monto
                                                jsonVentas[i].total_x_marca += monto
                                                break;
                                            }
                                        }
                                    }
                                })
                            }
                        }
                    }
                }
            });
            for (let i = 0; i < jsonVentas.length; i++) {
                for (let x = 0; x < jsonVendedores.length; x++) {
                    jsonTotales[0][jsonVendedores[x].nombre] += jsonVentas[i][jsonVendedores[x].nombre]
                }
            }
            setListTotalPorCliente(jsonTotales)
            setListVentas(jsonVentas)
        });

         /* dataFoliosjson.forEach((data) => {
            let folioMes = data.fecha.substring(3, 5)
            let ano = data.fecha.substring(6, 10)
            if (folioMes === selectMes && ano === '2023') {
                let nombre = nombreFormat((data.vendedor.nombre === undefined ? data.vendedor : data.vendedor.nombre).replace(" ", "_"));
                if (nombre !== 'soporte' && nombre !== 'luis_guillermo' && nombre !== 'javier_salas') {
                    if (selectAgente === nombre || selectAgente === '00') {
                        if (selectRuta === data.ruta || selectRuta === '00') {
                            data.listaDeProductos.forEach(p => {
                                if (selectMarca === p.marca || selectMarca === '00') {
                                    for (let i = 0; i < jsonMarcas.length; i++) {
                                        if (p.marca === jsonMarcas[i].nombre) {
                                            let monto = data.tipoDocumento === 'Factura' ? p.precio * p.cantidad : ((p.precio / 1.16) * p.cantidad)
                                            jsonVentas[i][nombre] += monto
                                            jsonVentas[i].total_x_marca += monto
                                            break;
                                        }
                                    }
                                }
                            })
                        }
                    }
                }
            }
        });

        for (let i = 0; i < jsonVentas.length; i++) {
            for (let x = 0; x < jsonVendedores.length; x++) {
                jsonTotales[0][jsonVendedores[x].nombre] += jsonVentas[i][jsonVendedores[x].nombre]
            }
        }
        setListTotalPorCliente(jsonTotales)
        setListVentas(jsonVentas) */ 
    }

    const handleLimpiar = () => {
        setselectAgente('00')
        setselectMarca('00')
        setselectMes('00')
        setselectRuta('00')
        setListVentas([])
        setListTotalPorCliente([])
    }

    function currencyFormat(num) {
        return num === 0 ? '' : '$' + parseFloat(num).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }

    const nombreFormat = (str) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }

    const handleSelectAgente = (agente) => {
        setselectAgente(agente)
        for (let i = 0; i < jsonVendedores.length; i++) {
            if (jsonVendedores[i].nombre === agente) {
                setRutasAgente(jsonVendedores[i].rutas)
                break
            }


        }
    }

    const handleExport = () => {
        const options = {
            fieldSeparator: ',',
            quoteStrings: '"',
            decimalSeparator: '.',
            showLabels: true,
            filename: 'Reporte Ventas',
            useTextFile: false,
            useBom: true,
            useKeysAsHeaders: true,
            // headers: ['Column 1', 'Column 2', etc...] <-- Won't work with useKeysAsHeaders present!
        };
        const csvExporter = new ExportToCsv(options);
        csvExporter.generateCsv(listVentas);
    }

    return (
        <>
            <div className='container' style={{ marginTop: '20px' }}>
                <div className="card shadow">
                    <div className="card-header">Reporte Ventas</div>
                    <div className="card-body" style={{ fontSize: '15px' }}>
                        <div className='container'>
                            <div className="row mb-3">
                                <div className="col-auto">
                                    <select className="form-select" value={selectMes} onChange={e => setselectMes(e.target.value)}>
                                        <option value='00'>Selecciona un Mes</option>
                                        {
                                            jsonMeses.map((m, index) => (
                                                <option key={index} value={m.valor}>{m.nombre}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                                <div className="col-auto">
                                    <select className="form-select" value={selectAgente} onChange={e => handleSelectAgente(e.target.value)}>
                                        <option value={'00'}>Selecciona un Agente</option>
                                        {
                                            jsonVendedores.map((v, index) => (
                                                <option key={index} value={v.nombre}>{v.nombre}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                                <div className="col-auto">
                                    <select className="form-select" value={selectRuta} onChange={e => setselectRuta(e.target.value)}>
                                        <option value={'00'}>Selecciona una Ruta</option>
                                        {
                                            rutasAgente.map((r, index) => (
                                                <option key={index} value={r.nombre}>{r.nombre}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                                <div className="col-auto">
                                    <select className="form-select" value={selectMarca} onChange={e => setselectMarca(e.target.value)}>
                                        <option value='00'>Selecciona una Marca</option>
                                        {
                                            jsonMarcas.map((m, index) => (
                                                <option key={index} value={m.nombre}>{m.nombre}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                                <div className="col-auto">
                                    <button className='btn btn-primary' onClick={handleBuscar}>Buscar</button>
                                </div>
                                <div className="col-auto">
                                    <button className='btn btn-secondary' onClick={handleLimpiar}>Limpiar</button>
                                </div>
                                <div className="col-auto">
                                    <button className='btn btn-success' onClick={handleExport}>Exportar Excel</button>
                                </div>
                            </div>
                            <table className="table table-sm table-bordered">
                                <thead>
                                    <tr>
                                        <th>Marca</th>
                                        <th>Cesar Ramirez</th>
                                        <th>Rodolfo Castellanos</th>
                                        <th>Horacio Tejeda</th>
                                        <th>Horacio Guerrero</th>
                                        <th>Omar Rivas</th>
                                        <th>Alfredo Arreola</th>
                                        <th>Cesar Serrano</th>
                                        <th>Juan Cruz</th>
                                        <th>Enrique Rivera</th>
                                        <th>Carlos Bautista</th>
                                        <th>Total x Marca</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        listVentas.map((d, index) => (
                                            <tr key={index}  >
                                                <td>{d.marca}</td>
                                                <td className='text-end'>{currencyFormat(d.cesar_ramirez)}</td>
                                                <td className='text-end'>{currencyFormat(d.rodolfo_castellanos)}</td>
                                                <td className='text-end'>{currencyFormat(d.horacio_tejeda)}</td>
                                                <td className='text-end'>{currencyFormat(d.horacio_guerrero)}</td>
                                                <td className='text-end'>{currencyFormat(d.omar_rivas)}</td>
                                                <td className='text-end'>{currencyFormat(d.alfredo_arreola)}</td>
                                                <td className='text-end'>{currencyFormat(d.cesar_serrano)}</td>
                                                <td className='text-end'>{currencyFormat(d.juan_cruz)}</td>
                                                <td className='text-end'>{currencyFormat(d.enrique_rivera)}</td>
                                                <td className='text-end'>{currencyFormat(d.carlos_bautista)}</td>
                                                <td className='text-end'>{currencyFormat(d.total_x_marca)}</td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                                <tfoot>
                                    {
                                        listTotalPorCliente.map((t, index) => (
                                            <tr key={index}>
                                                <td>Total</td>
                                                <td className='text-end'>{currencyFormat(t.cesar_ramirez)}</td>
                                                <td className='text-end'>{currencyFormat(t.rodolfo_castellanos)}</td>
                                                <td className='text-end'>{currencyFormat(t.horacio_tejeda)}</td>
                                                <td className='text-end'>{currencyFormat(t.horacio_guerrero)}</td>
                                                <td className='text-end'>{currencyFormat(t.omar_rivas)}</td>
                                                <td className='text-end'>{currencyFormat(t.alfredo_arreola)}</td>
                                                <td className='text-end'>{currencyFormat(t.cesar_serrano)}</td>
                                                <td className='text-end'>{currencyFormat(t.juan_cruz)}</td>
                                                <td className='text-end'>{currencyFormat(t.enrique_rivera)}</td>
                                                <td className='text-end'>{currencyFormat(t.carlos_bautista)}</td>
                                                <td className='text-end'>{currencyFormat(t.total_x_marca)}</td>
                                            </tr>
                                        ))
                                    }
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}