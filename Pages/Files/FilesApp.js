// ----------------------------------
// Emscripten 'init'
// ----------------------------------

const app_splashscreen = document.getElementById("application-splash");
const progressContainer = document.getElementById("progressContainer");

var Module = {

    onRuntimeInitialized: function () {

        progressContainer.style.opacity = 0; // Hide the progress ring on emscripten initialization

        const RFS = new RFSManager();
        RFS.Init().then(() => {

            FilesApp_ChangeDirectory('/FileSystem');
            app_splashscreen.style.opacity = 0; // Now that the FileSystem is initialized, we can hide the splashscreen

            setTimeout(() => { // Wait juuust a bit later to fully remove the splashscreen
                app_splashscreen.remove();
            }, 1000);

        });
    },
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
        }

        // statusElement.innerHTML = text;
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

// weeeeeeeeee!!!!!
function updTitlebarTheme() {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)');
  
    function xtwitter(event) {
      document.querySelector("meta[name=theme-color]").setAttribute('content', window.getComputedStyle(document.getElementById('app-root')).backgroundColor);
    }
  
    isDark.addListener(xtwitter);
    xtwitter(isDark);
  }
  
  updTitlebarTheme();

let FS_Path = "//FileSystem";

// literally just the createDialog function but modified
// there's probably a better way to do this

function createDialog_NewDir() {
    const smokeContainer = document.createElement('div');
    smokeContainer.className = 'content-dialog-smoke svelte-1szmc6y darken';
    smokeContainer.style.opacity = '0';
    smokeContainer.style.transition = 'opacity 0.083s linear';
    smokeContainer.style.position = 'absolute';

    document.body.appendChild(smokeContainer);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'content-dialog size-standard svelte-1szmc6y';
    contentDiv.setAttribute('role', 'dialog');
    contentDiv.setAttribute('aria-modal', 'true');
    contentDiv.setAttribute('aria-labelledby', 'fds-dialog-title-p519d1a3bd008a18b33e67358');
    contentDiv.setAttribute('aria-describedby', 'fds-dialog-body');
    contentDiv.style.transform = 'scale(0)';
    contentDiv.style.transition = 'transform 0.333s cubic-bezier(0, 1, 0, 1)';

    contentDiv.innerHTML = `
        <div class="content-dialog-body svelte-1szmc6y" id="fds-dialog-body">
            <h4 class="text-block type-subtitle content-dialog-title svelte-zxj483" id="fds-dialog-title-p519d1a3bd008a18b33e67358">Create Directory</h4>

            <div class="text-box-container svelte-8l6kgi">
                <input type="text" class="text-box svelte-8l6kgi" placeholder="Directory Name" id="nameInput">
                <div class="text-box-underline svelte-8l6kgi"></div>
                <div class="text-box-buttons svelte-8l6kgi"> </div>
            </div>

        </div>
        <footer class="content-dialog-footer svelte-1szmc6y">
            <button id="confirmButton" class="button style-accent svelte-1ulhukx">Create</button>
            <button id="closeButton" class="button style-standard svelte-1ulhukx">Cancel</button>
        </footer>
    `;

    smokeContainer.appendChild(contentDiv);

    setTimeout(function () {
        smokeContainer.style.opacity = '1';
        contentDiv.style.transform = 'scale(1)';
    }, 50);

    const confirmButton = document.getElementById('confirmButton');
    const closeButton = document.getElementById('closeButton');

    confirmButton.addEventListener('click', function () {

        const nameInput = document.getElementById("nameInput");
        const dirName = nameInput.value;

        if (dirName.length < 1) {
            alert("Directory name can't be empty");
            return;
        }

        const dirPath = FS_Path + '/' + dirName;

        FS.mkdir(dirPath);
        FS.syncfs(function (err) {
            if (err) {
                console.error('Error:', err);
            } else {
                console.log(`Wrote ${dirPath} to FS`);
            }
        });

        FilesApp_ChangeDirectory(); // Refresh

        smokeContainer.style.opacity = '0';
        contentDiv.style.transition = 'transform 0.167s cubic-bezier(1, 0, 1, 1)';
        contentDiv.style.transform = 'scale(2)';

        setTimeout(function () {
            smokeContainer.remove();
        }, 167);
    });

    closeButton.addEventListener('click', function () {
        smokeContainer.style.opacity = '0';
        contentDiv.style.transition = 'transform 0.167s cubic-bezier(1, 0, 1, 1)';
        contentDiv.style.transform = 'scale(0)';
        setTimeout(function () {
            smokeContainer.remove();
        }, 167);
    });
}


// ----------------------------------
// File Management Functions
// ----------------------------------


