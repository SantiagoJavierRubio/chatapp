import React, { useState, useEffect } from 'react';

const ChatBox = (props) => {

    const { socket } = props

    const [messages, updateMsg] = useState([]);
    const [inputMsg, getMsg] = useState();

    useEffect(() => {
        socket.on('msg', (msg_data) => {
            let new_messages = [...messages];
            new_messages.push(msg_data)
            updateMsg(new_messages);
        })
    })

    const handleInput = e => {
        let new_msg = e.target.value;
        getMsg(new_msg);
    }

    const handleSubmit = e => {
        e.preventDefault();
        socket.emit('new_msg', [socket.id, inputMsg])
        document.getElementById("message-input").value = null;
    }

    return (
        <React.Fragment>
            <div>
                {messages.map(message => {
                    if(message.id === socket.id){
                        return(
                            <div className="msg-me" key={messages.indexOf(message)}>
                                <p>{message.text}</p>
                            </div>
                        )
                    } else {
                        return(
                            <div className="msg-other" key={messages.indexOf(message)}>
                                <p className="msg-sender">{message.username}</p>
                                <p>{message.text}</p>
                            </div>
                        )
                    }
                })}
            </div>
            <input id="message-input" type="text" onChange={(e)=>handleInput(e)} />
            <button type="submit" onClick={(e) => handleSubmit(e)}>Send</button>
        </React.Fragment>
    )

}

export default ChatBox;