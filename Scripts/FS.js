// Purpose: Emscripten FileSystem management
// Author: Jd1206

/*
All emscripten modules that use this script must be 
compiled with -lidbfs.js, along with having access
to emscripten's FS.
*/

class RFSManager {
    constructor() { }

    Init() {
        return new Promise((resolve, reject) => {

            FS.mkdir('FileSystem');
	        FS.mount(IDBFS, {}, 'FileSystem');

            this.Load(resolve);     
       		
	        FS.mkdir('FileSystem/RSDKv2');
            FS.mkdir('FileSystem/RSDKv3');
            FS.mkdir('FileSystem/RSDKv4');
        });
    }

    Load(successCB) {
        FS.syncfs(true, function (err) {
            if (err) {
                console.error('Error synchronizing file system:', err);
            } else {
                console.log('Synchronized FS');
                successCB();
            }
        });
    }
}



function FS_IndexedDB_Save(path, data, isDirectory) {

    const RSDKvFS = indexedDB.open('RSDKvFS', 1);

    RSDKvFS.onupgradeneeded = function (event) {
        event.target.result.createObjectStore('files');
        console.log("Created new object store 'files' in RSDKvFS");
    };

    RSDKvFS.onsuccess = function (event) {

        const transaction = event.target.result.transaction(['files'], 'readwrite');
        const objectStore = transaction.objectStore('files');

        if (isDirectory) {
            // Save as a directory instead of a file
            const directory = { type: 'directory', content: {} };
            objectStore.put(directory, path);
        }
        else {
            objectStore.put(Array.from(data), path);
        }

    };

    RSDKvFS.onerror = function (event) {
        console.error('Error opening database:', event.target.error);
    }
}