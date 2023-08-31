import React, { useEffect, useState, useMemo } from 'react'
import { onValue, ref } from "firebase/database";
import { db } from "../util/firebase";
import { Box, Button } from '@mui/material';
import { ExportToCsv } from 'export-to-csv';
import { MaterialReactTable } from "material-react-table";
import FileDownloadIcon from '@mui/icons-material/FileDownload';

export default function Cobranza() {
    const [cobranza, setCobranza] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const columns = useMemo(
        () => [
            {
                accessorKey: "key",
                header: "Key",

            },
            {
                accessorKey: "fechaEmision",
                header: "Fecha Emision",
                size: 10,
            },
            {
                accessorKey: "factura",
                header: "Factura",
                size: 10,
            },
            {
                accessorKey: "notaCredito",
                header: "N.C.",
                size: 10,
            },
            {
                accessorKey: "codigoCliente",
                header: "Codigo Cliente",
                size: 10,
            },
            {
                accessorKey: "nombreCliente",
                header: "Nombre Cliente",
                size: 10,
            },
            {
                accessorKey: "importeFactura",
                header: "$ Factura",
                size: 10,
            },
            {
                accessorKey: "importeNotaCredito",
                header: "$ Credito",
                size: 10,
            },
            {
                accessorKey: "importePorPagar",
                header: "$ por Pagar",
                size: 10,
            },
            {
                accessorKey: "abono",
                header: "Abono",
                size: 10,
            },
            {
                accessorKey: "saldo",
                header: "Saldo",
                size: 10,
            },
            {
                accessorKey: "efectivo",
                header: "Efectivo",
                size: 10,
            },
            {
                accessorKey: "otros",
                header: "Otros",
                size: 10,
            },
            {
                accessorKey: "observaciones",
                header: "Obervaciones",
                size: 10,
            },
            {
                accessorKey: "vencidas",
                header: "Vencidas",
                size: 10,
            },
            {
                accessorKey: "agente",
                header: "Agente",
                size: 10,
            },
            {
                accessorKey: "ruta",
                header: "Ruta",
                size: 10,
            },


        ],
        []
    );

    useEffect(() => {
        onValue(ref(db, 'Cobranza'), (snapshot) => {
            setCobranza(snapshot.val())
            setIsLoading(true);
        })
    }, []);


    const csvOptionsCobranza = {
        fieldSeparator: ',',
        quoteStrings: '"',
        decimalSeparator: '.',
        showLabels: true,
        useBom: true,
        useKeysAsHeaders: false,
        filename: 'Cobranza',
        headers: ['fechaEmision', 'factura', 'notaCredito', 'codigoCliente', 'nombreCliente', 'importeFactura', 'importeNotaCredito', 'importePorPagar', 'abono', 'saldo', 'efectivo', 'otros', 'observaciones', 'vencidas', 'agente', 'ruta'],
    };

    const csvExporterCobranza = new ExportToCsv(csvOptionsCobranza);
    const handleExportRows = (rows) => csvExporterCobranza.generateCsv(rows);

    return (
        <>
            <div>Cobranza</div>
            
        </>
    )
}
