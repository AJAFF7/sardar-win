const express = require("express");
const { exec } = require("child_process");
//const http = require("http");
const { Server } = require("socket.io");

const path = require("path");
const cors = require("cors");
const dns = require("dns").promises;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");
const Pauth_Model1 = require("./models/Auth");
const ping = require("ping");
const { networkInterfaces } = require("os");
const os = require("os");
const pLimit = require("p-limit");
const si = require("systeminformation");
const osu = require("node-os-utils");
const netstat = osu.netstat; // ✅ Make sure this is used

//const server = http.createServer(app); // ✅ Create server AFTER express app

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const http = require("http");
// const socketIO = require("socket.io");

// const server = http.createServer(app);

const app = express();
const port = 3535;

const server = http.createServer(app);
//const io = socketIO(server);

// Middleware
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(express.static(path.join(__dirname, "build")));
app.options("*", cors()); // Handle CORS preflight

// const log = require("electron-log"); // Use electron-log here

// const log = require("electron-log");

// Logging setup with pinned logs
const memoryLogs = [];
const logTimeouts = [];
const LOG_EXPIRY_MS = 15 * 1000;

const pinnedLogs = [
  `✓ Server running at: http://localhost:${port}`,
  "✓ MongoDB connected",
];

const log = {
  info: (...args) => {
    const message = args.join(" ");
    memoryLogs.push(message);

    if (!pinnedLogs.includes(message)) {
      const timeout = setTimeout(() => {
        const index = memoryLogs.indexOf(message);
        if (index > -1) memoryLogs.splice(index, 1);
      }, LOG_EXPIRY_MS);
      logTimeouts.push(timeout);
    }

    if (memoryLogs.length > 1000) {
      const removed = memoryLogs.shift();
      const t = logTimeouts.shift();
      if (t) clearTimeout(t);
    }

    console.log("INFO:", message);
  },

  warn: (...args) => {
    const message = args.join(" ");
    memoryLogs.push(message);

    const timeout = setTimeout(() => {
      const index = memoryLogs.indexOf(message);
      if (index > -1) memoryLogs.splice(index, 1);
    }, LOG_EXPIRY_MS);
    logTimeouts.push(timeout);

    if (memoryLogs.length > 1000) {
      const removed = memoryLogs.shift();
      const t = logTimeouts.shift();
      if (t) clearTimeout(t);
    }

    console.warn("WARN:", message);
  },

  error: (...args) => {
    const message = args.join(" ");
    memoryLogs.push(message);

    const timeout = setTimeout(() => {
      const index = memoryLogs.indexOf(message);
      if (index > -1) memoryLogs.splice(index, 1);
    }, LOG_EXPIRY_MS);
    logTimeouts.push(timeout);

    if (memoryLogs.length > 1000) {
      const removed = memoryLogs.shift();
      const t = logTimeouts.shift();
      if (t) clearTimeout(t);
    }

    console.error("ERROR:", message);
  },
};

// Logs endpoint
app.get("/api/logs", (req, res) => {
  res.json({ logs: memoryLogs.join("\n") });
});

// Database
mongoose
  .connect(
    "mongodb+srv://ajsengineer:mdb5550140@clients.dzqygjh.mongodb.net/?retryWrites=true&w=majority&appName=Clients",
  )
  .then(() => log.info("✓ MongoDB connected"))
  .catch((err) => log.error("✗ MongoDB error:", err.message));

// Auth routes
app.post("/personal1-regis", async (req, res) => {
  const { username, password } = req.body;
  const existing = await Pauth_Model1.findOne({ username });
  if (existing)
    return res.status(400).json({ message: "Username already exists" });

  const hashed = await bcrypt.hash(password, 10);
  const newUser = new Pauth_Model1({ username, password: hashed });
  await newUser.save();
  res.json({ message: "User registered successfully" });
});

app.post("/personal1-login", async (req, res) => {
  const { username, password } = req.body;
  const user = await Pauth_Model1.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res
      .status(400)
      .json({ message: "Username or password is incorrect" });
  }

  const token = jwt.sign({ id: user._id }, "dms_secret");
  log.info(`✓ ${username} logged in  ID ${user._id}`);
  res.json({ token, userID: user._id });
});

