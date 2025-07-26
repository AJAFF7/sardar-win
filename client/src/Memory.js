import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from "recharts";

const formatBytesToGB = (bytes) => (bytes / (1024 ** 3)).toFixed(2); // Convert to GB

export default function Memory() {
  const [memoryData, setMemoryData] = useState([]);

  useEffect(() => {
    const fetchMemory = async () => {
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        const mem = data.memory;

        const chartData = [
          { name: "App memory", value: +formatBytesToGB(mem.used) },
          { name: "Wired memory", value: +formatBytesToGB(mem.free) },
          { name: "Compressed memory", value: +formatBytesToGB(mem.active) },
          { name: "Available memory", value: +formatBytesToGB(mem.available) },
        ];

        setMemoryData(chartData);
      } catch (err) {
        console.error("Failed to fetch memory stats:", err);
      }
    };

    fetchMemory();
    const interval = setInterval(fetchMemory, 1000); // Refresh every 1s
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      width: "45%",
      height: 450,
      boxShadow: "0 10px 30px rgba(0.4, 0.4, 0.4, 0.4)",
      boxSizing: "border-box",
      borderRadius: 16,
      marginTop: "400px",
    }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={memoryData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
          <XAxis dataKey="name" stroke="#666" axisLine={false} tickLine={false} />
          {/* <YAxis stroke="#666" domain={[0, 'ataMax + 2']} axisLine={false} tickLine={false} /> */}
          <Tooltip formatter={(val) => `${val} GB`} />
          <Bar dataKey="value" fill="#8884d8" radius={[6, 6, 0, 0]} barSize={40}>
            <LabelList dataKey="value" position="top" formatter={(val) => `${val} GB`} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}



// import React from "react";
// import {
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";

// export default function Memory() {
//   const dummyMemory = {
//     total: 16000,
//     used: 8000,
//     free: 4000,
//     active: 2000,
//     available: 6000,
//   };

//   const data = [
//     { name: "Used", value: Math.round((dummyMemory.used / dummyMemory.total) * 100) },
//     { name: "Free", value: Math.round((dummyMemory.free / dummyMemory.total) * 100) },
//     { name: "Active", value: Math.round((dummyMemory.active / dummyMemory.total) * 100) },
//     { name: "Available", value: Math.round((dummyMemory.available / dummyMemory.total) * 100) },
//   ];

//   return (
//     <div style={{ width: "100%", height: 200 }}>
//       <ResponsiveContainer>
//         <AreaChart
//           data={data}
//           margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
//         >
//           <defs>
//             <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="5%" stopColor="#66ccff" stopOpacity={0.8} />
//               <stop offset="95%" stopColor="#66ccff" stopOpacity={0} />
//             </linearGradient>
//           </defs>
//           <XAxis dataKey="name" stroke="#ccc" />
//           <YAxis stroke="#ccc" />
//           <Tooltip />
//           <Area
//             type="monotone"
//             dataKey="value"
//             stroke="#3399ff"
//             fillOpacity={1}
//             fill="url(#colorMem)"
//             animationDuration={800}
//           />
//         </AreaChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }



// import React, { useEffect, useState } from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   LabelList,
//   Cell,
// } from "recharts";

// // Convert to GB
// const formatBytesToGB = (bytes) => (bytes / (1024 ** 3)).toFixed(2);

// // ✅ Custom Tooltip with dark background
// const CustomTooltip = ({ active, payload, label }) => {
//   if (active && payload && payload.length) {
//     return (
//       <div
//         style={{
//           backgroundColor: "#222",
//           color: "#fff",
//           padding: "10px 12px",
//           borderRadius: "6px",
//           fontSize: "14px",
//           boxShadow: "0 0 8px rgba(0, 0, 0, 0.3)",
//         }}
//       >
//         <p style={{ margin: 0, fontWeight: "bold" }}>{label}</p>
//         <p style={{ margin: 0 }}>{`${payload[0].value} GB`}</p>
//       </div>
//     );
//   }
//   return null;
// };

// export default function Memory() {
//   const [memoryData, setMemoryData] = useState([]);
//   const [hoveredIndex, setHoveredIndex] = useState(null); // 🔥 Hover state

//   const colors = ["#FF8C00", "#0088FE", "#FF6492", "#00C49F"]; // Bar colors

//   useEffect(() => {
//     const fetchMemory = async () => {
//       try {
//         const res = await fetch("/api/stats");
//         const data = await res.json();
//         const mem = data.memory;

//         const chartData = [
//           { name: "App M", value: +formatBytesToGB(mem.used) },
//           { name: "Wired M", value: +formatBytesToGB(mem.active) },
//           { name: "Compressed M", value: +formatBytesToGB(mem.free) },
//           { name: "Available M", value: +formatBytesToGB(mem.available) },
//         ];

//         setMemoryData(chartData);
//       } catch (err) {
//         console.error("Failed to fetch memory stats:", err);
//       }
//     };

//     fetchMemory();
//     const interval = setInterval(fetchMemory, 1000);
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div
//       style={{
//         width: "45%",
//         height: 400,
//         boxShadow: "0 10px 30px rgba(0.4, 0.4, 0.4, 0.4)",
//         marginTop: "400px",
//         borderRadius: 16,
//         boxSizing: "border-box",
//       }}
//     >
//       <ResponsiveContainer width="100%" height="100%">
//         <BarChart
//           data={memoryData}
//           margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
//         >
//           <XAxis
//             dataKey="name"
//             stroke="#222"
//             axisLine={false}
//             tickLine={false}
//           />
//           <YAxis
//             stroke="#222"
//             domain={[0, "dataMax + 2"]}
//             axisLine={false}
//             tickLine={false}
//             ticks={[]}
//           />
//           <Tooltip content={<CustomTooltip />} />
//           <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40} >
//             <LabelList
//               dataKey="value"
//               position="top"
//               formatter={(val) => `${val} GB`}
//             />
//             {memoryData.map((entry, index) => (
//               <Cell
//                 key={`cell-${index}`}
//                 fill={
//                   hoveredIndex === index
//                     ? "#222"
//                     : colors[index % colors.length]
//                 }
//                 onMouseEnter={() => setHoveredIndex(index)}
//                 onMouseLeave={() => setHoveredIndex(null)}
//               />



//             ))}
//           </Bar>
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }



