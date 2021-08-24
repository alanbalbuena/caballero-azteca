import React, { Component } from "react";
import { IoAlert } from 'react-icons/io5';
import { animateScroll as scroll } from 'react-scroll'
import { storage, db } from "../util/firebase";
import "bootstrap/dist/css/bootstrap.min.css";
import { auth } from '../util/firebase'
import { Suspense } from "react";
import ReactExport from "react-export-excel";
import ExcelDocument from '../components/ExcelDocument'
import BarraHerramientas from '../components/BarraHerramientas'

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
      filtro: '',
      pedido: [],
      productos: [],
      user: [],
      permiso: '',
      id: '',
      tipo: props.location.state ? props.location.state.tipo : 'folios',
      paginacion: 150
    };
    this.handleChangeFecha = this.handleChange.bind(this);
    this.handleChangeFolio = this.handleChange.bind(this);
    this.handleChangeRazon = this.handleChange.bind(this);
    this.handleChangeRuta = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

  }

  handleChange(event) {

    let filter = this.state;
    filter[event.target.name] = event.target.value;

    if (event.target.name === 'fecha') {
      this.setState({ folio: '' });
      this.setState({ razon: '' });
      this.setState({ ruta: '' });
      this.setState({ filtro: event.target.name });
    }
    if (event.target.name === 'folio') {
      this.setState({ fecha: '' });
      this.setState({ razon: '' });
      this.setState({ ruta: '' });
      this.setState({ filtro: event.target.name });
    }
    if (event.target.name === 'razon') {
      this.setState({ folio: '' });
      this.setState({ fecha: '' });
      this.setState({ ruta: '' });
      this.setState({ filtro: event.target.name });
    }

    if (event.target.name === 'ruta') {
      this.setState({ folio: '' });
      this.setState({ fecha: '' });
      this.setState({ razon: '' });
      this.setState({ filtro: event.target.name });
    }
  }

  handleSubmit(event) {

    if (this.state.fecha !== '') {
      this.setState({ ...this.state.filtro, filtro: 'fecha' });
    }
    if (this.state.folio !== '') {
      this.setState({ ...this.state.filtro, filtro: 'folio' });
    }
    if (this.state.razon !== '') {
      this.setState({ ...this.state.filtro, filtro: 'razon' });
    }
    if (this.state.ruta !== '') {
      this.setState({ ...this.state.filtro, filtro: 'ruta' });
    }

    this.filtrarElementos(this.state.filtro);
    event.preventDefault();

  }

  filtrarElementos = (filtro) => {

    var search = this.state.data.filter(item => {

      if (filtro === 'folio') {
        if (item.folio.includes(this.state.folio)) { return item; } else { return false }
      }
      if (filtro === 'fecha') {
        if (item.fecha.includes(this.state.fecha)) { return item; } else { return false }
      }
      if (filtro === 'razon') {
        if (item.razon.includes(this.state.razon) || item.codigoCliente.includes(this.state.razon)) { return item; } else { return false }
      }
      if (filtro === 'ruta') {
        if (item.ruta.includes(this.state.ruta)) { return item; } else { return false }
      }
      if (filtro === '') {
        return false;
      }

    });

    if (search === false) {
      alert("No se han encontrado coincidencias.")
      this.peticionGet();
    } else {
      this.setState({ ...this.state.filterList, filterList: search });
    }

  }

  peticionGet = async () => {

    var usuario;
    var listaFolios = [];

    await auth.onAuthStateChanged(user => {

      if (user) {
        const userRef = db.ref('/Usuario/' + user.uid)
        userRef.on('value', (snapshot) => {

          usuario = snapshot.val();
          this.setState({ permiso: usuario.permisos })
          if (this.state.paginacion === 0) {
            var ref = this.state.tipo === "folios" ? db.ref("Folio") : db.ref("Cotizacion");
          } else {
            var ref = this.state.tipo === "folios" ? db.ref("Folio").limitToLast(this.state.paginacion) : db.ref("Cotizacion").limitToLast(this.state.paginacion);
          }

          ref.on('child_added', (snapshot) => {
            let folios = snapshot.val();

            if (folios.hasOwnProperty('folio') && folios.hasOwnProperty('vendedor')) {


              if (usuario.permisos === "superusuario" || usuario.permisos === "administrador") {
                listaFolios.push(folios)
              } else if (usuario.usuario === folios.folio.substring(1, 3)) {
                listaFolios.push(folios)
              }

            }
            this.setState({ ...this.state.filterList, filterList: listaFolios });
            this.setState({ ...this.state.data, data: listaFolios });
          });

        });
      }
    }).bind(this);
  }

  peticionDelete = async (id) => {

    var ref = this.state.tipo === "folios" ? db.ref("Folio") : db.ref("Cotizacion");

    if (window.confirm("Desea eliminar el folio " + id)) {
      ref.on('child_added', (snapshot) => {
        let folios = snapshot.val();
        if (folios.folio == id) {
          ref.child(snapshot.key).remove();
        }
      });
    }
  };

  printFolio = (id) => {

    var fileType = "CAPedido.pdf";
    var usuario = id.substring(1, 3);

    var tipo = id.substring(0, 1);

    var storageRef = storage.ref(usuario + "/" + tipo + "/" + id + "/" + fileType);

    var ref = db.ref("Folio");
    ref.orderByChild("folio").equalTo(id).on("child_added", function (snapshot) {
      
      let data = snapshot.val();
      let key = snapshot.key;

      if (data.status === "autorizado" && window.confirm("Desea cambiar el status del folio: " + id + " a IMPRESO?")) {


        ref.child(key).update({
          status: 'impreso',
        }, (error) => {
          if (error) {
            alert("Error al intentar cambiar a status de impreso.")
          } else {
            storageRef.getDownloadURL().then(function (url) {
              var xhr = new XMLHttpRequest();
              xhr.responseType = 'blob';
              xhr.onload = function (event) {
                var blob = xhr.response;
              };
              xhr.open('GET', url);
              xhr.send();
              window.open(url, '_blank');
              window.location.href = window.location.href;
            }).catch(function (error) {
              console.log(error)
            });
          }
        });
        
      } else if (data.status === "noautorizado") {
        alert("Folio: " + id + " no esta autorizado.")
      } else if (data.status === "impreso"){
          storageRef.getDownloadURL().then(function (url) {
          var xhr = new XMLHttpRequest();
          xhr.responseType = 'blob';
          xhr.onload = function (event) {
            var blob = xhr.response;
          };
          xhr.open('GET', url);
          xhr.send();
          window.open(url, '_blank');
        }).catch(function (error) {
          console.log(error)
        });
      }


    });

  }

  autorizar = (id) => {

    var ref = db.ref("Folio");

      ref.orderByChild("folio").equalTo(id).on("child_added", function (snapshot) {

        let data = snapshot.val();
        let key = snapshot.key;

        if (data.status === "noautorizado" && window.confirm("Desea autorizar el folio: " + id + "?")) {
          ref.child(key).update({
            status: 'autorizado',
          }, (error) => {
            if (error) {
              alert("Error al actualizar estado de folio.")
            } else {
              window.location.href = window.location.href;
            }
          });

        } else {
          alert("Ya se encuentra autorizado.")
        }
      });
  }

  downloadFile = (type, id) => {

    var fileType = (type === "excel") ? "CAPedido.xls" : "CAPedido.pdf";
    var usuario = id.substring(1, 3);

    var tipo = id.substring(0, 1);

    var storageRef = storage.ref(usuario + "/" + tipo + "/" + id + "/" + fileType);

    storageRef.getDownloadURL().then(function (url) {
      var xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = function (event) {
        var blob = xhr.response;
      };
      xhr.open('GET', url);
      xhr.send();
      window.open(url, '_blank');
    }).catch(function (error) {
      console.log(error)
    });

  }

  actionChooser = async (folioItem, id, caso) => {

    await this.setState({ folio: folioItem, id: id });

    if (caso === 'excel' || (caso === 'pdf')) {
      this.downloadFile(caso, id)
    } else if (caso === 'imprimir') {
      this.printFolio(id);
    } else if (caso === 'eliminar') {
      this.peticionDelete(id)
    } else if (caso === 'autorizar') {
      this.autorizar(id);
    }
  }

  remove(position) {

    let pedido = this.state.pedido;
    let newData = pedido.slice(position, 1)
    this.setState = ({ ...this.state.pedido, pedido: newData })

  }

  onChange = (e, folio) => {

    var listaFolios = this.state.pedido;
    var listaProductos = this.state.productos;

    if (e.target.type === "checkbox") {
      this.setState = ({ [e.target.name]: e.target.checked })
      if (e.target.checked) {
        if (!this.state.pedido.includes(folio)) {
          listaFolios.push(folio);
          if (folio.hasOwnProperty("listaDeProductos")) {
            if (folio.listaDeProductos[0].hasOwnProperty("nombre")) {
              folio.listaDeProductos.map(producto => {
                var protoproducto = {
                  folio: folio.folio,
                  id: producto.id,
                  cantidad: producto.cantidad,
                  marca: producto.marca,
                  nombre: producto.nombre,
                  precio: producto.precio
                }
                listaProductos.push(protoproducto)
              })
            }
          }
          listaProductos.push({})
        }
        this.setState = ({ ...this.state.pedido, pedido: listaFolios })
        this.setState = ({ ...this.state.productos, productos: listaProductos });

      } else {
        let position = this.state.pedido ? this.state.pedido.indexOf(folio) : null;
        if (position) {
          this.remove(position)
        }
      }
    }

  }

  getFolioStatus(status, numeroFactura, repartidor ) {
    switch (status) {
      case 'noautorizado':
        return 'NO AUTORIZADO'
      case 'autorizado':
        return 'AUTORIZADO'
      case 'impreso':
        return 'IMPRESO'
      case 'enalmacen':
        return 'EN ALMACEN'
      case 'enfacturacion':
        return 'EN FACTURACION'
      case 'facturado':
        return numeroFactura
      case 'entransito':
        return 'EN TRANSITO'
      case 'entregado':
        return 'ENTREGADO' + '\n' + numeroFactura + '\nPor: ' + repartidor
      default:
        return 'DESCONOCIDO'
    }
  }

  showMoreFolios() {
    this.setState({ paginacion: this.state.paginacion + 200 })
    this.peticionGet();
  }

  showAllFolios() {
    this.setState({ paginacion: 0 })
    this.peticionGet();
  }

  componentDidMount() {
    scroll.scrollToTop();
    this.peticionGet();
  }

  UNSAFE_componentWillReceiveProps(props) {
    window.location.reload();
    this.setState({ tipo: this.props.location.state ? this.props.location.state.tipo : this.state.tipo })
    this.peticionGet();
  }

  render() {

    var { isChecked } = this.state;

    return (
      <div className="ListaFolios">
        <div className="flex border flex-col items-center border-blue-400 px-3 py-4">
          <div>
            <ul className="row">
              <h1 className="text-center col-1 strong"><strong>FILTROS:</strong></h1>
              <li className="text-center col-2"><p>FECHA <input type="text" name="fecha"
                className="border text-center" value={this.state.fecha}
                onChange={this.handleChangeFecha}></input></p></li>
              <li className="text-center col-2"><p>FOLIO <input type="text" name="folio"
                className="border text-center" value={this.state.folio}
                onChange={this.handleChangeFolio}></input></p></li>
              <li className="text-center col-2"><p>CLIENTE O ID <input type="text" name="razon"
                className="border text-center" value={this.state.razon}
                onChange={this.handleChangeRazon}></input></p></li>
              <li className="text-center col-2"><p>RUTA <input type="text" name="ruta"
                className="border text-center" value={this.state.ruta}
                onChange={this.handleChangeRuta}></input></p></li>{"  "}
              <br />
              <input
                className="btn btn-danger"
                type="submit" value="FILTRAR/MOSTRAR" onClick={(e) => this.handleSubmit(e)} />
                <ExcelDocument data = {this.state.pedido} products={this.state.productos}/>
            </ul>
          </div>
        </div>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>SEL.</th>
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
            <Suspense fallback={<h1>CARGANDO FOLIOS...</h1>}>
              {this.state.filterList ? this.state.filterList.slice(0).reverse().map((folio, index) => (
                <tr key={index}>
                  <td><input type="checkbox"
                    checked={isChecked}
                    name={folio.folio}
                    style={{ width: "20px", height: "20px" }}
                    onChange={(e) => this.onChange(e, folio)}
                  />
                  </td>
                  <td>{folio.fecha}</td>
                  <td>{folio.folio}</td>
                  <td>{folio.vendedor}</td>
                  <td>{folio.codigoCliente}</td>
                  <td>{folio.razon}</td>
                  <td>{folio.ruta}</td>
                  <td>{folio.total}</td>
                  <td>
                    <BarraHerramientas permiso = {this.state.permiso} folio = {folio}  action = {this.actionChooser}/>
                  </td>
                  <td className="text-center">
                    <p>
                      {
                        this.getFolioStatus(folio.status, folio.numeroFactura, folio.repartidor)
                      }
                    </p>
                    <button className="btn btn-danger rounded-circle"><IoAlert className="text"/></button>
                  </td>
                </tr>

              )) : <h1>CARGANDO FOLIOS...</h1>}
            </Suspense>
          </tbody>
        </table>

        <div className="row justify-content-md-center">
          <div className="col-auto text-center mb-4"><button className="btn btn-primary" onClick={() => this.showMoreFolios()}>VER MÁS</button></div>
          <div className="col-auto text-center mb-4"><button className="btn btn-primary" onClick={() => this.showAllFolios()}>VER TODOS</button></div>
        </div>
        <div className="fixed-bottom mb-3 ml-3">
          <button onClick={() => scroll.scrollToTop()}><span className="h3">⬆</span></button>
          <button onClick={() => scroll.scrollToBottom()}><span className="h3">⬇</span></button>
        </div>
      </div>);
  }
}

export default ListaFolios;
