import React from 'react';
import './App.css';
import Application from "./components/Application";
import UserProvider from "./providers/UserProvider";

export default function App() {
  
  return (
    <UserProvider>
      <Application />
    </UserProvider>
  );
  
}
