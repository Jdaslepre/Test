// ----------------------------------
// Emscripten things
// ----------------------------------

var progressTrack = document.getElementById('ptrack');

var Module = {
    print: (function () {
        var element = document.getElementById('output');
        if (element) element.value = ''; // clear browser cache
        return function (text) {
            if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');

            console.log(text);
            if (element) {
                element.value += text + "\n";
                element.scrollTop = element.scrollHeight; // focus on bottom
            }
        };
    })(),
    setStatus: (text) => {
        if (!Module.setStatus.last) Module.setStatus.last = { time: Date.now(), text: '' };
        if (text === Module.setStatus.last.text) return;
        var m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
        var now = Date.now();
        if (m && now - Module.setStatus.last.time < 30) return; // if this is a progress update, skip it if too soon
        Module.setStatus.last.time = now;
        Module.setStatus.last.text = text;

        if (m) {
            text = m[1];
            var progressValue = parseInt(m[2]);
            var progressMax = parseInt(m[4]);

            Module.updateProgressBar(progressValue, progressMax);
        }

        // statusElement.innerHTML = text;
    },
    updateProgressBar: function (progressValue, progressMax) {
        var startTime = null;
        var initialWidth = parseFloat(progressTrack.style.width || '0');
        var targetWidth = (progressValue / progressMax) * 100;

        function animate(time) {
            if (!startTime) startTime = time;
            var progress = (time - startTime) / 300;
            if (progress >= 1) {
                progressTrack.style.width = targetWidth + '%';
            } else {

                var newWidth = initialWidth + (targetWidth - initialWidth) * progress;
                progressTrack.style.width = newWidth + '%';
                requestAnimationFrame(animate);
            }
        }
        requestAnimationFrame(animate);
    },
    totalDependencies: 0,
    monitorRunDependencies: (left) => {
        this.totalDependencies = Math.max(this.totalDependencies, left);
        Module.setStatus(left ? 'Preparing... (' + (this.totalDependencies - left) + '/' + this.totalDependencies + ')' : 'All downloads complete.');
    }
};
Module.setStatus('Downloading...');
window.onerror = () => {
    Module.setStatus('Exception thrown, see JavaScript console');

    Module.setStatus = (text) => {
        if (text) console.error('[post-exception status] ' + text);
    };
};

var Modulae = {
    print: (function () {
        var element = document.getElementById('output');
        if (element) element.value = ''; // clear browser cache
        return function (text) {
            if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');

            console.log(text);
            if (element) {
                element.value += text + "\n";
                element.scrollTop = element.scrollHeight; // focus on bottom
            }
        };
    })(),
    setStatus: (text) => {
        if (!Module.setStatus.last) Module.setStatus.last = { time: Date.now(), text: '' };
        if (text === Module.setStatus.last.text) return;
        var m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
        var now = Date.now();
        if (m && now - Module.setStatus.last.time < 30) return; // if this is a progress update, skip it if too soon
        Module.setStatus.last.time = now;
        Module.setStatus.last.text = text;

        if (m) {
            text = m[1];

            var progressValue = parseInt(m[2]);
            var progressMax = parseInt(m[4]);

            Module.updateProgressBar(progressValue, progressMax);
        }
    },
    updateProgressBar: function (progressValue, progressMax) { // well, new stuff!!
        var startTime = null;
        var initialWidth = parseFloat(progressTrack.style.width || '0');
        var targetWidth = (progressValue / progressMax) * 100;

        function animate(time) {
            if (!startTime) startTime = time;
            var progress = (time - startTime) / 300;
            if (progress >= 1) {
                progressTrack.style.width = targetWidth + '%';
            } else {

                var newWidth = initialWidth + (targetWidth - initialWidth) * progress;
                progressTrack.style.width = newWidth + '%';
                requestAnimationFrame(animate);
            }
        }
        requestAnimationFrame(animate);
    },
    totalDependencies: 0,
    monitorRunDependencies: (left) => {
        this.totalDependencies = Math.max(this.totalDependencies, left);
        Module.setStatus(left ? 'Preparing... (' + (this.totalDependencies - left) + '/' + this.totalDependencies + ')' : 'All downloads complete.');
    }
};
Module.setStatus('Downloading...');
window.onerror = () => {
    Module.setStatus('Exception thrown, see JavaScript console');

    Module.setStatus = (text) => {
        if (text) console.error('[post-exception status] ' + text);
    };
};

// ----------------------------------
// File Manager implementation
// ----------------------------------

let FS_Path = "/FileSystem";
const app_splashscreen = document.getElementById("application-splash");

