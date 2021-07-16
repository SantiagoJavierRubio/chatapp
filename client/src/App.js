import React, { useState } from 'react';
import LoginBox from './components/LoginBox';
import UserList from './components/UserList';
import ChatBox from './components/ChatBox';
import './App.css';
import { io } from 'socket.io-client';
const socket = io();

function App() {

  const [logged, logIn] = useState(false);

  const handleLogin = () => {
    logIn(true);
  }

  return (
    <React.Fragment>
      {!logged ? (
        <LoginBox socket={socket} handleLogin={handleLogin} className="login-box"/>
      ):(
        <div id="main-page">
          <UserList socket={socket} className="user-list"/>
          <ChatBox socket={socket} className="chat-box"/>
        </div>
      )}
    </React.Fragment>

  );
}

export default App;
