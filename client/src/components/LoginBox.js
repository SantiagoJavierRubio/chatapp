import React, { useState } from 'react';
import './LoginBox.css';


const LoginBox = (props) => {
    const { socket, handleLogin } = props
    const [username, setUsername] = useState(null);

    const handleSubmit = e => {
        e.preventDefault();
        if(username){
            socket.emit('login', username);
            handleLogin();
        }
    }

    const handleInput = e => {
        let usr_input = e.target.value;
        setUsername(usr_input);
    }

    return (
        <React.Fragment>
            <h1>Welcome to the chat!</h1>
            <form onSubmit={handleSubmit} id="entry-form">
                <h2>Please enter your nickname</h2>
                <input id="name-form" type='text' onChange={handleInput}/>
                <button type="submit">
                    Enter room <i className="fas fa-sign-in-alt fa-sm"></i>
                </button>
            </form>
        </React.Fragment>
    )

}

export default LoginBox;