import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../util/firebase";
import { Col, Button, Row, Container, Card, Form } from "react-bootstrap";
import logo from '../logo-caballero-azteca.jpg';

export function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
    <>
      <Container>
        <Row className="vh-100 d-flex justify-content-center align-items-center">
          <Col md={8} lg={6} xs={12}>
            <div className="border border-3 border-primary"></div>
            <Card className="shadow">
              <Card.Body>
                <div className="mb-3 mt-md-4">
                  <div className="text-center">
                    <img style={{ width: '150px' }} src={logo} alt="logo"></img>
                  </div>
                  <div className="mb-3">
                    <Form>
                      <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label className="text-center" >Email address</Form.Label>
                        <Form.Control type="email" value={email} placeholder="E.g: usuario@caballeroazteca.com" onChange={(e) => setEmail(e.target.value)} />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" value={password} placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                      </Form.Group>
                      <div className="d-grid">
                        <Button variant="primary" type="submit" onClick={(event) => { logInWithEmailAndPassword(event, email, password) }}>Login</Button>
                      </div>
                    </Form>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}
export default Login;