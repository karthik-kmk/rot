import React, { useEffect, useState } from 'react';
import "./welcomeadmin.css";
import videoDesktop from "../assets/admin-laptop.mp4";
import videoMobile from "../assets/admin-mobile.mp4";

const WelcomeAdmin = () => {
  const [videoSrc, setVideoSrc] = useState(videoDesktop); // Default to desktop video

  useEffect(() => {
    // Function to check screen size and set the correct video
    const updateVideoSource = () => {
      if (window.innerWidth <= 768) {
        setVideoSrc(videoMobile); // Set mobile video
      } else {
        setVideoSrc(videoDesktop); // Set desktop video
      }
    };

    // Call the function initially to set the correct video
    updateVideoSource();

    // Add resize event listener to update the video when screen size changes
    window.addEventListener("resize", updateVideoSource);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", updateVideoSource);
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount

  return (
    <div className="wrapper"> {/* Full viewport wrapper */}
      <div className="welcome-div">
        {/* Video player without controls */}
        <video
          className="video-player"
          src={videoSrc}
          width="100%" // Ensures video stretches across the full width
         
          muted // Optional: mute video if needed for autoplay
          playsInline // Ensures it plays inline on mobile devices
          autoPlay // Autoplay video when it is loaded
        />
      </div>
    </div>
  );
};

export default WelcomeAdmin;
