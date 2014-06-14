# localStorage image size calculator playground

## Install
```
bower install
```

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
