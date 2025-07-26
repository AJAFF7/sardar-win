import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./App.css";
import { Link } from "react-router-dom";
import axios from "axios";

import Clock from "./clock.js";
import Buttons from "./buttons.js";
import Scanner from "./Scanner.js";
import ServerLogs from "./Logs.js";
import ConnectedDevices from "./Podstatus.js";
import CleanUp from "./CleanMemory.js";

import Embed1 from "./Embed1.js";
import Embed2 from "./Embed2.js";
import Embed3 from "./Embed3.js";
import Embed4 from "./Embed4.js";
import Embed5 from "./Embed5.js";
import Embed6 from "./Embed6.js";
import Embed13 from "./Embed13.js";
import DeleteAccount from "./deleteaccount.js";
import UpdateChecker from "./UpdateChecker.js";
//import DevicesList from "./List.js";
import SystemStats from "./SystemStats.js";
import NetworkChart from "./NetworkChart.js"
import Cpu from "./Cpu.js";
//import Memory from "./Memory"

import logoutImg from "./assets/logout.jpg"; // ✅ Correct image import

// const LogoutIcon = () => (
//   <svg
//     width="28"
//     height="28"
//     fill="silver"
//     stroke=""
//     viewBox="0 0 25 25"
//     xmlns="http://www.w3.org/2000/svg"
//     style={{ marginRight: "5px" }}
//   >
//     {/* Arrow pointing right with a door/frame */}
//     <path d="M16 13v-2H7V8l-5 4 5 4v-3z" />
//     <path d="M20 3H10a2 2 0 0 0-2 2v4h2V5h10v14H10v-4h-2v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
//   </svg>
// );



// const LogoutIcon = () => (
//   <svg
//     width="28"
//     height="28"
//     fill="none"
//     stroke="#993b26"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//     viewBox="0 0 24 24"
//     xmlns="http://www.w3.org/2000/svg"
//     style={{ marginRight: "5px", marginTop: "0px" }}
//   >
//     {/* Circle frame */}
//     <circle cx="12" cy="12" r="10" />
//     {/* Arrow pointing right */}
//     <path d="M12 8l4 4-4 4" />
//     {/* Logout line */}
//     <path d="M8 12h8" />
//   </svg>
// );