Module['onRuntimeInitialized'] = function () {
    app_splashscreen.style.opacity = 0;

    // Wait until the opacity transition is complete
    setTimeout(() => {
        app_splashscreen.remove();
    }, 83);

    FS_ChangeDirectory('/');
    FS_IndexedDB_Load();
    FS.mkdir('/FileSystem');
    // FS_IndexedDB_Save('/FileSystem', null, true);

    // Refresh the files list
    FS_ChangeDirectory();
};

// ----------------------------------
// IndexedDB to store files
// ----------------------------------

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

    // Just incase?
    RSDKvFS.onupgradeneeded = function (event) {
        const db = event.target.result;
        db.createObjectStore('files');
    };

    RSDKvFS.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction(['files'], 'readwrite');
        const objectStore = transaction.objectStore('files');

        objectStore.openCursor().onsuccess = function (event) {
            const cursor = event.target.result;
            if (cursor) {
                const path = cursor.key;
                const fileData = cursor.value;
                const isDirectory = fileData.type === 'directory';

                if (isDirectory) {
                    FS.mkdir(path);
                } else {
                    FS.writeFile(path, new Uint8Array(fileData));
                }

                cursor.continue();
            }
        };
    };

    RSDKvFS.onerror = function (event) {
        console.error('Error opening database:', event.target.error);
    }
}

function uploadFile() {
    const fileInput = document.getElementById("fileInput");
    const dirPath = FS_Path;

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const filePath = dirPath + '/' + file.name;

        const reader = new FileReader();
        reader.onload = function (event) {
            const fileData = new Uint8Array(event.target.result);

            // Write the file to the virtual file system
            FS.writeFile(filePath, fileData, { encoding: 'binary' });
            FS_IndexedDB_Save(filePath, fileData, false);

            // Update the file list
            FS_ChangeDirectory();
        };
        reader.readAsArrayBuffer(file);
    }
}

function createDirectory() {
    const dirNameInput = document.getElementById("dirName");
    const dirName = dirNameInput.value;

    if (dirName.length < 1) {
        alert("Directory name must be at least 1 character long");
        return;
    }

    const dirPath = FS_Path + '/' + dirName;

    // Create the directory in the virtual file system
    FS.mkdir(dirPath);
    FS_IndexedDB_Save(dirPath, null, true);

    // Update the file list
    FS_ChangeDirectory();
    dirNameInput.value = ""; // Clear the input field after creating the directory
}

function FS_NavUp() {
    const dirArray = FS_Path.split('/');
    if (dirArray.length > 2) {
        dirArray.pop();
        const newDirPath = dirArray.join('/');
        FS_ChangeDirectory(newDirPath);
    }
}

function FS_ChangeDirectory(newDirPath) {
    const fileListItems = document.getElementById("fileListItems");
    fileListItems.innerHTML = "";

    const dirPath = newDirPath || FS_Path;
    FS_Path = dirPath;

    const dirArray = dirPath.split('/');

    dirArray.forEach(function (dir, index) {
        if (dir === "") {
            return;
        }
    });

    let entries = FS.readdir(dirPath);

    // Remove these 2 little stupids
    entries = entries.filter(entry => entry !== '.' && entry !== '..');

    entries.forEach(function (entry) {
        const listItem = document.createElement("li");
        listItem.setAttribute("tabindex", "0");
        listItem.setAttribute("aria-selected", "false");
        listItem.classList.add("list-item", "svelte-1ye4o7x");
        listItem.setAttribute("role", "listitem");

        const isDirectory = FS.isDir(FS.lookupPath(dirPath + '/' + entry).node.mode);
        const svgPath = isDirectory ? '/Assets/FluentIcons/Directory.svg' : '/Assets/FluentIcons/Document.svg';

        listItem.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                        <image width="16" height="16" href="${svgPath}" />
                    </svg>
                    <span class="text-block type-body svelte-zxj483">${entry}</span>
                `;

        // Check if the entry is a directory
        if (FS.isDir(FS.lookupPath(dirPath + '/' + entry).node.mode)) {
            listItem.classList.add("directory");
            // Add a double-click event listener to navigate into the directory
            listItem.addEventListener("dblclick", function () {
                const newDirPath = dirPath + '/' + entry;
                FS_ChangeDirectory(newDirPath);
            });
        }

        // Add a click event listener to select the item
        listItem.addEventListener("click", function (event) {
            if (!event.ctrlKey) {
                // Clear previous selections
                const selectedItems = document.querySelectorAll(".selected");
                selectedItems.forEach(item => item.classList.remove("selected"));
            }

            if (!listItem.classList.contains("selected")) {
                listItem.classList.add("selected");
            } else {
                listItem.classList.remove("selected");
            }
        });

        fileListItems.appendChild(listItem);
    });

    // Update title stuff
    document.getElementById("currentDir").textContent = dirPath;
    document.title = "Files - " + dirPath;
}