


// /////////////

import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import "./App.css";

const PauseIcon = () => (
  <svg
    width="28"
    height="28"
    fill="#FFA500"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    style={{ marginRight: "5px" }}
  >
    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
  </svg>
);

const PlayIcon = () => (
  <svg
    width="20"
    height="20"
    fill="#98FB98"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    style={{ verticalAlign: "middle" }}
  >
    <path d="M8 5v14l11-7L8 5z" />
  </svg>
);

function backupDeviceData(setStatusMessage) {
  const data = JSON.stringify(localStorage);
  const blob = new Blob([data], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "localStorage_backup.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setStatusMessage(
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.5 }}
      style={{
        color: "#000",
        marginTop: "10px",
        backgroundColor: "#F8F5D7",
        borderRadius: "5px",
        padding: "6px",
        border: "1px solid #aaa",
        display: "inline-block",
      }}
    >
      Backup created successfully!
    </motion.div>,
  );
}

function restoreDeviceData(event, setDevices, setStatusMessage) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const backupData = JSON.parse(e.target.result);
      for (const key in backupData) {
        localStorage.setItem(key, backupData[key]);
      }

      if (backupData.devices) {
        setDevices(JSON.parse(backupData.devices));
      }

      setStatusMessage(
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.5 }}
          style={{
            color: "#000",
            marginTop: "10px",
            backgroundColor: "#DFF0D8",
            borderRadius: "5px",
            padding: "6px",
            border: "1px solid green",
            display: "inline-block",
          }}
        >
          Devices restored from backup!
        </motion.div>,
      );

      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      setStatusMessage(
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.5 }}
          style={{
            color: "red",
            marginTop: "10px",
            backgroundColor: "#F2DEDE",
            borderRadius: "5px",
            padding: "6px",
            border: "1px solid red",
            display: "inline-block",
          }}
        >
          Invalid backup file!
        </motion.div>,
      );
    }
  };
  reader.readAsText(file);
}