const OpenLockIcon = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
      marginBottom: 2,
    }}
  >
    <svg
      width="26"
      height="26"
      fill="#aaa"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
      <path d="M17 8h-1V6a4 4 0 1 0-8 0h2a2 2 0 1 1 4 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zM15 18H9v-4h6v4z" />
    </svg>
  </div>
);

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeEmbed, setActiveEmbed] = useState(null);

  const toggleEmbed = (key) => {
    setActiveEmbed((prev) => (prev === key ? null : key));
  };

  const handleLogout = async () => {
    try {
      await axios.post("https://localhost:3535/logout");
    } catch (error) {
      console.error("Logout request failed:", error);
    }

    // ✅ Clear localStorage and navigate
    localStorage.removeItem("userID");
    localStorage.clear("token");
    navigate("/Login");
  };

  // ✅ Check for logged-in user on mount
  useEffect(() => {
    if (!localStorage.getItem("userID")) {
      navigate("/Login");
    }
  }, [navigate]);

  return (
    <div className="home">
      <div className="container">
        <div className="sections-container">
          <div className="graf-link-button-section">
            <div className="logo-wrapper-section">
              <div className="logo-wrapper">
                <div
                  className={`spinner-ring ${activeEmbed === null ? "active" : ""}`}
                >
                  <div className="logo-center">
                    <img
                      className="logo home1-logo"
                      src="/home1.png"
                      alt="Home"
                      onClick={() => setActiveEmbed(null)}
                    />
                  </div>
                </div>
              </div>

              <div className="logo-wrapper">
                <div
                  className={`spinner-ring ${activeEmbed === "embed2" ? "active" : ""}`}
                >
                  <div className="logo-center">
                    <img
                      className="logo jenkins-logo"
                      src="/uptime.png"
                      alt="Jenkins"
                      onClick={() => toggleEmbed("embed2")}
                    />
                  </div>
                </div>
              </div>
              <div className="logo-wrapper">
                <div
                  className={`spinner-ring ${activeEmbed === "embed3" ? "active" : ""}`}
                >
                  <div className="logo-center">
                    <img
                      className="logo ansible-logo"
                      src="/ansible.png"
                      alt="Ansible"
                      onClick={() => toggleEmbed("embed3")}
                    />
                  </div>
                </div>
              </div>
              <div className="logo-wrapper">
                <div
                  className={`spinner-ring ${activeEmbed === "embed4" ? "active" : ""}`}
                >
                  <div className="logo-center">
                    <img
                      className="logo docker-logo"
                      src="/docker.png"
                      alt="Docker"
                      onClick={() => toggleEmbed("embed4")}
                    />
                  </div>
                </div>
              </div>
              <div className="logo-wrapper">
                <div
                  className={`spinner-ring ${activeEmbed === "embed5" ? "active" : ""}`}
                >
                  <div className="logo-center">
                    <img
                      className="logo github-logo"
                      src="/github.png"
                      alt="Github"
                      onClick={() => toggleEmbed("embed5")}
                    />
                  </div>
                </div>
              </div>
              <div className="logo-wrapper">
                <div
                  className={`spinner-ring ${activeEmbed === "embed6" ? "active" : ""}`}
                >
                  <div className="logo-center">
                    <img
                      className="logo simplenote-logo"
                      src="/simplenote.png"
                      alt="Simplenote"
                      onClick={() => toggleEmbed("embed6")}
                    />
                  </div>
                </div>
              </div>

              <div className="clock-container">
                <Clock />
              </div>
            </div>

            <button className="logout" onClick={handleLogout}>
              <OpenLockIcon />
            </button>
            {/* <button className="logout" onClick={handleLogout}>
              <img src="/logout.png" alt="Logout" className="logout-icon" />
            </button> */}

            <DeleteAccount />
            {/* <CleanUp /> */}
          </div>

          {/* Conditionally render embeds */}
          {activeEmbed === "embed1" && (
            <div className="next-embed-section">
              <Embed1 />
            </div>
          )}
          {activeEmbed === "embed2" && (
            <div className="next-embed-section">
              <Embed2 />
            </div>
          )}
          {activeEmbed === "embed3" && (
            <div className="next-embed-section">
              <Embed3 />
            </div>
          )}
          {activeEmbed === "embed4" && (
            <div className="next-embed-section">
              <Embed4 />
            </div>
          )}
          {activeEmbed === "embed5" && (
            <div className="next-embed-section">
              <Embed5 />
            </div>
          )}
          {activeEmbed === "embed6" && (
            <div className="next-embed-section">
              <Embed6 />
            </div>
          )}

          {/* Default dashboard view */}
          {activeEmbed === null && (
            <>
              <div className="left-side">
                <div className="buttons-section-top">
                  <Buttons />
                </div>
                <div className="buttons-section-middle">
                  <ServerLogs />
                </div>
                <div className="buttons-section-bottom">
                  <NetworkChart />
                  {/* <SystemStats /> */}
                </div>
              </div>

              <div className="podstatus-section">
                {/* <ConnectedDevices /> */}
                <SystemStats />

                {/* <Cpu />
                <Memory /> */}
                <div className="cpu-memory-wrapper">
                                    <Cpu />
                                    {/* <Memory /> */}
                                  </div>

                {/* <DevicesList /> */}

                {/* <SystemStats /> */}
              </div>

              {/* <div class="podstatus-section">
                <div class="podstatus-inner left">
                  <ConnectedDevices />
                </div>
                <div class="podstatus-inner right"></div>
              </div> */}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;

// import React, { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import "./App.css";
// import { Link } from "react-router-dom";
// import axios from "axios";

// // import GrafanaLinkButton from "./Grafana.js";
// import Clock from "./clock.js";
// import Buttons from "./buttons.js";
// import Scanner  from "./Scanner.js";
// import ServerLogs from "./Logs.js"
// import Login from "./Login.js"
// import logoutImg from "./assets/logout.jpg";
// import ConnectedDevices from "./Podstatus.js";

// import Embed1 from "./Embed1.js";
// import Embed2 from "./Embed2.js";
// import Embed3 from "./Embed3.js";
// import Embed4 from "./Embed4.js";
// import Embed5 from "./Embed5.js";
// import Embed6 from "./Embed6.js";
// // import Embed7 from "./Embed7.js";
// // import Embed8 from "./Embed8.js";
// // import Embed9 from "./Embed9.js";
// // import Embed10 from "./Embed10.js";
// // import Embed11 from "./Embed11.js";
// // import Embed12 from "./Embed12.js";
// import Embed13 from "./Embed13.js";

// function Home() {
//   const navigate = useNavigate(); // Unused currently
//   const location = useLocation(); // Unused currently
//   const [activeEmbed, setActiveEmbed] = useState(null);

//   const toggleEmbed = (key) => {
//     setActiveEmbed((prev) => (prev === key ? null : key));
//   };

// const handleLogout = async () => {
//     try {
//       await axios.post("https://localhost:3535/logout");
//     } catch (error) {
//       console.error("Logout failed:", error);
//     }
//     navigate("/Login");
//   };

//   useEffect(() => {
//     if (!localStorage.getItem("userID")) {
//       navigate("/Login_auth");
//     }
//   }, [navigate]);

//   return (
//     <div className="home">
//       <div className="container">
//         <div className="sections-container">
//           {/* Top full width section */}
//           <div className="graf-link-button-section">
//             {/* <GrafanaLinkButton /> */}

//             <div className="logo-wrapper-section">
//               {[
//                 { key: null, src: "/home1.png", alt: "Home" },
//                 { key: "embed2", src: "/jenkins.png", alt: "Jenkins" },
//                 { key: "embed3", src: "/ansible.png", alt: "Ansible" },
//                 { key: "embed4", src: "/docker.png", alt: "Docker" },
//                 { key: "embed5", src: "/github.png", alt: "Github" },
//                 { key: "embed6", src: "/simplenote.png", alt: "Simplenote" },
//                 { key: "embed7", src: "/octant.png", alt: "Octant" },
//                 // { key: "embed8", src: "/crm.png", alt: "Crm" },
//                 // { key: "embed9", src: "/cf.png", alt: "Cf" },
//                 // { key: "embed10", src: "/argocd.png", alt: "ArgoCD" },
//                 // { key: "embed11", src: "/argor.png", alt: "ArgoR" },
//                 // { key: "embed12", src: "/argor.png", alt: "ArgoR" },
//                 // { key: "embed13", src: "/argor.png", alt: "ArgoR" },
//               ].map(({ key, src, alt }) => (
//                 <div key={alt} className="logo-wrapper">
//                   <div
//                     className={`spinner-ring ${activeEmbed === key ? "active" : ""}`}
//                   >
//                     <div className="logo-center">
//                       <img
//                         className={`logo ${alt.toLowerCase()}-logo`}
//                         src={src}
//                         alt={alt}
//                         onClick={() => setActiveEmbed(key)}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               ))}
//               <button className="nav-item" onClick={handleLogout}>
//           <img src={logout} height="28" width="28" alt="Logout" />
//         </button>
//             </div>

//                  <div className="clock-container">
//                    <Clock />
//                  </div>

//           </div>

//           {/* Left column split vertically */}
//           {activeEmbed === null ? (
//             <>
//               <div className="left-side">
//                 <div className="buttons-section-top">
//                   <Buttons />
//                 </div>
//                 <div className="buttons-section-middle">
//                  <ServerLogs />
//                 </div>
//                 <div className="buttons-section-bottom">
//                   {/* Optional: Add bottom left content here */}
//                     <Scanner />
//                 </div>
//               </div>

//               {/* Right column */}
//               <div className="podstatus-section">
//                 {" "}
//                 <ConnectedDevices />{" "}
//               </div>
//             </>
//           ) : (
//             // Show embed on right side full width when an embed is active
//             <div className="next-embed-section">
//               {activeEmbed === "embed1" && <Embed1 />}
//               {activeEmbed === "embed2" && <Embed2 />}
//               {activeEmbed === "embed3" && <Embed3 />}
//               {activeEmbed === "embed4" && <Embed4 />}
//               {activeEmbed === "embed5" && <Embed5 />}
//               {activeEmbed === "embed6" && <Embed6 />}
//               {/* {activeEmbed === "embed7" && <Embed7 />} */}
//               {/* {activeEmbed === "embed8" && <Embed8 />}
//               {activeEmbed === "embed9" && <Embed9 />}
//               {activeEmbed === "embed10" && <Embed10 />}
//               {activeEmbed === "embed11" && <Embed11 />}
//               {activeEmbed === "embed12" && <Embed12 />} */}
//               {activeEmbed === "embed13" && <Embed13 />}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Home;
