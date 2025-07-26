import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
} from "recharts";

// Socket connection
const socket = io("http://localhost:6565");

export default function NetworkChartPro() {
  const [data, setData] = useState([]);
  const [currentStats, setCurrentStats] = useState({ download: 0, upload: 0 });
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    const fetchStats = () => {
      socket.emit("requestStats");
    };

    fetchStats(); // first fetch
    const intervalId = setInterval(fetchStats, 4000);

    socket.on("networkStats", (stats) => {
      if (!stats || stats.length === 0) return;

      const s = stats[0];
      if (!s) return;

      const formatted = {
        time: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        download: s.download,
        upload: s.upload,
      };

      setCurrentStats({ download: s.download, upload: s.upload });
      setData((prev) => [...prev.slice(-29), formatted]);
      setLoading(false);
      setHasData(true);
    });

    return () => {
      clearInterval(intervalId);
      socket.disconnect();
    };
  }, []);

  const getSignalColor = (value, type) => {
    const level = Math.min(6, Math.ceil((value || 0) / 20));
    if (level === 1) return "#ff4444";
    if (level <= 3) return "#ffaa00";
    return type === "download" ? "#00ff88" : "#3399ff";
  };

  const renderSignalBars = (value, type) => {
    const level = Math.min(6, Math.ceil((value || 0) / 20));
    const color = getSignalColor(value, type);

    return (
      <div
        style={{ display: "flex", gap: 2, height: 24, alignItems: "flex-end" }}
      >
        {[1, 2, 3, 4, 5, 6].map((bar) => (
          <div
            key={bar}
            style={{
              width: 5,
              height: bar * 4,
              backgroundColor: bar <= level ? color : "#333",
              borderRadius: 2,
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>
    );
  };

  const signalBoxStyle = {
    padding: 8,
    borderRadius: 8,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: 12,
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: 450,
        padding: 24,
        borderRadius: 16,
        color: "#777",
        boxShadow: "0 0 20px rgba(0,0,0,0.3)",
      }}
    >
      {loading && !hasData ? (
        <div
          style={{
            position: "absolute",
            top: "47%",
            left: "51%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: "#999",
          }}
        >
          <div className="spinner" />
        </div>
      ) : (
        <>
          {/* Signal bars */}
          <div
            style={{
              position: "absolute",
              top: 8,
              left: 24,
              display: "flex",
              flexDirection: "row",
              gap: 24,
              zIndex: 10,
            }}
          >
            <div style={signalBoxStyle}>
              <div
                style={{
                  color: "#00ff88",
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                {/* Download */}
              </div>
              {renderSignalBars(currentStats.download, "download")}
              <div style={{ color: "#aaa", marginTop: 4, fontSize: 12 }}>
                {currentStats.download?.toFixed(1)} Mbps
              </div>
            </div>

            <div style={signalBoxStyle}>
              <div
                style={{
                  color: "#3399ff",
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                {/* Upload */}
              </div>
              {renderSignalBars(currentStats.upload, "upload")}
              <div style={{ color: "#aaa", marginTop: 4, fontSize: 12 }}>
                {currentStats.upload?.toFixed(1)} Mbps
              </div>
            </div>
          </div>

          {/* Chart */}
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <defs>
                <linearGradient id="colorDownload" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#add8e6" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#add8e6" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorUpload" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f9c0d4" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#f9c0d4" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1c1f26" strokeDasharray="3 3" />
              <YAxis
                unit=" Mbps"
                tick={{ fill: "#ccc", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={0}
              />
              <Tooltip
              cursor={false}
                contentStyle={{
                  backgroundColor: "#1f1f2e",
                  borderRadius: 6,
                  border: "none",
                  fontSize: 12,
                }}
                labelStyle={{ color: "#ddd" }}
              />
              <Area
                type="monotone"
                dataKey="download"
                stroke="#00C49F"
                strokeWidth={1}
                fillOpacity={1}
                fill="url(#colorDownload)"
                name="Download"
                activeDot={false}
              />
              <Area
                type="monotone"
                dataKey="upload"
                stroke="#FF8042"
                strokeWidth={1}
                fillOpacity={1}
                fill="url(#colorUpload)"
                name="Upload"
                activeDot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}

////////////

// import React, { useEffect, useState } from "react";
// import io from "socket.io-client";
// import {
//   ResponsiveContainer,
//   ComposedChart,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   Area,
// } from "recharts";

// // Socket connection
// const socket = io("http://localhost:6565");

// export default function NetworkChartPro() {
//   const [data, setData] = useState([]);
//   const [currentStats, setCurrentStats] = useState({ download: 0, upload: 0 });

//   useEffect(() => {
//     const fetchStats = () => {
//       socket.emit("requestStats");
//     };

//     fetchStats();
//     const intervalId = setInterval(fetchStats, 4000);

//     socket.on("networkStats", (stats) => {
//       const s = stats[0];
//       if (!s) return;

//       const formatted = {
//         time: new Date().toLocaleTimeString("en-US", {
//           hour: "2-digit",
//           minute: "2-digit",
//           second: "2-digit",
//         }),
//         download: s.download,
//         upload: s.upload,
//       };

//       setCurrentStats({ download: s.download, upload: s.upload });
//       setData((prev) => [...prev.slice(-29), formatted]);
//     });

//     return () => {
//       clearInterval(intervalId);
//       socket.disconnect();
//     };
//   }, []);

//   const getSignalColor = (value, type) => {
//     const level = Math.min(6, Math.ceil((value || 0) / 20));
//     if (level === 1) return "#ff4444"; // red
//     if (level <= 3) return "#ffaa00"; // orange
//     return type === "download" ? "#00ff88" : "#3399ff"; // green or blue
//   };

//   const renderSignalBars = (value, type) => {
//     const level = Math.min(6, Math.ceil((value || 0) / 20));
//     const color = getSignalColor(value, type);

//     return (
//       <div
//         style={{ display: "flex", gap: 2, height: 24, alignItems: "flex-end" }}
//       >
//         {[1, 2, 3, 4, 5, 6].map((bar) => (
//           <div
//             key={bar}
//             style={{
//               width: 5,
//               height: bar * 4,
//               backgroundColor: bar <= level ? color : "#333",
//               borderRadius: 2,
//               transition: "all 0.3s ease",
//             }}
//           />
//         ))}
//       </div>
//     );
//   };

//   const signalBoxStyle = {
//     padding: 8,
//     borderRadius: 8,
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "flex-start",
//     marginBottom: 12,
//   };

//   return (
//     <div
//       style={{
//         position: "relative",
//         width: "100%",
//         height: 460,
//         padding: 24,
//         borderRadius: 16,
//         color: "#777",
//         boxShadow: "0 0 20px rgba(0,0,0,0.3)",
//       }}
//     >
//       {/* Signal bars */}
//       <div
//         style={{
//           position: "absolute",
//           top: 8,
//           left: 24,
//           display: "flex",
//           flexDirection: "row",
//           gap: 24,
//           zIndex: 10,
//         }}
//       >
//         <div style={signalBoxStyle}>
//           <div
//             style={{
//               color: "#00ff88",
//               fontSize: 14,
//               fontWeight: 600,
//               marginBottom: 4,
//             }}
//           >
//             {/* Download */}
//           </div>
//           {renderSignalBars(currentStats.download, "download")}
//           <div style={{ color: "#aaa", marginTop: 4, fontSize: 12 }}>
//             {currentStats.download?.toFixed(1)} Mbps
//           </div>
//         </div>

//         <div style={signalBoxStyle}>
//           <div
//             style={{
//               color: "#3399ff",
//               fontSize: 14,
//               fontWeight: 600,
//               marginBottom: 4,
//             }}
//           >
//             {/* Upload */}
//           </div>
//           {renderSignalBars(currentStats.upload, "upload")}
//           <div style={{ color: "#aaa", marginTop: 4, fontSize: 12 }}>
//             {currentStats.upload?.toFixed(1)} Mbps
//           </div>
//         </div>
//       </div>

//       {/* Chart */}
//       <ResponsiveContainer width="100%" height="100%">
//         <ComposedChart data={data}>
//           <defs>
//             <linearGradient id="colorDownload" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="5%" stopColor="#add8e6" stopOpacity={0.6} />
//               <stop offset="95%" stopColor="#add8e6" stopOpacity={0.05} />
//             </linearGradient>
//             <linearGradient id="colorUpload" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="5%" stopColor="#f9c0d4" stopOpacity={0.5} />
//               <stop offset="95%" stopColor="#f9c0d4" stopOpacity={0.05} />
//             </linearGradient>
//           </defs>
//           <CartesianGrid stroke="#1c1f26" strokeDasharray="3 3" />
//           <YAxis
//             unit=" Mbps"
//             tick={{ fill: "#ccc", fontSize: 10 }}
//             axisLine={false}
//             tickLine={false}
//             width={0}
//           />
//           <Tooltip
//             contentStyle={{
//               backgroundColor: "#1f1f2e",
//               borderRadius: 6,
//               border: "none",
//               fontSize: 12,
//             }}
//             labelStyle={{ color: "#ddd" }}
//           />
//           <Area
//             type="monotone"
//             dataKey="download"
//             stroke="#00C49F"
//             strokeWidth={1}
//             fillOpacity={1}
//             fill="url(#colorDownload)"
//             name="Download"
//           />
//           <Area
//             type="monotone"
//             dataKey="upload"
//             stroke="#FF8042"
//             strokeWidth={1}
//             fillOpacity={1}
//             fill="url(#colorUpload)"
//             name="Upload"
//           />
//         </ComposedChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }

//////////////
// import React, { useEffect, useState } from "react";
// import io from "socket.io-client";
// import {
//   ResponsiveContainer,
//   ComposedChart,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   Area,
// } from "recharts";

// // Socket connection
// const socket = io("http://localhost:6565");

// export default function NetworkChartPro() {
//   const [data, setData] = useState([]);
//   const [currentStats, setCurrentStats] = useState({ download: 0, upload: 0 });

//   useEffect(() => {
//     const fetchStats = () => {
//       socket.emit("requestStats");
//     };

//     fetchStats();
//     const intervalId = setInterval(fetchStats, 10000);

//     socket.on("networkStats", (stats) => {
//       const s = stats[0];
//       if (!s) return;

//       const formatted = {
//         time: new Date().toLocaleTimeString("en-US", {
//           hour: "2-digit",
//           minute: "2-digit",
//           second: "2-digit",
//         }),
//         download: s.download,
//         upload: s.upload,
//       };

//       setCurrentStats({ download: s.download, upload: s.upload });
//       setData((prev) => [...prev.slice(-29), formatted]);
//     });

//     return () => {
//       clearInterval(intervalId);
//       socket.disconnect();
//     };
//   }, []);

//   const getSignalColor = (value, normalColor) => {
//     const level = Math.ceil((value || 0) / 20);
//     return level <= 2 ? "#ff4444" : normalColor;
//   };

//   const renderSignalBars = (value, color) => {
//     const level = Math.min(5, Math.ceil((value || 0) / 20));
//     return (
//       <div
//         style={{ display: "flex", gap: 2, height: 20, alignItems: "flex-end" }}
//       >
//         {[1, 2, 3, 4, 5].map((bar) => (
//           <div
//             key={bar}
//             style={{
//               width: 4,
//               height: bar * 4,
//               backgroundColor: bar <= level ? color : "#333",
//               borderRadius: 2,
//               transition: "all 0.3s ease",
//             }}
//           />
//         ))}
//       </div>
//     );
//   };

//   const signalBoxStyle = {
//     padding: 8,
//     borderRadius: 8,
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "flex-start",
//     marginBottom: 12,
//   };

//   return (
//     <div
//       style={{
//         position: "relative",
//         width: "100%",
//         height: 460,
//         padding: 24,
//         borderRadius: 16,
//         color: "#777",
//         boxShadow: "0 0 20px rgba(0,0,0,0.3)",
//       }}
//     >
//       {/* Signal bars */}
//       <div
//         style={{
//           position: "absolute",
//           top: 8,
//           left: 24,
//           display: "flex",
//           flexDirection: "row",
//           gap: 24,
//           zIndex: 10,
//         }}
//       >
//         <div style={signalBoxStyle}>
//           <div
//             style={{
//               color: "#00ff88",
//               fontSize: 14,
//               fontWeight: 600,
//               marginBottom: 4,
//             }}
//           >
//             Download
//           </div>
//           {renderSignalBars(
//             currentStats.download,
//             getSignalColor(currentStats.download, "#00ff88"),
//           )}
//           <div style={{ color: "#aaa", marginTop: 4, fontSize: 12 }}>
//             {currentStats.download?.toFixed(1)} Mbps
//           </div>
//         </div>

//         <div style={signalBoxStyle}>
//           <div
//             style={{
//               color: "#3399ff",
//               fontSize: 14,
//               fontWeight: 600,
//               marginBottom: 4,
//             }}
//           >
//             Upload
//           </div>
//           {renderSignalBars(
//             currentStats.upload,
//             getSignalColor(currentStats.upload, "#3399ff"),
//           )}
//           <div style={{ color: "#aaa", marginTop: 4, fontSize: 12 }}>
//             {currentStats.upload?.toFixed(1)} Mbps
//           </div>
//         </div>
//       </div>

//       {/* Chart */}
//       <ResponsiveContainer width="100%" height="100%">
//         <ComposedChart data={data}>
//           <defs>
//             <linearGradient id="colorDownload" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="5%" stopColor="#add8e6" stopOpacity={0.6} />
//               <stop offset="95%" stopColor="#add8e6" stopOpacity={0.05} />
//             </linearGradient>
//             <linearGradient id="colorUpload" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="5%" stopColor="#f9c0d4" stopOpacity={0.5} />
//               <stop offset="95%" stopColor="#f9c0d4" stopOpacity={0.05} />
//             </linearGradient>
//           </defs>
//           <CartesianGrid stroke="#1c1f26" strokeDasharray="3 3" />
//           <YAxis
//             unit=" Mbps"
//             tick={{ fill: "#ccc", fontSize: 10 }}
//             axisLine={false}
//             tickLine={false}
//             width={0}
//           />
//           <Tooltip
//             contentStyle={{
//               backgroundColor: "#1f1f2e",
//               borderRadius: 6,
//               border: "none",
//               fontSize: 12,
//             }}
//             labelStyle={{ color: "#ddd" }}
//           />
//           <Area
//             type="monotone"
//             dataKey="download"
//             stroke="#00C49F"
//             strokeWidth={1}
//             fillOpacity={1}
//             fill="url(#colorDownload)"
//             name="Download"
//           />
//           <Area
//             type="monotone"
//             dataKey="upload"
//             stroke="#FF8042"
//             strokeWidth={1}
//             fillOpacity={1}
//             fill="url(#colorUpload)"
//             name="Upload"
//           />
//         </ComposedChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }

// ////////////
// import React, { useEffect, useState } from "react";
// import io from "socket.io-client";
// import {
//   ResponsiveContainer,
//   ComposedChart,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   Area,
// } from "recharts";

// // Socket connection
// const socket = io("http://localhost:6565");

// export default function NetworkChartPro() {
//   const [data, setData] = useState([]);

//   useEffect(() => {
//     const fetchStats = () => {
//       socket.emit("requestStats"); // Emit custom event to request data
//     };

//     fetchStats(); // Emit immediately on mount
//     const intervalId = setInterval(fetchStats, 10000); // Repeat every 5s

//     socket.on("networkStats", (stats) => {
//       const s = stats[0];
//       if (!s) return;

//       const formatted = {
//         time: new Date().toLocaleTimeString("en-US", {
//           hour: "2-digit",
//           minute: "2-digit",
//           second: "2-digit",
//         }),
//         download: s.download,
//         upload: s.upload,
//       };

//       setData((prev) => [...prev.slice(-29), formatted]); // Keep last 30
//     });

//     return () => {
//       clearInterval(intervalId);
//       socket.disconnect();
//     };
//   }, []);

//   return (
//     <div
//       style={{
//         width: "100%",
//         height: 420,
//         padding: 24,
//         borderRadius: 16,
//         color: "#777",
//         boxShadow: "0 0 20px rgba(0,0,0,0.3)",
//       }}
//     >
//       <h3 style={{ marginBottom: 16, fontSize: 18, fontWeight: 500 }}>Mbps</h3>

//       <ResponsiveContainer width="100%" height="100%">
//         <ComposedChart data={data}>
//           <defs>
//             <linearGradient id="colorDownload" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="5%" stopColor="#add8e6" stopOpacity={0.6} />
//               <stop offset="95%" stopColor="#add8e6" stopOpacity={0.05} />
//             </linearGradient>
//             <linearGradient id="colorUpload" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="5%" stopColor="#f9c0d4" stopOpacity={0.5} />
//               <stop offset="95%" stopColor="#f9c0d4" stopOpacity={0.05} />
//             </linearGradient>
//           </defs>
//           <CartesianGrid stroke="#1c1f26" strokeDasharray="3 3" />
//           <YAxis
//             unit=" Mbps"
//             tick={{ fill: "#ccc", fontSize: 10 }}
//             axisLine={false}
//             tickLine={false}
//             width={0}
//           />
//           <Tooltip
//             contentStyle={{
//               backgroundColor: "#1f1f2e",
//               borderRadius: 6,
//               border: "none",
//               fontSize: 12,
//             }}
//             labelStyle={{ color: "#ddd" }}
//           />
//           <Area
//             type="monotone"
//             dataKey="download"
//             stroke="#00C49F"
//             strokeWidth={1}
//             fillOpacity={1}
//             fill="url(#colorDownload)"
//             name="Download"
//           />
//           <Area
//             type="monotone"
//             dataKey="upload"
//             stroke="#FF8042"
//             strokeWidth={1}
//             fillOpacity={1}
//             fill="url(#colorUpload)"
//             name="Upload"
//           />
//         </ComposedChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }

// import React, { useEffect, useState } from "react";
// import io from "socket.io-client";
// import {
//   ResponsiveContainer,
//   ComposedChart,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   Area,
// } from "recharts";

// // Socket connection
// const socket = io("http://localhost:6565");

// export default function NetworkChartPro() {
//   const [data, setData] = useState([]);

//   useEffect(() => {
//     const fetchStats = () => {
//       socket.emit("requestStats"); // Emit custom event to request data
//     };

//     fetchStats(); // Emit immediately on mount
//     const intervalId = setInterval(fetchStats, 10000); // Repeat every 5s

//     socket.on("networkStats", (stats) => {
//       const s = stats[0];
//       if (!s) return;

//       const formatted = {
//         time: new Date().toLocaleTimeString("en-US", {
//           hour: "2-digit",
//           minute: "2-digit",
//           second: "2-digit",
//         }),
//         download: s.download,
//         upload: s.upload,
//       };

//       setData((prev) => [...prev.slice(-29), formatted]); // Keep last 30
//     });

//     return () => {
//       clearInterval(intervalId);
//       socket.disconnect();
//     };
//   }, []);

//   return (
//     <div
//       style={{
//         width: "100%",
//         height: 420,
//         padding: 24,
//         borderRadius: 16,
//         color: "#777",
//         boxShadow: "0 0 20px rgba(0,0,0,0.3)",
//       }}
//     >
//       <h3 style={{ marginBottom: 16, fontSize: 18, fontWeight: 500 }}>Mbps</h3>

//       <ResponsiveContainer width="100%" height="100%">
//         <ComposedChart data={data}>
//           <defs>
//             <linearGradient id="colorDownload" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="5%" stopColor="#add8e6" stopOpacity={0.6} />
//               <stop offset="95%" stopColor="#add8e6" stopOpacity={0.05} />
//             </linearGradient>
//             <linearGradient id="colorUpload" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="5%" stopColor="#f9c0d4" stopOpacity={0.5} />
//               <stop offset="95%" stopColor="#f9c0d4" stopOpacity={0.05} />
//             </linearGradient>
//           </defs>
//           <CartesianGrid stroke="#1c1f26" strokeDasharray="3 3" />
//           <YAxis
//             unit=" Mbps"
//             tick={{ fill: "#ccc", fontSize: 10 }}
//             axisLine={false}
//             tickLine={false}
//             width={0}
//           />
//           <Tooltip
//             contentStyle={{
//               backgroundColor: "#1f1f2e",
//               borderRadius: 6,
//               border: "none",
//               fontSize: 12,
//             }}
//             labelStyle={{ color: "#ddd" }}
//           />
//           <Area
//             type="monotone"
//             dataKey="download"
//             stroke="#00C49F"
//             strokeWidth={1}
//             fillOpacity={1}
//             fill="url(#colorDownload)"
//             name="Download"
//           />
//           <Area
//             type="monotone"
//             dataKey="upload"
//             stroke="#FF8042"
//             strokeWidth={1}
//             fillOpacity={1}
//             fill="url(#colorUpload)"
//             name="Upload"
//           />
//         </ComposedChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }

///////////////
