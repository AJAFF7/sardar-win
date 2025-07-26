const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");
const fetch = require("node-fetch");

// ✅ Disable GPU and hardware acceleration
app.disableHardwareAcceleration();
app.commandLine.appendSwitch("disable-gpu");
app.commandLine.appendSwitch("disable-software-rasterizer");
app.commandLine.appendSwitch("disable-renderer-backgrounding");
app.commandLine.appendSwitch("disable-background-timer-throttling");
app.commandLine.appendSwitch("disable-backgrounding-occluded-windows");

log.transports.file.level = "info";

let mainWindow;
let updateCheckStarted = false;
let inactivityTimeout;

// 🔁 Wait for frontend server to be ready
async function waitForServer(url, timeout = 8000, interval = 300) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      await fetch(url);
      return true;
    } catch {
      await new Promise((res) => setTimeout(res, interval));
    }
  }
  return false;
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1700,
    height: 1167,
    frame: false,
    transparent: false, // ✅ Turned off transparency (critical for virtual machines)
    backgroundColor: "#000000", // ✅ Solid background to avoid GPU fallback
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: false,
      webviewTag: true,
      // preload: path.join(__dirname, "preload.js"), // Optional
    },
    autoHideMenuBar: true,
  });

  const frontendURL = "http://localhost:3535";
  const isReady = await waitForServer(frontendURL);

  if (isReady) {
    log.info("✓ Frontend server is ready, loading...");
    mainWindow.loadURL(frontendURL);
  } else {
    log.error("❌ Frontend server not ready after timeout.");
    mainWindow.loadURL(
      "data:text/html,<h2 style='color:#fff;background:#000'>Server not ready</h2>",
    );
  }

  const resetInactivityTimer = () => {
    if (inactivityTimeout) clearTimeout(inactivityTimeout);
    inactivityTimeout = setTimeout(() => {
      log.info("⏱ No activity for 5 minutes. Quitting...");
      app.quit();
    }, 300000); // 5 minutes
  };

  mainWindow.webContents.on("before-input-event", resetInactivityTimer);
  mainWindow.webContents.on("cursor-changed", resetInactivityTimer);

  mainWindow.webContents.on("did-finish-load", () => {
    console.log("✓ Frontend loaded successfully");
    resetInactivityTimer();

    if (!updateCheckStarted) {
      updateCheckStarted = true;
      setupAutoUpdater();
    } else {
      autoUpdater.checkForUpdates().catch((err) => {
        log.warn("⚠️ Update check failed on reload:", err?.message || err);
      });
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function setupAutoUpdater() {
  log.transports.file.level = "info";
  autoUpdater.logger = log;
  autoUpdater.autoDownload = false;

  autoUpdater.setFeedURL({
    provider: "github",
    owner: "AJAFF7",
    repo: "sardar",
    releaseType: "release",
    private: true,
    token:
      "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",
  });

  autoUpdater.on("checking-for-update", () =>
    log.info("Checking for update..."),
  );

  autoUpdater.on("update-available", async (info) => {
    log.info("⬇ Update available:", info);

    const result = await dialog.showMessageBox(mainWindow, {
      type: "question",
      buttons: ["Download", "Cancel"],
      defaultId: 0,
      cancelId: 1,
      title: `Update Available V${info.version}`,
      message: `New update V${info.version} is available. Do you want to download it now?`,
    });

    if (result.response === 0) {
      autoUpdater.downloadUpdate();
    } else {
      log.info("➡ User declined update.");
    }
  });

  autoUpdater.on("update-not-available", (info) => {
    log.info("✓ No updates available.", info);
  });

  autoUpdater.on("download-progress", (progress) => {
    log.info(`📦 Downloading update: ${Math.floor(progress.percent)}%`);
  });

  autoUpdater.on("update-downloaded", () => {
    log.info("✓ Update downloaded.");
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

  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((err) => {
      log.warn("⚠️ Initial update check failed:", err?.message || err);
    });
  }, 1000);
}

app.whenReady().then(() => {
  const serverPath = path.join(__dirname, "server.js");

  if (!fs.existsSync(serverPath)) {
    console.error("✗ server.js not found:", serverPath);
    return;
  }

  require(serverPath);
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

module.exports.log = log;

///////////////

// const { app, BrowserWindow, dialog, ipcMain } = require("electron");
// const path = require("path");
// const fs = require("fs");
// const { autoUpdater } = require("electron-updater");
// const log = require("electron-log");
// const fetch = require("node-fetch"); // Ensure this is installed

// log.transports.file.level = "info";

// let mainWindow;
// let updateCheckStarted = false;
// let inactivityTimeout;

// // 🔁 Wait for frontend server to be ready
// async function waitForServer(url, timeout = 8000, interval = 300) {
//   const start = Date.now();
//   while (Date.now() - start < timeout) {
//     try {
//       await fetch(url);
//       return true;
//     } catch {
//       await new Promise((res) => setTimeout(res, interval));
//     }
//   }
//   return false;
// }

// async function createWindow() {
//   mainWindow = new BrowserWindow({
//     width: 1700,
//     height: 1167,
//     frame: false,
//     transparent: true, // ❌ Set to false to remove transparency
//     webPreferences: {
//       nodeIntegration: true,
//       contextIsolation: true,
//       enableRemoteModule: false,
//       webviewTag: true,
//       // preload: path.join(__dirname, "preload.js"), // 🔴 Removed preload
//     },
//     autoHideMenuBar: true,
//     backgroundColor: "#00000000",
//   });

//   const frontendURL = "http://localhost:3535";
//   const isReady = await waitForServer(frontendURL);

//   if (isReady) {
//     log.info("✓ Frontend server is ready, loading...");
//     mainWindow.loadURL(frontendURL);
//   } else {
//     log.error("❌ Frontend server not ready after timeout.");
//     mainWindow.loadURL(
//       "data:text/html,<h2 style='color:#fff;background:#000'>Server not ready</h2>",
//     );
//   }

//   const resetInactivityTimer = () => {
//     if (inactivityTimeout) clearTimeout(inactivityTimeout);
//     inactivityTimeout = setTimeout(() => {
//       log.info("⏱ No activity for 5 minutes. Quitting...");
//       app.quit();
//     }, 300000); // 5 minutes
//   };

//   mainWindow.webContents.on("before-input-event", resetInactivityTimer);
//   mainWindow.webContents.on("cursor-changed", resetInactivityTimer);

//   mainWindow.webContents.on("did-finish-load", () => {
//     console.log("✓ Frontend loaded successfully");

//     resetInactivityTimer();

//     // Removed ipcRenderer usage
//     if (!updateCheckStarted) {
//       updateCheckStarted = true;
//       setupAutoUpdater();
//     } else {
//       autoUpdater.checkForUpdates().catch((err) => {
//         log.warn("⚠️ Update check failed on reload:", err?.message || err);
//       });
//     }
//   });

//   mainWindow.on("closed", () => {
//     mainWindow = null;
//   });
// }

// // 🔴 Removed ipcMain "user-activity" listener since there's no preload to emit it

// function setupAutoUpdater() {
//   log.transports.file.level = "info";
//   autoUpdater.logger = log;
//   autoUpdater.autoDownload = false;

//   // ✅ SET FEED URL WITH TOKEN
//     autoUpdater.setFeedURL({
//       provider: "github",
//       owner: "AJAFF7",
//       repo: "sardar",
//       releaseType: "release",
//       private: true,
//       token: "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"
//     });

//   autoUpdater.on("checking-for-update", () => {
//     log.info("Checking for update...");
//   });

//   autoUpdater.on("update-available", async (info) => {
//     log.info("⬇ Update available:", info);

//     const result = await dialog.showMessageBox(mainWindow, {
//       type: "question",
//       buttons: ["Download", "Cancel"],
//       defaultId: 0,
//       cancelId: 1,
//       title: `Update Available V${info.version}`,
//       message: `New update V${info.version} is available. Do you want to download it now?`,
//     });

//     if (result.response === 0) {
//       autoUpdater.downloadUpdate();
//     } else {
//       log.info("➡ User declined update.");
//     }
//   });

//   autoUpdater.on("update-not-available", (info) => {
//     log.info("✓ No updates available.", info);
//   });

//   autoUpdater.on("download-progress", (progress) => {
//     log.info(`📦 Downloading update: ${Math.floor(progress.percent)}%`);
//   });

//   autoUpdater.on("update-downloaded", () => {
//     log.info("✓ Update downloaded.");

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

//   setTimeout(() => {
//     autoUpdater.checkForUpdates().catch((err) => {
//       log.warn("⚠️ Initial update check failed:", err?.message || err);
//     });
//   }, 1000);
// }

// app.whenReady().then(() => {
//   const serverPath = path.join(__dirname, "server.js");

//   if (!fs.existsSync(serverPath)) {
//     console.error("✗ server.js not found:", serverPath);
//     return;
//   }

//   require(serverPath);
//   createWindow();
// });

// app.on("window-all-closed", () => {
//   if (process.platform !== "darwin") app.quit();
// });

// module.exports.log = log;

/////////////
