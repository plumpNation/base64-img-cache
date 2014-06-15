# localStorage image size calculator playground

## Install
```
bower install
```

## How does it work
Well, previously, in tag v0.1 the image was loaded with an img tag and then was put on a canvas
and the data read from that. This re-compressed the images, normalising their disk sizes and
ensuring that the same space was taken for each image of the same size.

Now I have rewritten it to load using the arraybuffer xhr response type, created a blob and
converted that to base64 using the FileReader API. I could have used a blob response type, but that
is perhaps not covered in all browsers at this point. I think that the array buffer is a Uint8Array
so this will only work with browsers that support typed arrays, and XHR2 but I think that's
implied if the browser supports typed arrays.

## What is the point in this repo?
This is an experiment to see how much room is taken up by converting images to Base64 and storing
them in the local browser storage.

There is far simpler ways to do this, right, but this is also a little fun for me to play with.

## Potential issues
CORS images need handling a particular way. Cannot use the canvas getDataUrl on a CORS image in a
canvas as it becomes 'tainted'.

Extracting the data is currently using the canvas tag which I don't believe has support in the
web worker environment.

Sharing the localStorage with other applications may be a source of frustration if you need large
space. Subdomains are a solution to this.

* How much room gets used by the images in localStorage?
* How much quota does a user have on a browser with factory settings?

## Rules of localStorage quota (14.06.2014 Taken from PouchDB docs)
* In Firefox PouchDB uses IndexedDB, this will ask the user if data can be stored the first it is attempted then every 50MB after, the amount that can be stored is not limited.
* Chrome calculates the amount of storage left available on the users hard drive and uses that to calculate a limit.
* Mobile Safari on iOS has a hard 50MB limit, desktop Safari will prompt users wanting to store more than 5MB up to a limit of 500MB.
* Opera has no known limit.
* Internet Exporer 10 has a hard 250MB limit.


# Reading materials

https://dvcs.w3.org/hg/quota/raw-file/tip/Overview.html#idl-def-StorageQuota

https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image

http://pouchdb.com/faq.html

http://randomuser.me/documentation.html

http://stackoverflow.com/questions/3027142/calculating-usage-of-localstorage-space

http://www.html5rocks.com/en/tutorials/file/xhr2/

https://hacks.mozilla.org/2012/02/saving-images-and-files-in-localstorage/

http://www.html5rocks.com/en/tutorials/webgl/typed_arrays/

https://developer.mozilla.org/en-US/docs/Web/API/Uint8Array
