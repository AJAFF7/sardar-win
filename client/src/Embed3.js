// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   CircularProgressbarWithChildren,
//   buildStyles,
// } from "react-circular-progressbar";
// import "react-circular-progressbar/dist/styles.css";
// import { FaChargingStation } from "react-icons/fa";

// import "./App.css";

// export default function SystemStats() {
//   const [stats, setStats] = useState(null);
//   const [showChargingIcon, setShowChargingIcon] = useState(false);

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         const response = await axios.get("/api/stats");
//         setStats(response.data);
//       } catch (error) {
//         console.error("Failed to fetch stats:", error);
//       }
//     };

//     fetchStats();
//     const interval = setInterval(fetchStats, 2000);
//     return () => clearInterval(interval);
//   }, []);

//   // Delay the charging icon update to avoid flicker
//   useEffect(() => {
//     if (stats?.battery?.isCharging !== undefined) {
//       const timer = setTimeout(() => {
//         setShowChargingIcon(stats.battery.isCharging);
//       }, 1000);
//       return () => clearTimeout(timer);
//     }
//   }, [stats?.battery?.isCharging]);

//   if (!stats) return <p>Loading system stats...</p>;

//   const { cpu, memory, battery, disk } = stats;

//   const usedMemoryPercent = (memory.used / memory.total) * 100;
//   const firstDisk = disk[0];
//   const usedDiskPercent = (firstDisk?.used / firstDisk?.size) * 100 || 0;

//   const bytesToGB = (bytes) => (bytes / 1024 ** 3).toFixed(1); // Convert to GB

//   return (
//     <div className="system-stats-container">
//       {/* CPU */}
//       <div className="stat-box">
//         <CircularProgressbarWithChildren
//           value={cpu.load}
//           styles={buildStyles({
//             pathColor: "#00bcd4",
//             trailColor: "#333",
//           })}
//         >
//           <div
//             style={{
//               fontSize: 15,
//               color: "#555",
//               marginBottom: 14,
//               fontWeight: 1000,
//               top: 10,
//             }}
//           >
//             CPU
//           </div>
//           <div style={{ fontSize: 24, fontWeight: "bold", color: "#fff" }}>
//             {cpu.load.toFixed(1)}
//             <div style={{ fontSize: 14, fontWeight: "bold", color: "#fff" }}>
//               %
//             </div>
//           </div>
//         </CircularProgressbarWithChildren>
//       </div>

//       {/* Memory */}
//       <div className="stat-box">
//         <CircularProgressbarWithChildren
//           value={usedMemoryPercent}
//           styles={buildStyles({
//             pathColor: "#ff9800",
//             trailColor: "#333",
//           })}
//         >
//           <div
//             style={{
//               fontSize: 15,
//               color: "#555",
//               marginBottom: 14,
//               fontWeight: 1000,
//             }}
//           >
//             Memory
//           </div>
//           <div style={{ fontSize: 24, fontWeight: "bold", color: "#fff" }}>
//             {usedMemoryPercent.toFixed(1)}
//             <div style={{ fontSize: 14, fontWeight: "bold", color: "#fff" }}>
//               %
//             </div>
//           </div>
//         </CircularProgressbarWithChildren>
//       </div>

//       {/* Battery */}
//       <div
//         className="stat-box"
//         key={battery.isCharging ? "charging" : "not-charging"}
//       >
//         <CircularProgressbarWithChildren
//           value={battery.percent}
//           styles={buildStyles({
//             pathColor: battery.isCharging ? "#f44336" : "#4caf50",
//             trailColor: "#333",
//           })}
//         >
//           <div
//             style={{
//               fontSize: 15,
//               color: "#555",
//               marginBottom: 14,
//               fontWeight: 1000,
//             }}
//           >
//             Battery
//           </div>
//           <div
//             style={{
//               fontSize: 24,
//               fontWeight: "bold",
//               color: "#fff",
//               display: "flex",
//               alignItems: "center",
//             }}
//           >
//             {battery.percent}
//             <div
//               style={{
//                 fontSize: 14,
//                 fontWeight: "bold",
//                 color: "#fff",
//                 marginLeft: 4,
//               }}
//             >
//               %
//               {battery.isCharging && (
//                 <FaChargingStation
//                   style={{ marginLeft: 6, fontSize: 16, color: "#4caf50" }}
//                 />
//               )}
//             </div>
//           </div>
//         </CircularProgressbarWithChildren>
//       </div>

//       {/* Disk */}
//       {/* Disk */}
//       <div className="stat-box-disk">
//         <CircularProgressbarWithChildren
//           value={usedDiskPercent}
//           styles={buildStyles({
//             pathColor: "#9c27b0",
//             trailColor: "#333",
//           })}
//         >
//           <div
//             style={{
//               fontSize: 15,
//               color: "#555",
//               marginBottom: 14,
//               fontWeight: 1000,
//             }}
//           >
//             Disk
//           </div>
//           <div style={{ fontSize: 18, fontWeight: "bold", color: "#fff" }}>
//             {bytesToGB(firstDisk?.used)} GB
//             <span style={{ fontSize: 14, color: "#aaa" }}>
//               {" "}
//               / {bytesToGB(firstDisk?.size)} GB
//             </span>
//           </div>
//           <div style={{ fontSize: 13, fontWeight: "bold", color: "#fff" }}>
//             {usedDiskPercent.toFixed(1)}%
//           </div>
//         </CircularProgressbarWithChildren>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import "./App.css";

const Embed2 = () => {
  const fullText = "Under Construction";

  const [count, setCount] = useState(3);
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);
  const [countdownDone, setCountdownDone] = useState(false);

  // Countdown logic
  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    } else if (count === 0) {
      setCountdownDone(true);
    }
  }, [count]);

  // Text animation logic
  useEffect(() => {
    if (countdownDone && index < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + fullText[index]);
        setIndex(index + 1);
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [countdownDone, index, fullText]);

  return (
    <>
      {!countdownDone && (
        <div className="countdown-overlay">
          <div className="countdown-text">{count}</div>
        </div>
      )}
      <div className="embed2-container">
        {countdownDone && <div className="embed2-text">{displayedText}</div>}
      </div>
    </>
  );
};

export default Embed2;

// // components/Vault.js
// import React from 'react';
// import './App.css';

// const Embed3 = () => {
//   return (
//     <div className="w-full h-full bg-white rounded-xl overflow-hidden border shadow">
//       <webview
//         src="http://172.18.0.123"
//         style={{
//           width: '1635px',
//           height: '100vh',
//           borderRadius: '12px', // ✅ Add this line
//           overflow: 'hidden',
//           marginLeft: '30px', // ✅ Added margin-left

//         }}
//       />
//     </div>
//   );
// };

// export default Embed3;