const ConnectedDevices = () => {
  const [devices, setDevices] = useState(
    JSON.parse(localStorage.getItem("devices")) || [],
  );
  const [deviceStates, setDeviceStates] = useState(
    JSON.parse(localStorage.getItem("deviceStates")) || {},
  );
  const [newDevice, setNewDevice] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const fileInputRef = useRef(null);
  const openedWindows = useRef({});

  useEffect(() => {
    localStorage.setItem("devices", JSON.stringify(devices));
    localStorage.setItem("deviceStates", JSON.stringify(deviceStates));
  }, [devices, deviceStates]);

  const addDevice = () => {
    const trimmed = newDevice.trim();
    if (!trimmed) return;

    if (devices.includes(trimmed)) {
      setStatusMessage("Device already exists.");
      return;
    }

    setDevices([...devices, trimmed]);
    setNewDevice("");
  };

  const removeDevice = (device) => {
    if (window.confirm(`Delete ${device}?`)) {
      const win = openedWindows.current[device];
      if (win && !win.closed) win.close();
      delete openedWindows.current[device];

      const updated = { ...deviceStates };
      delete updated[device];
      setDeviceStates(updated);
      setDevices(devices.filter((d) => d !== device));
    }
  };

  const logWindowAction = async (device, action) => {
    try {
      await fetch("http://localhost:3535/api/logs/window", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device, action }),
      });
    } catch (error) {
      console.error("Failed to send window log:", error);
    }
  };

  const toggleDeviceState = (device) => {
    const newState = !deviceStates[device];
    setDeviceStates((prev) => ({ ...prev, [device]: newState }));

    if (newState) {
      // Try different URL schemes and ports
      const urlVariations = [
        `http://${device}`, // Default HTTP
        `https://${device}`, // HTTPS
        `http://${device}:8080`, // Common alt port
        `http://${device}:8000`, // Another common port
        `http://${device}:8443`, // HTTPS alt port
        `http://${device}:9000`, // Another common port
        `https://${device}:443`, // Explicit HTTPS port
        `http://${device}:80`, // Explicit HTTP port
      ];

      // Try the first URL (default HTTP)
      let win;
      try {
        win = window.open(urlVariations[0], "_blank", "noopener,noreferrer");

        // Check if window opened successfully after a brief delay
        setTimeout(() => {
          if (win && !win.closed && win.location.href !== "about:blank") {
            openedWindows.current[device] = win;
            logWindowAction(device, "opened");
          }
        }, 100);
      } catch (error) {
        console.error("Failed to open window:", error);
        win = null;
      }

      // If window failed to open or popup was blocked, show multiple URL options
      if (!win || win.closed) {
        setStatusMessage(
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              marginTop: "12px",
              backgroundColor: "#FFFAE5",
              border: "1px solid #F0AD4E",
              borderRadius: "6px",
              padding: "8px",
              color: "#333",
              display: "inline-block",
              maxWidth: "400px",
            }}
          >
            Unable to open device automatically. Try these links:
            <br />
            <div
              style={{
                marginTop: "8px",
                display: "flex",
                flexWrap: "wrap",
                gap: "4px",
              }}
            >
              {urlVariations.map((url, index) => {
                const isHttps = url.includes("https");
                const port =
                  url.includes(":") && !url.match(/:\/\//)
                    ? url.split(":").pop()
                    : "";
                const label = isHttps ? "HTTPS" : "HTTP";
                const portLabel =
                  port && port !== "80" && port !== "443" ? `:${port}` : "";

                return (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#337ab7",
                      textDecoration: "underline",
                      padding: "2px 6px",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "3px",
                      fontSize: "12px",
                      border: "1px solid #dee2e6",
                    }}
                    onClick={() => {
                      // Clear the message when user clicks a link
                      setTimeout(() => setStatusMessage(""), 1000);
                    }}
                  >
                    {label}
                    {portLabel}
                  </a>
                );
              })}
            </div>
            <br />
            <small>Device: {device}</small>
          </motion.div>,
        );
      } else {
        openedWindows.current[device] = win;
        logWindowAction(device, "opened");
      }
    } else {
      const win = openedWindows.current[device];
      if (win && !win.closed) win.close();
      delete openedWindows.current[device];
      logWindowAction(device, "closed");
      setStatusMessage(""); // Clear message when closed
    }
  };

  return (
    <div className="container-b">
      <h2 className="h2b">Connected Devices</h2>

      <div className="services-list">
        {devices.map((device) => (
          <div key={device} className="service-item-ip">
            <span className="service-name">{device}</span>

            <div
              className="play-pause"
              role="button"
              tabIndex={0}
              style={{
                color: deviceStates[device] ? "#FFA500" : "#98FB98",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "14px",
                fontWeight: "bold",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                marginRight: "8px",
                userSelect: "none",
                fontFamily: "Arial, sans-serif",
              }}
              onClick={() => toggleDeviceState(device)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  toggleDeviceState(device);
                }
              }}
              title={deviceStates[device] ? "Pause Device" : "Start Device"}
            >
              {deviceStates[device] ? <PauseIcon /> : <PlayIcon />}
            </div>

            <label className="switch">
              <input
                type="checkbox"
                checked={!!deviceStates[device]}
                readOnly
              />
              <span className="slider" />
            </label>

            <button
              className="delete-btn"
              onClick={() => removeDevice(device)}
              title="Remove Device"
              style={{ marginLeft: "12px" }}
            >
              <img
                src="/trash.png"
                alt="Delete"
                className="submit-img"
                style={{ width: "14px", height: "14px" }}
              />
            </button>
          </div>
        ))}
      </div>

      <div className="add-ip">
        <input
          type="text"
          value={newDevice}
          onChange={(e) => setNewDevice(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addDevice()}
          placeholder="Enter device IP"
          className="service-input"
        />

        <div
          className="backup-b"
          style={{
            position: "relative",
            marginTop: "28px",
            marginLeft: "6px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span onClick={() => backupDeviceData(setStatusMessage)}>
            <img
              src="/backup.png"
              alt="Backup"
              className="submit-img"
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
          </span>

          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={(e) => restoreDeviceData(e, setDevices, setStatusMessage)}
            style={{ display: "none" }}
          />

          <span onClick={() => fileInputRef.current.click()}>
            <img
              src="/restore.png"
              alt="Restore"
              className="submit-img"
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
          </span>
        </div>
      </div>

      {statusMessage && <div className="status-message">{statusMessage}</div>}
    </div>
  );
};

export default ConnectedDevices;

//////////

// import React, { useEffect, useState, useRef } from "react";
// import { motion } from "framer-motion";
// import "./App.css";

// // const PauseIcon = () => (
// //   <svg
// //     width="28"
// //     height="28"
// //     fill="#FFA500"
// //     viewBox="0 0 24 24"
// //     xmlns="http://www.w3.org/2000/svg"
// //     style={{ marginRight: "5px" }}
// //   >
// //     <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
// //   </svg>
// // );

// // const PlayIcon = () => (
// //   <svg
// //     width="20"
// //     height="20"
// //     fill="#98FB98"
// //     viewBox="0 0 24 24"
// //     xmlns="http://www.w3.org/2000/svg"
// //     style={{ verticalAlign: "middle" }}
// //   >
// //     <path d="M8 5v14l11-7L8 5z" />
// //   </svg>
// // );

// const PauseIcon = () => (
//   <svg
//     width="28"
//     height="28"
//     fill="#FFA500"
//     viewBox="0 0 24 24"
//     xmlns="http://www.w3.org/2000/svg"
//     style={{ marginRight: "5px" }}
//   >
//     <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
//   </svg>
// );

// const PlayIcon = () => (
//   <svg
//     width="20"
//     height="20"
//     fill="#98FB98"
//     viewBox="0 0 24 24"
//     xmlns="http://www.w3.org/2000/svg"
//     style={{ verticalAlign: "middle" }}
//   >
//     <path d="M8 5v14l11-7L8 5z" />
//   </svg>
// );


// function backupDeviceData(setStatusMessage) {
//   const data = JSON.stringify(localStorage);
//   const blob = new Blob([data], { type: "application/json" });
//   const a = document.createElement("a");
//   a.href = URL.createObjectURL(blob);
//   a.download = "localStorage_backup.json";
//   document.body.appendChild(a);
//   a.click();
//   document.body.removeChild(a);

//   setStatusMessage(
//     <motion.div
//       initial={{ opacity: 0, x: -50 }}
//       animate={{ opacity: 1, x: 0 }}
//       exit={{ opacity: 0, x: 50 }}
//       transition={{ duration: 0.5 }}
//       style={{
//         color: "#000",
//         marginTop: "10px",
//         backgroundColor: "#F8F5D7",
//         borderRadius: "5px",
//         padding: "6px",
//         border: "1px solid #aaa",
//         display: "inline-block",
//       }}
//     >
//       Backup created successfully!
//     </motion.div>,
//   );
// }

// function restoreDeviceData(event, setDevices, setStatusMessage) {
//   const file = event.target.files[0];
//   if (!file) return;

//   const reader = new FileReader();
//   reader.onload = (e) => {
//     try {
//       const backupData = JSON.parse(e.target.result);
//       for (const key in backupData) {
//         localStorage.setItem(key, backupData[key]);
//       }

//       if (backupData.devices) {
//         setDevices(JSON.parse(backupData.devices));
//       }

//       setStatusMessage(
//         <motion.div
//           initial={{ opacity: 0, x: -50 }}
//           animate={{ opacity: 1, x: 0 }}
//           exit={{ opacity: 0, x: 50 }}
//           transition={{ duration: 0.5 }}
//           style={{
//             color: "#000",
//             marginTop: "10px",
//             backgroundColor: "#DFF0D8",
//             borderRadius: "5px",
//             padding: "6px",
//             border: "1px solid green",
//             display: "inline-block",
//           }}
//         >
//           Devices restored from backup!
//         </motion.div>,
//       );

//       setTimeout(() => window.location.reload(), 500);
//     } catch (error) {
//       setStatusMessage(
//         <motion.div
//           initial={{ opacity: 0, x: -50 }}
//           animate={{ opacity: 1, x: 0 }}
//           exit={{ opacity: 0, x: 50 }}
//           transition={{ duration: 0.5 }}
//           style={{
//             color: "red",
//             marginTop: "10px",
//             backgroundColor: "#F2DEDE",
//             borderRadius: "5px",
//             padding: "6px",
//             border: "1px solid red",
//             display: "inline-block",
//           }}
//         >
//           Invalid backup file!
//         </motion.div>,
//       );
//     }
//   };
//   reader.readAsText(file);
// }

// const ConnectedDevices = () => {
//   const [devices, setDevices] = useState(
//     JSON.parse(localStorage.getItem("devices")) || [],
//   );
//   const [deviceStates, setDeviceStates] = useState(
//     JSON.parse(localStorage.getItem("deviceStates")) || {},
//   );
//   const [newDevice, setNewDevice] = useState("");
//   const [statusMessage, setStatusMessage] = useState("");
//   const fileInputRef = useRef(null);
//   const openedWindows = useRef({});

//   useEffect(() => {
//     localStorage.setItem("devices", JSON.stringify(devices));
//     localStorage.setItem("deviceStates", JSON.stringify(deviceStates));
//   }, [devices, deviceStates]);

//   const addDevice = () => {
//     const trimmed = newDevice.trim();
//     if (!trimmed) return;

//     if (devices.includes(trimmed)) {
//       setStatusMessage("Device already exists.");
//       return;
//     }

//     setDevices([...devices, trimmed]);
//     setNewDevice("");
//   };

//   const removeDevice = (device) => {
//     if (window.confirm(`Delete ${device}?`)) {
//       const win = openedWindows.current[device];
//       if (win && !win.closed) win.close();
//       delete openedWindows.current[device];

//       const updated = { ...deviceStates };
//       delete updated[device];
//       setDeviceStates(updated);
//       setDevices(devices.filter((d) => d !== device));
//     }
//   };

//   const logWindowAction = async (device, action) => {
//     try {
//       await fetch("http://localhost:3535/api/logs/window", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ device, action }),
//       });
//     } catch (error) {
//       console.error("Failed to send window log:", error);
//     }
//   };

//   const toggleDeviceState = (device) => {
//     const newState = !deviceStates[device];
//     setDeviceStates((prev) => ({ ...prev, [device]: newState }));

//     if (newState) {
//       const url = `http://${device}`;
//       const win = window.open(url, "_blank");

//       if (win && !win.closed) {
//         openedWindows.current[device] = win;
//         logWindowAction(device, "opened");
//       } else {
//         // Popup blocked or failed – show clickable fallback
//         setStatusMessage(
//           <motion.div
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.3 }}
//             style={{
//               marginTop: "12px",
//               backgroundColor: "#FFFAE5",
//               border: "1px solid #F0AD4E",
//               borderRadius: "6px",
//               padding: "8px",
//               color: "#333",
//               display: "inline-block",
//             }}
//           >
//             Unable to open device automatically.
//             <br />
//             <a
//               href={url}
//               target="_blank"
//               rel="noopener noreferrer"
//               style={{ color: "#337ab7", textDecoration: "underline" }}
//             >
//               Click here to open {device} manually
//             </a>
//           </motion.div>,
//         );
//       }
//     } else {
//       const win = openedWindows.current[device];
//       if (win && !win.closed) win.close();
//       delete openedWindows.current[device];
//       logWindowAction(device, "closed");
//       setStatusMessage(""); // Clear message when closed
//     }
//   };

