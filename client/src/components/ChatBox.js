import React, { useState, useEffect } from 'react';
import SentImg from './SentImg';
import './ChatBox.css';
import ImageTagger from './ImageTagger';
import axios from 'axios';


const ChatBox = (props) => {

    const { socket } = props
    const [messages, updateMsg] = useState([]);
    const [inputMsg, getMsg] = useState();
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [imgData, setImgData] = useState({});
    const [loaded, imgLoaded] = useState(false);

    const scrollDown = () => {
        if (!modalIsOpen) {
            let bottom = document.getElementById('chat-bottom');
            bottom.scrollIntoView({behavior: "auto"});
        }
    }
    
    useEffect(() => {
        socket.off('msg').on('msg', (msg_data) => {
            let new_messages = [...messages];
            if (msg_data.isImg && !imgData[msg_data.file]) {
                axios.get(`https://santiagoschat.herokuapp.com/images/${msg_data.file}`)
                .then((response) => {
                    let new_img_data = imgData;
                    new_img_data[msg_data.file] = response.data
                    setImgData(new_img_data);
                    imgLoaded(true);
                })
                .catch((err) => console.log(err));
            }
            new_messages.push(msg_data)
            updateMsg(new_messages);
            scrollDown();
        })
    })

    useEffect(() => {
        if(loaded) {
            imgLoaded(false);
            scrollDown();
        }
    }, [loaded]);

    const handleInput = e => {
        let new_msg = e.target.value;
        getMsg(new_msg);
    }

    const handleSubmit = e => {
        e.preventDefault();
        if(inputMsg && !modalIsOpen){
            let msg_data = {
                usr_id: socket.id,
                msg_id: `${Date.now()}-${socket.id}`,
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

    // RENDER
    
    return (
        <div id="main-chat">
            {!modalIsOpen ? (
            <div className="msg-board">
                {messages.map(message => {
                    if(message.sender_id === socket.id){
                        return(
                            <div className="msg-me" key={message.message_id}>
                                {message.isImg ? (
                                    <SentImg file={imgData[message.file]} tags={message.tags} id={message.file} />
                                ):(
                                    <p className="msg">{message.text}</p>
                                )}
                            </div>
                        )
                    } else {
                        return(
                            <div className="msg-other" key={message.message_id}>
                                <p className="msg-sender">{message.username}:</p>
                                {message.isImg ? (
                                    <SentImg file={imgData[message.file]} tags={message.tags} id={message.file} />
                                ):(
                                    <p className="msg">{message.text}</p>
                                )}
                                
                            </div>
                        )
                    }
                })}
                <div id="chat-bottom" />
            </div>
            ) : (
            <div className="msg-board">
                <div id="chat-bottom" />
            </div>
            )
            }
            <form onSubmit={handleSubmit} className="msg-input-bar">
                <div className="flex-container">
                    <input id="message-input" type="text" onChange={handleInput} />
                    <button type="submit">
                        <i className="fas fa-paper-plane fa-2x"></i>
                    </button>
                    <ImageTagger socket={socket} setModalIsOpen={setModalIsOpen}/>
                </div>
            </form>
        </div>
    )
}

export default ChatBox;