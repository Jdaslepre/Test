function FS_Initialize(){
    FS.mkdir('//FileSystem');
    // FS.mkdir('//FileSystem/RSDKv2');
    // FS.mkdir('//FileSystem/RSDKv3');
    // FS.mkdir('//FileSystem/RSDKv4');
    FS_IndexedDB_Load();
}

function FS_IndexedDB_Save(path, data, isDirectory) {
    const RSDKvFS = indexedDB.open('RSDKvFS', 1);

    RSDKvFS.onupgradeneeded = function (event) {
        event.target.result.createObjectStore('files');
    };

    RSDKvFS.onsuccess = function (event) {
        const transaction = event.target.result.transaction(['files'], 'readwrite');
        const objectStore = transaction.objectStore('files');

        if (isDirectory) {
            const directory = { type: 'directory', content: {} };
            objectStore.put(directory, path);
        } else {
            objectStore.put(Array.from(data), path);
        }
    };

    RSDKvFS.onerror = function (event) {
        console.error('Error opening database:', event.target.error);
    }
}

function FS_IndexedDB_Load() {
    const RSDKvFS = indexedDB.open('RSDKvFS', 1);
    console.log("FS_IndexedDB_Load called");
    // Just incase?
    RSDKvFS.onupgradeneeded = function (event) {
        const db = event.target.result;
        db.createObjectStore('files');
    };

    RSDKvFS.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction(['files'], 'readonly');
        const objectStore = transaction.objectStore('files');

        objectStore.openCursor().onsuccess = function (event) {
            const cursor = event.target.result;
            if (cursor) {

                const path = cursor.key;
                const fileData = cursor.value;
                const isDirectory = fileData.type === 'directory';

                if (isDirectory) {

                    console.log("Attempting to create directory " + path + "...");

                    FS.mkdir(path);

                    console.log("Directory " + path + " created");
                } else {
                    console.log("Attempting to create file " + path + "...");
                    FS.writeFile(path, new Uint8Array(fileData));
                    console.log("File " + path + " created");
                }

                cursor.continue();
            }
        };
    };

    RSDKvFS.onerror = function (event) {
        console.error('Error opening database:', event.target.error);
    }
}

function FS_CheckDirectoryExists(directoryPath) {
    try {
        var stats = FS.analyzePath(path);
        return stats && stats.exists && stats.mode === 16384;
    } catch (e) {
        return false;
    }
}