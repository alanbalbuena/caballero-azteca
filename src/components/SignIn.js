import React, {useState} from "react";
import { Link } from "@reach/router";
import { auth } from '../util/firebase';

const SignIn = () => {
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const signInWithEmailAndPasswordHandler = 
            (event,email, password) => {
                event.preventDefault();
                auth.signInWithEmailAndPassword(email, password).then((user) => {

                }).catch(error => {
                  setError("Error signing in with password and email!");
                  console.error("Error signing in with password and email", error);
                });

    };

      const onChangeHandler = (event) => {
          
        const {name, value} = event.currentTarget;
          if(name === 'userEmail') {
              setEmail(value);
          }
          else if(name === 'userPassword'){
            setPassword(value);
          }
      };

  return (
    <div className="mt-8">
      <h1 className="text-3xl mb-2 text-center font-bold">CABALLERO AZTECA VENTAS ADMINISTRADOR</h1>
      
      <div
          style={{
            background: `url('https://firebasestorage.googleapis.com/v0/b/caballero-azteca-ventas.appspot.com/o/src%2Flogo.png?alt=media&token=9db8fc2e-3896-4646-9c15-ef9508763e4b')  no-repeat center center`,
            backgroundSize: "fit",
            height: "300px",
            width: "300px"
          }}
          className="text-center mx-auto"
        ></div>

      <div className="border border-dark mx-auto w-11/12 md:w-2/4 rounded py-8 px-4 md:px-8">
        {error !== null && <div className = "py-4 bg-red-600 w-full text-white text-center mb-3">{error}</div>}
        <form className="">
          <label htmlFor="userEmail" className="block">
            Email:
          </label>
          <input
            type="email"
            className="my-1 p-1 w-full"
            name="userEmail"
            value = {email}
            placeholder="E.g: usuario@caballeroazteca.com"
            id="userEmail"
            onChange = {(event) => onChangeHandler(event)}
          />
          <label htmlFor="userPassword" className="block">
            Password:
          </label>
          <input
            type="password"
            className="mt-1 mb-3 p-1 w-full"
            name="userPassword"
            value = {password}
            placeholder="Password"
            id="userPassword"
            onChange = {(event) => onChangeHandler(event)}
          />
          <button className="bg-green-400 hover:bg-green-500 w-full py-2 text-white" 
            onClick = {(event) => {signInWithEmailAndPasswordHandler(event, email, password)}}>
            Loguearse
          </button>
        </form>
  
        <p className="text-center my-3">
          Desea una nueva cuenta?{" "}
          <Link to="signUp" className="text-blue-500 hover:text-blue-600">
            Darse de alta.
          </Link>{" "}
          <br />{" "}
          <Link to = "passwordReset" className="text-blue-500 hover:text-blue-600">
            Olvido su password?
          </Link>
        </p>
      </div>
    </div>
  );
};
export default SignIn;