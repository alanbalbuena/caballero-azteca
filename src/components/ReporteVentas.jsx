import { limitToLast, onValue, query, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react'
import { db, urlSiteGround } from '../util/firebase';
import dataFolios from './dataFolios';
import { ExportToCsv } from "export-to-csv";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { event } from 'jquery';

export default function ReporteVentas() {
    const [listVentasMensual, setListVentasMensual] = useState([])
    const [listVentasSemanal, setListVentasSemanal] = useState([])
    const [listVentasMarca, setListVentasMarca] = useState([])
    const [listTotalPorCliente, setListTotalPorCliente] = useState([])
    const [rutasAgente, setRutasAgente] = useState([])
    const [dataFoliosjson, setDataFoliosJson] = useState(dataFolios)
    const [selectMes, setselectMes] = useState(new Date().getMonth() + 1)
    const [selectRuta, setselectRuta] = useState('00')
    const [selectMarca, setselectMarca] = useState('metalflu')
    const [selectAgente, setselectAgente] = useState('00')
    const [key, setKey] = useState('mensual');
    const [fechaInicioSemanal, setFechaInicioSemanal] = useState()
    const [fechaFinSemanal, setFechaFinSemanal] = useState()
    const [fechaAyer, setFechaAyer] = useState()

    

    /* let jsonMarcas = [
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
    ] */

    let jsonMarcas = [{ marca: 'metalflu' }, { marca: 'fleximatic' }, { marca: 'elpro' }, { marca: 'fxb' }]

    let jsonVendedores = [
        { nombre: 'cesar ramirez', rutas: [{ nombre: 'LOCAL' }, { nombre: 'CHAPALA' }] },
        { nombre: 'rodolfo castellanos', rutas: [{ nombre: 'LOCAL' }] },
        { nombre: 'horacio tejeda', rutas: [{ nombre: 'ZAC1' }, { nombre: 'COLIMA', nombre: 'LOCAL' }] },
        { nombre: 'horacio guerrero', rutas: [{ nombre: 'LOCAL' }, { nombre: 'SAN MARCOS' }, { nombre: 'SAN GABRIEL' }] },
        { nombre: 'omar rivas', rutas: [{ nombre: 'TEPIC' }, { nombre: 'VALLARTA' }, { nombre: 'TUITO' }] },
        { nombre: 'alfredo arreola', rutas: [{ nombre: 'ZAMORA' }, { nombre: 'ZAC2' }, { nombre: 'SAN BLAS' }, { nombre: 'ROSARIO' }] },
        { nombre: 'cesar serrano', rutas: [{ nombre: 'AGUASCALIENTES' }] },
        { nombre: 'juan cruz', rutas: [{ nombre: 'TECO LA HUERTA' }, { nombre: 'MANZANILLO' }] },
        { nombre: 'enrique rivera', rutas: [{ nombre: 'LOCAL' }] },
        { nombre: 'carlos bautista', rutas: [{ nombre: 'AGUASCALIENTES' }] },
        { nombre: 'total_x_marca' },
    ]

    let jsonMeses = [
        { nombre: 'Enero', valor: '1' },
        { nombre: 'Febrero', valor: '2' },
        { nombre: 'Marzo', valor: '3' },
        { nombre: 'Abril', valor: '4' },
        { nombre: 'Mayo', valor: '5' },
        { nombre: 'Junio', valor: '6' },
        { nombre: 'Julio', valor: '7' },
        { nombre: 'Agosto', valor: '8' },
        { nombre: 'Septiembre', valor: '9' },
        { nombre: 'Octubre', valor: '10' },
        { nombre: 'Noviembre', valor: '11' },
        { nombre: 'Diciembre', valor: '12' },
    ]

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

    useEffect(() => {
        if (key === 'mensual') {
            reporteMensual()
        } else if (key === 'semanal') {
            if (fechaFinSemanal === undefined || fechaInicioSemanal === undefined) {
                obtenerSemanaActual()
            }

            reporteSemanal()
        } else if (key === 'marca') {
            reporteMarca()
        }
    }, [key, selectMes, fechaInicioSemanal, fechaFinSemanal, selectMarca]);

    const reporteMensual = () => {
        if (selectMes !== '00') {
            fetch(urlSiteGround + 'reporte-ventas-mensual.php?mes=' + selectMes)
                .then((response) => response.json())
                .then((json) => {
                    setListVentasMensual(json);
                }).catch((error) => {
                    alert("Ocurrio un error con la API " + error)
                });;
        }
    }

    const reporteSemanal = () => {

        if (fechaInicioSemanal !== undefined && fechaFinSemanal !== undefined) {
            fetch(urlSiteGround + "reporte-ventas-semanal.php?inicio='" + fechaInicioSemanal + "'&fin='" + fechaFinSemanal + "'")
                .then((response) => response.json())
                .then((json) => {

                    let auxJson = [
                        { agente: 'Cesar Ramirez', total: 0 },
                        { agente: 'Rodolfo Castellanos', total: 0 },
                        { agente: 'Horacio Tejeda', total: 0 },
                        { agente: 'Horacio Guerrero', total: 0 },
                        { agente: 'Omar Rivas', total: 0 },
                        { agente: 'Alfredo Arreola', total: 0 },
                        { agente: 'Cesar Serrano', total: 0 },
                        { agente: 'Juan Cruz', total: 0 },
                        { agente: 'Enrique Rivera', total: 0 },
                        { agente: 'Carlos Bautista', total: 0 },

                    ]

                    for (var i = 0; i < json.length; i++) {
                        for (let x = 0; x < auxJson.length; x++) {
                            if (json[i].agente === auxJson[x].agente) {
                                auxJson[x].total = json[i].total
                                break
                            }
                        }
                    }

                    setListVentasSemanal(auxJson);
                }).catch((error) => {
                    alert("Ocurrio un error con la API " + error)
                });
        }
    }

    const reporteMarca = () => {
        obtenerSemanaActual()
        fetch(urlSiteGround + "reporte-ventas-marca.php?inicio='" + fechaInicioSemanal + "'&fin='" + fechaFinSemanal + "'&ayer='" + fechaAyer + "'&marca='" + selectMarca + "'")
            .then((response) => response.json())
            .then((json) => {

                let auxJson = [
                    { agente: 'Cesar Ramirez', ayer: 0, hoy: 0 },
                    { agente: 'Rodolfo Castellanos', ayer: 0, hoy: 0 },
                    { agente: 'Horacio Tejeda', ayer: 0, hoy: 0 },
                    { agente: 'Horacio Guerrero', ayer: 0, hoy: 0 },
                    { agente: 'Omar Rivas', ayer: 0, hoy: 0 },
                    { agente: 'Alfredo Arreola', ayer: 0, hoy: 0 },
                    { agente: 'Cesar Serrano', ayer: 0, hoy: 0 },
                    { agente: 'Juan Cruz', ayer: 0, hoy: 0 },
                    { agente: 'Enrique Rivera', ayer: 0, hoy: 0 },
                    { agente: 'Carlos Bautista', ayer: 0, hoy: 0 },

                ]

                for (var i = 0; i < json.length; i++) {
                    for (let x = 0; x < auxJson.length; x++) {
                        if (json[i].agente === auxJson[x].agente) {
                            auxJson[x].ayer = json[i].ayer === null ? 0 : json[i].ayer
                            auxJson[x].hoy = json[i].hoy === null ? 0 : json[i].hoy
                            break
                        }
                    }
                }

                setListVentasMarca(auxJson);
            }).catch((error) => {
                alert("Ocurrio un error con la API " + error)
            });;

    }


    /* const handleLimpiar = () => {
        setselectAgente('00')
        setselectMarca('00')
        setselectMes('00')
        setselectRuta('00')
        setListVentas([])
        setListTotalPorCliente([])
    } */

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
        csvExporter.generateCsv(listVentasMensual);
    }

    const obtenerSemanaActual = () => {
        let dateInicio = new Date;
        let dateFin =    new Date;
        let dateAyer =   new Date;

        let inicio =      dateInicio.getDate() - dateInicio.getDay() - 1;
        let fechaInicio = new Date(dateInicio.setDate(inicio));
        let fechaFin =    new Date(dateFin.setDate(inicio + 6));
        let fechaAyer =   new Date(dateAyer.setDate(dateAyer.getDate() - 1))

        //obetiene la fecha de inicio
        let dayInicio =   fechaInicio.getDate();
        let monthInicio = fechaInicio.getMonth() + 1;
        let yearInicio =  fechaInicio.getFullYear();

        if (monthInicio < 10) monthInicio = "0" + monthInicio;
        if (dayInicio < 10) dayInicio = "0" + dayInicio;

        let auxInicio = yearInicio + "-" + monthInicio + "-" + dayInicio;

        //obtiene la fecha fin
        let dayFin = fechaFin.getDate();
        let monthFin = fechaFin.getMonth() + 1;
        let yearFin = fechaFin.getFullYear();

        if (monthFin < 10) monthFin = "0" + monthFin;
        if (dayFin < 10) dayFin = "0" + dayFin;

        let auxFin = yearFin + "-" + monthFin + "-" + dayFin;

        //obtiene la fecha ayer
        let dayAyer = fechaAyer.getDate();
        let monthAyer = fechaAyer.getMonth() + 1;
        let yearAyer = fechaAyer.getFullYear();

        if (monthAyer < 10) monthAyer = "0" + monthAyer;
        if (dayAyer < 10) dayAyer = "0" + dayAyer;

        let auxAyer = yearAyer + "-" + monthAyer + "-" + dayAyer;

        setFechaInicioSemanal(auxInicio)
        setFechaFinSemanal(auxFin)
        setFechaAyer(auxAyer)

    }

    const handleChangeFechaInicio = (event) => {
        setFechaInicioSemanal(event.target.value)
    }
    const handleChangeFechaFin = (event) => {
        setFechaFinSemanal(event.target.value)
    }


    return (
        <>
            <div className='container' style={{ marginTop: '20px' }}>
                <div className="card shadow">

                    <div className="card-header">Reporte Ventas</div>
                    <div className="card-body" style={{ fontSize: '15px' }}>
                        <Tabs id="controlled-tab-example" activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
                            <Tab eventKey="mensual" title="Mensual">
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
                                        {/* <div className="col-auto">
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
                                        </div>*/}
                                        <div className="col-auto ms-auto">
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
                                                listVentasMensual.map((d, index) => (
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
                                        {/* <tfoot>
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
                                </tfoot> */}
                                    </table>
                                </div>
                            </Tab>
                            <Tab eventKey="semanal" title="Semanal">
                                <div className='container'>
                                    <div className="row mb-3">
                                        <div className="col-auto">
                                            <div className="input-group mb-3">
                                                <label className="input-group-text">Inicio</label>
                                                <input type="date" className="form-control" onChange={handleChangeFechaInicio} defaultValue={fechaInicioSemanal} />
                                            </div>
                                        </div>
                                        <div className="col-auto">
                                            <div className="input-group mb-3">
                                                <label className="input-group-text">Fin</label>
                                                <input type="date" className="form-control" onChange={handleChangeFechaFin} defaultValue={fechaFinSemanal} />
                                            </div>
                                        </div>
                                        {/* <div className="col-auto ms-auto">
                                            <button className='btn btn-success' onClick={handleExport}>Exportar Excel</button>
                                        </div> */}
                                    </div>
                                    <div className='row'>
                                        <div className='col-4'>
                                            <table className="table table-sm table-bordered">
                                                <thead>
                                                    <tr>
                                                        <th>Agente</th>
                                                        <th>Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {listVentasSemanal.map((d, index) => (
                                                        <tr key={index}>
                                                            <td>{d.agente}</td>
                                                            <td>{currencyFormat(d.total)}</td>
                                                        </tr>
                                                    ))}

                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                </div>
                            </Tab>
                            <Tab eventKey="marca" title="Marca">
                                <div className='container'>
                                    <div className="row mb-3">
                                        <div className="col-auto">
                                            {
                                                <select className="form-select" value={selectMarca} onChange={e => setselectMarca(e.target.value)}>
                                                    {
                                                        jsonMarcas.map((m, index) => (
                                                            <option key={index} value={m.marca}>{m.marca}</option>
                                                        ))
                                                    }
                                                </select>
                                            }
                                        </div>
                                    </div>
                                    <div className='row'>
                                        <div className='col-4'>
                                            <table className="table table-sm table-bordered">
                                                <thead>
                                                    <tr>
                                                        <th>Agente</th>
                                                        <th>Ayer</th>
                                                        <th>Hoy</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {listVentasMarca.map((d, index) => (
                                                        <tr key={index}>
                                                            <td>{d.agente}</td>
                                                            <td>{currencyFormat(d.ayer)}</td>
                                                            <td>{currencyFormat(d.hoy)}</td>
                                                        </tr>
                                                    ))}

                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                </div>
                            </Tab>
                        </Tabs>

                    </div>
                </div>
            </div>
        </>
    )
}