import React, { useState, useEffect } from 'react';
import LoginBox from './components/LoginBox';
import UserList from './components/UserList';
import { io } from 'socket.io-client';
const socket = io();

function App() {

  const [logged, logIn] = useState(false);

  const handleLogin = () => {
    logIn(true);
  }

  return (
    <div>
      {!logged ? (
        <LoginBox socket={socket} handleLogin={handleLogin}/>
      ):(
        <UserList socket={socket} />
      )}
    </div>

  );
}

export default App;