app.get("/get-username/:userID", async (req, res) => {
  try {
    const user = await Pauth_Model1.findById(req.params.userID);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ username: user.username });
  } catch (error) {
    log.error("Error in get-username:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("token").json({ message: "Logged out successfully" });
});

app.delete("/p1-auths/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid ObjectId format" });
    }

    const result = await Pauth_Model1.deleteOne({ _id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    log.error("Error deleting user:", err);
    res.status(500).json({ message: err.message });
  }
});

// // Device check API
// app.post("/api/check-device", async (req, res) => {
//   const { ip } = req.body;

//   if (!ip || !/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
//     const msg = `Invalid IP address received: ${ip}`;
//     log.warn(msg);
//     return res.status(400).json({ error: "Invalid IP address" });
//   }

//   try {
//     log.info(`Checking device at IP: ${ip}`);
//     const response = await fetch(`http://${ip}`, {
//       method: "GET",
//       timeout: 3000,
//     });

//     if (!response.ok) {
//       const msg = `Device at ${ip} responded with status: ${response.status}`;
//       log.warn(msg);
//       return res.status(500).json({ error: "unreachable" });
//     }

//     log.info(`Device at ${ip} is reachable.`);
//     return res.json({ success: true, url: `http://${ip}` });
//   } catch (error) {
//     log.error(`Device at ${ip} is unreachable`);
//     return res.status(500).json({ error: "Could not connect to device" });
//   }
// });

///////////
/// Api Check-device

// app.post("/api/check-device", async (req, res) => {
//   const { ip } = req.body;

//   if (!ip || !/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
//     log.warn(`Invalid IP: ${ip}`);
//     return res.status(400).json({ error: "Invalid IP address" });
//   }

//   try {
//     const controller = new AbortController();
//     const timeoutId = setTimeout(() => controller.abort(), 3000);

//     const response = await fetch(`http://${ip}/main.html`, {
//       method: "GET",
//       headers: {
//         Host: ip, // ✅ Required by many embedded devices
//         "User-Agent":
//           "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
//         Accept: "text/html",
//         Connection: "keep-alive",
//       },
//       signal: controller.signal,
//     });

//     clearTimeout(timeoutId);

//     if (!response.ok) {
//       log.warn(`Device ${ip} responded with status: ${response.status}`);
//       return res.status(500).json({ error: "unreachable" });
//     }

//     const html = await response.text();
//     log.info(`Device ${ip} is reachable`);
//     return res.json({ success: true, html });
//   } catch (error) {
//     log.error(`Device ${ip} is unreachable or failed: ${error.message}`);
//     return res.status(500).json({ error: "Could not connect to device" });
//   }
// });

// app.post("/api/logs/window", (req, res) => {
//   const { device, action } = req.body;
//   if (device && action) {
//     log.info(`✓ Window ${action} for device: ${device}`);
//     res.status(200).send({ message: "Log received" });
//   } else {
//     res.status(400).send({ message: "Missing device or action" });
//   }
// });

// // Window log
// app.post("/api/logs/window", (req, res) => {
//   const { device, action } = req.body;
//   if (device && action) {
//     log.info(`✓ Window ${action} for device: ${device}`);
//     res.status(200).send({ message: "Log received" });
//   } else {
//     res.status(400).send({ message: "Missing device or action" });
//   }
// });

///////////
// Device scanning
// const subnets = ["192.168.1.", "192.168.0."];
// let previousDevices = new Map();
// let offlineDevices = new Map();
// let deviceTimestamps = new Map();

// const MAX_CONCURRENCY = 50;
// const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
// const limit = pLimit(MAX_CONCURRENCY);

// const macCache = new Map();
// const dnsCache = new Map();

// function getCachedOrFetch(cache, key, fetchFn) {
//   const now = Date.now();
//   const entry = cache.get(key);
//   if (entry && now - entry.timestamp < CACHE_TTL) {
//     return Promise.resolve(entry.value);
//   }
//   return fetchFn().then((value) => {
//     cache.set(key, { value, timestamp: now });
//     return value;
//   });
// }

// function getMAC(ip) {
//   return getCachedOrFetch(
//     macCache,
//     ip,
//     () =>
//       new Promise((resolve) => {
//         exec(`arp -n ${ip}`, (err, stdout) => {
//           if (err) return resolve("unknown");
//           const macMatch = stdout.match(/(([0-9a-f]{2}:){5}[0-9a-f]{2})/i);
//           resolve(macMatch ? macMatch[0] : "unknown");
//         });
//       }),
//   );
// }

