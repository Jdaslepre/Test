// ----------------------------------
// index implementation
// ----------------------------------

loadPage('Pages/Home');

// Setup theme detection, literally only for the titlebar
// PWA stuff might not work that well on any OS with 
// left-aligned window controls
function updTitlebarTheme() {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)');
  
    function xtwitter(event) {
      if (event.matches) 
        document.querySelector("meta[name=theme-color]").setAttribute('content', "#242831");
      else 
        document.querySelector("meta[name=theme-color]").setAttribute('content', "#F8FAFC");
    }
  
    isDark.addListener(xtwitter);
    xtwitter(isDark);
  }
  
  updTitlebarTheme();
  



const navContent = document.getElementById('contentColumn').firstElementChild;

// Handles the navigation with item selection & page loading
const listItems = document.querySelectorAll('.list-item[type="navigation"]');
listItems.forEach(item => {
    if (item.id) {
        item.addEventListener('click', () => {
            listItems.forEach(item => item.classList.remove('selected'));
            item.classList.add('selected');
            const targetURL = item.getAttribute('id');
            loadPage(targetURL);
        });
    }
});

function themeWindow(bgColor) {
    document.querySelector("meta[name=theme-color]").setAttribute('content', bgColor);
  }
  

// Loads a page into the content column
function loadPage(url) {
    // contentRoot.style.transition = 'opacity 0.025s ease';
    contentRoot.style.transition = 'opacity 0.10s ease';
    contentRoot.style.opacity = '0';
 
    setTimeout(() => {
        contentRoot.style.marginTop = "20%";

        fetch(url)
        .then(response => response.text())
        .then(data => {
            contentRoot.innerHTML = data;
            

            setTimeout(() => {
                contentRoot.style.transition = 'opacity 0.40s ease, margin 0.297s cubic-bezier(0, 1, 0, 1)';
                contentRoot.style.opacity = '1';
                contentRoot.style.marginTop = "0";
            }, 50);
        });
    }, 100); 
}


// The most functional function of all time
function OpenTab(url) {
    window.open(url, '_blank');
}


function toggleExpanded(id) {
    var expander = document.getElementById(id);
    expander.classList.toggle('expanded');
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