//   return (
//     <div className="container-b">
//       <h2 className="h2b">Connected Devices</h2>

//       <div className="services-list">
//         {devices.map((device) => (
//           <div key={device} className="service-item-ip">
//             <span className="service-name">{device}</span>

//             <div
//               className="play-pause"
//               role="button"
//               tabIndex={0}
//               style={{
//                 color: deviceStates[device] ? "#FFA500" : "#98FB98",
//                 width: "20px",
//                 height: "20px",
//                 borderRadius: "50%",
//                 display: "flex",
//                 justifyContent: "center",
//                 alignItems: "center",
//                 fontSize: "14px",
//                 fontWeight: "bold",
//                 backgroundColor: "transparent",
//                 border: "none",
//                 cursor: "pointer",
//                 marginRight: "8px",
//                 userSelect: "none",
//                 fontFamily: "Arial, sans-serif",
//               }}
//               onClick={() => toggleDeviceState(device)}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter" || e.key === " ") {
//                   toggleDeviceState(device);
//                 }
//               }}
//               title={deviceStates[device] ? "Pause Device" : "Start Device"}
//             >
//               {deviceStates[device] ? <PauseIcon /> : <PlayIcon />}
//             </div>

//             <label className="switch">
//               <input
//                 type="checkbox"
//                 checked={!!deviceStates[device]}
//                 readOnly
//               />
//               <span className="slider" />
//             </label>

