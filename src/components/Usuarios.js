import React, { useState, useMemo, useEffect } from 'react'
import { ref, onValue, orderByChild, query, update, onChildChanged } from "firebase/database";
import { db } from '../util/firebase';
import "bootstrap/dist/css/bootstrap.min.css";
//import { FaRegEdit, FaRegTrashAlt } from "react-icons/fa";
import { MaterialReactTable } from "material-react-table";

export default function Usuarios() {

  const [listaUsuarios, setListaUsuarios] = useState([]);
  const usuariosRef = query(ref(db, 'Usuario'), orderByChild('usuario'));

  function getUsuarios() {
    onValue(usuariosRef, (snapshot) => {
      let list = []
      snapshot.forEach((childSnapshot) => {
        var key = childSnapshot.key;
        var data = childSnapshot.val();
        list.push({
          key: key,
          nombre: data.nombre,
          usuario: data.usuario,
          password: data.password,
          email: data.email,
          permisos: data.permisos,
          telefono: data.telefono
        });
      });
      setListaUsuarios(list);
    }, {
      onlyOnce: true
    });
  }

  useEffect(() => {
    getUsuarios();
    // addUsuario();
  },[])

  onChildChanged(usuariosRef, () => {
    getUsuarios();
  });

  const columns = useMemo(
    () => [
      {
        accessorKey: "key",
        header: "key",
        enableEditing: false,

      },
      {
        accessorKey: "usuario",
        header: "Id",
        size: 10
      },
      {
        accessorKey: "nombre",
        header: "Nombre",
        filterVariant: 'text',
      },
      {
        accessorKey: "password",
        header: "Password",
      },
      {
        accessorKey: "email",
        header: "Email",
        enableEditing: false,
      },
      {
        accessorKey: "permisos",
        header: "Permisos",
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
    updates['/Usuario/' + values.key] = values;
    update(ref(db), updates);

    exitEditingMode(); //required to exit editing mode
  };

  return (

    <MaterialReactTable
      columns={columns}
      data={listaUsuarios}
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
