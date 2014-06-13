(function () {
    'use strict';

    var imageUrls = [
            'https://forums.freebsd.org/download/file.php?avatar=10313_1385339595.jpg',
            'http://www.earthworksaction.org/images/made/images/avatars/uploads/avatar_12_50_50_s_c1.jpg',
            'http://gravatar.com/avatar/d12f506a8f9afba443178608fc9e2232?d=mm&s=48&r=G',
            'http://gravatar.com/avatar/fa89abfe7f076aedbd3387d306770da8?d=wavatar&s=50&r=X',
            'http://www.avepoint.com/community/wp-content/uploads/avatars/4050/b2f0a7953de1bfc57d05f140bb67c635-bpthumb.jpg'
        ],

        /**
         * Convert an image to a base64 string.
         *
         * @todo This is an ugly function. This could probably be done in a much sexier way.
         * @param  {String}   url
         * @param  {Function} callback
         * @param  {String}   [outputFormat=image/png]
         */
        convertImgToBase64 = function (img, outputFormat) {
            var canvas = document.createElement('canvas'),
                ctx = canvas.getContext('2d'),
                dataURL,

                promise = new Promise(function (resolve, reject) {
                    outputFormat = outputFormat || 'image/jpg';

                    img.crossOrigin = 'Anonymous';

                    canvas.height = img.height;
                    canvas.width = img.width;
                    ctx.drawImage(img, 0, 0);

                    dataURL = canvas.toDataURL(outputFormat);
                    canvas = null;

                    // just for prettiness :)
                    resolve(dataUrl);
                });

            return promise;
        },

        writeDataToStorage = function (key) {
            return function (data) {
                debugger;
                window.localStorage.setItem(key, data);
            };
        },

        cacheImage = function (img) {
            convertImgToBase64(img)
                .then(writeDataToStorage(img.src));
        },

        createImage = function (src, getFromCache) {
            var img,
                cachedImageSrc = window.localStorage.getItem(src);

            if (getFromCache && cachedImageSrc) {
                console.log('boom')
                src = cachedImageSrc;

            } else if (getFromCache) {
                console.info('Image not yet saved to storage');
                return null;
            }

            img = new Image();
            img.src = src;

            cacheImage(img);

            return img;
        },

        webImageContainer = document.getElementById('web-image-container'),
        storageImageContainer = document.getElementById('storage-image-container');

        imageUrls.forEach(function (imageUrl) {
            var img = createImage(imageUrl, true);
            if (img) {
                storageImageContainer.appendChild(img);
            }
        });

        imageUrls.forEach(function (imageUrl) {
            webImageContainer.appendChild(createImage(imageUrl));
        });

}());