//             <button
//               className="delete-btn"
//               onClick={() => removeDevice(device)}
//               title="Remove Device"
//               style={{ marginLeft: "12px" }}
//             >
//               <img
//                 src="/trash.png"
//                 alt="Delete"
//                 className="submit-img"
//                 style={{ width: "14px", height: "14px" }}
//               />
//             </button>
//           </div>
//         ))}
//       </div>

//       <div className="add-ip">
//         <input
//           type="text"
//           value={newDevice}
//           onChange={(e) => setNewDevice(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && addDevice()}
//           placeholder="Enter device IP"
//           className="service-input"
//         />

//         <div
//           className="backup-b"
//           style={{
//             position: "relative",
//             marginTop: "28px",
//             marginLeft: "6px",
//             display: "flex",
//             alignItems: "center",
//             gap: "6px",
//           }}
//         >
//           <span onClick={() => backupDeviceData(setStatusMessage)}>
//             <img
//               src="/backup.png"
//               alt="Backup"
//               className="submit-img"
//               style={{ width: "18px", height: "18px", cursor: "pointer" }}
//             />
//           </span>

//           <input
//             type="file"
//             accept=".json"
//             ref={fileInputRef}
//             onChange={(e) => restoreDeviceData(e, setDevices, setStatusMessage)}
//             style={{ display: "none" }}
//           />

//           <span onClick={() => fileInputRef.current.click()}>
//             <img
//               src="/restore.png"
//               alt="Restore"
//               className="submit-img"
//               style={{ width: "18px", height: "18px", cursor: "pointer" }}
//             />
//           </span>
//         </div>
//       </div>

//       {statusMessage && <div className="status-message">{statusMessage}</div>}
//     </div>
//   );
// };

// export default ConnectedDevices;

//////////////

// import React, { useEffect, useState, useRef } from "react";
// import { motion } from "framer-motion";
// import "./App.css";

// const PauseIcon = () => (
//   <svg
//     width="28"
//     height="28"
//     fill="#FFA500"
//     viewBox="0 0 24 24"
//     xmlns="http://www.w3.org/2000/svg"
//     style={{ marginRight: "5px" }}
//   >
//     <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
//   </svg>
// );

// const PlayIcon = () => (
//   <svg
//     width="20"
//     height="20"
//     fill="#98FB98"
//     viewBox="0 0 24 24"
//     xmlns="http://www.w3.org/2000/svg"
//     style={{ verticalAlign: "middle" }}
//   >
//     <path d="M8 5v14l11-7L8 5z" />
//   </svg>
// );

// function backupDeviceData(setStatusMessage) {
//   const data = JSON.stringify(localStorage);
//   const blob = new Blob([data], { type: "application/json" });
//   const a = document.createElement("a");
//   a.href = URL.createObjectURL(blob);
//   a.download = "localStorage_backup.json";
//   document.body.appendChild(a);
//   a.click();
//   document.body.removeChild(a);

//   setStatusMessage(
//     <motion.div
//       initial={{ opacity: 0, x: -50 }}
//       animate={{ opacity: 1, x: 0 }}
//       exit={{ opacity: 0, x: 50 }}
//       transition={{ duration: 0.5 }}
//       style={{
//         color: "#000",
//         marginTop: "10px",
//         backgroundColor: "#F8F5D7",
//         borderRadius: "5px",
//         padding: "6px",
//         border: "1px solid #aaa",
//         display: "inline-block",
//       }}
//     >
//       Backup created successfully!
//     </motion.div>
//   );
// }

// function restoreDeviceData(event, setDevices, setStatusMessage) {
//   const file = event.target.files[0];
//   if (!file) return;

//   const reader = new FileReader();
//   reader.onload = (e) => {
//     try {
//       const backupData = JSON.parse(e.target.result);
//       for (const key in backupData) {
//         localStorage.setItem(key, backupData[key]);
//       }

//       if (backupData.devices) {
//         setDevices(JSON.parse(backupData.devices));
//       }

//       setStatusMessage(
//         <motion.div
//           initial={{ opacity: 0, x: -50 }}
//           animate={{ opacity: 1, x: 0 }}
//           exit={{ opacity: 0, x: 50 }}
//           transition={{ duration: 0.5 }}
//           style={{
//             color: "#000",
//             marginTop: "10px",
//             backgroundColor: "#DFF0D8",
//             borderRadius: "5px",
//             padding: "6px",
//             border: "1px solid green",
//             display: "inline-block",
//           }}
//         >
//           Devices restored from backup!
//         </motion.div>
//       );

//       setTimeout(() => window.location.reload(), 500);
//     } catch (error) {
//       setStatusMessage(
//         <motion.div
//           initial={{ opacity: 0, x: -50 }}
//           animate={{ opacity: 1, x: 0 }}
//           exit={{ opacity: 0, x: 50 }}
//           transition={{ duration: 0.5 }}
//           style={{
//             color: "red",
//             marginTop: "10px",
//             backgroundColor: "#F2DEDE",
//             borderRadius: "5px",
//             padding: "6px",
//             border: "1px solid red",
//             display: "inline-block",
//           }}
//         >
//           Invalid backup file!
//         </motion.div>
//       );
//     }
//   };
//   reader.readAsText(file);
// }

