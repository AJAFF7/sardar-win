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
    <div style={styles.outerContainer}>
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

///////////////

// import React, { useEffect, useState } from "react";
// import { AnimatePresence, motion } from "framer-motion";
// import { FaWifi, FaNetworkWired } from "react-icons/fa";
// import { Scrollbar } from "react-scrollbars-custom";

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
//     const interval = setInterval(fetchDevices, 5000);
//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     const styleTag = document.createElement("style");
//     styleTag.innerHTML = `
//       @keyframes spin {
//         0% { transform: rotate(0deg); }
//         100% { transform: rotate(360deg); }
//       }
//       @keyframes blinkGreen {
//         0% { box-shadow: 0 0 1px 1px rgba(14, 228, 29, 0.6); }
//         100% { box-shadow: 0 0 1px 2px rgba(14, 228, 29, 1); }
//       }
//       @keyframes blinkRed {
//         0% { box-shadow: 0 0 1px 1px rgba(255, 0, 0, 0.5); }
//         100% { box-shadow: 0 0 1px 2px rgba(255, 0, 0, 0.9); }
//       }
//     `;
//     document.head.appendChild(styleTag);
//   }, []);

//   return (
//     <div style={styles.outerContainer}>
//       <div style={styles.spinnerWrapper}>
//         {loading && <div style={styles.spinner} />}
//       </div>
//       <div style={styles.sectionWrapper}>
//         <DeviceSection
//           title="Connected"
//           devices={connectedDevices}
//           status="connected"
//         />
//         <DeviceSection
//           title="Disconnected"
//           devices={disconnectedDevices}
//           status="disconnected"
//         />
//       </div>
//     </div>
//   );
// }

// function DeviceSection({ title, devices, status }) {
//   return (
//     <motion.div
//       whileHover={{ scale: 1.03 }}
//       transition={{ type: "spring", stiffness: 300, damping: 20 }}
//       style={styles.section}
//     >
//       <h2 style={styles.sectionTitle}>{title}</h2>
//       <Scrollbar
//         style={{ height: 470, width: "100%" }}
//         thumbYProps={{
//           renderer: ({ elementRef, style, ...restProps }) => (
//             <div
//               ref={elementRef}
//               style={{
//                 ...style,
//                 backgroundColor: "#3a5696",
//                 borderRadius: "8px",
//                 width: "10px",
//                 height: "1cm",
//                 maxHeight: "0.5cm",
//               }}
//               {...restProps}
//             />
//           ),
//         }}
//       >
//         {devices.length === 0 ? (
//           <div style={styles.emptyState}>
//             <FaNetworkWired size={48} color="#666" />
//             <p style={styles.emptyText}>No {status} devices found</p>
//           </div>
//         ) : (
//           <div style={styles.deviceGrid}>
//             <AnimatePresence>
//               {devices.map(({ ip, connectedAt, disconnectedAt }) => (
//                 <motion.div
//                   key={ip}
//                   layout
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: -10 }}
//                   transition={{ duration: 0.3 }}
//                   style={{
//                     ...styles.card,
//                     borderLeft: `4px solid ${
//                       status === "connected" ? "#4caf50" : "#f44336"
//                     }`,
//                   }}
//                 >
//                   <div style={styles.cardTop}>
//                     <div
//                       style={{
//                         ...styles.statusDot,
//                         backgroundColor:
//                           status === "connected" ? "#00ce0e" : "#f44336",
//                         animation:
//                           status === "connected"
//                             ? "blinkGreen 0.01s infinite alternate"
//                             : "blinkRed 0.4s infinite alternate",
//                       }}
//                     />
//                     <span style={styles.ip}>{ip}</span>
//                     <span style={styles.tag}>
//                       <FaWifi
//                         color={status === "connected" ? "#4caf50" : "#888"}
//                       />
//                     </span>
//                   </div>
//                   <div style={styles.time}>
//                     {status === "connected"
//                       ? `Connected: ${
//                           connectedAt
//                             ? new Date(connectedAt).toLocaleString()
//                             : "-"
//                         }`
//                       : `Disconnect: ${
//                           disconnectedAt
//                             ? new Date(disconnectedAt).toLocaleString()
//                             : "-"
//                         }`}
//                   </div>
//                 </motion.div>
//               ))}
//             </AnimatePresence>
//           </div>
//         )}
//       </Scrollbar>
//     </motion.div>
//   );
// }

