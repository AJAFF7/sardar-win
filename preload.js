// // preload.js
// const { contextBridge, ipcRenderer } = require("electron");

// contextBridge.exposeInMainWorld("ipcRenderer", {
//   send: (...args) => ipcRenderer.send(...args),
// });
// const { contextBridge, ipcRenderer } = require("electron");

// contextBridge.exposeInMainWorld("electronAPI", {
//   onUpdateLog: (callback) =>
//     ipcRenderer.on("update-log", (event, message) => callback(message)),
// });

//
//////
// // preload.js
// const { contextBridge, ipcRenderer } = require("electron");

// contextBridge.exposeInMainWorld("electronUpdater", {
//   checkForUpdates: () => ipcRenderer.send("check-for-updates"),
//   onUpdateAvailable: (callback) => ipcRenderer.on("update-available", callback),
//   onUpdateDownloaded: (callback) => ipcRenderer.on("update-downloaded", callback),
// });