// function getHostname(ip) {
//   return getCachedOrFetch(dnsCache, ip, () =>
//     dns
//       .reverse(ip)
//       .then((hosts) => hosts[0])
//       .catch(() => "unknown"),
//   );
// }

// async function scanNetwork() {
//   const devices = [];
//   const tasks = [];

//   for (const subnet of subnets) {
//     for (let i = 1; i <= 254; i++) {
//       const ip = subnet + i;
//       const task = limit(async () => {
//         try {
//           const res = await ping.promise.probe(ip, { timeout: 1 });
//           if (res.alive) {
//             await new Promise((r) => setTimeout(r, 50));
//             const now = new Date().toISOString();

//             const [mac, hostname] = await Promise.all([
//               getMAC(ip),
//               getHostname(ip),
//             ]);

//             devices.push({
//               ip,
//               mac,
//               hostname,
//               status: "online",
//               connectedAt: deviceTimestamps.get(ip)?.connectedAt || now,
//             });

//             const prev = deviceTimestamps.get(ip) || {};
//             deviceTimestamps.set(ip, {
//               connectedAt: prev.connectedAt || now,
//               disconnectedAt: null,
//             });
//           }
//         } catch {}
//       });
//       tasks.push(task);
//     }
//   }

//   await Promise.all(tasks);
//   return devices;
// }

// app.get("/devices", async (req, res) => {
//   try {
//     const currentDevices = await scanNetwork();
//     const currentMap = new Map();
//     currentDevices.forEach((d) => currentMap.set(d.ip, d));

//     for (const [ip, device] of previousDevices.entries()) {
//       if (!currentMap.has(ip) && !offlineDevices.has(ip)) {
//         const timestamp = new Date().toISOString();
//         offlineDevices.set(ip, {
//           ...device,
//           status: "offline",
//           disconnectedAt: timestamp,
//           connectedAt: deviceTimestamps.get(ip)?.connectedAt || null,
//         });

//         const prev = deviceTimestamps.get(ip) || {};
//         deviceTimestamps.set(ip, {
//           connectedAt: prev.connectedAt || null,
//           disconnectedAt: timestamp,
//         });
//       }
//     }

//     for (const ip of offlineDevices.keys()) {
//       if (currentMap.has(ip)) {
//         offlineDevices.delete(ip);
//         const now = new Date().toISOString();
//         const prev = deviceTimestamps.get(ip) || {};
//         deviceTimestamps.set(ip, {
//           connectedAt: prev.connectedAt || now,
//           disconnectedAt: null,
//         });
//       }
//     }

//     previousDevices = currentMap;

//     const disconnectedDevices = Array.from(offlineDevices.values()).map(
//       (device) => {
//         const timestamps = deviceTimestamps.get(device.ip) || {};
//         return {
//           ...device,
//           connectedAt: timestamps.connectedAt || null,
//           disconnectedAt: timestamps.disconnectedAt || null,
//         };
//       },
//     );

//     res.json({
//       connectedDevices: currentDevices,
//       disconnectedDevices,
//     });
//   } catch (error) {
//     log.error("Error scanning network:", error);
//     res.status(500).json({ error: "Failed to scan network" });
//   }
// });

// // Cleanup cache every hour
// setInterval(
//   () => {
//     const now = Date.now();
//     [macCache, dnsCache].forEach((cache) => {
//       for (const [key, { timestamp }] of cache.entries()) {
//         if (now - timestamp > CACHE_TTL) {
//           cache.delete(key);
//         }
//       }
//     });
//   },
//   60 * 60 * 1000,
// );

///////////////
// const subnets = ["192.168.1.", "192.168.0."];
// let previousDevices = new Map();
// let offlineDevices = new Map();
// let deviceTimestamps = new Map(); // Tracks online/offline times

// // Helper to get MAC address using 'arp -n <ip>' system command (Linux/macOS)
// function getMAC(ip) {
//   return new Promise((resolve) => {
//     exec(`arp -n ${ip}`, (err, stdout) => {
//       if (err) return resolve("unknown");
//       const macMatch = stdout.match(/(([0-9a-f]{2}:){5}[0-9a-f]{2})/i);
//       resolve(macMatch ? macMatch[0] : "unknown");
//     });
//   });
// }

