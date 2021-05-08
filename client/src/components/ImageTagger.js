import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from 'axios';

const ImageTagger = (props) => {

    const { socket } = props;

    const [showModal, setModal] = useState(false);
    const [toTag, setTag] = useState(false);
    const [file, setFile] = useState('');
    const [uploadedFile, setUploadedFile] = useState({});
    const [canSend, setSend] = useState(false);

    useEffect(() => {
        Modal.setAppElement('body');
    }, []);

    const handleFile = (e) => {
        setFile(e.target.files[0]);
    }

    const handleSendImage = () => {
        setModal(false);
        let msg_data = {
            id: socket.id,
            text: null,
            isImg: true,
            file: uploadedFile
        }
        socket.emit('new_msg', msg_data);
        setSend(false);
        setFile('');
        setUploadedFile({});
    }

    const handleSubmit = async e => {
        e.preventDefault();
        let formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            const { fileName, filePath } = res.data;
            setUploadedFile({ fileName, filePath });
            setSend(true);

        } catch(err) {
            if(err.response.status === 500) {
                console.log('There was a problem with the server')
            } else {
                console.log(err.response.data.msg)
            }
        }
    }

    return (
        <React.Fragment>
            <button onClick={() => setModal(true)}>Send photo</button>
            <Modal 
                isOpen={showModal}
                onRequestClose={() => setModal(false)}
            >
                <h2>Send an photo</h2>
                <form onSubmit={handleSubmit}>
                    <input type="file" onChange={handleFile}/>
                    <input type="submit" value="Upload" />
                </form>
                { uploadedFile.filePath ? (
                    <React.Fragment>
                    {toTag ? (
                        <div>
                            <h3>Click on the image to add a tag:</h3>
                            <canvas></canvas>
                            <img src={uploadedFile.filePath} alt="" />
                            <button onClick={e => setTag(false)}>Cancel tags</button>
                        </div>
                    ):(
                        <div>
                            <img src={uploadedFile.filePath} alt="" />
                            <button onClick={e => setTag(true)}>Add tags</button>
                        </div>
                    )}
                </React.Fragment>
                ):(null)
                }
                <button onClick={handleSendImage} disabled={!canSend}>Send</button>
                <button onClick={e => setModal(false)}>X</button>
            </Modal>
        </React.Fragment>
    )

}

export default ImageTagger;