// const styles = {
//   outerContainer: {
//     padding: 24,
//     fontFamily: "Inter, sans-serif",
//     color: "#fff",
//     maxHeight: "100vh",
//     marginTop: 140,
//   },
//   spinnerWrapper: {
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     height: 60,
//     width: "100%",
//     marginBottom: 10,
//   },
//   spinner: {
//     width: 30,
//     height: 30,
//     border: "3px solid rgba(255, 255, 255, 0.2)",
//     borderTop: "3px solid #3b82f6",
//     borderRadius: "50%",
//     animation: "spin 0.8s linear infinite",
//   },
//   sectionWrapper: {
//     display: "flex",
//     flexWrap: "wrap",
//     justifyContent: "center",
//     gap: 24,
//     marginTop: 20,
//   },
//   section: {
//     width: 500, // ✅ Fixed width in px (adjust as needed)
//     height: 570, // ✅ Fixed height in px (adjust as needed)
//     borderRadius: 16,
//     padding: 20,
//     // border: "1px solid #888",
//     // boxShadow: "0px 0px 6px 1px #777",
//     boxShadow: "0 10px 30px rgba(0.4, 0.4, 0.4, 0.4)",
//     boxSizing: "border-box",
//     // scrollbarWidth: "thin", // Firefox
//     // scrollbarColor: "#54b9d1 transparent", // Firefox
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 14,
//     textAlign: "center",
//   },
//   deviceGrid: {
//     display: "grid",
//     gridTemplateColumns: "1fr 1fr",
//     gap: 15,
//   },
//   card: {
//     background: "#222",
//     borderRadius: 10,
//     padding: "5px 2px",
//     boxShadow: "0 10px 30px rgba(0.4, 0.4, 0.4, 0.4)",
//   },
//   cardTop: {
//     display: "flex",
//     alignItems: "center",
//     gap: 10,
//     marginBottom: 0,
//   },
//   statusDot: {
//     width: 4,
//     height: 4,
//     borderRadius: "50%",
//     marginLeft: 6,
//   },
//   ip: {
//     flex: 1,
//     fontWeight: 600,
//     color: "#fff",
//   },
//   tag: {
//     fontSize: 16,
//   },
//   time: {
//     fontSize: 13,
//     color: "#bbb",
//     marginTop: 4,
//   },
//   emptyState: {
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     justifyContent: "center",
//     padding: "40px 20px",
//     gap: 12,
//   },
// };

// // Inject animations and scrollbar styling into the document
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

/////////////
////////////

// import React, { useEffect, useState } from "react";
// import { AnimatePresence, motion } from "framer-motion";
// import { FaWifi, FaNetworkWired, FaPlug } from "react-icons/fa";

// export default function DevicesList() {
//   const [connectedDevices, setConnectedDevices] = useState([]);
//   const [disconnectedDevices, setDisconnectedDevices] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isHovered, setIsHovered] = useState(false);

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
//     const interval = setInterval(fetchDevices, 5000);
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div style={styles.outerContainer}>
//       <div style={styles.spinnerWrapper}>
//         {loading && <div style={styles.spinner} />}
//       </div>

//       <div style={styles.sectionWrapper}>
//         <DeviceSection
//           title="Connected"
//           devices={connectedDevices}
//           status="connected"
//         />
//         <DeviceSection
//           title="Disconnected"
//           devices={disconnectedDevices}
//           status="disconnected"
//         />
//       </div>
//     </div>
//   );
// }

// function DeviceSection({ title, devices, status }) {
//   return (
//     <motion.div
//       whileHover={{ scale: 1.03 }}
//       transition={{ type: "spring", stiffness: 300, damping: 20 }}
//       style={styles.section}
//     >
//       <h2 style={styles.sectionTitle}>{title}</h2>

//       {devices.length === 0 && (
//         <div style={styles.emptyState}>
//           <FaNetworkWired size={48} color="#666" />
//           <p style={styles.emptyText}>No {status} devices found</p>
//         </div>
//       )}

