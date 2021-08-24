import React from 'react'

const BarraHerramientas = (props) => {

    const permiso = props.permiso
    const folio = props.folio
    const status = props.folio.status
    const actionChooser = props.action

    const Bar = () => {

        switch (permiso) {

            case "superusuario":
                return (
                <div>
                    <button className="btn btn-primary" onClick={() => actionChooser(folio, folio.folio, 'excel')}>EXCEL</button>
                    <button className="btn btn-danger" onClick={() => actionChooser(folio, folio.folio, 'pdf')}>PDF</button>
                    <button className="btn btn-danger" onClick={() => actionChooser(folio, folio.folio, 'imprimir')}>IMPRIMIR</button>
                    <button className="btn btn-primary" onClick={() => actionChooser(folio, folio.folio, 'autorizar')}>AUTORIZAR</button>
                    <button className="btn btn-danger" onClick={() => actionChooser(folio, folio.folio, 'eliminar')}>ELIMINAR</button>
                </div> )
            case "administrador":
                return (
                <div>
                    <button className="btn btn-primary" onClick={() => actionChooser(folio, folio.folio, 'excel')}>EXCEL</button>
                    <button className="btn btn-danger" onClick={() => actionChooser(folio, folio.folio, 'pdf')}>PDF</button>
                    {
                        status === "autorizado"
                            ? <button className="btn btn-danger" onClick={() => actionChooser(folio, folio.folio, 'imprimir')}>IMPRIMIR</button>
                            : null
                    }
                </div> )
            case "vendedor":
                return (
                <div>
                    <button className="btn btn-primary" onClick={() => actionChooser(folio, folio.folio, 'excel')}>EXCEL</button>
                    <button className="btn btn-danger" onClick={() => actionChooser(folio, folio.folio, 'pdf')}>PDF</button>
                </div> )
            case "almacen":
                return (
                <div>
                    <button className="btn btn-primary" onClick={() => actionChooser(folio, folio.folio, 'excel')}>EXCEL</button>
                    <button className="btn btn-danger" onClick={() => actionChooser(folio, folio.folio, 'pdf')}>PDF</button>
                    {
                        status === "autorizado"
                            ? <button className="btn btn-danger" onClick={() => actionChooser(folio, folio.folio, 'imprimir')}>IMPRIMIR</button>
                            : null
                    }
                </div> )
            case "facturacion":
                return (
                <div>
                    <button className="btn btn-primary" onClick={() => actionChooser(folio, folio.folio, 'excel')}>EXCEL</button>
                    <button className="btn btn-danger" onClick={() => actionChooser(folio, folio.folio, 'pdf')}>PDF</button>
                    <button className="btn btn-primary" onClick={() => actionChooser(folio, folio.folio, 'autorizar')}>AUTORIZAR</button>
                </div> )

            default: return <h1>SIN PERMISOS</h1>
        }
    }

    return (<Bar />)
}

export default BarraHerramientas