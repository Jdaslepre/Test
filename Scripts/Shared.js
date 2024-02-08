function createDialog(title, message, confirmLabel, closeLabel, confirmStyle, closeStyle, confirmActionFunc, closeActionFunc, target) { // mid function ngl
    const smokeContainer = document.createElement('div');
    smokeContainer.className = 'content-dialog-smoke svelte-1szmc6y darken';
    smokeContainer.style.opacity = '0';
    smokeContainer.style.transition = 'opacity 0.083s linear';
    smokeContainer.style.position = 'absolute';

    target.appendChild(smokeContainer);

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


function RS_getSetting(key) {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
}

function RS_saveSetting(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}


