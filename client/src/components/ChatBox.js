import React, { useState, useEffect } from 'react';
import SentImg from './SentImg';
import './ChatBox.css';

const ChatBox = (props) => {

    const { socket } = props
    const [messages, updateMsg] = useState([]);
    const [inputMsg, getMsg] = useState();

    useEffect(() => {
        socket.on('msg', (msg_data) => {
            let new_messages = [...messages];
            new_messages.push(msg_data)
            updateMsg(new_messages);
            let bottom = document.getElementById('chat-bottom');
            bottom.scrollIntoView({behavior: "smooth"});
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
                tags: null,
            }
            socket.emit('new_msg', msg_data)
            document.getElementById("message-input").value = null;
            getMsg(null);
        }
    }


    return (
        <React.Fragment>
            <div className="msg-board">
                {messages.map(message => {
                    if(message.sender_id === socket.id){
                        return(
                            <div className="msg-me" key={messages.indexOf(message)}>
                                {message.isImg ? (
                                    <SentImg file={message.file} tags={message.tags} />
                                ):(
                                 <p className="msg">{message.text}</p>
                                )}
                            </div>
                        )
                    } else {
                        return(
                            <div className="msg-other" key={messages.indexOf(message)}>
                                <p className="msg-sender">{message.username}:</p>
                                {message.isImg ? (
                                    <SentImg file={message.file} tags={message.tags} />
                                ):(
                                 <p className="msg">{message.text}</p>
                                )}
                                
                            </div>
                        )
                    }
                })}
                <div id="chat-bottom" />
            </div>
            <form onSubmit={handleSubmit} className="msg-input-bar">
                <div className="flex-container">
                    <input id="message-input" type="text" onChange={handleInput} />
                    <button type="submit">
                        <i class="fas fa-paper-plane fa-lg"></i>
                    </button>
                </div>
            </form>
        </React.Fragment>
    )
}

export default ChatBox;