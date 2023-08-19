import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../util/firebase";

export function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) {
      // maybe trigger a loading screen
      return;
    }
    if (user) {
      navigate("/folios");
     
    } 
  });

  const logInWithEmailAndPassword = async (event, email, password) => {
    try {
      event.preventDefault();
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="mt-8">
      <h1 className="text-3xl mb-2 text-center font-bold">CABALLERO AZTECA VENTAS ADMINISTRADOR</h1>
      <div
        style={{
          background: `url('https://firebasestorage.googleapis.com/v0/b/caballero-azteca-ventas.appspot.com/o/src%2Flogo.png?alt=media&token=9db8fc2e-3896-4646-9c15-ef9508763e4b')  no-repeat center center`,
          backgroundSize: "fit",
          height: "100px",
          width: "300px"
        }}
        className="text-center mx-auto"
      ></div>

      <div className="border border-dark mx-auto w-11/12 md:w-2/4 rounded py-8 px-4 md:px-8">
        <form className="">
          <label htmlFor="userEmail" className="block">
            Email:
          </label>
          <input
            type="email"
            className="my-1 p-1 w-full"
            name="userEmail"
            value={email}
            placeholder="E.g: usuario@caballeroazteca.com"
            onChange={(e) => setEmail(e.target.value)}
          />
          <label htmlFor="userPassword" className="block">
            Password:
          </label>
          <input
            type="password"
            className="mt-1 mb-3 p-1 w-full"
            name="userPassword"
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="bg-green-400 hover:bg-green-500 w-full py-2 text-white"
            onClick={(event) => { logInWithEmailAndPassword(event, email, password) }}>
            Loguearse
          </button>
        </form>
      </div>
    </div>
  );
}
export default Login;