// const ConnectedDevices = () => {
//   const [devices, setDevices] = useState(
//     JSON.parse(localStorage.getItem("devices")) || []
//   );
//   const [deviceStates, setDeviceStates] = useState(
//     JSON.parse(localStorage.getItem("deviceStates")) || {}
//   );
//   const [newDevice, setNewDevice] = useState("");
//   const [statusMessage, setStatusMessage] = useState("");
//   const fileInputRef = useRef(null);
//   const openedWindows = useRef({});

//   useEffect(() => {
//     localStorage.setItem("devices", JSON.stringify(devices));
//     localStorage.setItem("deviceStates", JSON.stringify(deviceStates));
//   }, [devices, deviceStates]);

//   const addDevice = () => {
//     const trimmed = newDevice.trim();
//     if (!trimmed) return;

//     if (devices.includes(trimmed)) {
//       setStatusMessage("Device already exists.");
//       return;
//     }

//     setDevices([...devices, trimmed]);
//     setNewDevice("");
//   };

//   const removeDevice = (device) => {
//     if (window.confirm(`Delete ${device}?`)) {
//       const win = openedWindows.current[device];
//       if (win && !win.closed) win.close();
//       delete openedWindows.current[device];

//       const updated = { ...deviceStates };
//       delete updated[device];
//       setDeviceStates(updated);
//       setDevices(devices.filter((d) => d !== device));
//     }
//   };

//   const logWindowAction = async (device, action) => {
//   try {
//     await fetch("http://localhost:3535/api/logs/window", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ device, action }),
//     });
//   } catch (error) {
//     console.error("Failed to send window log:", error);
//   }
// };

//   const toggleDeviceState = (device) => {
//   const newState = !deviceStates[device];
//   setDeviceStates((prev) => ({ ...prev, [device]: newState }));

//   if (newState) {
//     const win = window.open(`http://${device}`, "_blank");
//     if (win) {
//       openedWindows.current[device] = win;
//       logWindowAction(device, "opened"); // Send "opened" log to server
//     }
//   } else {
//     const win = openedWindows.current[device];
//     if (win && !win.closed) win.close();
//     delete openedWindows.current[device];
//     logWindowAction(device, "closed"); // Send "closed" log to server
//   }
// };

//   return (
//     <div className="container-b">
//       <h2 className="h2b">Connected Devices</h2>

//       <div className="services-list">
//         {devices.map((device) => (
//           <div key={device} className="service-item-ip">
//             <span className="service-name">{device}</span>

//             <div
//               className="play-pause"
//               role="button"
//               tabIndex={0}
//               style={{
//                 color: deviceStates[device] ? "#FFA500" : "#98FB98",
//                 width: "20px",
//                 height: "20px",
//                 borderRadius: "50%",
//                 display: "flex",
//                 justifyContent: "center",
//                 alignItems: "center",
//                 fontSize: "14px",
//                 fontWeight: "bold",
//                 backgroundColor: "transparent",
//                 border: "none",
//                 cursor: "pointer",
//                 marginRight: "8px",
//                 userSelect: "none",
//                 fontFamily: "Arial, sans-serif",
//               }}
//               onClick={() => toggleDeviceState(device)}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter" || e.key === " ") {
//                   toggleDeviceState(device);
//                 }
//               }}
//               title={deviceStates[device] ? "Pause Device" : "Start Device"}
//             >
//               {deviceStates[device] ? <PauseIcon />  : <PlayIcon /> }
//             </div>

//             <label className="switch">
//               <input
//                 type="checkbox"
//                 checked={!!deviceStates[device]}
//                 readOnly
//               />
//               <span className="slider" />
//             </label>

//             <button
//               className="delete-btn"
//               onClick={() => removeDevice(device)}
//               title="Remove Device"
//               style={{ marginLeft: "12px" }}
//             >
//               <img
//                 src="/trash.png"
//                 alt="Delete"
//                 className="submit-img"
//                 style={{ width: "14px", height: "14px" }}
//               />
//             </button>
//           </div>
//         ))}
//       </div>

//       <div className="add-ip">
//         <input
//           type="text"
//           value={newDevice}
//           onChange={(e) => setNewDevice(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && addDevice()}
//           placeholder="Enter device IP"
//           className="service-input"
//         />

//         <div
//           className="backup-b"
//           style={{
//             position: "relative",
//             marginTop: "28px",
//             marginLeft: "6px",
//             display: "flex",
//             alignItems: "center",
//             gap: "6px",
//           }}
//         >
//           <span onClick={() => backupDeviceData(setStatusMessage)}>
//             <img
//               src="/backup.png"
//               alt="Backup"
//               className="submit-img"
//               style={{ width: "18px", height: "18px", cursor: "pointer" }}
//             />
//           </span>

//           <input
//             type="file"
//             accept=".json"
//             ref={fileInputRef}
//             onChange={(e) =>
//               restoreDeviceData(e, setDevices, setStatusMessage)
//             }
//             style={{ display: "none" }}
//           />

//           <span onClick={() => fileInputRef.current.click()}>
//             <img
//               src="/restore.png"
//               alt="Restore"
//               className="submit-img"
//               style={{ width: "18px", height: "18px", cursor: "pointer" }}
//             />
//           </span>
//         </div>
//       </div>

//       {statusMessage && <div className="status-message">{statusMessage}</div>}
//     </div>
//   );
// };

// export default ConnectedDevices;

//////////////////////

// import React, { useEffect, useState, useRef } from "react";
// import { motion } from "framer-motion";
// import "./App.css";

// const PauseIcon = () => (
//   <svg
//     width="28"
//     height="28"
//     fill="#FFA500"
//     viewBox="0 0 24 24"
//     xmlns="http://www.w3.org/2000/svg"
//     style={{ marginRight: "5px" }}
//   >
//     <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
//   </svg>
// );

