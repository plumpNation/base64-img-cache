(function () {
    'use strict';

    // I had to use locally hosted images as there are issues with extracting base64 easily
    // using canvas when the image is cross domain.
    var getSizeParam = function () {
            var params = document.URL.split('?')[1];

            if (!params) {
                return 'small';
            }

            switch (true) {
            case params.indexOf('medium') > -1:
                return 'medium';

            default:
                return 'small';
            }
        },


        testSize = getSizeParam() || 'medium', // size of images, relates to folder name in images folder.
        idLength = 20, // how long we want the id to be
        nameLength = 20, // how long we want the username to be
        fileType = 'jpg',

        numOfTestImages = {
            'small': 5,
            'medium': 20
        },

        /**
         * Creates a random string of alphanumeric characters.
         *
         * @param  {number} length How long we want the string to be.
         * @return {string}
         */
        makeId = function (length) {
            var text = '',
                possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

            length = length || 5;

            for (var i = 0; i < length; i += 1) {
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            }

            return text;
        },

        createUsers = function (imageSize) {
            var result = [],
                i;

            for (i = 1; i <= numOfTestImages[testSize]; i += 1) {
                result.push({
                    'id': makeId(idLength),
                    'name': makeId(nameLength),
                    'image': 'images/' + testSize + '/' + i + '.' + fileType
                })
            }

            return result; // this will be the value of users
        },

        users = createUsers(testSize),

        /**
         * This function will fill your storage up to it's limit.
         *
         * @param  {Function} callback Runs BEFORE you clear the test data out. Synchronous.
         * @return {void}
         */
        maxOutStorage = function (callback) {
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

        /**
         * Prettifies bytes number to it's most useful unit.
         *
         * @param  {number} bytes
         * @return {string}       e.g. 2MB
         */
        prettyBytes = function (bytes) {
            var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'],
                i;

            if (bytes === 0) {
                return '0 Bytes';
            }

           i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);

           return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
        },

        bytesToKb = function (bytes) {
            var n;

            if (bytes === 0) {
                return 0;
            }

            return Math.round(bytes / Math.pow(1024, 1), 2);
        },

        /**
         * Simply a way to count the bytes in the localStorage.
         *
         * @param  {number} multiplier
         * @return {number}
         */
        getStorageSize = function (multiplier) {
            // Quick hack to make the numbers correct
            multiplier = multiplier / users.length;

            return JSON.stringify(window.localStorage).length * (multiplier || 1);
        },

        /**
         * Runs the result of getStorageSize through a prettifier function called prettyBytes
         * @param  {number} multiplier
         * @return {number}
         */
        getPrettyStorageSize = function (multiplier) {
            return prettyBytes(getStorageSize(multiplier));
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

            console.log('Writing ' + prettyBytes(data.length) + ' to storage');
            window.localStorage.setItem(key, data);
        },

        /**
         * Converts image tag to base 64 and writes the result to the local storage.
         *
         * @param  {DOMelement} img
         * @return {void}
         */
        cacheImage = function (img, user) {
            var dataURL = convertImgToBase64(img);

            user.image = dataURL;
            writeDataToStorage(user.id, user);
        },

        imageTemplate = $('#image-template').remove(),

        /**
         * Creates the image tag for the image url to populate.
         *
         * @param  {object} user
         * @return {promise}     Resolves to the img tag when it is loaded so that calculations
         *                                can be done knowing that the image is loaded and
         *                                stored.
         */
        createImage = function (user) {
            var imgContainer,
                img,
                promise;

            imgContainer = imageTemplate.clone();
            img = imgContainer.children('img').prop('src', user.image);

            return new Promise(function (resolve) {
                img.on('load', function () {
                    cacheImage(this, user);
                    // If we resolve in the onload function, the users will be added according
                    // to when they load from their respective sources. So expect the users
                    // to change order on the page.
                    resolve(imgContainer);
                });
            });
        },

        /**
         * Just for reporting purposes. bigNumbers is used as a way to create projections.
         * Converts a simple object
         *
         * @param  {object} data
         * @return {[type]}      [description]
         */
        makeBarChartData = function (data) {
            var bigNumbers = [100, 500, 1000, 5000, 10000],
                datasetData = Object.keys(data).map(function (key) {
                            return bytesToKb(data[key]);
                        }).concat(bigNumbers.map(function (num) {
                            return bytesToKb(getStorageSize(num));
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

            return true;
        },

        /**
         * Populates a table with data and projection sizes.
         *
         * @return {void}
         */
        writeReport = function () {
            var data = {
                    'Number of users': users.length,
                    'Storage size'   : getPrettyStorageSize(),
                    'For 100 users'  : getPrettyStorageSize(100),
                    'For 200 users'  : getPrettyStorageSize(200),
                    'For 500 users'  : getPrettyStorageSize(500),
                    'For 1000 users' : getPrettyStorageSize(1000),
                    'For 10000 users': getPrettyStorageSize(10000)
                },
                report = $('#report'),
                template = report.find('.row-template').remove(),
                clone;

            Object.keys(data).forEach(function (key) {
                clone = template.clone();
                clone.children('th').text(key);
                clone.children('td').text(data[key]);
                clone.appendTo(report);
            });
        },

        recordEndResults = function () {
            console.info('So after writing our ' + users.length + ' user images we ' +
                'have used roughly ' + getPrettyStorageSize() + ' bytes');
            console.log('This means for 10000 users we will use roughly ' + getPrettyStorageSize(10000));

            chartData.end = getStorageSize();

            return chartData;
        },

        webImageContainer = document.getElementById('web-image-container'),
        storageImageContainer = document.getElementById('storage-image-container');

    // We start by clearing the local storage for this domain.
    localStorage.clear();

    console.log('Starting storage size: ', getPrettyStorageSize());

    var writesToStorage = [],
        chartData = {
            // Record the starting storage size
            'start': getStorageSize(),
            'end': undefined
        };

    users.forEach(function (user) {
        var storing = new Promise(function (resolve) {
            createImage(user).then(function (imgContainer) {
                imgContainer.appendTo('#web-image-container');
                resolve();
            });
        });

        writesToStorage.push(storing);
    });

    Promise.all(writesToStorage)
        .then(recordEndResults)
        .then(drawChart)
        .then(writeReport);
}());
