import React, { useState, useEffect } from 'react';

const SentImg = (props) => {

    const { file, tags } = props;

    const [imgSize, setImgSize] = useState([0,0]);

    const handleImgLoad = e => {
        let img = e.target;
        let imgWidth = img.width;
        let imgHeight = img.height;
        setImgSize([imgWidth, imgHeight]);
    }

    const showTags = e => {
        let canvas = e.target;
        let ctx = canvas.getContext('2d');
        tags.forEach(tag => {
            ctx.strokeRect(tag[0]*imgSize[0], tag[1]*imgSize[1], (tag[2]-tag[0])*imgSize[0], (tag[3]-tag[1])*imgSize[1]);
            ctx.fillText(tag[4], tag[0]*imgSize[0], (tag[1]*imgSize[1])+30);
        })
    }

    const hideTags = e => {
        let canvas = e.target;
        let ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    if (tags) {
        return (
            <div className="img-msg" style={{position: 'relative'}}>
                <canvas
                    style={{position: 'absolute', zIndex: 2}}
                    width={imgSize[0]}
                    height={imgSize[1]}
                    onMouseEnter={showTags}
                    onMouseLeave={hideTags}
                />
                
                <img 
                    src={file.filePath}
                    alt={file.fileName}
                    style={{zIndex: 1, width: '100%'}}
                    onLoad={handleImgLoad}
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