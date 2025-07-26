///////////////////////

import React, { useState } from "react";
import DevicesList from "./List.js";

const ConnectedDevices = () => {
  const [ipInput, setIpInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedDevices, setSavedDevices] = useState([]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      checkDevice();
    }
  };

  const checkDevice = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/check-device", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: ipInput }),
      });

      const data = await res.json();
      if (!res.ok) {
        setResult({ error: data.error || "Unknown error" });
      } else {
        const device = {
          ip: ipInput,
          url: data.url || `http://${ipInput}/`,
        };
        setResult({ url: device.url });

        setSavedDevices((prev) => {
          if (prev.some((d) => d.ip === device.ip)) return prev;
          return [...prev, device];
        });
      }
    } catch (err) {
      setResult({ error: "Network error or server not running" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "1rem", position: "relative", minHeight: "200px" }}>
      <h2 style={{ color: "#555" }}>Check Device</h2>
      <br />

      <input
        type="text"
        placeholder="Enter IP address"
        value={ipInput}
        onChange={(e) => setIpInput(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          backgroundColor: "#555",
          padding: "0.6rem 1rem",
          width: "200px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          fontSize: "16px",
          outline: "none",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          color: "#dbdbdb",
          fontWeight: "bold",
        }}
      />

      <button
        onClick={checkDevice}
        disabled={loading || !ipInput.trim()}
        style={{
          marginLeft: "1rem",
          padding: "0.6rem 1.2rem",
          backgroundColor: "#5e3922",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          transition: "background 0.3s",
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#9e3922")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#5e3922")}
      >
        {loading ? "Checking" : "➜"}
      </button>

      {loading && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              border: "6px solid rgba(255, 255, 255, 0.2)",
              borderTop: "6px solid #ffffff",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginTop: "100px",
              marginLeft: "450px",
            }}
          />
        </div>
      )}

      {result?.error && !loading && (
        <div
          className="popup-message"
          style={{
            backgroundColor: "#222",
            transform: "translate(-50%, -50%)",
            padding: "20px 30px",
            borderRadius: "10px",
            fontSize: "18px",
            fontWeight: "bold",
            color: "red",
            animation: "scaleUp 0.4s ease-out",
            zIndex: 9999,
            marginTop: "30px",
            marginLeft: "190px",
          }}
        >
          ✗ {result.error}
        </div>
      )}

      {result?.url && !loading && !result?.error && (
        <div style={styles.successCard}>
          <div style={styles.icon}></div>
          <div>
            <div style={styles.status}>Connected Device ✓</div> <br />
            <div style={styles.linkText}>
              Open Device UI:&nbsp;
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="modern-button"
              >
                Go{" "}
                <span style={{ marginLeft: "22px" }}>
                  {ipInput.split(".").slice(-1)[0]}
                </span>
              </a>
            </div>
          </div>
        </div>
      )}

      {savedDevices.length > 0 && (
        // <div style={{ marginTop: "2rem" }}>
        //   <h3 style={{ color: "#666" }}>Saved Connected Devices</h3>
        //   <div
        <div style={{ marginBottom: "1rem", textAlign: "center" }}>
          <h3 style={{ color: "#666", margin: 0 }}>Saved Connected Devices</h3>{" "}
          <br />
          <div
            // style={{
            //   overflowX: "auto",
            //   borderRadius: "12px",
            //   boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
            //   marginTop: "0.5rem",
            // }}

            style={{
              // full viewport height
              display: "flex",
              justifyContent: "center", // center horizontally
              alignItems: "center", // center vertically
              // backgroundColor: "#f9fafb", // optional light background
            }}
          >
            <table
              style={{
                width: "100%",
                maxWidth: "800px",

                borderCollapse: "separate",
                borderSpacing: "0",
                fontSize: "15px",
                backgroundColor: "#fff",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#3e4b5b", color: "#fff" }}>
                  <th style={tableStyles.th}>IP Address</th>
                  <th style={tableStyles.th}>URL</th>
                  <th style={tableStyles.th}>Open</th>
                </tr>
              </thead>
              <tbody>
                {savedDevices.map((device, index) => (
                  <tr
                    key={index}
                    style={{
                      backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#f0f4f7",
                      transition: "background-color 0.3s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#e0e7ef")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        index % 2 === 0 ? "#f9f9f9" : "#f0f4f7")
                    }
                  >
                    <td style={tableStyles.td}>{device.ip}</td>
                    <td style={tableStyles.td}>{device.url}</td>
                    <td style={tableStyles.td}>
                      <a
                        href={device.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: "#3e4b5b",
                          color: "#fff",
                          padding: "6px 14px",
                          borderRadius: "6px",
                          textDecoration: "none",
                          fontWeight: "bold",
                          fontSize: "14px",
                          transition: "background 0.3s",
                        }}
                        onMouseOver={(e) =>
                          (e.target.style.background = "#6b7d94")
                        }
                        onMouseOut={(e) =>
                          (e.target.style.background =
                            "linear-gradient(135deg, #4f46e5, #3b82f6)")
                        }
                      >
                        Open
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <DevicesList />
    </div>
  );
};

const styles = {
  successCard: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "5px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    fontFamily: "sans-serif",
    marginTop: "2rem",
    color: "#999",
    width: "24%",
    maxWidth: "600px",
  },
  icon: {
    fontSize: "2rem",
  },
  status: {
    fontWeight: "bold",
    fontSize: "1.1rem",
    color: "#1e7d32",
  },
  linkText: {
    fontSize: "0.95rem",
    marginTop: "0.2rem",
  },
};

const tableStyles = {
  th: {
    padding: "12px 16px",
    textAlign: "left",
    fontWeight: "bold",
    fontSize: "15px",
    borderBottom: "2px solid #ddd",
  },
  td: {
    padding: "10px 16px",
    fontSize: "14px",
    borderBottom: "1px solid #e0e0e0",
    color: "#333",
  },
};

export default ConnectedDevices;

/////////////////////

// import React, { useState } from "react";

// const ConnectedDevices = () => {
//   const [ipInput, setIpInput] = useState("");
//   const [result, setResult] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter") {
//       checkDevice();
//     }
//   };

//   const checkDevice = async () => {
//     setLoading(true);
//     setResult(null);
//     try {
//       const res = await fetch("/api/check-device", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ ip: ipInput }),
//       });

//       const data = await res.json();
//       if (!res.ok) {
//         setResult({ error: data.error || "Unknown error" });
//       } else {
//         setResult({ url: data.url || `http://${ipInput}/` });
//       }
//     } catch (err) {
//       setResult({ error: "Network error or server not running" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ padding: "1rem", position: "relative", minHeight: "200px" }}>
//       <h2 style={{ color: "#555" }}>Check Device</h2>
//       <br />

//       <input
//         type="text"
//         placeholder="Enter IP address"
//         value={ipInput}
//         onChange={(e) => setIpInput(e.target.value)}
//         onKeyDown={handleKeyDown}
//         style={{
//           backgroundColor: "#555",
//           padding: "0.6rem 1rem",
//           width: "200px",
//           border: "1px solid #ccc",
//           borderRadius: "8px",
//           fontSize: "16px",
//           outline: "none",
//           boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
//           color: "#dbdbdb",
//           fontWeight: "bold",
//         }}
//       />

//       <button
//         onClick={checkDevice}
//         disabled={loading || !ipInput.trim()}
//         style={{
//           marginLeft: "1rem",
//           padding: "0.6rem 1.2rem",
//           backgroundColor: "#5e3922",
//           color: "#fff",
//           border: "none",
//           borderRadius: "8px",
//           fontSize: "16px",
//           cursor: "pointer",
//           boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
//           transition: "background 0.3s",
//         }}
//         onMouseOver={(e) => (e.target.style.backgroundColor = "#9e3922")}
//         onMouseOut={(e) => (e.target.style.backgroundColor = "#5e3922")}
//       >
//         {loading ? "Checking" : "➜"}
//       </button>

//       {/* Custom Spinner Overlay */}
//       {loading && (
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//             position: "fixed",
//             top: 0,
//             left: 0,
//             width: "100vw",
//             height: "100vh",
//             backgroundColor: "rgba(0,0,0,0.4)",
//             zIndex: 9999,
//           }}
//         >
//           <div
//             style={{
//               width: "80px",
//               height: "80px",
//               border: "6px solid rgba(255, 255, 255, 0.2)",
//               borderTop: "6px solid #ffffff",
//               borderRadius: "50%",
//               animation: "spin 1s linear infinite",
//               marginTop: "100px",
//               marginLeft: "370px",
//             }}
//           />
//         </div>
//       )}

//       {/* Custom Error Overlay */}
//       {result?.error && !loading && (
//         <div className="popup-message"
//           style={{
//             position: "block",
//             top: "50%",
//             left: "50%",
//             transform: "translate(-50%, -50%)",
//             backgroundColor: "#222",
//             padding: "20px 30px",
//             borderRadius: "10px",
//             fontSize: "18px",
//             fontWeight: "bold",
//             color: "red",
//             animation: "scaleUp 0.4s ease-out",
//             zIndex: 9999,
//             marginTop: "30px",
//             marginLeft: "190px",
//           }}
//         >
//           ✗  {result.error}
//         </div>
//       )}

//       {/* ✓ Success Card */}
//       {result?.url && !loading && !result?.error && (
//         <div style={styles.successCard}>
//           <div style={styles.icon}></div>
//           <div>
//             <div style={styles.status}>Connected Device ✓</div> <br />
//             <div style={styles.linkText}>
//               Open Device UI:&nbsp;
//               {/* <a
//                 href={result.url}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 style={styles.link}
//               >
//                 {result.url}
//               </a> */}

//               {/* <a
//   href={result.url}
//   target="_blank"
//   rel="noopener noreferrer"
//   className="modern-button"
// >
//   Go
// </a> */}

//              <a
//   href={result.url}
//   target="_blank"
//   rel="noopener noreferrer"
//   className="modern-button"
// >
//   Go <span style={{ marginLeft: '22px' }}>{ipInput.split('.').slice(-1)[0]}</span>
// </a>

//             </div>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// };

// const styles = {
//   successCard: {
//     display: "flex",
//     alignItems: "center",
//     gap: "1rem",
//     // backgroundColor: "#999",
//     padding: "5px",
//     borderRadius: "10px",
//     boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
//     fontFamily: "sans-serif",
//     marginTop: "2rem",
//     color: "#999",
//     width: "24%",
//     maxWidth: "600px",
//   },
//   icon: {
//     fontSize: "2rem",
//   },
//   status: {
//     fontWeight: "bold",
//     fontSize: "1.1rem",
//     color: "#1e7d32",
//   },
//   linkText: {
//     fontSize: "0.95rem",
//     marginTop: "0.2rem",
//   },
//   link: {
//     color: "#fff",
//     textDecoration: "none",
//     fontWeight: "500",
//   },
// };

// export default ConnectedDevices;
