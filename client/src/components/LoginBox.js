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
            <form onSubmit={handleSubmit}>
                <h1>Enter your nickname</h1>
                <input className="entry-form" type='text' onChange={handleInput}/>
                <button type="submit">
                    <i className="fas fa-sign-in-alt fa-4x"></i>
                </button>
            </form>
        </React.Fragment>
    )

}

export default LoginBox;