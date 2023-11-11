// ----------------------------------
// index implementation
// ----------------------------------

loadPage('Pages/Home');

const navContent = document.getElementById('contentColumn');

// Handles the navigation with item selection & page loading
const listItems = document.querySelectorAll('.list-item[type="navigation"]');      
    listItems.forEach(item => {
    item.addEventListener('click', () => {
      listItems.forEach(item => item.classList.remove('selected'));
        item.classList.add('selected');
        const targetURL = item.getAttribute('id');
        loadPage(targetURL);
    });
});

// Loads a page into the content column
function loadPage(url) {
    fetch(url) .then(response => response.text()) .then(data => {
        contentColumn.innerHTML = data;
    });
}

function OpenTab(url) {
    window.open(url, '_blank');
}

// Well?
function createDialog(title, message, confirmLabel, closeLabel, confirmActionFunc, closeActionFunc) {
    const smokeContainer = document.createElement('div');
    smokeContainer.className = 'content-dialog-smoke svelte-1szmc6y darken';
    smokeContainer.style.opacity = '0';
    smokeContainer.style.transition = 'opacity 0.083s linear';
    document.body.appendChild(smokeContainer);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'content-dialog size-standard svelte-1szmc6y';
    contentDiv.setAttribute('role', 'dialog');
    contentDiv.setAttribute('aria-modal', 'true');
    contentDiv.setAttribute('aria-labelledby', 'fds-dialog-title-p519d1a3bd008a18b33e67358');
    contentDiv.setAttribute('aria-describedby', 'fds-dialog-body-i26c952489bcdd18b33e67358');
    contentDiv.style.transform = 'scale(0)';
    contentDiv.style.transition = 'transform 0.550s cubic-bezier(0, 1, 0, 1)';

    contentDiv.innerHTML = `
        <div class="content-dialog-body svelte-1szmc6y" id="fds-dialog-body-i26c952489bcdd18b33e67358">
            <h4 class="text-block type-subtitle content-dialog-title svelte-zxj483" id="fds-dialog-title-p519d1a3bd008a18b33e67358">${title}</h4>
            ${message}
        </div>
        <footer class="content-dialog-footer svelte-1szmc6y">
            <button id="confirmButton" class="button style-standard svelte-1ulhukx">${confirmLabel}</button>
            <button id="closeButton" class="button style-standard svelte-1ulhukx">${closeLabel}</button>
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
        smokeContainer.style.opacity = '0';
        contentDiv.style.transition = 'transform 0.167s cubic-bezier(1, 0, 1, 1)';
        contentDiv.style.transform = 'scale(2)';
        setTimeout(function () {
            smokeContainer.remove();
        }, 167);
        if (typeof confirmActionFunc === 'function') {
            confirmActionFunc();
        }
    });

    closeButton.addEventListener('click', function () {
        smokeContainer.style.opacity = '0';
        contentDiv.style.transition = 'transform 0.167s cubic-bezier(1, 0, 1, 1)';
        contentDiv.style.transform = 'scale(0)';
        setTimeout(function () {
            smokeContainer.remove();
        }, 167);
        if (typeof closeActionFunc === 'function') {
            closeActionFunc();
        }
    });
}


// Launches an engine depending on what was passed through the function
// launchEngine('3') - RSDKv(version), which would be RSDKv3
function launchEngine(version) {
  document.body.classList.add('fade-out');

  // Wait for the fade
  setTimeout(function () {
      location.href = `Engines/RSDKv${version}/index.html`;
  }, 300);
}

// ----------------------------------
// huh.
// well, this seems to do something
// ----------------------------------

var Module = {

};
