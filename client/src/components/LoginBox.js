import React, { useState } from 'react';


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
            <form onSubmit={e => handleSubmit(e)}>
                <h1>Enter your nickname</h1>
                <input type='text' onChange={e => handleInput(e)}/>
                <button type="submit">Go to chat</button>
            </form>
        </React.Fragment>
    )

}

export default LoginBox;