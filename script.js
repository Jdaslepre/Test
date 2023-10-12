var statusElement = document.getElementById('status');
var loadingElement = document.getElementById('loading');
var progressTrack = document.getElementById('ptrack');
const fileUploadButton = document.getElementById('uploadFile');

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
  onRuntimeInitialized: function () {
    loadingElement.style.display = "none";
  },
  
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
      var progressValue = parseInt(m[2]);
      var progressMax = parseInt(m[4]);

      Module.updateProgressBar(progressValue, progressMax);
    }

    statusElement.innerHTML = text;
  },
  updateProgressBar: function (progressValue, progressMax) {
    var startTime = null;
    var initialWidth = parseFloat(progressTrack.style.width || '0');
    var targetWidth = (progressValue / progressMax) * 100;

    function animate(time) {
      if (!startTime) startTime = time;
      var progress = (time - startTime) / 300;
      if (progress >= 1) {
        progressTrack.style.width = targetWidth + '%'; // Set the final width
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

function handleFileUpload(event) {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.style.display = 'none';

  fileInput.addEventListener('change', (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {

      const reader = new FileReader();
      reader.onload = (event) => {
        const fileData = event.target.result;

        FS.writeFile('/Data.bin', new Uint8Array(fileData));
        fileUploadButton.style.display = "none";

        Module._RSDKInitialize();
      };
      reader.readAsArrayBuffer(selectedFile);
    }
  });

  fileInput.click();
}

fileUploadButton.addEventListener('click', handleFileUpload);