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
            // quick hack to make the numbers correct
            n = n / users.length;

            return JSON.stringify(window.localStorage).length * (n || 1);
        },

        getPrettyStorageSize = function (n) {
            return bytesToSize(getStorageSize(n));
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

            // Draws the image at origin point 0,0
            // https://developer.mozilla.org/en/docs/Web/API/CanvasRenderingContext2D
            ctx.drawImage(img, 0, 0);

            // Beware of cross domain images, they are not available to 'toDataURL' as they
            // 'taint' the canvas. Security something or other. There is a workaround I'm sure,
            // but from the looks of it it involves getting the binary data from the FileAPI
            // and I don't think this is relevent to your use case.
            dataURL = canvas.toDataURL(outputFormat);
            canvas = null;

            return dataURL;
        },

        /**
         * This function assumes for the point of this example that you are writing an object
         * which will need to be stringified to store it.
         *
         * @param  {string} key
         * @param  {object} data Will be stringified
         * @return {void}
         */
        writeDataToStorage = function (key, data) {
            var data = JSON.stringify(data);

            console.log('Writing ' + bytesToSize(data.length) + ' to storage');
            window.localStorage.setItem(key, data);
        },

        cacheImage = function (img) {
            var dataURL = convertImgToBase64(img);

            return {
                forUser: function (user) {
                    user.image = dataURL;
                    writeDataToStorage(user.id, user);
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

        makeBarChartData = function (data) {
            var bigNumbers = [100, 500, 1000, 5000, 10000],
                datasetData = Object.keys(data).map(function (key) {
                            return data[key];
                        }).concat(bigNumbers.map(function (num) {
                            return getStorageSize(num);
                        }));

                chartData = {
                    'labels': Object.keys(data).concat(bigNumbers),
                    'datasets': [
                        {'data': datasetData}
                    ]
                };

            return chartData;
        },

        drawChart = function (data) {
            var chart = document.getElementById('report-chart'),
                ctx = chart.getContext('2d');

            new Chart(ctx).Bar(makeBarChartData(data));
        },

        report = function () {
            console.info('So after writing our ' + users.length + ' user images we ' +
                'have used roughly ' + getPrettyStorageSize() + ' bytes');
            console.log('This means for 10000 users we will use roughly ' + getPrettyStorageSize(10000));

            chartData.end = getStorageSize();
            chartData.prediction = getPrettyStorageSize(10000);

            drawChart(chartData);
        },

        webImageContainer = document.getElementById('web-image-container'),
        storageImageContainer = document.getElementById('storage-image-container');

    localStorage.clear();
    console.log('Starting storage size: ', getPrettyStorageSize());

    var writesToStorage = [],
        chartData = {
            'start': getStorageSize(),
            'end': undefined,
            'prediction': undefined
        };

    // This foreach is only interesting if we have commented the localStorage.clear() line.
    /*users.forEach(function (user) {
        createImage(user, true).then(function (img) {
            if (img) {
                storageImageContainer.appendChild(img);
            }
        });
    });*/

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