//  import React, { useEffect, useState } from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   LabelList,
//   Cell,
// } from "recharts";

// const formatBytesToGB = (bytes) => (bytes / (1024 ** 3)).toFixed(2); // Convert to GB

// export default function Memory() {
//   const [memoryData, setMemoryData] = useState([]);

//   const colors = ["#FF8C00", "#0088FE", "#FF6492", "#00C49F"]; // Unique bar colors

//   useEffect(() => {
//     const fetchMemory = async () => {
//       try {
//         const res = await fetch("/api/stats");
//         const data = await res.json();
//         const mem = data.memory;

//         const chartData = [
//           { name: "App M", value: +formatBytesToGB(mem.used) },
//           { name: "Wired M", value: +formatBytesToGB(mem.active) },
//           { name: "Compressed M", value: +formatBytesToGB(mem.free) },
//           { name: "Available M", value: +formatBytesToGB(mem.available) },
//         ];

//         setMemoryData(chartData);
//       } catch (err) {
//         console.error("Failed to fetch memory stats:", err);
//       }
//     };

//     fetchMemory();
//     const interval = setInterval(fetchMemory, 1000);
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div style={{ width: "45%", height: 400,  boxShadow: "0 10px 30px rgba(0.4, 0.4, 0.4, 0.4)", marginTop: "400px", borderRadius: 16,
//     boxSizing: "border-box", }}>
//       {/* <h3 style={{ marginBottom: "10px", fontSize: "20px", color: "#333" }}>Memory</h3> */}
//       <ResponsiveContainer width="100%" height="100%">
//         <BarChart
//           data={memoryData}
//           margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
//         >
//           <XAxis dataKey="name" stroke="#666" axisLine={false} tickLine={false} />
//           <YAxis
//             stroke="666"
//             domain={[0, "dataMax + 2"]}
//             axisLine={false}
//             tickLine={false}
//             ticks={[]} // 🔥 Removes Y-axis line + tick numbers like 0, 1, 2...
//           />
//           <Tooltip formatter={(val) => `${val} GB`} />
//           <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
//             <LabelList dataKey="value" position="top" formatter={(val) => `${val} GB`} />
//             {memoryData.map((entry, index) => (
//               <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
//             ))}
//           </Bar>
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }
