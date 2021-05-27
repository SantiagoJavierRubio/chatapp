import React, { useState, useEffect } from 'react';

const SentImg = (props) => {

    const { file, tags } = props;

    const [imgSize, setImgSize] = useState([0,0]);

    const handleImgLoad = e => {
        let img = e.target
        let imgWidth = img.width;
        let imgHeight = img.height;
        setImgSize([imgWidth, imgHeight]);
    }

    if (tags) {
        return (
            <div className="img-msg" style={{position: 'relative'}}>
                <canvas
                    style={{position: 'absolute', zIndex: 2, height: '100%', width: '100%'}}
                />
                
                <img 
                    src={file.filePath}
                    alt={file.fileName}
                    onLoad={handleImgLoad} 
                    style={{zIndex: 1, width: '100%'}}
                />
            </div>
        )
    } else {
        return (
            <div className="img-msg">
                <img src={file.filePath} alt={file.fileName} />
            </div>
        )
    }

}

export default SentImg;