// const PlayIcon = () => (
//   <svg
//     width="20"
//     height="20"
//     fill="#98FB98"
//     viewBox="0 0 24 24"
//     xmlns="http://www.w3.org/2000/svg"
//     style={{ verticalAlign: "middle" }}
//   >
//     <path d="M8 5v14l11-7L8 5z" />
//   </svg>
// );

// function backupDeviceData(setStatusMessage) {
//   const data = JSON.stringify(localStorage);
//   const blob = new Blob([data], { type: "application/json" });
//   const a = document.createElement("a");
//   a.href = URL.createObjectURL(blob);
//   a.download = "localStorage_backup.json";
//   document.body.appendChild(a);
//   a.click();
//   document.body.removeChild(a);

//   setStatusMessage(
//     <motion.div
//       initial={{ opacity: 0, x: -50 }}
//       animate={{ opacity: 1, x: 0 }}
//       exit={{ opacity: 0, x: 50 }}
//       transition={{ duration: 0.5 }}
//       style={{
//         color: "#000",
//         marginTop: "10px",
//         backgroundColor: "#F8F5D7",
//         borderRadius: "5px",
//         padding: "6px",
//         border: "1px solid #aaa",
//         display: "inline-block",
//       }}
//     >
//       Backup created successfully!
//     </motion.div>
//   );
// }

// function restoreDeviceData(event, setDevices, setStatusMessage) {
//   const file = event.target.files[0];
//   if (!file) return;

//   const reader = new FileReader();
//   reader.onload = (e) => {
//     try {
//       const backupData = JSON.parse(e.target.result);
//       for (const key in backupData) {
//         localStorage.setItem(key, backupData[key]);
//       }

//       if (backupData.devices) {
//         setDevices(JSON.parse(backupData.devices));
//       }

//       setStatusMessage(
//         <motion.div
//           initial={{ opacity: 0, x: -50 }}
//           animate={{ opacity: 1, x: 0 }}
//           exit={{ opacity: 0, x: 50 }}
//           transition={{ duration: 0.5 }}
//           style={{
//             color: "#000",
//             marginTop: "10px",
//             backgroundColor: "#DFF0D8",
//             borderRadius: "5px",
//             padding: "6px",
//             border: "1px solid green",
//             display: "inline-block",
//           }}
//         >
//           Devices restored from backup!
//         </motion.div>
//       );

//       setTimeout(() => window.location.reload(), 500);
//     } catch (error) {
//       setStatusMessage(
//         <motion.div
//           initial={{ opacity: 0, x: -50 }}
//           animate={{ opacity: 1, x: 0 }}
//           exit={{ opacity: 0, x: 50 }}
//           transition={{ duration: 0.5 }}
//           style={{
//             color: "red",
//             marginTop: "10px",
//             backgroundColor: "#F2DEDE",
//             borderRadius: "5px",
//             padding: "6px",
//             border: "1px solid red",
//             display: "inline-block",
//           }}
//         >
//           Invalid backup file!
//         </motion.div>
//       );
//     }
//   };
//   reader.readAsText(file);
// }

// const ConnectedDevices = () => {
//   const [devices, setDevices] = useState(
//     JSON.parse(localStorage.getItem("devices")) || []
//   );
//   const [deviceStates, setDeviceStates] = useState(
//     JSON.parse(localStorage.getItem("deviceStates")) || {}
//   );
//   const [newDevice, setNewDevice] = useState("");
//   const [statusMessage, setStatusMessage] = useState("");
//   const fileInputRef = useRef(null);
//   const openedWindows = useRef({});

//   useEffect(() => {
//     localStorage.setItem("devices", JSON.stringify(devices));
//     localStorage.setItem("deviceStates", JSON.stringify(deviceStates));
//   }, [devices, deviceStates]);

//   const addDevice = () => {
//     const trimmed = newDevice.trim();
//     if (!trimmed) return;

//     if (devices.includes(trimmed)) {
//       setStatusMessage("Device already exists.");
//       return;
//     }

//     setDevices([...devices, trimmed]);
//     setNewDevice("");
//   };

//   const removeDevice = (device) => {
//     if (window.confirm(`Delete ${device}?`)) {
//       const win = openedWindows.current[device];
//       if (win && !win.closed) win.close();
//       delete openedWindows.current[device];

//       const updated = { ...deviceStates };
//       delete updated[device];
//       setDeviceStates(updated);
//       setDevices(devices.filter((d) => d !== device));
//     }
//   };

//   const toggleDeviceState = (device) => {
//     const newState = !deviceStates[device];
//     const updated = { ...deviceStates, [device]: newState };
//     setDeviceStates(updated);

//     if (newState) {
//       const win = window.open(`http://${device}`, "_blank");
//       if (win) openedWindows.current[device] = win;
//     } else {
//       const win = openedWindows.current[device];
//       if (win && !win.closed) win.close();
//       delete openedWindows.current[device];
//     }
//   };

//   return (
//     <div className="container-b">
//       <h2 className="h2b">Connected Devices</h2>

//       <div className="services-list">
//         {devices.map((device) => (
//           <div key={device} className="service-item-ip">
//             <span className="service-name">{device}</span>

