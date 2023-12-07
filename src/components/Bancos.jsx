import React, { useMemo, useState, useEffect } from 'react'
import { urlSiteGround } from '../util/firebase'
import {MaterialReactTable, useMaterialReactTable} from 'material-react-table';

export default function Bancos() {
    const [data, setData] = useState([])

    const columns = useMemo(
        () => [
            {
                accessorKey: 'id',
                header: 'ID',
            },
            {
                accessorKey: 'fecha',
                header: 'FECHA',
            },
            {
                accessorKey: 'tipo',
                header: 'TIPO',
            },
            {
                accessorKey: 'deposito',
                header: 'DEPOSITO',
            },
            {
                accessorKey: 'retiro',
                header: 'RETIRO',
            },
            {
                accessorKey: 'saldo',
                header: 'SALDO',
            },
            {
                accessorKey: 'concepto',
                header: 'CONCEPTO',
            },

        ],
        [],
    );

    useEffect(() => {
        getDataBancos()
    }, []);

    const getDataBancos = () => {
        fetch(urlSiteGround + 'bancos.php')
            .then((response) => response.json())
            .then((json) => {
                json.forEach(j => {
                    j.deposito = currencyFormat(j.deposito)
                    j.retiro = currencyFormat(j.retiro)
                    j.saldo = currencyFormat(j.saldo)
                });
                setData(json);
            }).catch((error) => {
                alert("Ocurrio un error con la API " + error)
            })
    }

    function currencyFormat(num) {
        return num === 0 ? '' : '$' + parseFloat(num).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }

    const table = useMaterialReactTable({
        columns: columns,
        data: data,
        enableTopToolbar: false,
        enableColumnActions: false,
        enableSorting: false,
        initialState: {
            showColumnFilters: false,
            density: 'compact',
            columnVisibility: { key: false, status: true },
            sorting: [
                { id: 'key', desc: true },
            ],
        },
        defaultColumn: {
            size: 30, //make columns wider by default
        }
    })

    const [contador, setContador] = useState(0)
    
console.log("entro a todo")
    return (
        <div className='container ' style={{ marginTop: '20px' }}>
            <div className="card shadow">
                <button onClick={()=> setContador(contador+1)}>miboton</button>
                {contador}
                <div className="card-header">Bancos</div>
                <div className='card-body'>
                    <MaterialReactTable
                        table={table}
                    />
                </div>
            </div>
        </div>
    )
}