//       <div style={styles.deviceGrid}>
//         <AnimatePresence>
//           {devices.map(({ ip, connectedAt, disconnectedAt }) => (
//             <motion.div
//               key={ip}
//               layout
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -10 }}
//               transition={{ duration: 0.3 }}
//               style={{
//                 ...styles.card,
//                 borderLeft: `4px solid ${
//                   status === "connected" ? "#4caf50" : "#f44336"
//                 }`,
//               }}
//             >
//               <div style={styles.cardTop}>
//                 <div
//                   style={{
//                     ...styles.statusDot,
//                     backgroundColor:
//                       status === "connected" ? "#00ce0e" : "#f44336",
//                     animation:
//                       status === "connected"
//                         ? "blinkGreen 0.01s infinite alternate"
//                         : "blinkRed 0.4s infinite alternate",
//                   }}
//                 />
//                 <span style={styles.ip}>{ip}</span>
//                 <span style={styles.tag}>
//                   {status === "connected" ? (
//                     <FaWifi color="#4caf50" />
//                   ) : (
//                     <FaWifi color="#888" />
//                   )}
//                 </span>
//               </div>
//               <div style={styles.time}>
//                 {status === "connected"
//                   ? `Connected: ${
//                       connectedAt ? new Date(connectedAt).toLocaleString() : "-"
//                     }`
//                   : `Disconnect: ${
//                       disconnectedAt
//                         ? new Date(disconnectedAt).toLocaleString()
//                         : "-"
//                     }`}
//               </div>
//             </motion.div>
//           ))}
//         </AnimatePresence>
//       </div>
//     </motion.div>
//   );
// }

// const styles = {
//   outerContainer: {
//     padding: 24,
//     fontFamily: "Inter, sans-serif",
//     // backgroundColor: "#333",
//     maxHeight: "100vh",
//     color: "#fff",
//     borderRadius: "1%",
//     marginTop: "40px",
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

//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 14,
//     textAlign: "center",
//     display: "block",
//     width: "100%",
//   },

//   error: {
//     color: "red",
//     textAlign: "center",
//     fontWeight: "600",
//   },

//   // sectionWrapper: {
//   //   display: "grid",
//   //   gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
//   //   gap: 24,
//   //   marginTop: 20,
//   // },

//   sectionWrapper: {
//     display: "flex",
//     flexWrap: "wrap",
//     justifyContent: "center",
//     gap: 24,
//     marginTop: 20,
//   },

//   // section: {
//   //   borderRadius: 16,
//   //   padding: 20,
//   //   border: "1px solid #888",
//   //   boxShadow: "0px 0px 6px 1px #777",
//   //   overflow: "auto",
//   //   maxHeight: "100%",
//   //   scrollbarWidth: "thin",
//   //   scrollbarColor: "#54b9d1 transparent",
//   // },

// section: {
//   width: 500, // ✅ Fixed width in px (adjust as needed)
//   height: 670, // ✅ Fixed height in px (adjust as needed)
//   borderRadius: 16,
//   padding: 20,
//   // border: "1px solid #888",
//   // boxShadow: "0px 0px 6px 1px #777",
//   boxShadow: "0 10px 30px rgba(0.4, 0.4, 0.4, 0.4)",
//   overflowY: "auto", // ✅ Scroll only vertically
//   overflowX: "hidden", // ✅ Prevent horizontal scroll
//   boxSizing: "border-box",
//   scrollbarWidth: "thin", // Firefox
//   scrollbarColor: "#54b9d1 transparent", // Firefox

//     transition: "transform 0.01s ease-in-out",
//     cursor: "pointer",
//   },

//   deviceGrid: {
//     display: "grid",
//     gridTemplateColumns: "1fr 1fr",
//     gap: 15,
//   },

//   card: {
//     background: "#000",
//     borderRadius: 10,
//     padding: "12px 2px",
//     boxShadow: "0 10px 30px rgba(0.4, 0.4, 0.4, 0.4)",
//   },

//   cardTop: {
//     display: "flex",
//     alignItems: "center",
//     gap: 10,
//     marginBottom: 0,
//   },

//   statusDot: {
//     width: "4px",
//     height: "4px",
//     borderRadius: "50%",
//     marginLeft: "6px",
//   },

//   ip: {
//     flex: 1,
//     fontWeight: 600,
//     color: "#fff",
//   },

//   tag: {
//     fontSize: 16,
//   },

//   time: {
//     fontSize: 13,
//     color: "#bbb",
//     marginTop: 4,
//   },

//   emptyState: {
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     justifyContent: "center",
//     padding: "40px 20px",
//     gap: 12,
//   },
// };

// // Inject animations and scrollbar styling into the document
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

//   /* Custom Scrollbar Styling */
//   .scrollable-section::-webkit-scrollbar {
//     width: 5px;            /* Vertical scrollbar width */
//     height: 1cm;           /* Horizontal scrollbar height */
//   }

//   .scrollable-section::-webkit-scrollbar-track {
//     background: transparent;
//   }

//   .scrollable-section::-webkit-scrollbar-thumb {
//     background-color: #54b9d1;
//     border-radius: 8px;
//   }

//   .scrollable-section::-webkit-scrollbar-corner {
//     background: transparent;
//   }
// `;
// document.head.appendChild(styleTag);