function FilesApp_PromptFileUpload() {
    const fileInput = document.getElementById("fileInput");
    const dirPath = FS_Path;

    if (fileInput.files.length > 0) 
    {
        const fileName = fileInput.files[0].name.toLowerCase();
        if (fileName.endsWith('.zip')) {
            // It's a zip file, extract and upload its contents
            extractZIP(fileInput.files[0]);
        } else {
            for (let i = 0; i < fileInput.files.length; i++) {
                const file = fileInput.files[i];
                const filePath = dirPath + '/' + file.name;

                const reader = new FileReader();
                reader.onload = function (event) {
                    const fileData = new Uint8Array(event.target.result);
                    FS.writeFile(filePath, fileData, { encoding: 'binary' });

                    if (i === fileInput.files.length - 1) {
                        // If it's the last file, sync the filesystem
                        FS.syncfs(function (err) {
                            if (err) {
                                console.error('Error:', err);
                            } else {
                                console.log(`Wrote file(s) to FS`);
                            }
                            FilesApp_ChangeDirectory(); // Refresh
                        });
                    }
                };

                reader.readAsArrayBuffer(file);
            }
        }
    }
}


function FilesApp_DeleteSelectedItem() {
    const selectedItems = document.querySelectorAll(".selected");

    selectedItems.forEach(item => {
        const path = item.id

        try {
            if (FS.isDir(FS.lookupPath(path).node.mode)) {



                console.log(`Deleting directory: ${path}`);
                FS.rmdir(path);
            } else {
                console.log(`Deleting file: ${path}`);
                FS.unlink(path);
            }
        } catch (error) {
            console.error(`Error deleting ${path}: ${error}`);
        }
    });

    FS.syncfs(function (err) {
        if (err) {
            console.error('Error synchronizing file system:', err);
        } else {
            console.log('Deleted selected item(s).');
        }
    });

    FilesApp_ChangeDirectory(); // Refresh
}


function FilesApp_GetFileSize(filePath) {
    const stats = FS.stat(filePath);
    const fileSizeInBytes = stats.size;
    const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
    return fileSizeInMB.toFixed(2);
}


function extractZIP(zipFile) {
    JSZip.loadAsync(zipFile)
        .then(function (zip) {
            let directories = [];

            // Traverse zip file contents to identify directories
            zip.forEach(function (relativePath, zipEntry) {
                if (zipEntry.dir) {
                    directories.push(FS_Path + '/' + relativePath);
                }
            });

            // Create directories
            directories.forEach(function (dirPath) {
                const parts = dirPath.split('/');

                // Create directories recursively
                let currentPath = parts.shift(); // Remove the root FS path
                parts.forEach(function (part) {
                    currentPath += '/' + part;
                    if (!FS.analyzePath(currentPath).exists) {
                        FS.mkdir(currentPath);
                    }
                });
            });

            // Write files
            let count = 0;
            zip.forEach(function (relativePath, zipEntry) {
                if (!zipEntry.dir) {
                    count++;
                    const filePath = FS_Path + '/' + relativePath;

                    zipEntry.async('uint8array').then(function (fileData) {
                        const parentDir = PATH.dirname(filePath);

                        if (!FS.analyzePath(parentDir).exists) {
                            FS.mkdir(parentDir);
                        }

                        FS.writeFile(filePath, fileData, { encoding: 'binary' });

                        if (--count === 0) {
                            // Sync the FS if all files have been processed
                            FS.syncfs(function (err) {
                                if (err) {
                                    console.error('Error synchronizing file system:', err);
                                } else {
                                    console.log('Uploaded all files and directories to FS');
                                }
                                FilesApp_ChangeDirectory(); // Refresh the directory view
                            });
                        }
                    });
                }
            });
        })
        .catch(function (error) {
            console.error('Error loading zip file:', error);
        });
}

// ----------------------------------
// Navigation Functions
// ----------------------------------


function FilesApp_NavigateUp() {
    const dirArray = FS_Path.split('/');
    if (dirArray.length > 2) {
        dirArray.pop();
        const newDirPath = dirArray.join('/');
        FilesApp_ChangeDirectory(newDirPath);
    }
}

function FilesApp_ChangeDirectory(newDirPath) {
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

        const entryPath = dirPath + '/' + entry;
        const isDirectory = FS.isDir(FS.lookupPath(entryPath).node.mode);
        const svgPath = isDirectory ? '/Assets/FluentIcons/Directory.svg' : '/Assets/FluentIcons/Document.svg';

        listItem.innerHTML =
            `<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <image width="16" height="16" href="${svgPath}" />
         </svg>
         <span class="text-block type-body svelte-zxj483">${entry}</span>`;

        listItem.id = `${FS_Path}/${entry}`; // Set an ID so the selected item is identifiable

        if (isDirectory) {
            listItem.classList.add("directory");
            listItem.addEventListener("dblclick", function () {
                const newDirPath = entryPath;
                FilesApp_ChangeDirectory(newDirPath);
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

        if (!isDirectory) {
            const fileSize = FilesApp_GetFileSize(entryPath);
            listItem.innerHTML += `<span class="text-block type-body svelte-zxj483" style="margin-left: 16px; color: var(--fds-text-secondary)">${fileSize} MB</span>`;
        }
    });

    // Update title stuff
    document.getElementById("currentDir").textContent = dirPath;
    document.title = "Files - " + dirPath;
}