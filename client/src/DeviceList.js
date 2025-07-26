import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const DeviceList= () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3535/api/scan")
      .then((res) => res.json())
      .then((data) => {
        if (data.devices) {
          setDevices(data.devices);
          setLoading(false);
        } else {
          setError("No devices found");
          setLoading(false);
        }
      })
      .catch((err) => {
        setError("Failed to fetch devices");
        setLoading(false);
        console.error(err);
      });
  }, []);

  if (loading) return <p>🔄 Scanning network...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", textAlign: "center" }}>
      <h2>🌐 Connected Devices</h2>
      {devices.length === 0 ? (
        <p>No devices found.</p>
      ) : (
        <table
          style={{
            margin: "1rem auto",
            borderCollapse: "collapse",
            width: "100%",
          }}
          border="1"
        >
          <thead>
            <tr>
              <th style={{ padding: "8px" }}>IP</th>
              <th style={{ padding: "8px" }}>MAC</th>
              <th style={{ padding: "8px" }}>Hostname</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((d, i) => (
              <tr key={i}>
                <td style={{ padding: "8px" }}>{d.ip}</td>
                <td style={{ padding: "8px" }}>{d.mac}</td>
                <td style={{ padding: "8px" }}>{d.hostname}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
export default DeviceList;