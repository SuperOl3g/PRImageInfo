import filesize from 'filesize';

import s from './styles.scss';

const SIZE_ELEM_CLASSNAME = 'snippet__pic-size';

const SIZE_LIMIT = {
    UNOPTIMIZED: 600 * 1024
};

const OPT_STATUS = {
    LOADING: 'loading',
    OPTIMIZED: 'optimized',
    UNKNOWN: 'unknown',
    UNOPTIMIZED: 'unoptimized',
    NOTCHECKED: 'notchecked'
};

const getOptStatus = size => {
    if (size > SIZE_LIMIT.UNOPTIMIZED) {
        return OPT_STATUS.UNOPTIMIZED;
    }

    return OPT_STATUS.NOTCHECKED;
};

const getTooltipHTML = status => {
    if (status === OPT_STATUS.NOTCHECKED) {
        return '';
    }

    const icons = {
        [OPT_STATUS.LOADING]:
            `<div class='${s.loading}'>
                <div class='${s.loading__dot}'></div>
            </div>`,
        [OPT_STATUS.OPTIMIZED] : '\u2705',
        [OPT_STATUS.UNKNOWN] : '\u2754',
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
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
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

            if (!sizeElem) {
                sizeElem = document.createElement('span');
                sizeElem.className = SIZE_ELEM_CLASSNAME;
                insertionPointElem.appendChild(sizeElem);
            }

            const optStatus = getOptStatus(imgSize);

            sizeElem.innerHTML = ` (${imgElem.naturalWidth}x${imgElem.naturalHeight}, ${filesize(imgSize)})${getTooltipHTML(optStatus)}`;
        });
};

const applicationName = document.querySelector("meta[name=\'application-name\']");
const isBucket = applicationName && applicationName.content === "Bitbucket";

if (isBucket) {
    document.addEventListener(
        'load', event => {
            if (event.target.tagName == 'IMG' && event.target.closest('.binary'))
                addImgInfo(event.target);
        }, true);
}