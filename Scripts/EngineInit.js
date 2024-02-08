// ----------------------------------
// Emscripten 'init'
// ----------------------------------

const app_splashscreen = document.getElementById("application-splash");
const progressContainer = document.getElementById("progressContainer");

var originalWidth = 0;
var originalHeight = 0;

var Module = {

    onRuntimeInitialized: function () {

        progressContainer.style.opacity = 0; // Hide the progress ring on emscripten initialization

        const RFS = new RFSManager();
        RFS.Init().then(() => {

            app_splashscreen.style.opacity = 0; // Now that the FileSystem is initialized, we can hide the splashscreen

            setTimeout(() => { // Wait juuust a bit later to fully remove the splashscreen
                app_splashscreen.remove();
            }, 1000);

            // Defined in the Engine.js script. This has to be
            // called last, as it starts a loop
            RSDK_Init();
        })

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
    canvas: (() => {
        var canvas = document.getElementById('canvas');

        // As a default initial behavior, pop up an alert when the webgl context is lost.
        // To make your application robust, you may want to override this behavior before shipping!
        // See http://www.khronos.org/registry/webgl/specs/latest/1.0/#5.15.2
        canvas.addEventListener("webglcontextlost", (e) => { alert('WebGL context lost. You will need to reload the page.'); e.preventDefault(); }, false);

        return canvas;
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