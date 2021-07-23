import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import './ImageTagger.css';
import Resizer from 'react-image-file-resizer';


const ImageTagger = (props) => {

    const { socket, setModalIsOpen } = props;

    // STATES

    // window
    const [showModal, setModal] = useState(false);
    const [buttonText, setButtonText] = useState('Upload image');
    const [canSend, setSend] = useState(false);
    // for change window size
    const [windowHeight, setWindowHeight] = useState(window.innerHeight);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [proportionSize, setProportions] = useState(1);
    // for img handling
    const [file, setFile] = useState(null);
    const [imgSize, setImgSize] = useState([0,0]);
    const [imgOriginalSize, setOriginalSize] = useState([0,0]);
    // for tag functions
    const [toTag, setTag] = useState(false);
    const [mousePos, setMouse] = useState([]);
    const [tags, setTags] = useState([]);
    const [isTagging, setTagging] = useState(false);
    const [hasCanvas, setHasCanvas] = useState(false);
    const [hlTag, setHighlight] = useState(null);
    
    useEffect(() => {
        Modal.setAppElement('body');
    }, []);

    // Window resize management
    useEffect(() => {
        setWindowWidth(window.innerWidth*0.8);
        setWindowHeight(window.innerHeight*0.8) ;
        if (imgSize !== [0,0]) {
            if (imgSize[0] > windowWidth) {
                setProportions(windowWidth/imgSize[0]);
                let img_resize = [imgSize[0]*proportionSize, imgSize[1]*proportionSize];
                setImgSize(img_resize);
            } else if (imgSize[1] > windowHeight) {
                setProportions(windowHeight/imgSize[1]);
                let img_resize = [imgSize[0]*proportionSize, imgSize[1]*proportionSize];
                setImgSize(img_resize);
            }
            if (windowWidth > imgSize[0]) {
                if (windowWidth > imgOriginalSize[0]) {
                    setImgSize(imgOriginalSize);
                }
            }
        }
    })

    // IMAGE UPLOAD FUNCTIONS

    // function to compress and resize img (to save space)
    const resizeFile = (file) => new Promise((resolve) => {
        Resizer.imageFileResizer(file, 600, 600, "JPEG", 80, 0,(uri) => {resolve(uri)}, "base64");
    });

    // if a file is confirmed allows sending it
    useEffect(() => {
        if (file) {
            setSend(true);
            setButtonText('Change image');
        }
    }, [file]);

    // calls resize and sets the img
    const handleFile = async (e) => {
        try {
            const image = e.target.files[0];
            const resized_img = await resizeFile(image);
            setFile(resized_img);
        } catch (err) {
            console.log(err);
        }
    }

    // gets img data on tag window
    const handleImgLoad = () => {
        let img = document.getElementById('img-to-tag');
        let imgWidth = img.width;
        let imgHeight = img.height;
        setOriginalSize([imgWidth, imgHeight]);
        setImgSize([imgWidth, imgHeight]);
    }

    // submits the base64 img to backend and triggers img send
    const handleSubmit = async () => {
        setSend(false);
        try {
            const res = await axios.post('https://santiagoschat.herokuapp.com/img_upload', { file, headers: {
                'Content-Type': 'multipart/form-data'
                } 
            });
            const code = res.data.code;
            handleSendImage(code);
        } catch (err) { console.log(err.message) }
    }

    // handles the socket emit and cleans the form
    const handleSendImage = (code) => {
        setModal(false);
        let msg_data = {
            usr_id: socket.id,
            msg_id: `${Date.now()}-${socket.id}`,
            text: null,
            isImg: true,
            file: code,
            tags: tags
        }
        socket.emit('new_msg', msg_data);
        setSend(false);
        setFile(null);
        setTags([]);
        setTag(false);
        setButtonText('Upload image');
        
    }

    const handleQuit = () => {
        setHasCanvas(false);
        setTag(false);
        setTags([]);
        setTagging(false);
        setModal(false);
        setButtonText('Upload image');
        setFile(null);
    }

    const handleQuitTags = () => {
        setHasCanvas(false);
        setTag(false);
        setTags([]);
        setTagging(false);
    }

    // IMAGE TAG FUNCTIONS

    // draw canvas with tags
    useEffect(() => {
        if(hasCanvas){
            drawCanvas();
        }
    }, [hasCanvas, hlTag, mousePos, tags]);

    useEffect(() => {
        if (!showModal) {
            setModalIsOpen(false);
            setHasCanvas(false);
        } else setModalIsOpen(true);
    }, [showModal])

    const drawCanvas = () => {
        if (showModal) {
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
                        ctx.strokeRect(tag[0]*imgSize[0], tag[1]*imgSize[1], (tag[2]-tag[0])*imgSize[0], (tag[3]-tag[1])*imgSize[1]);
                    });
                } else {
                    let tagsButLast = [...tags];
                    tagsButLast.pop();
                    tagsButLast.forEach(tag => {
                        ctx.strokeRect(tag[0]*imgSize[0], tag[1]*imgSize[1], (tag[2]-tag[0])*imgSize[0], (tag[3]-tag[1])*imgSize[1]);
                    });
                    let currentTag = tags[tags.length-1];
                    ctx.strokeStyle = 'red';
                    ctx.strokeRect(currentTag[0]*imgSize[0], currentTag[1]*imgSize[1], mousePos[0]-(currentTag[0]*imgSize[0]), mousePos[1]-(currentTag[1]*imgSize[1]));
                }
            } catch (e) {
                console.log(e);
            }
        } 
    }

    // get relative mouse position
    const handleMouse = e => {
        let elOffset = e.target.getBoundingClientRect();
        let mouseX = Math.round(e.clientX - elOffset.left);
        let mouseY = Math.round(e.clientY - elOffset.top);
        setMouse([mouseX, mouseY]);
    }

    // Values are taken on proportion to image size
    const handleMouseDown = () => {
        if (!isTagging) {
            let newTag = [mousePos[0]/imgSize[0], mousePos[1]/imgSize[1]];
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
                if (tagText.length > 20) {
                    window.alert("Tag must be 20 characters or less");
                    tagText = null;
                    newTagSet.pop();
                    setTags(newTagSet);
                    setTagging(false);
                } else {
                    let thisTag = tags[tags.length-1];
                    thisTag.push(mousePos[0]/imgSize[0], mousePos[1]/imgSize[1], tagText);
                    newTagSet.pop();
                    newTagSet.push(thisTag);
                    setTags(newTagSet);
                    setTagging(false);
                }
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

    // set tag on which user is hovering to highlight it
    const handleTagSelect = e => {
        let index = e.target.id;
        setHighlight(index);
    }

    const handleNoTagSelected = () => {
        setHighlight(null)
    }

    // RENDER

    return (
        <React.Fragment>
            <button className="img-send-btn" onClick={() => setModal(true)}>
                <i class="fas fa-file-image fa-2x"></i>
            </button>
            <Modal 
                isOpen={showModal}
                onRequestClose={() => setModal(false)}
            >
                <div className="modal">
                    <h2>Send a photo</h2>
                    <label htmlFor="file-upload" className="custom-file-upload">
                        {buttonText}
                    </label>
                    <input id='file-upload' type="file" onChange={handleFile} accept=".jpg, .jpeg, .gif" />
                    { file ? (
                        <React.Fragment>
                        {toTag ? (
                            <div className="img-tag">
                                <div className="h-img" onLoad={()=>setHasCanvas(true)}>
                                    <h3>Click on the image to add a tag:</h3>
                                    <div>
                                        <canvas
                                            id='tag-canvas'
                                            onMouseMove={handleMouse} 
                                            onMouseDown={handleMouseDown}
                                            onMouseUp={handleMouseUp}
                                            width={imgSize[0]}
                                            height={imgSize[1]}
                                            style={{zIndex: 2, position: 'absolute', overflow: 'hidden'}}
                                        />
                                        <img 
                                            src={file} 
                                            alt="" 
                                            id="img-to-tag"
                                            width={imgSize[0]}
                                            height={imgSize[1]}
                                            style={{zIndex: 1, overflow: 'hidden'}}
                                        />
                                    </div>
                                </div>
                                <div className="side-info" onMouseOut={handleNoTagSelected}>
                                    {tags.map(tag => {
                                            return( 
                                                <button className="tag-btn" key={tags.indexOf(tag)}
                                                    id={tags.indexOf(tag)} 
                                                    className='tag-text'
                                                    onClick={handleTagRemove}
                                                    onMouseOver={handleTagSelect}>{tag[4]} X
                                                </button>
                                            )
                                        })}
                                    <button id="undo-tags" onClick={handleQuitTags}>Undo tags</button>
                                </div>
                            </div>
                        ):(
                            <div className="tag-info">
                                <img 
                                    src={file}
                                    alt=""
                                    onLoad={handleImgLoad}
                                    id="img-to-tag"
                                />
                                <button className="tag-btn" onClick={e => setTag(true)}>Add tags</button>
                            </div>
                        )}
                    </React.Fragment>
                    ):(null)
                    }
                    <button id="send-btn" onClick={handleSubmit} disabled={!canSend}>Send</button>
                    <button id="quit-btn" onClick={handleQuit}>
                        <i class="far fa-times-circle fa-2x"></i>
                    </button>
                </div>
            </Modal>
        </React.Fragment>
    )

}

export default ImageTagger;