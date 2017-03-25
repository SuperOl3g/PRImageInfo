import filesize from 'filesize';
import { throttle, random } from 'underscore';
import { Promise } from 'bluebird';

import s from './styles.scss';

const SIZE_ELEM_CLASSNAME = 'snippet__pic-size';

const SIZE_LIMIT = {
    UNOPTIMIZED: 1024 * 1024
};

const OPT_STATUS = {
    LOADING: 'loading',
    OPTIMIZED: 'optimized',
    UNDEFINED: 'undefined',
    UNOPTIMIZED: 'unoptimized'
};

const getOptStatus = size => {
    if (size > SIZE_LIMIT.UNOPTIMIZED) {
        return OPT_STATUS.UNOPTIMIZED;
    }

    return OPT_STATUS.UNDEFINED;
};

const getTooltipHTML = status => {
    const icons = {
        [OPT_STATUS.LOADING]:
            `<div class='${s.loading}'>
                <div class='${s.loading__dot}'></div>
            </div>`,
        [OPT_STATUS.OPTIMIZED] : '\u2705',
        [OPT_STATUS.UNDEFINED] : '\u2754',
        [OPT_STATUS.UNOPTIMIZED] : '\u26A0'
    };

    const text = chrome.i18n.getMessage(`tooltip_${status}`);

    return `<div class='${s.tooltip}'>
            <div class='${s.tooltip__content}'>
                ${icons[status]}️
            </div>
            <div class='${s.tooltip__popup}'>${text}</div>
        </div>`;
};

const getImgSize = imgPath => new Promise((resolve,reject) => {
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
});

const addImgInfo = imgElem => {
    getImgSize(imgElem.src)
        .then(imgSize => {
            const imgBlock = imgElem.closest('.binary');
            const insertionPointElem = imgBlock.querySelector('h5');
            let sizeElem = insertionPointElem.querySelector(`.${SIZE_ELEM_CLASSNAME}`);

            if(!sizeElem) {
                sizeElem = document.createElement('span');
                sizeElem.className = SIZE_ELEM_CLASSNAME;
                insertionPointElem.appendChild(sizeElem);
            }

            const optStatus = getOptStatus(imgSize);

            sizeElem.innerHTML = ` (${imgElem.naturalWidth}x${imgElem.naturalHeight}, ${filesize(imgSize)})${getTooltipHTML(optStatus)}`;
        });
};

const throttledAddImgInfo = throttle(addImgInfo, 200);

const applicationName = document.querySelector("meta[name=\'application-name\']");
const isBucket = applicationName && applicationName.content === "Bitbucket";

if (isBucket) {
    document.addEventListener(
        'load', event => {
            if (event.target.tagName == 'IMG' && event.target.closest('.binary'))
                throttledAddImgInfo(event.target);
        }, true);
}