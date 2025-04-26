const { ipcRenderer } = require('electron');

// Function to create an app item element
function createAppItem(appName) {
    const appItem = document.createElement('div');
    appItem.className = 'app-item';
    appItem.innerHTML = `
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20Z" fill="white"/>
        </svg>
        <span class="app-name">${appName}</span>
    `;
    
    // Add click handler
    appItem.addEventListener('click', () => {
        const animation = appItem.animate([
            { transform: 'scale(1)', opacity: 1 },
            { transform: 'scale(0.95)', opacity: 0.8 },
            { transform: 'scale(1)', opacity: 1 }
        ], {
            duration: 300,
            easing: 'ease-out'
        });

        ipcRenderer.send('launch-app', appName);
    });

    return appItem;
}

// Load apps when the page loads
async function loadApps() {
    try {
        const apps = await ipcRenderer.invoke('get-apps');
        const appGrid = document.getElementById('appGrid');
        
        apps.forEach(appName => {
            const appItem = createAppItem(appName);
            appGrid.appendChild(appItem);
        });
    } catch (error) {
        console.error('Error loading apps:', error);
    }
}

// Handle app launch responses
ipcRenderer.on('launch-app-response', (event, response) => {
    if (!response.success) {
        console.error('Failed to launch app:', response.error);
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', loadApps); 