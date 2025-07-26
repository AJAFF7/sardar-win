
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaWifi, FaNetworkWired } from "react-icons/fa";
import { Scrollbar } from "react-scrollbars-custom";

export default function DevicesList() {
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [disconnectedDevices, setDisconnectedDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3535/devices");
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const data = await res.json();
      setConnectedDevices(data.connectedDevices || []);
      setDisconnectedDevices(data.disconnectedDevices || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes blinkGreen {
        0% { box-shadow: 0 0 1px 1px rgba(14, 228, 29, 0.6); }
        100% { box-shadow: 0 0 1px 2px rgba(14, 228, 29, 1); }
      }
      @keyframes blinkRed {
        0% { box-shadow: 0 0 1px 1px rgba(255, 0, 0, 0.5); }
        100% { box-shadow: 0 0 1px 2px rgba(255, 0, 0, 0.9); }
      }
    `;
    document.head.appendChild(styleTag);
  }, []);

  return (
    <div>
    <div style={styles.outerContainer}>
      <h1 style={styles.Heading}>Connected Devices</h1>
      <div style={styles.spinnerWrapper}>
        {loading && <div style={styles.spinner} />}
      </div>
      <div style={styles.sectionWrapper}>
        <DeviceSection
          title="Connected"
          devices={connectedDevices}
          status="connected"
        />
        <DeviceSection
          title="Disconnected"
          devices={disconnectedDevices}
          status="disconnected"
        />
      </div>
    </div>
    </div>
  );


}

function DeviceSection({ title, devices, status }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={styles.section}
    >
      <h2 style={styles.sectionTitle}>{title}</h2>
      <Scrollbar
        style={{ height: 470, width: "100%" }}
        thumbYProps={{
          renderer: ({ elementRef, style, ...restProps }) => (
            <div
              ref={elementRef}
              style={{
                ...style,
                backgroundColor: "#3a5696",
                borderRadius: "8px",
                width: "10px",
                height: "1cm",
                maxHeight: "0.5cm",
              }}
              {...restProps}
            />
          ),
        }}
      >
        {devices.length === 0 ? (
          <div style={styles.emptyState}>
            <FaNetworkWired size={48} color="#666" />
            <p style={styles.emptyText}>No {status} devices found</p>
          </div>
        ) : (
          <div style={styles.deviceGrid}>
            <AnimatePresence>
              {devices.map(({ ip, connectedAt, disconnectedAt }) => (
                <motion.div
                  key={ip}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    ...styles.card,
                    borderLeft: `1px solid ${
                      status === "connected" ? "#4caf50" : "#f44336"
                    }`,
                  }}
                >
                  <div style={styles.cardTop}>
                    <div
                      style={{
                        ...styles.statusDot,
                        backgroundColor:
                          status === "connected" ? "#00ce0e" : "#f44336",
                        animation:
                          status === "connected"
                            ? "blinkGreen 0.01s infinite alternate"
                            : "blinkRed 0.4s infinite alternate",
                      }}
                    />
                    <span style={styles.ip}>{ip}</span>
                    <span style={styles.tag}>
                      <FaWifi
                        color={status === "connected" ? "#4caf50" : "#888"}
                      />
                    </span>
                  </div>
                  <div style={styles.time}>
                    {status === "connected"
                      ? `Connected: ${
                          connectedAt
                            ? new Date(connectedAt).toLocaleString()
                            : "-"
                        }`
                      : `Disconnect: ${
                          disconnectedAt
                            ? new Date(disconnectedAt).toLocaleString()
                            : "-"
                        }`}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </Scrollbar>
    </motion.div>
  );
}

const styles = {
  outerContainer: {
    padding: 24,
    fontFamily: "Inter, sans-serif",
    color: "#fff",
    maxHeight: "100vh",
    marginTop: 140,
  },
  Heading: {
      textAlign: "center",
      marginTop: "0px",
      marginBottom: "20px",
      fontSize: "44px",
      fontWeight: "bold",
      color: "#333",
    },
  spinnerWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: 60,
    width: "100%",
    marginBottom: 10,
  },
  spinner: {
    width: 40,
    height: 40,
    // border: "3px solid rgba(255, 255, 255, 0.2)",
    borderTop: "2px solid #3b82f6",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },


  sectionWrapper: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 24,
    marginTop: 20,
  },
  section: {
    width: 500, // ✅ Fixed width in px (adjust as needed)
    height: 570, // ✅ Fixed height in px (adjust as needed)
    borderRadius: 16,
    padding: 20,
    // border: "1px solid #888",
    // boxShadow: "0px 0px 6px 1px #777",
    boxShadow: "0 10px 30px rgba(0.4, 0.4, 0.4, 0.4)",
    boxSizing: "border-box",
    // scrollbarWidth: "thin", // Firefox
    // scrollbarColor: "#54b9d1 transparent", // Firefox
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 14,
    textAlign: "center",
  },
  deviceGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 15,
  },
  card: {
    background: "#222",
    borderRadius: "10px",
    padding: "5px 2px",
    boxShadow: "0 10px 30px rgba(0.4, 0.4, 0.4, 0.4)",
    // cursor: "pointer",
    // transition: "transform 0.3s ease, border 0.3s ease",
    // border: "1px solid transparent",
  },
  cardTop: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 0,
  },
  statusDot: {
    width: 4,
    height: 4,
    borderRadius: "50%",
    marginLeft: 6,
  },
  ip: {
    flex: 1,
    fontWeight: 600,
    color: "#fff",
  },
  tag: {
    fontSize: 16,
  },
  time: {
    fontSize: 13,
    color: "#bbb",
    marginTop: 4,
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    gap: 12,
  },
};

// Inject animations and scrollbar styling into the document
const styleTag = document.createElement("style");
styleTag.innerHTML = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes blinkGreen {
    0% { box-shadow: 0 0 1px 1px rgba(14, 228, 29, 0.6); }
    100% { box-shadow: 0 0 1px 2px rgba(14, 228, 29, 1); }
  }
  @keyframes blinkRed {
    0% { box-shadow: 0 0 1px 1px rgba(255, 0, 0, 0.5); }
    100% { box-shadow: 0 0 1px 2px rgba(255, 0, 0, 0.9); }
  }

`;
document.head.appendChild(styleTag); //

//////////////


// import React, { useEffect, useState } from "react";
// import { AnimatePresence, motion } from "framer-motion";

// export default function DevicesList() {
//   const [connectedDevices, setConnectedDevices] = useState([]);
//   const [disconnectedDevices, setDisconnectedDevices] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const fetchDevices = async () => {
//     try {
//       setLoading(true);
//       const res = await fetch("http://localhost:3535/devices");
//       if (!res.ok) throw new Error(`Error: ${res.status}`);
//       const data = await res.json();
//       setConnectedDevices(data.connectedDevices || []);
//       setDisconnectedDevices(data.disconnectedDevices || []);
//     } catch (e) {
//       setError(e.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDevices();
//     const interval = setInterval(fetchDevices, 10000);
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div style={styles.outerContainer}>
//       <div style={styles.spinnerWrapper}>
//         {loading && <div style={styles.spinner} />}
//       </div>

//       <div style={styles.sectionsRow}>
//         <div style={styles.section}>
//           <h2 style={styles.heading}>Connected</h2> <br />
//           {error && <p style={styles.error}>{error}</p>}
//           <DeviceCards devices={connectedDevices} status="connected" />
//         </div>
//         <div style={styles.section}>
//           <h2 style={styles.heading}>Disconnected</h2> <br />
//           <DeviceCards devices={disconnectedDevices} status="disconnected" />
//         </div>
//       </div>
//     </div>
//   );
// }

// function DeviceCards({ devices, status }) {
//   const isConnected = status === "connected";

//   return (
//     <div style={styles.cardGrid}>
//       <AnimatePresence>
//         {devices.map(({ ip, connectedAt, disconnectedAt }) => (
//           <motion.div
//             key={ip}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -20 }}
//             transition={{ duration: 0.4 }}
//             layout
//             // style={{
//             //   ...styles.deviceCard,
//             //   borderLeft: `5px solid  ${isConnected ? "#00ce0e" : "#ff4d4f"}`,
//             // }}

//             style={{
//               ...styles.deviceCard,
//               borderLeft: `5px solid ${isConnected ? "#00ce0e" : "#ff4d4f"}`,
//               borderTop: "0.7px solid " + (isConnected ? "#00ce0e" : "#ff4d4f"),
//               borderBottom:
//                 "0.7px solid " + (isConnected ? "#00ce0e" : "#ff4d4f"),
//               borderRight:
//                 "0.7px solid " + (isConnected ? "#00ce0e" : "#ff4d4f"),
//             }}
//           >
//             <div style={styles.statusRow}>
//               <div
//                 style={{
//                   ...styles.statusDot,
//                   backgroundColor: isConnected ? "#00ce0e" : "red",
//                   animation: isConnected
//                     ? "blinkGreen 1s infinite"
//                     : "blinkRed 1s infinite",
//                 }}
//               />
//               <span style={styles.ipAddress}>{ip}</span>
//               <span style={styles.statusText}>
//                 {isConnected ? "Online" : "Offline"}
//               </span>
//             </div>
//             <div style={styles.timestamp}>
//               {isConnected
//                 ? `Connected: ${connectedAt ? new Date(connectedAt).toLocaleString() : "-"}`
//                 : `Disconnect: ${disconnectedAt ? new Date(disconnectedAt).toLocaleString() : "-"}`}
//             </div>
//           </motion.div>
//         ))}
//       </AnimatePresence>
//     </div>
//   );
// }

// const styles = {
//   // outerContainer: {
//   //   display: "flex",
//   //   flexDirection: "column",
//   //   alignItems: "center",
//   //   padding: 20,
//   //   fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
//   // },

//   outerContainer: {
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 30,
//     fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
//     background: "#111", // dark background
//     borderRadius: "20px", // rounded edges
//     boxShadow: "0 0 30px rgba(0,0,0,0.4)",
//     maxWidth: "1150px",
//     margin: "40px auto",
//     border: "1px solid #333",
//   },

//   spinnerWrapper: {
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     height: "60px",
//     width: "100%",
//     marginBottom: 10,
//   },
//   spinner: {
//     width: "30px",
//     height: "30px",
//     border: "3px solid rgba(255, 255, 255, 0.2)",
//     borderTop: "3px solid #3b82f6",
//     borderRadius: "50%",
//     animation: "spin 0.8s linear infinite",
//   },
//   sectionsRow: {
//     display: "flex",
//     flexDirection: "row",
//     justifyContent: "center",
//     gap: "100px",
//     width: "100%",
//     flexWrap: "wrap",
//   },
//   section: {
//     flex: 1,
//     maxWidth: "40%",
//     textAlign: "center",
//     minWidth: "100px",
//   },
//   heading: {
//     fontSize: "24px",
//     fontWeight: "600",
//     marginBottom: 10,
//     marginTop: 10,
//     // marginRight: 90,
//   },
//   error: {
//     color: "red",
//     fontWeight: "bold",
//   },
//   // cardGrid: {
//   //   display: "flex",
//   //   flexDirection: "column",
//   //   gap: "14px",
//   //   marginTop: 10,
//   // },

//   cardGrid: {
//     display: "grid",
//     gridTemplateColumns: "1fr 1fr", // two columns
//     gap: "14px",
//     marginTop: 10,
//     justifyItems: "center",
//   },

//   deviceCard: {
//     background: "#000", //#1f1f1f
//     borderRadius: "12px",
//     padding: "2px 10px",
//     boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
//     textAlign: "left",
//     color: "#fff",
//     width: "235px",
//   },
//   ipPill: {
//     background: "linear-gradient(135deg, #4f46e5, #3b82f6)",
//     color: "#fff",
//     padding: "6px 12px",
//     borderRadius: "8px",
//     fontWeight: "bold",
//     display: "inline-block",
//     marginBottom: "10px",
//   },
//   statusRow: {
//     display: "flex",
//     alignItems: "center",
//     gap: "10px",
//     marginBottom: "8px",
//   },
//   statusDot: {
//     cursor: "pointer",
//     width: "5px",
//     height: "5px",
//     borderRadius: "50%",
//     backgroundColor: "#00ce0eff", // green
//     transition: "0.1s",
//     animation: "blinkGreen 0.01s infinite alternate",
//   },
//   statusText: {
//     fontWeight: "600",
//   },
//   timestamp: {
//     fontSize: "13px",
//     color: "#bbb",
//   },
// };

// const styleTag = document.createElement("style");
// styleTag.innerHTML = `
//   @keyframes spin {
//     0% { transform: rotate(0deg); }
//     100% { transform: rotate(360deg); }
//   }
//   @keyframes blinkGreen {
//     0% { box-shadow: 0 0 1px 1px rgba(14, 228, 29, 0.6); }
//     100% { box-shadow: 0 0 1px 2px rgba(14, 228, 29, 1); }
//   }
//   @keyframes blinkRed {
//     0% { box-shadow: 0 0 1px 1px rgba(255, 0, 0, 0.5); }
//     100% { box-shadow: 0 0 1px 2px rgba(255, 0, 0, 0.9); }
//   }
// `;
// document.head.appendChild(styleTag);

////////////

// import React, { useEffect, useState } from "react";

// export default function DevicesList() {
//   const [connectedDevices, setConnectedDevices] = useState([]);
//   const [disconnectedDevices, setDisconnectedDevices] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const fetchDevices = async () => {
//     try {
//       setLoading(true);
//       const res = await fetch("http://localhost:3535/devices");
//       if (!res.ok) throw new Error(`Error: ${res.status}`);
//       const data = await res.json();
//       setConnectedDevices(data.connectedDevices || []);
//       setDisconnectedDevices(data.disconnectedDevices || []);
//     } catch (e) {
//       setError(e.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDevices();
//     const interval = setInterval(fetchDevices, 10000);
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div style={styles.outerContainer}>
//       <div style={styles.spinnerWrapper}>
//         {loading && <div style={styles.spinner} />}
//       </div>

//       <div style={styles.sectionsRow}>
//         <div style={styles.section}>
//           <h2 style={styles.heading}>Connected Devices</h2>
//           {error && <p style={styles.error}>{error}</p>}
//           <DeviceTable devices={connectedDevices} status="connected" />
//         </div>
//         <div style={styles.section}>
//           <h2 style={styles.heading}>Disconnected Devices</h2>
//           <DeviceTable devices={disconnectedDevices} status="disconnected" />
//         </div>
//       </div>
//     </div>
//   );
// }

// function DeviceTable({ devices, status }) {
//   const isConnected = status === "connected";

//   const tableStyle = {
//     width: "100%",
//     borderCollapse: "separate",
//     borderSpacing: "3px",
//     fontSize: "15px",
//     borderRadius: "12px",
//     overflow: "hidden",
//     boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
//     marginTop: 10,
//     backgroundColor: "transparent",
//   };

//   const gradientPill = {
//     background: "linear-gradient(135deg, #4f46e5, #3b82f6)",
//     color: "#fff",
//     //padding: "6px 14px",
//     padding: "6px 14px",
//     borderRadius: "10px",
//     fontWeight: "bold",
//     fontSize: "14px",
//     display: "inline-block",

//   };

//   const statusPill = {
//     backgroundColor: isConnected ? "#3aff40ff" : "#888",
//     color: "#000",
//     padding: "6px 14px",
//     borderRadius: "6px",
//     fontWeight: "bold",
//     fontSize: "14px",
//     display: "inline-block",
//   };

//   const at = {
//     color: "#555",
//     fontSize: "13px",
//   };

//   return (
//     <table style={tableStyle}>
//       <thead>
//         <tr style={styles.tableHeader}>
//           <th style={styles.th_ip}>IP </th>
//           <th style={styles.th_status}>Status</th>
//           {isConnected && <th style={styles.th_connec}>Connected At</th>}
//           {!isConnected && <th style={styles.th_disconnec}>Disconnected At</th>}
//         </tr>
//       </thead>
//       <tbody>
//         {devices.map(({ ip, connectedAt, disconnectedAt }) => (
//           <tr key={ip} style={{ textAlign: "center" }}>
//             <td style={styles.td_cell}>
//               <span style={gradientPill}>{ip}</span>
//             </td>
//             <td style={styles.td_cell}>
//               <div
//                 style={{
//                   display: "inline-flex",
//                   alignItems: "center",
//                   gap: 8,
//                   justifyContent: "center",
//                 }}
//               >
//                 <span
//                   style={
//                     isConnected
//                       ? styles.statusDotOnline
//                       : styles.statusDotOffline
//                   }
//                 />
//                 <span style={statusPill}>{isConnected ? "Online" : "Offline"}</span>
//               </div>
//             </td>
//             {isConnected && (
//               <td style={styles.td_cell}>
//                 <span style={styles.at}>
//                   {connectedAt ? new Date(connectedAt).toLocaleString() : "-"}
//                 </span>
//               </td>
//             )}
//             {!isConnected && (
//               <td style={styles.td_cell}>
//                 <span style={styles.at}>
//                   {disconnectedAt ? new Date(disconnectedAt).toLocaleString() : "-"}
//                 </span>
//               </td>
//             )}
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   );
// }

// const styles = {
//   outerContainer: {
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     padding: 20,
//     fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
//   },
//   spinnerWrapper: {
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     height: "60px",
//     width: "100%",
//     marginBottom: 10,
//   },
//   spinner: {
//     width: "30px",
//     height: "30px",
//     border: "2px solid rgba(255, 255, 255, 0.2)",
//     borderTop: "2px solid #3b82f6",
//     borderRadius: "50%",
//     animation: "spin 1s linear infinite",
//   },
//   sectionsRow: {
//     display: "flex",
//     flexDirection: "row",
//     justifyContent: "center",
//     gap: "40px",
//     width: "100%",
//     flexWrap: "wrap",
//   },
//   section: {
//     flex: 1,
//     maxWidth: "48%",
//     textAlign: "center",
//     minWidth: "300px",
//   },
//   heading: {
//     fontSize: "24px",
//     fontWeight: "600",
//     marginBottom: 10,
//     marginTop: 10,
//   },
//   error: {
//     color: "red",
//     fontWeight: "bold",
//   },
//   tableHeader: {
//     textAlign: "center",
//     backgroundColor: "transparent",
//   },
//   th_ip: {
//     padding: "6px 8px",
//     fontWeight: "600",
//     userSelect: "none",
//     backgroundColor: "#abc1ff",
//     height: "30px",
//     width: "100px",
//     borderRadius: "6px",
//     border: "1px solid #ddd",
//   },
//   th_status: {
//     padding: "6px 8px",
//     fontWeight: "600",
//     userSelect: "none",
//     backgroundColor: "#a0d8ef",
//     height: "30px",
//     width: "100px",
//     borderRadius: "6px",
//     border: "1px solid #ddd",
//   },
//   th_connec: {
//     padding: "6px 8px",
//     fontWeight: "600",
//     userSelect: "none",
//     backgroundColor: "#b5e48c",
//     height: "30px",
//     width: "100px",
//     borderRadius: "6px",
//     border: "1px solid #ddd",
//   },
//   th_disconnec: {
//     padding: "6px 8px",
//     fontWeight: "600",
//     userSelect: "none",
//     backgroundColor: "#ffb4a2",
//     height: "30px",
//     width: "100px",
//     borderRadius: "6px",
//     border: "1px solid #ddd",
//   },
//   td_cell: {
//     backgroundColor: "#333",
//     borderRadius: "6px",
//     border: "1px solid #ddd",
//     padding: "8px 10px",
//     height: "30px",
//     width: "100px",
//     textAlign: "center",
//   },

//   at:{
//   color: "#fff",
//   },

//   statusDotOnline: {
// cursor: "pointer",
// width: "5px",
// height: "5px",
// borderRadius: "50%",
// backgroundColor: "#00ce0eff", // green
// transition: "0.1s",
// animation: "blinkGreen 0.01s infinite alternate",
//   },
//   statusDotOffline: {
//     cursor: "pointer",
//     width: "5px",
//     height: "5px",
//     borderRadius: "50%",
//     backgroundColor: "red",
//     transition: "0.1s",
//     animation: "blinkRed 1s infinite alternate",
//   },
// };

// // Inject keyframes for spinner and blinking animations
// const styleTag = document.createElement("style");
// styleTag.innerHTML = `
//   @keyframes spin {
//     0% { transform: rotate(0deg); }
//     100% { transform: rotate(360deg); }
//   }
//   @keyframes blinkGreen {
//     0% { box-shadow: 0 0 1px 1px rgba(14, 228, 29, 0.6); }
//     100% { box-shadow: 0 0 1px 2px rgba(14, 228, 29, 1); }
//   }
//   @keyframes blinkRed {
//     0% { box-shadow: 0 0 1px 1px rgba(255, 0, 0, 0.5); }
//     100% { box-shadow: 0 0 1px 2px rgba(255, 0, 0, 0.9); }
//   }
// `;
// document.head.appendChild(styleTag);

////////////////////////////////////

// import React, { useEffect, useState } from "react";

// export default function Embed2() {
//   const [connectedDevices, setConnectedDevices] = useState([]);
//   const [disconnectedDevices, setDisconnectedDevices] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const fetchDevices = async () => {
//     try {
//       setLoading(true);
//       const res = await fetch("http://localhost:3535/devices");
//       if (!res.ok) throw new Error(`Error: ${res.status}`);
//       const data = await res.json();
//       setConnectedDevices(data.connectedDevices || []);
//       setDisconnectedDevices(data.disconnectedDevices || []);
//     } catch (e) {
//       setError(e.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDevices();
//     const interval = setInterval(fetchDevices, 10000);
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div style={styles.outerContainer}>
//       {loading && (
//         <div style={styles.spinnerContainer}>
//           <div style={styles.spinner} />
//         </div>
//       )}
//       <div style={styles.sectionsRow}>
//         <div style={styles.section}>
//           <h2 style={styles.heading}>Connected Devices</h2>
//           {error && <p style={styles.error}>{error}</p>}
//           <DeviceTable devices={connectedDevices} status="connected" />
//         </div>
//         <div style={styles.section}>
//           <h2 style={styles.heading}>Disconnected Devices</h2>
//           <DeviceTable devices={disconnectedDevices} status="disconnected" />
//         </div>
//       </div>
//     </div>
//   );
// }

// function DeviceTable({ devices, status }) {
//   const isConnected = status === "connected";

//   const tableStyle = {
//     width: "100%",
//     borderCollapse: "separate",
//     borderSpacing: 0,
//     fontSize: "15px",
//     backgroundColor: "#cac3c3ff",
//     borderRadius: "12px",
//     overflow: "hidden",
//     boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
//     marginTop: 10,
//   };

//   const gradientPill = {
//     background: "linear-gradient(135deg, #4f46e5, #3b82f6)",
//     color: "#fff",
//     padding: "6px 14px",
//     borderRadius: "12px",
//     fontWeight: "bold",
//     fontSize: "14px",
//     display: "inline-block",
//     margin: "4px",
//   };

//   const statusPill = {
//     background: isConnected ? "#3aff40ff" : "#888",
//     color: "#000",
//     padding: "6px 14px",
//     borderRadius: "6px",
//     fontWeight: "bold",
//     fontSize: "14px",
//     display: "inline-block",
//     margin: "4px",
//   };

//   const at = {
//     color: "#ddd",
//   };

//   return (
//     <table style={tableStyle}>
//       <thead>
//         <tr style={styles.tableHeader}>
//           <th style={styles.th}>Hostname</th>
//           <th style={styles.th}>IP Address</th>
//           <th style={styles.th}>MAC Address</th>
//           <th style={styles.th}>Status</th>
//           {isConnected && <th style={styles.th}>Connected At</th>}
//           {!isConnected && <th style={styles.th}>Disconnected At</th>}
//         </tr>
//       </thead>
//       <tbody>
//         {devices.map(({ ip, mac, hostname, connectedAt, disconnectedAt }, idx) => (
//           <tr
//             key={ip}
//             style={{
//               backgroundColor: "#222",
//               textAlign: "center",
//             }}
//           >
//             <td><span style={gradientPill}>{hostname || "Unknown"}</span></td>
//             <td><span style={gradientPill}>{ip}</span></td>
//             <td><span style={gradientPill}>{mac}</span></td>
//             <td><span style={statusPill}>{isConnected ? "Online" : "Offline"}</span></td>
//             {isConnected && (
//               <td><span style={at}>{connectedAt ? new Date(connectedAt).toLocaleString() : "-"}</span></td>
//             )}
//             {!isConnected && (
//               <td><span style={at}>{disconnectedAt ? new Date(disconnectedAt).toLocaleString() : "-"}</span></td>
//             )}
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   );
// }

// const styles = {
//   outerContainer: {
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     padding: 20,
//     fontFamily: "Segoe UI, sans-serif",
//   },
//   sectionsRow: {
//     display: "flex",
//     flexDirection: "row",
//     justifyContent: "center",
//     gap: "40px",
//     width: "100%",
//     flexWrap: "wrap",
//   },
//   section: {
//     flex: 1,
//     maxWidth: "48%",
//     textAlign: "center",
//     minWidth: "300px",
//   },
//   heading: {
//     fontSize: "24px",
//     fontWeight: "600",
//     marginBottom: 10,
//     marginTop: 10,
//   },
//   error: {
//     color: "red",
//     fontWeight: "bold",
//   },
//   tableHeader: {
//     color: "#fff",
//     backgroundColor: "#3e4b5b",
//     textAlign: "center",
//   },
//   th: {
//     padding: "12px 15px",
//     fontWeight: "600",
//     userSelect: "none",
//   },
//   spinnerContainer: {
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 20,
//     minHeight: "40px",
//   },
//   spinner: {
//     width: "30px",
//     height: "30px",
//     border: "2px solid rgba(255, 255, 255, 0.2)",
//     borderTop: "2px solid #ffffff",
//     borderRadius: "50%",
//     animation: "spin 1s linear infinite",
//   },
// };

/////////////////////

// import React, { useEffect, useState } from "react";
// // import DevicesList from "./List.js"

// import "./App.css";

// const Embed2 = () => {
//   const fullText = "Under Construction";

//   const [count, setCount] = useState(3);
//   const [displayedText, setDisplayedText] = useState("");
//   const [index, setIndex] = useState(0);
//   const [countdownDone, setCountdownDone] = useState(false);

//   // Countdown logic
//   useEffect(() => {
//     if (count > 0) {
//       const timer = setTimeout(() => setCount(count - 1), 1000);
//       return () => clearTimeout(timer);
//     } else if (count === 0) {
//       setCountdownDone(true);
//     }
//   }, [count]);

//   // Text animation logic
//   useEffect(() => {
//     if (countdownDone && index < fullText.length) {
//       const timeout = setTimeout(() => {
//         setDisplayedText((prev) => prev + fullText[index]);
//         setIndex(index + 1);
//       }, 150);
//       return () => clearTimeout(timeout);
//     }
//   }, [countdownDone, index, fullText]);

//   return (
//     <>
//       {!countdownDone && (
//         <div className="countdown-overlay">
//           <div className="countdown-text">{count}</div>
//         </div>
//       )}
//       <div className="embed2-container">
//         {countdownDone && <div className="embed2-text">{displayedText}</div>}
//       </div>
//       {/* <DevicesList /> */}
//     </>
//   );
// };

// export default Embed2;

//////////////////////////////

// // components/Vault.js
// import React from 'react';
// import './App.css';

// const Embed2 = () => {
//   return (
//     <div className="w-full h-full bg-white rounded-xl overflow-hidden border shadow">
//       <webview
//         src="http://localhost:3535/proxy1"
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

// export default Embed2;