// async function scanNetwork() {
//   const devices = [];
//   const pingPromises = [];

//   for (const subnet of subnets) {
//     for (let i = 1; i <= 254; i++) {
//       const ip = subnet + i;

//       const p = (async () => {
//         try {
//           const res = await ping.promise.probe(ip, { timeout: 1 });
//           if (res.alive) {
//             await new Promise((r) => setTimeout(r, 200));
//             const [mac, hostname] = await Promise.all([
//               getMAC(ip),
//               dns
//                 .reverse(ip)
//                 .then((hosts) => hosts[0])
//                 .catch(() => "unknown"),
//             ]);

//             const now = new Date().toISOString();

//             devices.push({
//               ip,
//               mac,
//               hostname,
//               status: "online",
//               connectedAt: deviceTimestamps.get(ip)?.connectedAt || now,
//             });

//             const prev = deviceTimestamps.get(ip) || {};
//             deviceTimestamps.set(ip, {
//               connectedAt: prev.connectedAt || now,
//               disconnectedAt: null,
//             });
//           }
//         } catch {
//           // ignore errors here
//         }
//       })();

//       pingPromises.push(p);
//     }
//   }

//   await Promise.all(pingPromises);
//   return devices;
// }

// app.get("/devices", async (req, res) => {
//   try {
//     const currentDevices = await scanNetwork();
//     const currentMap = new Map();
//     currentDevices.forEach((d) => currentMap.set(d.ip, d));

//     for (const [ip, device] of previousDevices.entries()) {
//       if (!currentMap.has(ip)) {
//         if (!offlineDevices.has(ip)) {
//           const timestamp = new Date().toISOString();

//           offlineDevices.set(ip, {
//             ...device,
//             status: "offline",
//             disconnectedAt: timestamp,
//             connectedAt: deviceTimestamps.get(ip)?.connectedAt || null,
//           });

//           const prev = deviceTimestamps.get(ip) || {};
//           deviceTimestamps.set(ip, {
//             connectedAt: prev.connectedAt || null,
//             disconnectedAt: timestamp,
//           });
//         }
//       }
//     }

//     for (const ip of offlineDevices.keys()) {
//       if (currentMap.has(ip)) {
//         offlineDevices.delete(ip);
//         const now = new Date().toISOString();
//         const prev = deviceTimestamps.get(ip) || {};
//         deviceTimestamps.set(ip, {
//           connectedAt: prev.connectedAt || now,
//           disconnectedAt: null,
//         });
//       }
//     }

//     previousDevices = currentMap;

//     const disconnectedDevices = Array.from(offlineDevices.values()).map(
//       (device) => {
//         const timestamps = deviceTimestamps.get(device.ip) || {};
//         return {
//           ...device,
//           connectedAt: timestamps.connectedAt || null,
//           disconnectedAt: timestamps.disconnectedAt || null,
//         };
//       },
//     );

//     res.json({
//       connectedDevices: currentDevices,
//       disconnectedDevices,
//     });
//   } catch (error) {
//     log.error("Error scanning network:", error);
//     res.status(500).json({ error: "Failed to scan network" });
//   }
// });

////////////////
// let cachedOSInfo = null;

// async function getSystemStats() {
//   if (!cachedOSInfo) {
//     cachedOSInfo = await si.osInfo(); // Only once
//   }

//   const [cpu, memory, battery, temp, disks] = await Promise.all([
//     si.currentLoad(), // Keep if needed
//     si.mem(),
//     si.battery(),
//     si.cpuTemperature(), // Optional
//     si.fsSize(),
//   ]);

//   return {
//     cpu: {
//       load: cpu.currentLoad,
//       currentLoadUser: cpu.currentLoadUser,
//       currentLoadSystem: cpu.currentLoadSystem,
//     },
//     memory: {
//       total: memory.total,
//       used: memory.used,
//       free: memory.free,
//     },
//     os: cachedOSInfo,
//     battery: {
//       hasBattery: battery.hasBattery,
//       percent: battery.percent,
//       isCharging: battery.isCharging,
//     },
//     temperature: {
//       main: temp.main,
//     },
//     disk: disks.map((disk) => ({
//       fs: disk.fs,
//       type: disk.type,
//       size: disk.size,
//       used: disk.used,
//       use: disk.use,
//       mount: disk.mount,
//     })),
//   };
// }

// app.get("/api/stats", async (req, res) => {
//   try {
//     const stats = await getSystemStats();
//     res.json(stats);
//   } catch (err) {
//     console.error("Error fetching system stats:", err);
//     res.status(500).json({ error: "Failed to fetch stats" });
//   }
// });

let cachedOSInfo = null;

async function getSystemStats() {
  if (!cachedOSInfo) {
    cachedOSInfo = await si.osInfo(); // Only fetch once
  }

  const [cpu, memory, battery, temp, disks] = await Promise.all([
    si.currentLoad(),
    si.mem(),
    si.battery(),
    si.cpuTemperature(),
    si.fsSize(),
  ]);

  return {
    cpu: {
      load: cpu.currentLoad, // Total CPU load
      currentLoadUser: cpu.currentLoadUser, // User processes
      currentLoadSystem: cpu.currentLoadSystem, // System processes
      currentLoadIdle: cpu.currentLoadIdle, // Idle percentage
      cpus: cpu.cpus, // Per-core breakdown
    },
    memory: {
      total: memory.total,
      used: memory.used,
      free: memory.free,
      active: memory.active,
      available: memory.available,
    },
    os: cachedOSInfo,
    battery: {
      hasBattery: battery.hasBattery,
      percent: battery.percent,
      isCharging: battery.isCharging,
      acConnected: battery.acConnected,
    },
    temperature: {
      main: temp.main,
      max: temp.max,
    },
    disk: disks.map((disk) => ({
      fs: disk.fs,
      type: disk.type,
      size: disk.size,
      used: disk.used,
      use: disk.use,
      mount: disk.mount,
    })),
  };
}

app.get("/api/stats", async (req, res) => {
  try {
    const stats = await getSystemStats();
    res.json(stats);
  } catch (err) {
    console.error("Error fetching system stats:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

///////////////

const subnets = ["192.168.1.", "192.168.0."];
let previousDevices = new Map();
let offlineDevices = new Map();
let deviceTimestamps = new Map();

async function scanNetwork() {
  const devices = [];
  const pingPromises = [];

  for (const subnet of subnets) {
    for (let i = 1; i <= 254; i++) {
      const ip = subnet + i;

      const p = (async () => {
        try {
          const res = await ping.promise.probe(ip, { timeout: 1 });
          if (res.alive) {
            const now = new Date().toISOString();

            devices.push({
              ip,
              status: "online",
              connectedAt: deviceTimestamps.get(ip)?.connectedAt || now,
            });

            const prev = deviceTimestamps.get(ip) || {};
            deviceTimestamps.set(ip, {
              connectedAt: prev.connectedAt || now,
              disconnectedAt: null,
            });
          }
        } catch {
          // silent fail
        }
      })();

      pingPromises.push(p);
    }
  }

  await Promise.all(pingPromises);
  return devices;
}

app.get("/devices", async (req, res) => {
  try {
    const currentDevices = await scanNetwork();
    const currentMap = new Map();
    currentDevices.forEach((d) => currentMap.set(d.ip, d));

    // Track disconnected
    for (const [ip, device] of previousDevices.entries()) {
      if (!currentMap.has(ip)) {
        if (!offlineDevices.has(ip)) {
          const timestamp = new Date().toISOString();

          offlineDevices.set(ip, {
            ip,
            status: "offline",
            disconnectedAt: timestamp,
            connectedAt: deviceTimestamps.get(ip)?.connectedAt || null,
          });

          const prev = deviceTimestamps.get(ip) || {};
          deviceTimestamps.set(ip, {
            connectedAt: prev.connectedAt || null,
            disconnectedAt: timestamp,
          });
        }
      }
    }

    // Remove offline if they came back
    for (const ip of offlineDevices.keys()) {
      if (currentMap.has(ip)) {
        offlineDevices.delete(ip);
        const now = new Date().toISOString();
        const prev = deviceTimestamps.get(ip) || {};
        deviceTimestamps.set(ip, {
          connectedAt: prev.connectedAt || now,
          disconnectedAt: null,
        });
      }
    }

    previousDevices = currentMap;

    const disconnectedDevices = Array.from(offlineDevices.values()).map(
      (device) => {
        const timestamps = deviceTimestamps.get(device.ip) || {};
        return {
          ip: device.ip,
          status: "offline",
          connectedAt: timestamps.connectedAt || null,
          disconnectedAt: timestamps.disconnectedAt || null,
        };
      },
    );

    res.json({
      connectedDevices: currentDevices,
      disconnectedDevices,
    });
  } catch (error) {
    console.error("Error scanning network:", error);
    res.status(500).json({ error: "Failed to scan network" });
  }
});

/////////////

const io = require("socket.io")(6565, {
  cors: {
    origin: "*",
  },
});

setInterval(() => {
  const netInterfaces = os.networkInterfaces();
  const stats = [];

  const time = new Date().toLocaleTimeString();

  for (let iface in netInterfaces) {
    const net = netInterfaces[iface].find(
      (n) => n.family === "IPv4" && !n.internal,
    );

    if (net) {
      stats.push({
        time, // time is useful for chart X axis
        iface,
        address: net.address,
        mac: net.mac,
        download: +(Math.random() * 100).toFixed(2), // Mbps (fake)
        upload: +(Math.random() * 50).toFixed(2), // Mbps (fake)
      });
    }
  }

  io.emit("networkStats", stats);
}, 3000);

////////

// Unified endpoint
app.post("/api/clean-memory", (req, res) => {
  const platform = os.platform();

  let command;

  if (platform === "linux") {
    command = `
      sudo sh -c "echo 1 > /proc/sys/vm/drop_caches && echo 2 > /proc/sys/vm/drop_caches && echo 3 > /proc/sys/vm/drop_caches" &&
      sudo sysctl vm.drop_caches=1 &&
      sudo sysctl vm.drop_caches=2 &&
      sudo sysctl vm.drop_caches=3
    `;
  } else if (platform === "win32") {
    command = `powershell -Command "Get-Process | ForEach-Object { try { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($_) > $null } catch {} }; [GC]::Collect(); [GC]::WaitForPendingFinalizers(); [GC]::Collect()"`;
  } else if (platform === "darwin") {
    command = `purge`;
  } else {
    return res.status(400).json({ message: "Unsupported OS platform" });
  }

  exec(command, { windowsHide: true }, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ message: `Error: ${stderr}` });
    }
    res.json({ message: `Memory cleanup triggered on ${platform}` });
  });
});

/////////

// React frontend
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "build", "index.html"));
});

// Start server
app.listen(port, () => {
  log.info(`✓ Server running at: http://localhost:${port}`);
});

///////////////////

// // Endpoint to clean memory For Linux
// app.post("/api/clean-memory", (req, res) => {
//   const command = `
//     sudo sh -c "echo 1 > /proc/sys/vm/drop_caches && echo 2 > /proc/sys/vm/drop_caches && echo 3 > /proc/sys/vm/drop_caches" &&
//     sudo sysctl vm.drop_caches=1 &&
//     sudo sysctl vm.drop_caches=2 &&
//     sudo sysctl vm.drop_caches=3
//   `;

//   const silentCommand = `${command} > /dev/null 2>&1`;

//   exec(silentCommand, (error, stdout, stderr) => {
//     if (error) {
//       return res.status(500).json({ message: `Error: ${stderr}` });
//     }
//     // Response will still be sent but no logs to terminal
//     res.json({ message: "Memory cleaned successfully!" });
//   });
// });

// // Endpoint to clean memory For Windows
// app.post("/api/clean-memory", (req, res) => {
//   // Use PowerShell to empty the working set of all processes
//   const psCommand = `
//     powershell -Command "Get-Process | ForEach-Object { try { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($_) > $null } catch {} }; [GC]::Collect(); [GC]::WaitForPendingFinalizers(); [GC]::Collect()"
//   `;

//   exec(psCommand, { windowsHide: true }, (error, stdout, stderr) => {
//     if (error) {
//       return res.status(500).json({ message: `Error: ${stderr}` });
//     }
//     res.json({ message: "Memory cleanup triggered on Windows!" });
//   });
// });

// // Endpoint to clean memory For Apple
// app.post("/api/clean-memory-mac", (req, res) => {
//   // The purge command tells the OS to free up memory
//   const command = `purge`;

//   exec(command, (error, stdout, stderr) => {
//     if (error) {
//       return res.status(500).json({ message: `Error: ${stderr}` });
//     }
//     res.json({ message: "Memory cleanup triggered on macOS!" });
//   });
// });
