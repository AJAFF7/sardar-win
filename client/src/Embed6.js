import React, { useEffect, useState } from 'react';
import './App.css';

const Embed2 = () => {
  const fullText = "Under Construction";

  const [count, setCount] = useState(3);
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);
  const [countdownDone, setCountdownDone] = useState(false);

  // Countdown logic
  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    } else if (count === 0) {
      setCountdownDone(true);
    }
  }, [count]);

  // Text animation logic
  useEffect(() => {
    if (countdownDone && index < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + fullText[index]);
        setIndex(index + 1);
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [countdownDone, index, fullText]);

  return (
    <>
      {!countdownDone && (
        <div className="countdown-overlay">
          <div className="countdown-text">{count}</div>
        </div>
      )}
      <div className="embed2-container">
        {countdownDone && (
          <div className="embed2-text">{displayedText}</div>
        )}
      </div>
    </>
  );
};

export default Embed2;


// // components/Vault.js
// import React from 'react';
// import './App.css';

// const Embed6 = () => {
//   return (
//     <div className="w-full h-full bg-white rounded-xl overflow-hidden border shadow">
//       <webview
//         src="https://app.simplenote.com"
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

// export default Embed6;
