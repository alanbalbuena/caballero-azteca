import React, { useState, useMemo, useEffect } from 'react'
import { ref, onValue, orderByChild, query, update, onChildChanged } from "firebase/database";
import { db } from '../util/firebase';
import { MaterialReactTable } from "material-react-table";

export default function Clientes() {

    const [listaClientes, setListaClientes] = useState([]);
    const clientesRef = query(ref(db, 'Cliente'), orderByChild('cliente'));

    function getClientes() {
        onValue(clientesRef, (snapshot) => {
            let list = []
            snapshot.forEach((childSnapshot) => {
                var key = childSnapshot.key;
                var data = childSnapshot.val();
                list.push({
                    key: key,
                    agenteCobro: data.agenteCobro,
                    agenteVenta: data.agenteVenta,
                    calle: data.calle,
                    code: data.code,
                    colonia: data.colonia,
                    cp: data.cp,
                    email: data.email,
                    estado: data.estado,
                    id: data.id,
                    municipio: data.municipio,
                    numeroExterior: data.numeroExterior,
                    numeroInterior: data.numeroInterior,
                    razon: data.razon,
                    rfc: data.rfc,
                    ruta: data.ruta,
                    telefono: data.telefono,
                });
            });
            setListaClientes(list);
        }, {
            onlyOnce: true
        });
    }

    useEffect(() => {
        getClientes();
        // addCliente();
    },[])

    onChildChanged(clientesRef, () => {
        getClientes();
    });

    const columns = useMemo(
        () => [
            {
                accessorKey: "key",
                header: "key",
                enableEditing: false,

            },
            {
                accessorKey: "agenteCobro",
                header: "Cobrador",
            },
            {
                accessorKey: "agenteVenta",
                header: "Vendedor",
            },
            {
                accessorKey: "calle",
                header: "Calle",
            },
            {
                accessorKey: "code",
                header: "Codigo",
                enableEditing: false,
            },
            {
                accessorKey: "colonia",
                header: "Colonia",
            },
            {
                accessorKey: "cp",
                header: "CP",
            },
            {
                accessorKey: "email",
                header: "Email",
            },
            {
                accessorKey: "estado",
                header: "Estado",
            },
            {
                accessorKey: "id",
                header: "Id",
            },
            {
                accessorKey: "municipio",
                header: "Municipio",
            },
            {
                accessorKey: "numeroExterior",
                header: "# Exterior",
            },
            {
                accessorKey: "numeroInterior",
                header: "# Interior",
            },
            {
                accessorKey: "razon",
                header: "Razon",
            },
            {
                accessorKey: "rfc",
                header: "RFC",
            },
            {
                accessorKey: "ruta",
                header: "Ruta",
            },
            {
                accessorKey: "telefono",
                header: "Telefono",
            },
        ],
        []
    );

    const handleSaveRow = async ({ exitEditingMode, row, values }) => {
        const updates = {};
        updates['/Cliente/' + values.key] = values;
        update(ref(db), updates);

        exitEditingMode(); //required to exit editing mode
    };

    return (

        <MaterialReactTable
            columns={columns}
            data={listaClientes}
            initialState={{
                showColumnFilters: true,
                density: 'compact'
                //columnVisibility: { key: false }
            }}
            enableEditing
            onEditingRowSave={handleSaveRow}
            enableTopToolbar={false} //hide top toolbar
            state={{ showProgressBars: true }} //or showSkeletons
            positionActionsColumn="last"


        />

    )
}
