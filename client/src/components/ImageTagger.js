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
    const [mousePos, setMouse] = useState([]);
    const [imgSize, setImgSize] = useState([0,0]);
    const [tags, setTags] = useState([]);
    const [isTagging, setTagging] = useState(false);
    const [hasCanvas, setHasCanvas] = useState(false);
    const [hlTag, setHighlight] = useState(null)

    useEffect(() => {
        Modal.setAppElement('body');
    }, []);

    useEffect(() => {
        if(hasCanvas){
            drawCanvas();
        }
    })

    // Image upload functions

    const handleFile = (e) => {
        setFile(e.target.files[0]);
    }

    const handleSendImage = () => {
        setModal(false);
        let msg_data = {
            id: socket.id,
            text: null,
            isImg: true,
            file: uploadedFile,
            tags: tags
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

    const handleQuit = () => {
        setHasCanvas(false);
        setTag(false);
        setTags([]);
        setTagging(false);
        setModal(false);
        // Mejorable: borrar la imagen solo al salir completamente del modal.
        setFile('');
        setUploadedFile({});
    }

    // Image tag functions

    // draw canvas with tags
    const drawCanvas = () => {
        try {
            let canvas = document.getElementById('tag-canvas');
            let ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = 'black';
            if (!isTagging) {
                tags.forEach(tag => {
                    if(tags.indexOf(tag) == hlTag){
                        ctx.strokeStyle = 'red';
                    } else {
                        ctx.strokeStyle = 'black';
                    }
                    ctx.strokeRect(tag[0], tag[1], tag[2]-tag[0], tag[3]-tag[1]);
                });
            } else {
                let tagsButLast = [...tags];
                tagsButLast.pop();
                tagsButLast.forEach(tag => {
                    ctx.strokeRect(tag[0], tag[1], tag[2]-tag[0], tag[3]-tag[1]);
                });
                let currentTag = tags[tags.length-1];
                ctx.strokeStyle = 'red';
                ctx.strokeRect(currentTag[0], currentTag[1], mousePos[0]-currentTag[0], mousePos[1]-currentTag[1]);
            }
        } catch {
            // error a manejar -- ! --
            console.log('RESOLVER: Error al salir del modal durante el tagging')
        }
        
    }

    const handleMouse = e => {
        // get relative mouse position
        let elOffset = e.target.getBoundingClientRect();
        let mouseX = Math.round(e.clientX - elOffset.left);
        let mouseY = Math.round(e.clientY - elOffset.top);
        setMouse([mouseX, mouseY]);
    }

    const handleImgLoad = () => {
        let img = document.getElementById('img-to-tag');
        let imgWidth = img.width;
        let imgHeight = img.height;
        setImgSize([imgWidth, imgHeight]);
        setHasCanvas(true);
    }

    const handleMouseDown = () => {
        if (!isTagging) {
            let newTag = [mousePos[0], mousePos[1]];
            let newTagSet = [...tags]
            newTagSet.push(newTag);
            setTags(newTagSet);
            setTagging(true);
        }
    }

    const handleMouseUp = () => {
        if(isTagging) {
            let tagText = window.prompt("Add tag text: ");
            let newTagSet = [...tags];
            if (tagText) {
                let thisTag = tags[tags.length-1];
                thisTag.push(mousePos[0], mousePos[1], tagText);
                newTagSet.pop();
                newTagSet.push(thisTag);
                setTags(newTagSet);
                setTagging(false);
            } else {
                newTagSet.pop();
                setTags(newTagSet);
                setTagging(false);
            }
        }
    }

    const handleTagRemove = e => {
        let index = e.target.id;
        let newTagSet = [...tags];
        newTagSet.splice(index, 1);
        setTags(newTagSet);
    }

    const handleTagSelect = e => {
        let index = e.target.id;
        setHighlight(index);
    }

    const handleNoTagSelected = () => {
        setHighlight(null)
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
                        <div style={{position: 'relative'}}>
                            <h3>Click on the image to add a tag:</h3>
                            <div>
                                <canvas
                                    id='tag-canvas'
                                    onMouseMove={handleMouse} 
                                    onMouseDown={handleMouseDown}
                                    onMouseUp={handleMouseUp}
                                    width={imgSize[0]}
                                    height={imgSize[1]}
                                    style={{zIndex: 2, position: 'absolute'}}
                                />
                                <img 
                                    src={uploadedFile.filePath} 
                                    alt="" 
                                    id="img-to-tag"
                                    onLoad={handleImgLoad}
                                    style={{zIndex: 1}}
                                />
                            </div>
                            <div onMouseOut={handleNoTagSelected}>
                                {tags.map(tag => {
                                        return( 
                                            <button key={tags.indexOf(tag)}
                                                id={tags.indexOf(tag)} 
                                                className='tag-text'
                                                onClick={handleTagRemove}
                                                onMouseOver={handleTagSelect}>{tag[4]}</button>
                                        )
                                    })}
                                <button onClick={handleQuit}>Cancel tags</button>
                            </div>
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
                <button onClick={handleQuit}>X</button>
            </Modal>
        </React.Fragment>
    )

}

export default ImageTagger;