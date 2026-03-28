// Preload script for Electron security
// This script runs in the renderer process context with Node.js access
// but with restrictions due to contextIsolation

const { contextBridge } = require('electron');

// Expose limited APIs to the renderer process
contextBridge.exposeInMainWorld('electron', {
  // Add any needed APIs here
  appVersion: require('electron').app.getVersion(),
});
