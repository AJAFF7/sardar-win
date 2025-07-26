import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function Cpu() {
  const [data, setData] = useState([]);
  const [currentStats, setCurrentStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        const json = await res.json();

        const {
          currentLoadUser = 0,
          currentLoadSystem = 0,
          currentLoadIdle = 0,
        } = json.cpu || {};

        const formatted = {
          user: currentLoadUser,
          system: currentLoadSystem,
          idle: currentLoadIdle,
        };

        setCurrentStats(formatted);
        setData((prev) => [...prev.slice(-29), formatted]);
        setLoading(false);
        setHasData(true);
      } catch (err) {
        console.error("Failed to fetch CPU stats:", err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 500);
    return () => clearInterval(interval);
  }, []);

  const renderBar = (label, value, color) => {
    const totalBars = 20;
    const activeBars = Math.round((value / 100) * totalBars);

    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ color, fontSize: 10, marginBottom: 4 }}>{label}</div>
        <div style={{ display: "flex", gap: 2 }}>
          {Array.from({ length: totalBars }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 4,
                height: 20,
                backgroundColor: i < activeBars ? color : "#2b2b2b",
                borderRadius: 2,
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>
        <div style={{ fontSize: 10, marginTop: 4, color: "#888" }}>
          {value.toFixed(1)}%
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        width: "40%",
        height: 450,
        padding: 0,
        borderRadius: 16,
        color: "#ddd",
        boxShadow: "0 10px 30px rgba(0.4, 0.4, 0.4, 0.4)",
        boxSizing: "border-box",
        position: "relative",
        marginTop: "400px",
      }}
    >
      {loading && !hasData ? (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            color: "#777",
          }}
        >
          Loading...
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 15, marginBottom: 12, marginLeft: 5, }}>
            {renderBar("User", currentStats.user, "#00c6ff")}
            {renderBar("System", currentStats.system, "#6a5acd")}
            {renderBar("Idle", currentStats.idle, "#555")}
          </div>

          <ResponsiveContainer width="100%" height="80%">
            <ComposedChart data={data}>
              <defs>
                <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00c6ff" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0072ff" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="systemGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6a5acd" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#6a5acd" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="idleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#777" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#777" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <XAxis hide />
              <YAxis domain={[0, 100]} hide />

              <Tooltip
                cursor={false}
                contentStyle={{
                  background: "#222",
                  border: "none",
                  borderRadius: 10,
                  padding: "8px",
                  color: "#fff",
                }}
                labelStyle={{ color: "red" }}
              />

              <Area
                type="monotone"
                dataKey="user"
                stroke="#00c6ff"
                strokeWidth={2.5}
                fill="url(#userGrad)"
                dot={false}
                activeDot={false}
              />
              <Area
                type="monotone"
                dataKey="system"
                stroke="#6a5acd"
                strokeWidth={2.5}
                fill="url(#systemGrad)"
                dot={false}
                activeDot={false}
              />
              <Area
                type="monotone"
                dataKey="idle"
                stroke="#999"
                strokeWidth={1.8}
                fill="url(#idleGrad)"
                dot={false}
                activeDot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}


//////////////


// import React, { useEffect, useState } from "react";
// import {
//   ResponsiveContainer,
//   ComposedChart,
//   Area,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
// } from "recharts";

// export default function Cpu() {
//   const [data, setData] = useState([]);
//   const [currentStats, setCurrentStats] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [hasData, setHasData] = useState(false);

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         const res = await fetch("/api/stats");
//         const json = await res.json();

//         const { currentLoadUser = 0, currentLoadSystem = 0, currentLoadIdle = 0 } = json.cpu || {};

//         const formatted = {
//           user: currentLoadUser,
//           system: currentLoadSystem,
//           idle: currentLoadIdle,
//         };

//         setCurrentStats(formatted);
//         setData((prev) => [...prev.slice(-29), formatted]);
//         setLoading(false);
//         setHasData(true);
//       } catch (err) {
//         console.error("Failed to fetch CPU stats:", err);
//       }
//     };

