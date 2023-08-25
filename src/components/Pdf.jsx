import React, { useRef } from 'react';
//import '../Styles/Components/pdf.css'
import logo from '../logo-caballero-azteca.jpg'
import { useReactToPrint } from 'react-to-print';

export default function Pdf(data) {

    const componentRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: 'Visitor Pass',
        onAfterPrint: () => console.log('Printed PDF successfully!'),
    });
    handlePrint();
    return (
        <>
            <div >
                <div className='marcaAgua'>DOCUMENTO NO VALIDO</div>
                <div className='header'>
                    <img src={logo} alt='logo' />
                    <div className='titulo'>
                        <h4>DISTRIBUIDORA FERRETERA CABALLERO AZTECA, S. A. DE C. V.</h4>
                        <p>JOSEMARIACOSS #1278-A</p>
                        <p>TEL. 38 23 76 32; FAX. 38 54 36 97</p>
                        <p>GUADALAJARA, JALISCO</p>
                        <p>Fecha y hora: 18 Agosto 2023 7:08:22 p. m.</p>
                    </div>
                </div>
                <p>Informacion General</p>
                <table>
                    <tbody>
                        <tr>
                            <td className='infGral'>FOLIO:</td>
                            <td>{data.folio}</td>
                        </tr>
                        <tr>
                            <td className='infGral'>VENDEDOR:</td>
                            <td>{data.vendedor}</td>
                        </tr>
                        <tr>
                            <td className='infGral'>RUTA:</td>
                            <td>{data.ruta}</td>
                        </tr>
                        <tr>
                            <td className='infGral'>FACTURA O REGISTRO:</td>
                            <td>{data.tipoDocumento}</td>
                        </tr>
                    </tbody>
                </table>
                <p>Informacion sobre el cliente</p>
                <table>
                    <tbody>
                        <tr>
                            <td>CODIGO:</td>
                            <td>{data.codigoCliente}</td>
                            <td>RAZON:</td>
                            <td>{data.razon}</td>
                        </tr>
                        <tr>
                            <td>RFC:</td>
                            <td>{data.rfc}</td>
                            <td>DOMICILIO:</td>
                            <td>{data.domicilio}</td>
                        </tr>
                        <tr>
                            <td>CIUDAD:</td>
                            <td>{data.ciudad}</td>
                            <td>ESTADO:</td>
                            <td>{data.estado}</td>
                        </tr>
                        <tr>
                            <td>TELEFONO:</td>
                            <td>{data.telefono}</td>
                            <td>EMAIL:</td>
                            <td>{data.email}</td>
                        </tr>
                    </tbody>
                </table>
                <table>
                    <thead>
                        <tr>
                            <th>CANTIDAD</th>
                            <th>CODIGO</th>
                            <th>MARCA</th>
                            <th>DESCRIPCION DEL ARTICULO</th>
                            <th>PRECIO (SIN IVA)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.productos.map((p, index) => (
                            <tr key={index}>
                                <td>{p.cantidad}</td>
                                <td>{p.code}</td>
                                <td>{p.marca}</td>
                                <td>{p.nombre}</td>
                                <td>{p.precio}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <p>Total:${data.total}</p>
                <p>Observaciones: {data.observaciones}</p>
            </div>

            {/* <button onClick={handlePrint}>imprimir pdf</button> */}
        </>
    )
}