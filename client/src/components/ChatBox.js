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
        if(inputMsg){
            let msg_data = {
                id: socket.id,
                text: inputMsg,
                isImg: false,
                file: null,
            }
            socket.emit('new_msg', msg_data)
            document.getElementById("message-input").value = null;
            getMsg(null);
        }
    }

    return (
        <React.Fragment>
            <div>
                {messages.map(message => {
                    if(message.sender_id === socket.id){
                        return(
                            <div className="msg-me" key={messages.indexOf(message)}>
                                {message.isImg ? (
                                    <img src={message.file.filePath} alt={message.file.fileName} />
                                ):(
                                 <p>{message.text}</p>
                                )}
                            </div>
                        )
                    } else {
                        return(
                            <div className="msg-other" key={messages.indexOf(message)}>
                                <p className="msg-sender">{message.username}</p>
                                {message.isImg ? (
                                    <img src={message.file.filePath} alt={message.file.fileName} />
                                ):(
                                 <p>{message.text}</p>
                                )}
                                
                            </div>
                        )
                    }
                })}
            </div>
            <form onSubmit={handleSubmit}>
                <input id="message-input" type="text" onChange={handleInput} />
                <button type="submit">Send</button>
            </form> 
        </React.Fragment>
    )
}

export default ChatBox;