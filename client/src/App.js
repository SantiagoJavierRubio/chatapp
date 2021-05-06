import './App.css';
import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
const socket = io('localhost:3001');

function App() {


  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.js</code> and  to reload.
        </p>
      </header>
    </div>
  );
}

export default App;
