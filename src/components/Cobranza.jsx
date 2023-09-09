import React, { useEffect, useState, useMemo } from 'react'
import { onValue, ref } from "firebase/database";
import { db } from "../util/firebase";
import Button from 'react-bootstrap/Button';

import '../App.css';

export default function Cobranza() {
    const [cobranza, setCobranza] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    /* useEffect(() => {
        onValue(ref(db, 'Cobranza'), (snapshot) => {
            setCobranza(snapshot.val())
            setIsLoading(true);
        })
    }, []); */

    return (
        <>
            <div className='container' style={{marginTop:'20px'}}>
                <div className="card shadow">
                    <div className="card-header">Cobranza</div>
                    <div className="card-body">
                        <div class="col-3 mb-3">
                            <label for="inputState" class="form-label">Agente</label>
                            <select id="inputState" class="form-select">
                                <option selected>Choose...</option>
                                <option>1</option>
                                <option>2</option>
                                <option>3</option>
                            </select>
                        </div>
                        <div class="col-3 mb-3">
                            <label for="inputState" class="form-label">Ruta</label>
                            <select id="inputState" class="form-select">
                                <option selected>Choose...</option>
                                <option>1</option>
                                <option>2</option>
                                <option>3</option>
                            </select>
                        </div>
                        <div class="col-3 mb-3">
                            <label for="inputState" class="form-label">Fecha</label>
                            <select id="inputState" class="form-select">
                                <option selected>Choose...</option>
                                <option>1</option>
                                <option>2</option>
                                <option>3</option>
                            </select>
                        </div>
                    </div>
                    <div className='container'>
                        <table class="table table-sm table-bordered">
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
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>13/06/2023</td>
                                    <td>K-18442</td>
                                    <td></td>
                                    <td>C2380</td>
                                    <td>ALEJANDRO PEREZ GUERRERO</td>
                                    <td>$5,262.49</td>
                                    <td></td>
                                    <td>$5,262.49</td>
                                    <td></td>
                                    <td>$5,262.49</td>
                                    <td></td>
                                    <td></td>
                                    <td>Zapopan</td>
                                </tr>
                                <tr>
                                    <td>13/06/2023</td>
                                    <td>K-18442</td>
                                    <td></td>
                                    <td>C2380</td>
                                    <td>ALEJANDRO PEREZ GUERRERO</td>
                                    <td>$5,262.49</td>
                                    <td></td>
                                    <td>$5,262.49</td>
                                    <td></td>
                                    <td>$5,262.49</td>
                                    <td></td>
                                    <td></td>
                                    <td>Zapopan</td>
                                </tr>
                                <tr>
                                    <td>13/06/2023</td>
                                    <td>K-18442</td>
                                    <td></td>
                                    <td>C2380</td>
                                    <td>ALEJANDRO PEREZ GUERRERO</td>
                                    <td>$5,262.49</td>
                                    <td></td>
                                    <td>$5,262.49</td>
                                    <td></td>
                                    <td>$5,262.49</td>
                                    <td></td>
                                    <td></td>
                                    <td>Zapopan</td>
                                </tr>
                                <tr>
                                    <td>13/06/2023</td>
                                    <td>K-18442</td>
                                    <td></td>
                                    <td>C2380</td>
                                    <td>ALEJANDRO PEREZ GUERRERO</td>
                                    <td>$5,262.49</td>
                                    <td></td>
                                    <td>$5,262.49</td>
                                    <td></td>
                                    <td>$5,262.49</td>
                                    <td></td>
                                    <td></td>
                                    <td>Zapopan</td>
                                </tr>
                                
                               
                               
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    )
}
