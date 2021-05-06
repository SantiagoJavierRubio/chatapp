import React, { useState, useEffect } from 'react';
import LoginBox from './components/LoginBox';
import UserList from './components/UserList';
import ChatBox from './components/ChatBox';
import ImageTagger from './components/ImageTagger';
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
        <LoginBox socket={socket} handleLogin={handleLogin}/>
      ):(
        <div>
          <UserList socket={socket} />
          <ChatBox socket={socket} />
          <ImageTagger />
        </div>
      )}
    </React.Fragment>

  );
}

export default App;
