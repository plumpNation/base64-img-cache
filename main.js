(function () {
    'use strict';

    var users = [
            {id: 'ousaf32o313', image: 'images/1.jpg'},
            {id: 'sf83jf0fahs', image: 'images/2.jpg'},
            {id: '83720hfsf7s', image: 'images/3.jpg'},
            {id: 'hfas87f3h32', image: 'images/4.png'},
            {id: 'asf373h0138', image: 'images/5.jpg'}
        ],

        testSize = function (callback) {
            var i,
                data;

            localStorage.setItem('DATA', 'm');

            for (i = 0; i < 40; i += 1) {

                data = localStorage.getItem('DATA');

                try {
                    localStorage.setItem('DATA', data + data);

                } catch (e) {
                    console.log('LIMIT REACHED: (' + i + ')');
                    console.log(e);
                    break;
                }
            }

            callback();

            localStorage.removeItem('DATA');
        },

        getStorageSize = function (n) {
            var bytes = JSON.stringify(window.localStorage).length * (n || 1);

            return bytesToSize(bytes);
        },

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
                cachedUser = window.localStorage.getItem(user.id),
                promise;

            if (getFromCache && cachedUser) {
                fromCache = JSON.parse(cachedUser).image;

            } else if (getFromCache) {
                console.info('Image not yet saved to storage');
                return Promise.resolve(null);
            }

            img = new Image();
            img.src = getFromCache ? fromCache : user.image;

            return new Promise(function (resolve) {
                if (fromCache) {
                    resolve(img);

                } else {
                    img.onload = function () {
                        cacheImage(img).forUser(user);
                        // If we resolve in the onload function, the users will be added according
                        // to when they load from their respective sources. So expect the users
                        // to change order on the page.
                        resolve(img);
                    };
                }
            });
        },

        bytesToSize = function (bytes) {
            var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'],
                i;

            if (bytes === 0) {
                return '0 Bytes';
            }

           i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);

           return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
        },

        report = function () {
            console.info('So after caching our ' + users.length + ' user images we ' +
                'have used roughly ' + getStorageSize() + ' bytes');
            console.log('This means for 10000 users we will use roughly ' + getStorageSize(10000));
        },

        webImageContainer = document.getElementById('web-image-container'),
        storageImageContainer = document.getElementById('storage-image-container');

    localStorage.clear();
    console.log('Starting size: ');
    console.log(getStorageSize());

    var writesToStorage = [];

    // Will load the image and then convert to base64 to store locally
    // This foreach is only interesting if we have commented the localStorage.clear() line.
    users.forEach(function (user) {
        createImage(user, true).then(function (img) {
            if (img) {
                storageImageContainer.appendChild(img);
            }
        });
    });

    // Just a normal image load, but it's also where we'll cache the images
    users.forEach(function (user) {
        var storing = new Promise(function (resolve) {
            createImage(user).then(function (img) {
                webImageContainer.appendChild(img);
                resolve();
            });
        });

        writesToStorage.push(storing);
    });

    Promise.all(writesToStorage).then(report);
}());
