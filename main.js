(function () {
    'use strict';

    var users = [
            {id: 'ousaf32o313', image: 'images/1.jpg'},
            {id: 'sf83jf0fahs', image: 'images/2.jpg'},
            {id: '83720hfsf7s', image: 'images/3.jpg'},
            {id: 'hfas87f3h32', image: 'images/4.png'},
            {id: 'asf373h0138', image: 'images/5.jpg'}
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
                dataURL;

            outputFormat = outputFormat || 'image/jpeg';

            img.crossOrigin = 'Anonymous';

            canvas.height = img.height;
            canvas.width = img.width;
            ctx.drawImage(img, 0, 0);

            dataURL = canvas.toDataURL(outputFormat);
            canvas = null;

            return dataURL;
        },

        writeDataToStorage = function (key, data) {
            window.localStorage.setItem(key, data);
        },

        cacheImage = function (img) {
            var dataURL = convertImgToBase64(img);

            return {
                forUser: function (user) {
                    user.image = dataURL;
                    writeDataToStorage(user.id, JSON.stringify(user));
                }
            };
        },

        createImage = function (user, getFromCache) {
            var img,
                fromCache,
                cachedUser = window.localStorage.getItem(user.id);

            if (getFromCache && cachedUser) {
                fromCache = JSON.parse(cachedUser).image;

            } else if (getFromCache) {
                console.info('Image not yet saved to storage');
                return null;
            }

            img = new Image();
            img.src = fromCache || user.image;

            if (!fromCache) {
                img.onload = function () {
                    cacheImage(img).forUser(user);
                };
            }

            return img;
        },

        webImageContainer = document.getElementById('web-image-container'),
        storageImageContainer = document.getElementById('storage-image-container');

    // localStorage.clear();

    users.forEach(function (user) {
        var img = createImage(user, true);
        if (img) {
            storageImageContainer.appendChild(img);
        }
    });

    users.forEach(function (user) {
        webImageContainer.appendChild(createImage(user));
    });

}());
