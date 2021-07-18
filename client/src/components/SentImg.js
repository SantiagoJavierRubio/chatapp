import React, { useState, useEffect } from 'react';

const SentImg = (props) => {

    const { file, tags } = props;

    const [imgSize, setImgSize] = useState({width: 0, height: 0});

    useEffect(() => {

        function handleResize() {
            try {
                    let img = document.getElementById(`${file.filePath}`);
                    let imgWidth = img.width;
                    let imgHeight = img.height;
                    setImgSize({width: imgWidth, height: imgHeight});
                } catch {
                    return;
                }
        }
        window.addEventListener('resize', handleResize);

        handleResize();

        return () => window.removeEventListener('resize', handleResize);

    }, []);

    const handleImgLoad = e => {
        let img = e.target;
        let imgWidth = img.width;
        let imgHeight = img.height;
        setImgSize({width: imgWidth, height: imgHeight});
    }

    const showTags = e => {
        let canvas = e.target;
        let ctx = canvas.getContext('2d');
        tags.forEach(tag => {
            ctx.strokeRect(tag[0]*imgSize.width, tag[1]*imgSize.height, (tag[2]-tag[0])*imgSize.width, (tag[3]-tag[1])*imgSize.height);
            ctx.fillStyle = 'black';
            ctx.font = '20px Arial'
            ctx.fillRect(tag[0]*imgSize.width, tag[1]*imgSize.height-20, 15*tag[4].length, 20);
            ctx.fillStyle = 'red';
            ctx.fillText(tag[4], tag[0]*imgSize.width, (tag[1]*imgSize.height)-4);
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
                    style={{position: 'absolute', zIndex: 1}}
                    width={imgSize.width}
                    height={imgSize.height}
                    onMouseEnter={showTags}
                    onMouseLeave={hideTags}
                />
                <img 
                    id={file}
                    src={file}
                    alt="sent-img"
                    style={{zIndex: 0}}
                    onLoad={handleImgLoad}
                />
            </div>
        )
    } else {
        return (
            <div className="img-msg">
                <img src={file} alt="sent-img" />
            </div>
        )
    }

}

export default SentImg;