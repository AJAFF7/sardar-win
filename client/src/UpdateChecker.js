import React, { useEffect, useState } from 'react';

const UpdateChecker = () => {
  const [status, setStatus] = useState("Click to check for updates");

  useEffect(() => {
    if (!window.electronUpdater) {
      setStatus("⚠️ Updater not available");
      return;
    }

    window.electronUpdater.onUpdateAvailable(() => {
      setStatus("🔄 Update available. Downloading...");
    });

    window.electronUpdater.onUpdateDownloaded(() => {
      setStatus("✅ Update downloaded. Restarting in 5s...");
      setTimeout(() => {
        window.location.reload(); // or autoUpdater.quitAndInstall()
      }, 5000);
    });
  }, []);

  const checkUpdate = () => {
    setStatus("🔍 Checking for updates...");
    window.electronUpdater?.checkForUpdates();
  };

  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <h2>Update Checker</h2>
      <p>{status}</p>
      <button onClick={checkUpdate} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Check for Update
      </button>
    </div>
  );
};

export default UpdateChecker;