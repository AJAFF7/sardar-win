const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");

let mainWindow;
let updateCheckStarted = false; // ✅ Prevent double update check

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1700,
    height: 1167,
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: false,
      webviewTag: true,
    },
    autoHideMenuBar: true,
    backgroundColor: "#00000000",
  });

  // mainWindow.loadFile(path.join(__dirname, "index.html")).catch((err) => {
  //   console.error("Failed to load local HTML:", err);
  // });

  // mainWindow.webContents.on("dom-ready", () => {
  //   const imagePath =
  //     "file:///C:/Users/jaff/Environments/Alfa/resources/icons/k8s-bg.png";

  //   mainWindow.webContents.insertCSS(`
  //     * {
  //       scrollbar-width: none;
  //       -ms-overflow-style: none;
  //     }
  //     ::-webkit-scrollbar { display: none; }

  //     body {
  //       background-image: url("${imagePath}");
  //       background-size: cover;
  //       background-position: center;
  //       overflow: hidden !important;
  //       margin: 0;
  //       height: 100vh;
  //       width: 100vw;
  //       border-radius: 14px;
  //       box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  //       background-color: transparent;
  //       font-family: 'Courier New', Courier, monospace;
  //     }

  //     html {
  //       border-radius: 12px;
  //       overflow: hidden;
  //       background-color: transparent;
  //     }
  //   `);
  // });

  setTimeout(() => {
    mainWindow.loadURL("http://localhost:3535");
  }, 2000);

  mainWindow.webContents.on("did-fail-load", (event, code, description) => {
    console.error(`❌ Failed to load frontend: ${description} (code: ${code})`);
  });

  mainWindow.webContents.on("did-finish-load", () => {
    console.log("✅ Frontend loaded successfully");

    if (!updateCheckStarted) {
      updateCheckStarted = true;
      setupAutoUpdater(); // ✅ Ensure it's only called once
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// ✅ Auto updater setup with prompt before downloading
function setupAutoUpdater() {
  log.transports.file.level = "info";
  autoUpdater.logger = log;

  autoUpdater.autoDownload = false;

  autoUpdater.on("checking-for-update", () => {
    log.info("🔍 Checking for update...");
  });

  autoUpdater.on("update-available", async (info) => {
    log.info("⬇️ Update available.", info);

    const result = await dialog.showMessageBox(mainWindow, {
      type: "question",
      buttons: ["Download", "Cancel"],
      defaultId: 0,
      cancelId: 1,
      title: "Update Available",
      message: "A new update is available. Do you want to download it now?",
    });

    if (result.response === 0) {
      autoUpdater.downloadUpdate();
    } else {
      log.info("⏩ User declined to download update.");
    }
  });

  autoUpdater.on("update-not-available", (info) => {
    log.info("✅ No updates available.", info);
  });

  autoUpdater.on("download-progress", (progress) => {
    log.info(`📦 Downloading update: ${Math.floor(progress.percent)}%`);
  });

  autoUpdater.on("update-downloaded", () => {
    log.info("✅ Update downloaded.");

    dialog
      .showMessageBox(mainWindow, {
        type: "question",
        buttons: ["Restart Now", "Later"],
        defaultId: 0,
        cancelId: 1,
        title: "Install Update",
        message: "Update downloaded. Restart app to apply it?",
      })
      .then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
  });

  autoUpdater.on("error", (err) => {
    log.warn("⚠️ Auto-update error:", err?.message || err);
  });

  // ⏳ Delay update check by 3 seconds after launch
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((err) => {
      log.warn("⚠️ Update check failed:", err?.message || err);
    });
  }, 1000);
}

app.whenReady().then(() => {
  const serverPath = path.join(__dirname, "server.js");

  if (!fs.existsSync(serverPath)) {
    console.error("❌ server.js not found:", serverPath);
    return;
  }

  require(serverPath);
  createWindow(); // Window opens, update runs only once after load
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});


module.exports.log = log;





// const { app, BrowserWindow, dialog } = require("electron");
// const path = require("path");
// const fs = require("fs");
// const { autoUpdater } = require("electron-updater");
// const log = require("electron-log");

// let mainWindow;
// let updateCheckStarted = false; // ✅ Prevent double update check

// function createWindow() {
//   mainWindow = new BrowserWindow({
//     width: 1700,
//     height: 1167,
//     frame: false,
//     transparent: true,
//     webPreferences: {
//       nodeIntegration: true,
//       contextIsolation: true,
//       enableRemoteModule: false,
//       webviewTag: true,
//     },
//     autoHideMenuBar: true,
//     backgroundColor: "#00000000",
//   });

//   mainWindow.loadFile(path.join(__dirname, "index.html")).catch((err) => {
//     console.error("Failed to load local HTML:", err);
//   });

//   mainWindow.webContents.on("dom-ready", () => {
//     const imagePath =
//       "file:///C:/Users/jaff/Environments/Alfa/resources/icons/k8s-bg.png";

//     mainWindow.webContents.insertCSS(`
//       * {
//         scrollbar-width: none;
//         -ms-overflow-style: none;
//       }
//       ::-webkit-scrollbar { display: none; }

//       body {
//         background-image: url("${imagePath}");
//         background-size: cover;
//         background-position: center;
//         overflow: hidden !important;
//         margin: 0;
//         height: 100vh;
//         width: 100vw;
//         border-radius: 14px;
//         box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
//         background-color: transparent;
//         font-family: 'Courier New', Courier, monospace;
//       }

//       html {
//         border-radius: 12px;
//         overflow: hidden;
//         background-color: transparent;
//       }
//     `);
//   });

//   setTimeout(() => {
//     mainWindow.loadURL("http://localhost:3535");
//   }, 2000);

//   mainWindow.webContents.on("did-fail-load", (event, code, description) => {
//     console.error(`❌ Failed to load frontend: ${description} (code: ${code})`);
//   });

//   mainWindow.webContents.on("did-finish-load", () => {
//     console.log("✅ Frontend loaded successfully");

//     if (!updateCheckStarted) {
//       updateCheckStarted = true;
//       setupAutoUpdater(); // ✅ Ensure it's only called once
//     }
//   });

//   mainWindow.on("closed", () => {
//     mainWindow = null;
//   });
// }

// // ✅ Auto updater setup with prompt before downloading
// function setupAutoUpdater() {
//   log.transports.file.level = "info";
//   autoUpdater.logger = log;

//   autoUpdater.autoDownload = false;

//   autoUpdater.on("checking-for-update", () => {
//     log.info("🔍 Checking for update...");
//   });

//   autoUpdater.on("update-available", async (info) => {
//     log.info("⬇️ Update available.", info);

//     const result = await dialog.showMessageBox(mainWindow, {
//       type: "question",
//       buttons: ["Download", "Cancel"],
//       defaultId: 0,
//       cancelId: 1,
//       title: "Update Available",
//       message: "A new update is available. Do you want to download it now?",
//     });

//     if (result.response === 0) {
//       autoUpdater.downloadUpdate();
//     } else {
//       log.info("⏩ User declined to download update.");
//     }
//   });

//   autoUpdater.on("update-not-available", (info) => {
//     log.info("✅ No updates available.", info);
//   });

//   autoUpdater.on("download-progress", (progress) => {
//     log.info(`📦 Downloading update: ${Math.floor(progress.percent)}%`);
//   });

//   autoUpdater.on("update-downloaded", () => {
//     log.info("✅ Update downloaded.");

//     dialog
//       .showMessageBox(mainWindow, {
//         type: "question",
//         buttons: ["Restart Now", "Later"],
//         defaultId: 0,
//         cancelId: 1,
//         title: "Install Update",
//         message: "Update downloaded. Restart app to apply it?",
//       })
//       .then((result) => {
//         if (result.response === 0) {
//           autoUpdater.quitAndInstall();
//         }
//       });
//   });

//   autoUpdater.on("error", (err) => {
//     log.warn("⚠️ Auto-update error:", err?.message || err);
//   });

//   autoUpdater.checkForUpdates().catch((err) => {
//     log.warn("⚠️ Update check failed:", err?.message || err);
//   });
// }

// app.whenReady().then(() => {
//   const serverPath = path.join(__dirname, "server.js");

//   if (!fs.existsSync(serverPath)) {
//     console.error("❌ server.js not found:", serverPath);
//     return;
//   }

//   require(serverPath);
//   createWindow(); // Window opens, update runs only once after load
// });

// app.on("window-all-closed", () => {
//   if (process.platform !== "darwin") app.quit();
// });





///////////// good if no releasse avoid error + Ask to confirmation to Download


// const { app, BrowserWindow, dialog } = require("electron");
// const path = require("path");
// const fs = require("fs");
// const { autoUpdater } = require("electron-updater");
// const log = require("electron-log");

// let mainWindow;

// function createWindow() {
//   mainWindow = new BrowserWindow({
//     width: 1700,
//     height: 1167,
//     frame: false,
//     transparent: true,
//     webPreferences: {
//       nodeIntegration: true,
//       contextIsolation: true,
//       enableRemoteModule: false,
//       webviewTag: true,
//     },
//     autoHideMenuBar: true,
//     backgroundColor: "#00000000",
//   });

//   mainWindow.loadFile(path.join(__dirname, "index.html")).catch((err) => {
//     console.error("Failed to load local HTML:", err);
//   });

//   mainWindow.webContents.on("dom-ready", () => {
//     const imagePath =
//       "file:///C:/Users/jaff/Environments/Alfa/resources/icons/k8s-bg.png";

//     mainWindow.webContents.insertCSS(`
//       * {
//         scrollbar-width: none;
//         -ms-overflow-style: none;
//       }
//       ::-webkit-scrollbar { display: none; }

//       body {
//         background-image: url("${imagePath}");
//         background-size: cover;
//         background-position: center;
//         overflow: hidden !important;
//         margin: 0;
//         height: 100vh;
//         width: 100vw;
//         border-radius: 14px;
//         box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
//         background-color: transparent;
//         font-family: 'Courier New', Courier, monospace;
//       }

//       html {
//         border-radius: 12px;
//         overflow: hidden;
//         background-color: transparent;
//       }
//     `);
//   });

//   setTimeout(() => {
//     mainWindow.loadURL("http://localhost:3535");
//   }, 3000);

//   mainWindow.webContents.on("did-fail-load", (event, code, description) => {
//     console.error(`❌ Failed to load frontend: ${description} (code: ${code})`);
//   });

//   mainWindow.webContents.on("did-finish-load", () => {
//     console.log("✅ Frontend loaded successfully");
//   });

//   mainWindow.on("closed", () => {
//     mainWindow = null;
//   });
// }

// // ✅ Auto updater setup with prompt before downloading
// function setupAutoUpdater() {
//   log.transports.file.level = "info";
//   autoUpdater.logger = log;

//   autoUpdater.autoDownload = false; // Prevent automatic download

//   autoUpdater.on("checking-for-update", () => {
//     log.info("🔍 Checking for update...");
//   });

//   autoUpdater.on("update-available", async (info) => {
//     log.info("⬇️ Update available.", info);

//     const result = await dialog.showMessageBox(mainWindow, {
//       type: "question",
//       buttons: ["Download", "Cancel"],
//       defaultId: 0,
//       cancelId: 1,
//       title: "Update Available",
//       message: "A new update is available. Do you want to download it now?",
//     });

//     if (result.response === 0) {
//       autoUpdater.downloadUpdate();
//     } else {
//       log.info("⏩ User chose not to download the update.");
//     }
//   });

//   autoUpdater.on("update-not-available", (info) => {
//     log.info("✅ No updates available.", info);
//   });

//   autoUpdater.on("download-progress", (progress) => {
//     log.info(`📦 Downloading update: ${Math.floor(progress.percent)}%`);
//   });

//   autoUpdater.on("update-downloaded", () => {
//     log.info("✅ Update downloaded; will install now...");
//     dialog
//       .showMessageBox(mainWindow, {
//         type: "question",
//         buttons: ["Restart Now", "Later"],
//         defaultId: 0,
//         cancelId: 1,
//         title: "Install Update",
//         message: "Update downloaded. Restart app to apply the update?",
//       })
//       .then((result) => {
//         if (result.response === 0) {
//           autoUpdater.quitAndInstall();
//         }
//       });
//   });

//   autoUpdater.on("error", (err) => {
//     log.warn("⚠️ Silent auto-update error:", err?.message || err);
//   });

//   // ✅ Manual check (no download unless user agrees)
//   autoUpdater.checkForUpdates().catch((err) => {
//     log.warn("⚠️ No update found or update server not reachable:", err?.message || err);
//   });
// }

// app.whenReady().then(() => {
//   const serverPath = path.join(__dirname, "server.js");

//   if (!fs.existsSync(serverPath)) {
//     console.error("❌ server.js not found:", serverPath);
//     return;
//   }

//   require(serverPath);
//   createWindow();
//   setupAutoUpdater();
// });

// app.on("window-all-closed", () => {
//   if (process.platform !== "darwin") app.quit();
// });





///////////// good if no releasse avoid error

// const { app, BrowserWindow, dialog } = require("electron");
// const path = require("path");
// const fs = require("fs");
// const { autoUpdater } = require("electron-updater");
// const log = require("electron-log");

// let mainWindow;

// function createWindow() {
//   mainWindow = new BrowserWindow({
//     width: 1700,
//     height: 1167,
//     frame: false,
//     transparent: true,
//     webPreferences: {
//       nodeIntegration: true,
//       contextIsolation: true,
//       enableRemoteModule: false,
//       webviewTag: true,
//     },
//     autoHideMenuBar: true,
//     backgroundColor: "#00000000",
//   });

//   mainWindow.loadFile(path.join(__dirname, "index.html")).catch((err) => {
//     console.error("Failed to load local HTML:", err);
//   });

//   mainWindow.webContents.on("dom-ready", () => {
//     const imagePath =
//       "file:///C:/Users/jaff/Environments/Alfa/resources/icons/k8s-bg.png";

//     mainWindow.webContents.insertCSS(`
//       * {
//         scrollbar-width: none;
//         -ms-overflow-style: none;
//       }
//       ::-webkit-scrollbar { display: none; }

//       body {
//         background-image: url("${imagePath}");
//         background-size: cover;
//         background-position: center;
//         overflow: hidden !important;
//         margin: 0;
//         height: 100vh;
//         width: 100vw;
//         border-radius: 14px;
//         box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
//         background-color: transparent;
//         font-family: 'Courier New', Courier, monospace;
//       }

//       html {
//         border-radius: 12px;
//         overflow: hidden;
//         background-color: transparent;
//       }
//     `);
//   });

//   setTimeout(() => {
//     mainWindow.loadURL("http://localhost:3535");
//   }, 3000);

//   mainWindow.webContents.on("did-fail-load", (event, code, description) => {
//     console.error(`❌ Failed to load frontend: ${description} (code: ${code})`);
//   });

//   mainWindow.webContents.on("did-finish-load", () => {
//     console.log("✅ Frontend loaded successfully");
//   });

//   mainWindow.on("closed", () => {
//     mainWindow = null;
//   });
// }

// // ✅ Auto updater setup with safe error handling
// function setupAutoUpdater() {
//   log.transports.file.level = "info";
//   autoUpdater.logger = log;

//   autoUpdater.on("checking-for-update", () => {
//     log.info("🔍 Checking for update...");
//   });

//   autoUpdater.on("update-available", (info) => {
//     log.info("⬇️ Update available.", info);
//     dialog.showMessageBox(mainWindow, {
//       type: "info",
//       title: "Update Available",
//       message: "A new update is available and will be downloaded.",
//     });
//   });

//   autoUpdater.on("update-not-available", (info) => {
//     log.info("✅ No updates available.", info);
//   });

//   autoUpdater.on("download-progress", (progress) => {
//     log.info(`📦 Downloading update: ${Math.floor(progress.percent)}%`);
//   });

//   autoUpdater.on("update-downloaded", () => {
//     log.info("✅ Update downloaded; will install now...");
//     dialog
//       .showMessageBox(mainWindow, {
//         type: "question",
//         buttons: ["Restart Now", "Later"],
//         defaultId: 0,
//         cancelId: 1,
//         title: "Install Update",
//         message: "Update downloaded. Restart app to apply the update?",
//       })
//       .then((result) => {
//         if (result.response === 0) {
//           autoUpdater.quitAndInstall();
//         }
//       });
//   });

//   autoUpdater.on("error", (err) => {
//     // Only log update errors silently — no popup
//     log.warn("⚠️ Silent auto-update error:", err?.message || err);
//   });

//   // ✅ Safely check for updates, no crash even if offline or no release
//   autoUpdater.checkForUpdatesAndNotify().catch((err) => {
//     log.warn("⚠️ No update found or update server not reachable:", err?.message || err);
//   });
// }

// app.whenReady().then(() => {
//   const serverPath = path.join(__dirname, "server.js");

//   if (!fs.existsSync(serverPath)) {
//     console.error("❌ server.js not found:", serverPath);
//     return;
//   }

//   require(serverPath);
//   createWindow();
//   setupAutoUpdater();
// });

// app.on("window-all-closed", () => {
//   if (process.platform !== "darwin") app.quit();
// });


////////////////////////////




// const { app, BrowserWindow, dialog } = require("electron");
// const path = require("path");
// const fs = require("fs");
// const { autoUpdater } = require("electron-updater");
// const log = require("electron-log");

// let mainWindow;

// function createWindow() {
//   mainWindow = new BrowserWindow({
//     width: 1700,
//     height: 1167,
//     frame: false,
//     transparent: true,
//     webPreferences: {
//       nodeIntegration: true,
//       contextIsolation: true,
//       enableRemoteModule: false,
//       webviewTag: true,
//     },
//     autoHideMenuBar: true,
//     backgroundColor: "#00000000",
//   });

//   mainWindow.loadFile(path.join(__dirname, "index.html")).catch((err) => {
//     console.error("Failed to load local HTML:", err);
//   });

//   mainWindow.webContents.on("dom-ready", () => {
//     const imagePath =
//       "file:///C:/Users/jaff/Environments/Alfa/resources/icons/k8s-bg.png";

//     mainWindow.webContents.insertCSS(`
//       * {
//         scrollbar-width: none;
//         -ms-overflow-style: none;
//       }
//       ::-webkit-scrollbar { display: none; }

//       body {
//         background-image: url("${imagePath}");
//         background-size: cover;
//         background-position: center;
//         overflow: hidden !important;
//         margin: 0;
//         height: 100vh;
//         width: 100vw;
//         border-radius: 14px;
//         box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
//         background-color: transparent;
//         font-family: 'Courier New', Courier, monospace;
//       }

//       html {
//         border-radius: 12px;
//         overflow: hidden;
//         background-color: transparent;
//       }
//     `);
//   });

//   setTimeout(() => {
//     mainWindow.loadURL("http://localhost:3535");
//   }, 3000);

//   mainWindow.webContents.on("did-fail-load", (event, code, description) => {
//     console.error(`❌ Failed to load frontend: ${description} (code: ${code})`);
//   });

//   mainWindow.webContents.on("did-finish-load", () => {
//     console.log("✅ Frontend loaded successfully");
//   });

//   mainWindow.on("closed", () => {
//     mainWindow = null;
//   });
// }

// // Auto updater setup
// function setupAutoUpdater() {
//   log.transports.file.level = "info";
//   autoUpdater.logger = log;

//   autoUpdater.on("checking-for-update", () => {
//     log.info("🔍 Checking for update...");
//   });

//   autoUpdater.on("update-available", (info) => {
//     log.info("⬇️ Update available.", info);
//     dialog.showMessageBox(mainWindow, {
//       type: "info",
//       title: "Update Available",
//       message: "A new update is available and will be downloaded.",
//     });
//   });

//   autoUpdater.on("update-not-available", (info) => {
//     log.info("✅ No updates available.", info);
//     dialog.showMessageBox(mainWindow, {
//       type: "info",
//       title: "No Update",
//       message: "You are using the latest version.",
//     });
//   });

//   autoUpdater.on("error", (err) => {
//     log.error("❌ Error in auto-updater.", err);
//     dialog.showErrorBox("Update error", err == null ? "unknown" : (err.stack || err).toString());
//   });

//   autoUpdater.on("download-progress", (progress) => {
//     log.info(`📦 Downloading update: ${Math.floor(progress.percent)}%`);
//   });

//   autoUpdater.on("update-downloaded", () => {
//     log.info("✅ Update downloaded; will install now...");
//     dialog
//       .showMessageBox(mainWindow, {
//         type: "question",
//         buttons: ["Restart Now", "Later"],
//         defaultId: 0,
//         cancelId: 1,
//         title: "Install Update",
//         message: "Update downloaded. Restart app to apply the update?",
//       })
//       .then((result) => {
//         if (result.response === 0) {
//           autoUpdater.quitAndInstall();
//         }
//       });
//   });

// //  autoUpdater.checkForUpdatesAndNotify();

//   // ✅ Safe update check with error catch to avoid crash
//   autoUpdater.checkForUpdatesAndNotify().catch(err => {
//     log.warn("⚠️ No update found or releases missing:", err.message);
//   });

// }

// app.whenReady().then(() => {
//   const serverPath = path.join(__dirname, "server.js");

//   if (!fs.existsSync(serverPath)) {
//     console.error("❌ server.js not found:", serverPath);
//     return;
//   }

//   require(serverPath);
//   createWindow();
//   setupAutoUpdater();
// });

// app.on("window-all-closed", () => {
//   if (process.platform !== "darwin") app.quit();
// });



///////////////////

///#222222

// const { app, BrowserWindow, dialog, ipcMain } = require("electron");
// const path = require("path");
// const fs = require("fs");
// const { autoUpdater } = require("electron-updater");
// const log = require("electron-log");

// let mainWindow;
// let updateModal;

// function createWindow() {
//   mainWindow = new BrowserWindow({
//     width: 1700,
//     height: 1167,
//     frame: false,
//     transparent: true,
//     webPreferences: {
//       nodeIntegration: true,
//       contextIsolation: true,
//       enableRemoteModule: false,
//       webviewTag: true,
//     },
//     autoHideMenuBar: true,
//     backgroundColor: "#00000000",
//   });

//   mainWindow.loadFile(path.join(__dirname, "index.html")).catch((err) => {
//     console.error("Failed to load local HTML:", err);
//   });

//   mainWindow.webContents.on("dom-ready", () => {
//     const imagePath =
//       "file:///C:/Users/jaff/Environments/Alfa/resources/icons/k8s-bg.png";

//     mainWindow.webContents.insertCSS(`
//       * {
//         scrollbar-width: none;
//         -ms-overflow-style: none;
//       }
//       ::-webkit-scrollbar { display: none; }

//       body {
//         background-image: url("${imagePath}");
//         background-size: cover;
//         background-position: center;
//         overflow: hidden !important;
//         margin: 0;
//         height: 100vh;
//         width: 100vw;
//         border-radius: 14px;
//         box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
//         background-color: transparent;
//         font-family: 'Courier New', Courier, monospace;
//       }

//       html {
//         border-radius: 12px;
//         overflow: hidden;
//         background-color: transparent;
//       }
//     `);
//   });

//   setTimeout(() => {
//     mainWindow.loadURL("http://localhost:3535");
//   }, 3000);

//   mainWindow.webContents.on("did-fail-load", (event, code, description) => {
//     console.error(`❌ Failed to load frontend: ${description} (code: ${code})`);
//   });

//   mainWindow.webContents.on("did-finish-load", () => {
//     console.log("✅ Frontend loaded successfully");
//   });

//   mainWindow.on("closed", () => {
//     mainWindow = null;
//   });
// }

// function showUpdateModal() {
//   if (updateModal) return;

//   updateModal = new BrowserWindow({
//     width: 400,
//     height: 200,
//     parent: mainWindow,
//     modal: true,
//     show: false,
//     frame: false,
//     resizable: false,
//     backgroundColor: "#222222",
//     webPreferences: {
//       nodeIntegration: true,
//       contextIsolation: false,
//     },
//   });

//   const htmlContent = `
//     <!DOCTYPE html>
//     <html>
//       <head>
//         <meta charset="UTF-8" />
//         <style>
//           body {
//             margin: 0;
//             display: flex;
//             flex-direction: column;
//             justify-content: center;
//             align-items: center;
//             height: 100%;
//             background-color: #222222;
//             color: #ffffff;
//             font-family: sans-serif;
//           }
//           h2 {
//             margin: 0 0 10px;
//           }
//           p {
//             margin: 0 0 20px;
//           }
//           button {
//             background: #00aaff;
//             color: white;
//             border: none;
//             padding: 10px 20px;
//             font-size: 14px;
//             border-radius: 4px;
//             cursor: pointer;
//           }
//           #later {
//             background: #555;
//           }
//           .button-group {
//             display: flex;
//             gap: 10px;
//           }
//         </style>
//       </head>
//       <body>
//         <h2>Update Ready</h2>
//         <p>An update has been downloaded. Restart now to apply?</p>
//         <div class="button-group">
//           <button id="restart">Restart Now</button>
//           <button id="later">Later</button>
//         </div>
//         <script>
//           const { ipcRenderer } = require('electron');
//           document.getElementById('restart').addEventListener('click', () => {
//             ipcRenderer.send('update-restart');
//           });
//           document.getElementById('later').addEventListener('click', () => {
//             window.close();
//           });
//         </script>
//       </body>
//     </html>
//   `;

//   updateModal.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

//   updateModal.once("ready-to-show", () => {
//     updateModal.show();
//   });

//   updateModal.on("closed", () => {
//     updateModal = null;
//   });
// }

// function setupAutoUpdater() {
//   log.transports.file.level = "info";
//   autoUpdater.logger = log;

//   autoUpdater.on("checking-for-update", () => {
//     log.info("🔍 Checking for update...");
//   });

//   autoUpdater.on("update-available", (info) => {
//     log.info("⬇️ Update available.", info);
//     // Show a simple info dialog to notify update available and downloading
//     dialog.showMessageBox(mainWindow, {
//       type: "info",
//       title: "Update Available",
//       message: "A new update is available and will be downloaded.",
//     });
//   });

//   autoUpdater.on("update-not-available", (info) => {
//     log.info("✅ No updates available.", info);
//     // No popup or message needed if no update available — comment out dialog
//     // dialog.showMessageBox(mainWindow, {
//     //   type: "info",
//     //   title: "No Update",
//     //   message: "You are using the latest version.",
//     // });
//   });

//   autoUpdater.on("error", (err) => {
//     log.error("❌ Error in auto-updater.", err);
//     dialog.showErrorBox("Update error", err == null ? "unknown" : (err.stack || err).toString());
//   });

//   autoUpdater.on("download-progress", (progress) => {
//     log.info(`📦 Downloading update: ${Math.floor(progress.percent)}%`);
//   });

//   autoUpdater.on("update-downloaded", () => {
//     log.info("✅ Update downloaded; will install now...");
//     showUpdateModal();
//   });

//   autoUpdater.checkForUpdatesAndNotify();
// }

// ipcMain.on("update-restart", () => {
//   if (updateModal) updateModal.close();
//   autoUpdater.quitAndInstall();
// });

// app.whenReady().then(() => {
//   const serverPath = path.join(__dirname, "server.js");

//   if (!fs.existsSync(serverPath)) {
//     console.error("❌ server.js not found:", serverPath);
//     return;
//   }

//   require(serverPath);
//   createWindow();
//   setupAutoUpdater();
// });

// app.on("window-all-closed", () => {
//   if (process.platform !== "darwin") app.quit();
// });