//     fetchStats();
//     const interval = setInterval(fetchStats, 500);
//     return () => clearInterval(interval);
//   }, []);

//   const renderBar = (label, value, color) => {
//     const totalBars = 20;
//     const activeBars = Math.round((value / 100) * totalBars);

//     return (
//       <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
//         <div style={{ color, fontSize: 10, marginBottom: 4 }}>{label}</div>
//         <div style={{ display: "flex", gap: 2 }}>
//           {Array.from({ length: totalBars }).map((_, i) => (
//             <div
//               key={i}
//               style={{
//                 width: 4,
//                 height: 20,
//                 backgroundColor: i < activeBars ? color : "#2b2b2b",
//                 borderRadius: 2,
//                 transition: "all 0.3s ease",
//               }}
//             />
//           ))}
//         </div>
//         <div style={{ fontSize: 10, marginTop: 4, color: "#888" }}>
//           {value.toFixed(1)}%
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div
//       style={{
//         width: "40%",
//         height: 450,
//         padding: 0,
//         borderRadius: 16,
//         color: "#ddd",
//         // background: "#0c0f1a",
//         boxShadow: "0 10px 30px rgba(0.4, 0.4, 0.4, 0.4)",
//         boxSizing: "border-box",
//         position: "relative",
//         marginTop: "400px",
//       }}
//     >
//       {loading && !hasData ? (
//         <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", color: "#777" }}>
//           Loading...
//         </div>
//       ) : (
//         <>
//           <div style={{ display: "flex", gap: 32, marginBottom: 12 }}>
//             {renderBar("User", currentStats.user, "#00c6ff")}
//             {renderBar("System", currentStats.system, "#6a5acd")}
//             {renderBar("Idle", currentStats.idle, "#ffaa00")}
//           </div>

//           <ResponsiveContainer width="100%" height="80%">
//             <ComposedChart data={data}>
//               <defs>
//                 <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="5%" stopColor="#00c6ff" stopOpacity={0.8} />
//                   <stop offset="95%" stopColor="#0072ff" stopOpacity={0.05} />
//                 </linearGradient>
//                 <linearGradient id="systemGrad" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="5%" stopColor="#6a5acd" stopOpacity={0.6} />
//                   <stop offset="95%" stopColor="#6a5acd" stopOpacity={0.05} />
//                 </linearGradient>
//                 <linearGradient id="idleGrad" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="5%" stopColor="#ffaa00" stopOpacity={0.4} />
//                   <stop offset="95%" stopColor="#ffaa00" stopOpacity={0.05} />
//                 </linearGradient>
//               </defs>

//               {/* <CartesianGrid stroke="#1a1a2f" strokeDasharray="3 3" /> */}

//               <XAxis hide />
//               <YAxis domain={[0, 100]} hide />

//               <Tooltip
//                 cursor={false}
//                 contentStyle={{
//                   background: "#222", //#1e1f2b
//                   border: "none",
//                   borderRadius: 10,
//                   padding: "8px",
//                   color: "#fff",
//                 }}
//                 labelStyle={{ color: "red" }}

//               />

//               <Area
//                 type="monotone"
//                 dataKey="user"
//                 stroke="#00c6ff"
//                 strokeWidth={2.5}
//                 fill="url(#userGrad)"
//                 dot={false}
//                 activeDot={false}
//               />
//               <Area
//                 type="monotone"
//                 dataKey="system"
//                 stroke="#6a5acd"
//                 strokeWidth={2.5}
//                 fill="url(#systemGrad)"
//                 dot={false}
//                 activeDot={false}
//               />
//               <Area
//                 type="monotone"
//                 dataKey="idle"
//                 stroke="#ffaa00"
//                 strokeWidth={1.8}
//                 fill="url(#idleGrad)"
//                 dot={false}
//                 activeDot={false}
//               />
//             </ComposedChart>
//           </ResponsiveContainer>
//         </>
//       )}
//     </div>
//   );
// }

////////////