//             <div
//               className="play-pause"
//               role="button"
//               tabIndex={0}
//               style={{
//                 color: deviceStates[device] ? "#FFA500" : "#98FB98",
//                 width: "20px",
//                 height: "20px",
//                 borderRadius: "50%",
//                 display: "flex",
//                 justifyContent: "center",
//                 alignItems: "center",
//                 fontSize: "14px",
//                 fontWeight: "bold",
//                 backgroundColor: "transparent",
//                 border: "none",
//                 cursor: "pointer",
//                 marginRight: "8px",
//                 userSelect: "none",
//                 fontFamily: "Arial, sans-serif",
//               }}
//               onClick={() => toggleDeviceState(device)}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter" || e.key === " ") {
//                   toggleDeviceState(device);
//                 }
//               }}
//               title={deviceStates[device] ? "Pause Device" : "Start Device"}
//             >
//               {deviceStates[device] ? <PauseIcon />  : <PlayIcon /> }
//             </div>

//             <label className="switch">
//               <input
//                 type="checkbox"
//                 checked={!!deviceStates[device]}
//                 readOnly
//               />
//               <span className="slider" />
//             </label>

//             <button
//               className="delete-btn"
//               onClick={() => removeDevice(device)}
//               title="Remove Device"
//               style={{ marginLeft: "12px" }}
//             >
//               <img
//                 src="/trash.png"
//                 alt="Delete"
//                 className="submit-img"
//                 style={{ width: "14px", height: "14px" }}
//               />
//             </button>
//           </div>
//         ))}
//       </div>

//       <div className="add-ip">
//         <input
//           type="text"
//           value={newDevice}
//           onChange={(e) => setNewDevice(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && addDevice()}
//           placeholder="Enter device IP"
//           className="service-input"
//         />

//         <div
//           className="backup-b"
//           style={{
//             position: "relative",
//             marginTop: "28px",
//             marginLeft: "6px",
//             display: "flex",
//             alignItems: "center",
//             gap: "6px",
//           }}
//         >
//           <span onClick={() => backupDeviceData(setStatusMessage)}>
//             <img
//               src="/backup.png"
//               alt="Backup"
//               className="submit-img"
//               style={{ width: "18px", height: "18px", cursor: "pointer" }}
//             />
//           </span>

//           <input
//             type="file"
//             accept=".json"
//             ref={fileInputRef}
//             onChange={(e) =>
//               restoreDeviceData(e, setDevices, setStatusMessage)
//             }
//             style={{ display: "none" }}
//           />

//           <span onClick={() => fileInputRef.current.click()}>
//             <img
//               src="/restore.png"
//               alt="Restore"
//               className="submit-img"
//               style={{ width: "18px", height: "18px", cursor: "pointer" }}
//             />
//           </span>
//         </div>
//       </div>

//       {statusMessage && <div className="status-message">{statusMessage}</div>}
//     </div>
//   );
// };

// export default ConnectedDevices;

/////////////////////

// "⏸" "▶"

// import React, { useEffect, useState, useRef } from "react";
// import { motion } from "framer-motion";
// import "./App.css";

// function backupDeviceData(setStatusMessage) {
//   const data = JSON.stringify(localStorage);
//   const blob = new Blob([data], { type: "application/json" });
//   const a = document.createElement("a");
//   a.href = URL.createObjectURL(blob);
//   a.download = "localStorage_backup.json";
//   document.body.appendChild(a);
//   a.click();
//   document.body.removeChild(a);

//   setStatusMessage(
//     <motion.div
//       initial={{ opacity: 0, x: -50 }}
//       animate={{ opacity: 1, x: 0 }}
//       exit={{ opacity: 0, x: 50 }}
//       transition={{ duration: 0.5 }}
//       style={{
//         color: "#000",
//         marginTop: "10px",
//         backgroundColor: "#F8F5D7",
//         borderRadius: "5px",
//         padding: "6px",
//         border: "1px solid #aaa",
//         display: "inline-block",
//       }}
//     >
//       Backup created successfully!
//     </motion.div>,
//   );
// }

// function restoreDeviceData(event, setDevices, setStatusMessage) {
//   const file = event.target.files[0];
//   if (!file) return;

//   const reader = new FileReader();
//   reader.onload = (e) => {
//     try {
//       const backupData = JSON.parse(e.target.result);
//       for (const key in backupData) {
//         localStorage.setItem(key, backupData[key]);
//       }

//       if (backupData.devices) {
//         setDevices(JSON.parse(backupData.devices));
//       }

//       setStatusMessage(
//         <motion.div
//           initial={{ opacity: 0, x: -50 }}
//           animate={{ opacity: 1, x: 0 }}
//           exit={{ opacity: 0, x: 50 }}
//           transition={{ duration: 0.5 }}
//           style={{
//             color: "#000",
//             marginTop: "10px",
//             backgroundColor: "#DFF0D8",
//             borderRadius: "5px",
//             padding: "6px",
//             border: "1px solid green",
//             display: "inline-block",
//           }}
//         >
//           Devices restored from backup!
//         </motion.div>,
//       );

//       setTimeout(() => window.location.reload(), 500);
//     } catch (error) {
//       setStatusMessage(
//         <motion.div
//           initial={{ opacity: 0, x: -50 }}
//           animate={{ opacity: 1, x: 0 }}
//           exit={{ opacity: 0, x: 50 }}
//           transition={{ duration: 0.5 }}
//           style={{
//             color: "red",
//             marginTop: "10px",
//             backgroundColor: "#F2DEDE",
//             borderRadius: "5px",
//             padding: "6px",
//             border: "1px solid red",
//             display: "inline-block",
//           }}
//         >
//           Invalid backup file!
//         </motion.div>,
//       );
//     }
//   };
//   reader.readAsText(file);
// }

// const ConnectedDevices = () => {
//   const [devices, setDevices] = useState(
//     JSON.parse(localStorage.getItem("devices")) || [],
//   );
//   const [deviceStates, setDeviceStates] = useState(
//     JSON.parse(localStorage.getItem("deviceStates")) || {},
//   );
//   const [newDevice, setNewDevice] = useState("");
//   const [statusMessage, setStatusMessage] = useState("");
//   const fileInputRef = useRef(null);

