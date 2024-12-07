import React from "react";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import "./footer.css";

const footer = () => {
  return (
    <div className="footer-center">
      
      <div className="footer">
        <a href="https://www.instagram.com/rotaract_atria/?hl=en" target="_blank">
          <InstagramIcon className="link-logos" />
        </a>
        <a href="https://youtube.com/@rotaractclubofatria8129?si=GvXn9Idim6-HT9Rx" target="_blank">
          <YouTubeIcon className="link-logos" />
        </a>
        <a href="https://www.linkedin.com/company/rotaract-atria/posts/?feedView=all" target="_blank">
          <LinkedInIcon className="link-logos" />
        </a>
      </div>
    </div>
  );
};

export default footer;
