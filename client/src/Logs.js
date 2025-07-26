import React, { useEffect, useState } from "react";

const ServerLogs = () => {
  const [logs, setLogs] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/logs");

      if (!res.ok) {
        let errorMessage = `Failed to fetch logs: ${res.status}`;
        const text = await res.text();

        try {
          const errData = JSON.parse(text);
          errorMessage = errData.error || errorMessage;
        } catch {
          console.error("Error response not JSON:", text);
        }

        setError(errorMessage);
        setLogs("");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setLogs(data.logs);
    } catch (err) {
      setError(err.message);
      setLogs("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        fontFamily: "monospace",
        color: "#0f0f", //#0f0
        padding: "1rem",
        maxHeight: "237px",
        width: "395px",
        overflowY: "auto",
        borderRadius: "5px",
      }}
    >
      <h3>Server Logs</h3>
      {loading && <p>Loading logs...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && (
        <div>
          {logs
            .split("\n")
            .filter((line) => line.trim() !== "")
            .map((line, index) => (
              <div key={index}>{line}</div>
            ))}
        </div>
      )}
    </div>
  );
};

export default ServerLogs;

// import React, { useEffect, useState } from "react";

// const ServerLogs = () => {
//   const [logs, setLogs] = useState("");
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const fetchLogs = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       const res = await fetch("/api/logs");

//       if (!res.ok) {
//         let errorMessage = `Failed to fetch logs: ${res.status}`;

//         const text = await res.text();
//         try {
//           const errData = JSON.parse(text);
//           errorMessage = errData.error || errorMessage;
//         } catch {
//           console.error("Error response not JSON:", text);
//         }

//         setError(errorMessage);
//         setLogs("");
//         setLoading(false);
//         return;
//       }

//       const data = await res.json();
//       setLogs(data.logs);
//     } catch (err) {
//       setError(err.message);
//       setLogs("");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchLogs();
//     const interval = setInterval(fetchLogs, 1000); // Update every 5 sec
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div
//       style={{
//         whiteSpace: "pre-wrap",
//         fontFamily: "monospace",
//         background: "#222",
//         color: "#0f0",
//         padding: "1rem",
//         maxHeight: "237px",
//         overflow: "hidden", // ✅ hides scrollbars
//         borderRadius: "5px",
//       }}
//     >
//       <h3>Server Logs</h3>
//       {loading && <p>Loading logs...</p>}
//       {error && <p style={{ color: "red" }}>{error}</p>}
//       {!loading && !error && <pre>{logs || "No logs found."}</pre>}
//     </div>
//   );
// };

// export default ServerLogs;