//   useEffect(() => {
//     localStorage.setItem("devices", JSON.stringify(devices));
//     localStorage.setItem("deviceStates", JSON.stringify(deviceStates));
//   }, [devices, deviceStates]);

//   const addDevice = () => {
//     const trimmed = newDevice.trim();
//     if (!trimmed) return;

//     if (devices.includes(trimmed)) {
//       setStatusMessage("Device already exists.");
//       return;
//     }

//     setDevices([...devices, trimmed]);
//     setNewDevice("");
//   };

//   const removeDevice = (device) => {
//     if (window.confirm(`Delete ${device}?`)) {
//       const updated = { ...deviceStates };
//       delete updated[device];
//       setDeviceStates(updated);
//       setDevices(devices.filter((d) => d !== device));
//     }
//   };

//   const toggleDeviceState = (device) => {
//     const newState = !deviceStates[device];
//     const updated = { ...deviceStates, [device]: newState };
//     setDeviceStates(updated);

//     if (newState) {
//       window.open(`http://${device}`, "_blank");
//     }
//   };

//   return (
//     <div className="container-b">
//       <h2 className="h2b">Connected Devices</h2>

//       <div className="services-list">
//         {devices.map((device) => (
//           <div key={device} className="service-item-ip">
//             <span className="service-name">{device}</span>

//             <div
//   className="play-pause"
//   role="button"
//   tabIndex={0}
//   style={{
//   color: deviceStates[device] ? "#FFA500" : "#98FB98",
//   width: "20px",
//   height: "20px",
//   borderRadius: "50%",
//   display: "flex",
//   justifyContent: "center",
//   alignItems: "center",
//   fontSize: "14px",
//   fontWeight: "bold",
//   backgroundColor: "transparent",
//   border: "none",
//   cursor: "pointer",
//   marginRight: "8px",
//   userSelect: "none",
//   fontFamily: "Arial, sans-serif", // 👈 Add this
// }}
//   onClick={() => toggleDeviceState(device)}
//   onKeyDown={(e) => {
//     if (e.key === "Enter" || e.key === " ") {
//       toggleDeviceState(device);
//     }
//   }}
//   title={deviceStates[device] ? "Pause Device" : "Start Device"}
// >
//   {deviceStates[device] ? "⏸" : "▶"}
// </div>

//             <label className="switch">
//               <input
//                 type="checkbox"
//                 checked={!!deviceStates[device]}
//                 readOnly
//               />
//               <span className="slider" />
//             </label>

//             <button
//               className="delete-btn"
//               onClick={() => removeDevice(device)}
//               title="Remove Device"
//               style={{ marginLeft: "12px" }}
//             >
//               <img
//                 src="/trash.png"
//                 alt="Delete"
//                 className="submit-img"
//                 style={{ width: "14px", height: "14px" }}
//               />
//             </button>
//           </div>
//         ))}
//       </div>

//       <div className="add-ip">
//         <input
//           type="text"
//           value={newDevice}
//           onChange={(e) => setNewDevice(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && addDevice()}
//           placeholder="Enter device IP"
//           className="service-input"
//         />

//         {/* <div className="backup-b" style={{ position: "relative", marginTop: "10px" }}>
//           <span onClick={() => backupDeviceData(setStatusMessage)}>
//             <img
//               src="/backup.png"
//               alt="Backup"
//               className="submit-img"
//               style={{
//                 width: "20px",
//                 height: "20px",
//                 marginLeft: "5px",
//                 cursor: "pointer",
//               }}
//             />
//           </span>

//           <input
//             type="file"
//             accept=".json"
//             ref={fileInputRef}
//             onChange={(e) => restoreDeviceData(e, setDevices, setStatusMessage)}
//             style={{ display: "none" }}
//           />

//           <span onClick={() => fileInputRef.current.click()}>
//             <img
//               src="/restore.png"
//               alt="Restore"
//               className="submit-img"
//               style={{
//                 width: "20px",
//                 height: "20px",
//                 marginLeft: "0px",
//                 cursor: "pointer",
//               }}
//             />
//           </span>
//         </div> */}

//         <div
//   className="backup-b"
//   style={{
//     position: "relative",
//     marginTop: "-15px", // ✅ Move up to align with .service-input
//     marginLeft: "6px",
//     display: "flex",
//     alignItems: "center", // ✅ Vertically center icons with input
//     gap: "6px",           // Optional: small space between icons
//   }}
// >
//   <span onClick={() => backupDeviceData(setStatusMessage)}>
//     <img
//       src="/backup.png"
//       alt="Backup"
//       className="submit-img"
//       style={{
//         width: "18px",      // ✅ Smaller icon
//         height: "18px",
//         cursor: "pointer",
//       }}
//     />
//   </span>

//   <input
//     type="file"
//     accept=".json"
//     ref={fileInputRef}
//     onChange={(e) =>
//       restoreDeviceData(e, setDevices, setStatusMessage)
//     }
//     style={{ display: "none" }}
//   />

//   <span onClick={() => fileInputRef.current.click()}>
//     <img
//       src="/restore.png"
//       alt="Restore"
//       className="submit-img"
//       style={{
//         width: "18px",     // ✅ Smaller icon
//         height: "18px",
//         cursor: "pointer",
//       }}
//     />
//   </span>
// </div>

//       </div>

//       {statusMessage && <div className="status-message">{statusMessage}</div>}
//     </div>
//   );
// };

// export default ConnectedDevices;
