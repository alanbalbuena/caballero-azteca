import React, { useState, useEffect } from 'react'

export default function Ejemplo() {
  const [data, setData] = useState([])

  useEffect(() => {
    fetch("http://localhost/caballeroazteca/reporte-ventas-mensual.php")
    .then((response) => response.json())
    .then((json) => {
      setData(json);
    });
  }, []);

  return (
    <>
       {data.map((d, index) => (
        <tr key={index}>
          <td>{d.marca}</td>
          
        </tr>
      ))}

    </>
  )

}
