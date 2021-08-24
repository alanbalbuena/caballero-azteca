import React from 'react'
import ReactExport from "react-export-excel";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const ExcelDocument = (props) => {

    const data = props.data ? props.data : null
    const products = props.products ? props.products : null

    return(
        <ExcelFile element={<button className="btn btn-primary">GENERAR EXCEL</button>} filename="ExcelPedido">
            <ExcelSheet data={data} name="Pedido">
            <ExcelColumn label="FECHA" value="fecha" />
            <ExcelColumn label="FOLIO" value="folio" />
            <ExcelColumn label="ID CLIENTE" value="codigoCliente" />
            <ExcelColumn label="CLIENTE" value="razon" />
            <ExcelColumn label="IMPORTE" value="totalSinIVA" />
            <ExcelColumn label="CIUDAD" value="ciudad" />
            <ExcelColumn label="RUTA" value="ruta" />
            <ExcelColumn label="VENDEDOR" value="vendedor" />
            <ExcelColumn label="FACTURA O REGISTRO" value="tipoDocumento" />
            <ExcelColumn label="FACTURA" value="numeroFactura"/>
            <ExcelColumn label="IMPORTE CON IVA" value="totalConIVA"/>
            </ExcelSheet>
            <ExcelSheet data={products} name="Productos">
            <ExcelColumn label="FOLIO" value="folio" />
            <ExcelColumn label="ID" value="id" />
            <ExcelColumn label="CANTIDAD" value="cantidad" />
            <ExcelColumn label="MARCA" value="marca" />
            <ExcelColumn label="NOMBRE" value="nombre" />
            <ExcelColumn label="PRECIO" value="precio" />
            </ExcelSheet>
        </ExcelFile>
    )
}

export default ExcelDocument