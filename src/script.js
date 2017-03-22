import { filesize } from 'filesize';
import { throttle } from 'underscore';
import { Promise } from 'bluebird';

const SIZE_ELEM_CLASSNAME = 'snippet__pic-size';

let throttledAddImgInfo = throttle(addImgInfo, 200);

document.addEventListener(
    'load', event => {
        if (event.target.tagName == 'IMG')
            throttledAddImgInfo();
    }, true);


function addImgInfo() {
    let imgBlocks = document.querySelectorAll('.binary-container .binary');
    for (let imgBlock of imgBlocks) {
        let imgElem = imgBlock.querySelector('img');

        if (!imgElem) continue;

        let imgPath = imgElem.src;

        new Promise( (resolve,reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open('HEAD', imgPath, true);
            xhr.onreadystatechange = () => {
                if ( xhr.readyState == 4 ) {
                    if ( xhr.status == 200 ) {
                        resolve(xhr.getResponseHeader('Content-Length'));
                    } else {
                        reject('Request error');
                    }
                }
            };
            xhr.send(null);
        })
            .then (imgSize => {
                let insertionPointElem = imgBlock.querySelector('h5');
                let sizeElem = insertionPointElem.querySelector(`.${SIZE_ELEM_CLASSNAME}`);

                if(!sizeElem) {
                    sizeElem = document.createElement('span');
                    sizeElem.className = SIZE_ELEM_CLASSNAME;
                    insertionPointElem.appendChild(sizeElem);
                }

                sizeElem.innerText = ` (${imgElem.naturalWidth}x${imgElem.naturalHeight}, ${filesize(imgSize)})`;
            });
    }
}
