import { Button } from 'bootstrap';
import React from 'react';

export default function ejemplo()   {

const getPDF = ()=>{
  window.print()
}

  return (
    <button onClick={getPDF}>pdf</button>
  );

}
