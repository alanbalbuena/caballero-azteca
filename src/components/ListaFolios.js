import React, { Component } from "react";
import {storage, db} from "../util/firebase";
import "bootstrap/dist/css/bootstrap.min.css";
import NavBar from "./NavBar";

class ListaFolios extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      filterList: [],
      fecha: '',
      folio: '',
      razon: '',
      ruta: '',
      filtro: ''
    };

    this.handleChangeFecha = this.handleChange.bind(this);
    this.handleChangeFolio = this.handleChange.bind(this);
    this.handleChangeRazon = this.handleChange.bind(this);
    this.handleChangeRuta = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }  

  
  handleChange(event) {

    let filter = this.state;
    filter[event.target.name]=event.target.value;
    
    if(event.target.name === 'fecha'){
      this.setState({folio: ''});
      this.setState({razon: ''});
      this.setState({ruta: ''});
      this.setState({filtro: event.target.name});
    }
    if(event.target.name === 'folio'){
      this.setState({fecha: ''});
      this.setState({razon: ''});
      this.setState({ruta: ''});
      this.setState({filtro: event.target.name});
    }
    if(event.target.name === 'razon'){
      this.setState({folio: ''});
      this.setState({fecha: ''});
      this.setState({ruta: ''});
      this.setState({filtro: event.target.name});
    }

    if(event.target.name === 'ruta'){
      this.setState({folio: ''});
      this.setState({fecha: ''});
      this.setState({razon: ''});
      this.setState({filtro: event.target.name});
    }
  }

  handleSubmit(event) { 

    if(this.state.fecha != ''){
      this.setState({ ...this.state.filtro, filtro: 'fecha' });
    }
    if(this.state.folio != ''){
      this.setState({ ...this.state.filtro, filtro: 'folio' });
    }
    if(this.state.razon != ''){
      this.setState({ ...this.state.filtro, filtro: 'razon' });
    }
    if(this.state.ruta != ''){
      this.setState({ ...this.state.filtro, filtro: 'ruta' });
    }

    this.filtrarElementos(this.state.filtro);
    event.preventDefault();

  }

  filtrarElementos=(filtro)=>{

    this.peticionGet();

    var search = this.state.data.filter(item=>{
      
      if(filtro =='folio'){
 
        if( item.folio.includes(this.state.folio)) {return item;} else {return false}
      }
      
      if (filtro =='fecha'){

        if( item.fecha.includes(this.state.fecha)) {return item;} else {return false}
      }

      if (filtro =='razon'){

        if( item.razon.includes(this.state.razon) || item.codigoCliente.includes(this.state.razon)) {return item;} else {return false}
      } 

      if(filtro =='ruta'){

        if( item.ruta.includes(this.state.ruta)) {return item;} else {return false}
      } 

      if(filtro == '') {
        return false;
      }

    });
    
    if(search == false){
      alert("No se han encontrado coincidencias.")
      this.peticionGet();
    } else{
      this.setState({ ...this.state.filterList, filterList: search });
    }

  }

  peticionGet = async() => {

    let listaFolios = [];
    let ref = db.ref("Folio");

    ref.on('child_added', (snapshot) => {
      let folios = snapshot.val();
      if(folios.hasOwnProperty('folio') && folios.hasOwnProperty('vendedor')){
        listaFolios.push(folios)
      }
      this.setState({ ...this.state.data, data: listaFolios });
      this.setState({ ...this.state.filterList, filterList: listaFolios })
    });
  };

  printFolio=(id)=>{

    var fileType = "CAPedido.pdf";
    var folio = id.substring(0, 2);

    var storageRef = storage.ref(folio+"/"+id+"/"+fileType);

    storageRef.getDownloadURL().then(function(url) {

      var xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = function(event) {
        var blob = xhr.response;
      };
      xhr.open('GET', url);
      xhr.send();
      window.open(url, '_blank');

    }).catch(function(error) {
      console.log(error)
    });

    console.log(id)

    var ref = db.ref("Folio");
    ref.orderByChild("folio").equalTo(id).on("child_added", function(snapshot) {
      let key = snapshot.key;
      
      ref.child(key).update({
        status: true,
      }, (error) => {
        if (error) {
       
        } else {
 
        }
      });
    });

  }

  downloadFile = (type, id) => {

    var fileType = (type === "excel") ? "CAPedido.xls": "CAPedido.pdf";
    var folio = id.substring(0, 2);

    var storageRef = storage.ref(folio+"/"+id+"/"+fileType);

    storageRef.getDownloadURL().then(function(url) {
      var xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = function(event) {
        var blob = xhr.response;
      };
      xhr.open('GET', url);
      xhr.send();
      window.open(url, '_blank');
    }).catch(function(error) {
      console.log(error)
    });

  }

  actionChooser = async(folioItem, id, caso)=>{

    await this.setState({folio: folioItem, id: id});

    (caso === 'excel') || (caso === 'pdf')  ? this.downloadFile(caso, id) :
    this.printFolio(id);

  }

  componentDidMount() {
    this.peticionGet();
  }

  render() {

    return (
        <div className="ListaFolios">
            <div className="flex border flex-col items-center border-blue-400 px-3 py-4">
              <form onSubmit={this.handleSubmit}>
                <ul className = "row">
                  <h1 className="text-center col-1 strong"><strong>FILTROS:</strong></h1>
                  <li className="text-center col-2"><p>FECHA <input type="text" name="fecha" 
                  className= "border text-center" value={this.state.fecha} 
                  onChange={this.handleChangeFecha}></input></p></li>
                  <li className="text-center col-2"><p>FOLIO <input type="text" name="folio" 
                  className= "border text-center" value={this.state.folio} 
                  onChange={this.handleChangeFolio}></input></p></li>
                  <li className="text-center col-2"><p>CLIENTE O ID <input type="text" name="razon" 
                  className= "border text-center" value={this.state.razon} 
                  onChange={this.handleChangeRazon}></input></p></li>
                  <li className="text-center col-2"><p>RUTA <input type="text" name="ruta" 
                  className= "border text-center" value={this.state.ruta} 
                  onChange={this.handleChangeRuta}></input></p></li>{"  "}
                  <br/>
                  <input
                  className="btn btn-danger col-1"
                  type="submit" value="FILTRAR" />
                </ul>
              </form>
            </div>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>FECHA</th>
                <th>FOLIO</th>
                <th>VENDEDOR</th>
                <th>ID CLIENTE</th>
                <th>CLIENTE</th>
                <th>RUTA</th>
                <th>TOTAL</th>
                <th>ACCIONES</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
            { this.state.filterList ? this.state.filterList.slice(0).reverse().map((folio, index) => (
              <tr key={folio.folio}>
                  <td>{folio.fecha}</td>
                  <td>{folio.folio}</td>
                  <td>{folio.vendedor}</td>
                  <td>{folio.codigoCliente}</td>
                  <td>{folio.razon}</td>
                  <td>{folio.ruta}</td>
                  <td>{folio.total}</td>
                  <td>
                    <button className="btn btn-primary" onClick={()=>this.actionChooser(folio, folio.folio, 'excel')}>EXCEL</button>
                    <button className="btn btn-danger" onClick={()=>this.actionChooser(folio, folio.folio, 'pdf')}>PDF</button>
                    <button className="btn btn-danger" onClick={()=>this.actionChooser(folio, folio.folio, 'imprimir')}>IMPRIMIR</button>
                  </td>
                  <td>{folio.status === true ? <p>IMPRESO</p> : <p>NO IMPRESO</p>}</td>
              </tr>

              )): <h1>CARGANDO FOLIOS...</h1>}

          </tbody>
        </table>
      </div>
    );
  }
}

export default ListaFolios;
