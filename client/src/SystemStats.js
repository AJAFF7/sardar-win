import React, { useEffect, useState } from "react";
import CleanUp from "./CleanMemory"; // or wherever your CleanUp component is
import axios from "axios";
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { FaChargingStation,} from "react-icons/fa";

import "./App.css";

export default function SystemStats() {
  const [stats, setStats] = useState(null);
  const [showChargingIcon, setShowChargingIcon] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("/api/stats");
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, []);

  // Delay the charging icon update to avoid flicker
  useEffect(() => {
    if (stats?.battery?.isCharging !== undefined) {
      const timer = setTimeout(() => {
        setShowChargingIcon(stats.battery.isCharging);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [stats?.battery?.isCharging]);

  if (!stats) return <p>Loading system stats...</p>;

  const { cpu, memory, battery, disk } = stats;

  const usedMemoryPercent = (memory.used / memory.total) * 100;
  const firstDisk = disk[0];
  const usedDiskPercent = (firstDisk?.used / firstDisk?.size) * 100 || 0;

  const bytesToGB = (bytes) => (bytes / 1024 ** 3).toFixed(1); // Convert to GB



    return (
      <div className="system-stats-container">
        {/* CPU */}
        <div className="stat-box">
          <CircularProgressbarWithChildren
            value={cpu.load}
            styles={buildStyles({
              pathColor: "#00bcd4",
              trailColor: "#333",
            })}
          >
            <div
              style={{
                fontSize: 15,
                color: "#555",
                marginBottom: 14,
                fontWeight: 1000,
                top: 10,
              }}
            >
              CPU
            </div>
            <div style={{ fontSize: 24, fontWeight: "bold", color: "#fff" }}>
              {cpu.load.toFixed(1)}
              <div style={{ fontSize: 14, fontWeight: "bold", color: "#fff" }}>
                %
              </div>
            </div>
          </CircularProgressbarWithChildren>
        </div>

        {/*  Memory  */}
        <div
          className="stat-box"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "#222",
            padding: "16px",
            borderRadius: "12px",
            width: "fit-content",
          }}
        >
          {/* Circular Memory Usage */}
          <div style={{ width: 110, height: 110 }}>
            <CircularProgressbarWithChildren
              value={usedMemoryPercent}
              styles={buildStyles({
                pathColor: "#ff9800",
                trailColor: "#333",
              })}
            >
              {/* Title */}
              <div
                style={{
                  fontSize: 15,
                  color: "#555",
                  marginBottom: 14,
                  fontWeight: 1000,
                  top: 10,
                }}
              >
                Memory
              </div>

              <div
                style={{
                  fontSize: 12,
                  fontWeight: "bold",
                  color: "#fff",
                  marginTop: -4,
                }}
              >
                {usedMemoryPercent.toFixed(1)}%
              </div>
            </CircularProgressbarWithChildren>
          </div>

          {/* Horizontal layout */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 12,
              width: "100%",
              gap: "16px",
            }}
          >
            {/* Memory Chip */}
            <div className="memory-chip-container">
              <div className="memory-chip">
                <div
                  className="memory-usage-fill"
                  style={{
                    width: `${usedMemoryPercent}%`,
                  }}
                />
                <div className="memory-usage-label">
                  {(stats.memory.used / 1024 ** 3).toFixed(1)} GB /{" "}
                  {(stats.memory.total / 1024 ** 3).toFixed(1)} GB
                </div>
              </div>
              <div className="memory-pins top"></div>
              <div className="memory-pins bottom"></div>
            </div>

            {/* CleanUp Button */}
            <CleanUp />
          </div>

          {/* Usage Percentage Again (optional) */}
          {/* <div
          style={{
            fontSize: 12,
            fontWeight: "bold",
            color: "#ff9800",
            marginTop: 8,
          }}
        >
          {usedMemoryPercent.toFixed(1)}%
        </div> */}
        </div>
        {/* Battery */}


        {/* Battery */}
        {/* Battery */}
                       <div
                         className="stat-box"
                         key={battery.isCharging ? "charging" : "not-charging"}
                       >

                         <CircularProgressbarWithChildren
                           value={battery.percent}
                           styles={buildStyles({
                             pathColor: battery.isCharging ? "#f44336" : "#4caf50",
                             trailColor: "#333",
                           })}
                         >
                           <div
                             style={{
                               fontSize: 15,
                               color: "#555",
                               marginBottom: 40,
                               fontWeight: 1000,
                             }}
                           >
                             Battery
                           </div>

                           {/* Battery container with electron dots */}
                          <div
                           className="battery-container"
                           style={{ position: "absolute", width: "60px", height: "20px",  }}
                         >

                           {battery.isCharging && (
                             <div className="electron-dots">
                               {[...Array(3)].map((_, i) => (
                                 <div className="electron-dot" key={i} />
                               ))}
                             </div>
                           )}
                           <div
                             className={`battery-level ${battery.isCharging ? "charging" : ""}`}
                             style={{ width: `${battery.percent}%` }}
                           />
                         </div>

                        {/*  Battery tip */}
                         <div
                           className=""
                           style={{
                             position: "relative",
                             top: "-22px",
                             right: "-32px",
                             width: "5.5px",
                             height: "8px",
                             background: "#777",
                             borderRadius: "50%",
                           }}
                         />







                           {/* Optional: status label */}
                           <div
                             style={{
                               fontSize: 12,
                               fontWeight: "bold",
                               color: battery.isCharging ? "#f44336" : "#4caf50",
                               marginTop: 1,
                               marginLeft: 10,
                             }}
                           >
                             {battery.percent.toFixed(0)}% {battery.isCharging ? "Charging" : ""}
                           </div>
                         </CircularProgressbarWithChildren>
                       </div>

        {/* Disk */}
        {/* Disk */}
        <div className="stat-box">
          <CircularProgressbarWithChildren
            value={usedDiskPercent}
            styles={buildStyles({
              pathColor: "#9c27b0",
              trailColor: "#333",
            })}
          >
            <div
              style={{
                fontSize: 15,
                color: "#555",
                marginBottom: 14,
                fontWeight: 1000,
              }}
            >
              Disk
            </div>
            <div style={{ fontSize: 12, fontWeight: "bold", color: "#fff" }}>
              {bytesToGB(firstDisk?.used)} GB
              <span style={{ fontSize: 8, color: "#aaa" }}>
                {" "}
                / {bytesToGB(firstDisk?.size)} GB
              </span>
            </div>
            <div style={{ fontSize: 13, fontWeight: "bold", color: "#fff" }}>
              {usedDiskPercent.toFixed(1)}%
            </div>
          </CircularProgressbarWithChildren>
        </div>
      </div>
    );
  }
