import React, { useState, useRef, useEffect } from "react";
import { Drawer, List, ListItem, ListItemText } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import "./adminmain.css";
import Welcome from "../components/welcomeadmin.jsx";
import Calendar from "../components/calendar.jsx";
import Meetings from "../components/meetings.jsx";
import Attendance from "../components/attendance.jsx";
import Events from "../components/events.jsx";
import Leaderboard from "../components/leaderboard.jsx";
import { API_BASE_URL } from "../constants.js";
import { logout } from "../utils.js";

const AdminMain = () => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Welcome");

  const sectionRefs = {
    Welcome: useRef(null),
    Calendar: useRef(null),
    Meetings: useRef(null),
    Attendance: useRef(null),
    Events: useRef(null),
    Leaderboard: useRef(null),
  };

  const sidebarRef = useRef(null);

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const handleSidebarItemClick = (component) => {
    sectionRefs[component].current.scrollIntoView({ behavior: "smooth" });
    setActiveSection(component);

    const sidebarItems = document.querySelectorAll(
      ".sidebar .active-sidebar-item"
    );
    sidebarItems.forEach((item) => {
      if (item.textContent !== component) {
        item.classList.remove("active-sidebar-item");
      } else {
        item.classList.add("active-sidebar-item");
      }
    });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    Object.keys(sectionRefs).forEach((key) => {
      if (sectionRefs[key].current) {
        observer.observe(sectionRefs[key].current);
      }
    });

    return () => {
      Object.keys(sectionRefs).forEach((key) => {
        if (sectionRefs[key].current) {
          observer.unobserve(sectionRefs[key].current);
        }
      });
    };
  }, []);

  useEffect(() => {
    gsap.fromTo(
      sidebarRef.current,
      { x: "-100%" },
      { x: 0, duration: 2, ease: "power2.out" }
    );
  }, []);

  const handleLogout = () => {
    fetch(`${API_BASE_URL}/api/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "1",
      },
    })
      .then(() => {
        logout(navigate);
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  return (
    <div className="admin-main-container">
      <div ref={sidebarRef} className="sidebar">
        <List>
          {[
            "Welcome",
            "Calendar",
            "Meetings",
            "Attendance",
            "Events",
            "Leaderboard",
          ].map((text) => (
            <ListItem
              button
              key={text}
              onClick={() => handleSidebarItemClick(text)}
              className={activeSection === text ? "active-sidebar-item" : ""}
            >
              <ListItemText
                primary={<span className="sidebar-text">{text}</span>}
              />
            </ListItem>
          ))}
        </List>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>

      <div className="menu-icon" onClick={toggleDrawer(true)}>
        &#9776;
      </div>

      <Drawer
  anchor="left"
  open={drawerOpen}
  onClose={toggleDrawer(false)}
  PaperProps={{
    className: "drawer-paper",
  }}
>
  <div className="close-icon-container">
    <CloseIcon className="close-icon" onClick={toggleDrawer(false)} />
  </div>
  <div
    role="presentation"
    onClick={toggleDrawer(false)}
    onKeyDown={toggleDrawer(false)}
  >
    <List>
      {[
        "Welcome",
        "Calendar",
        "Meetings",
        "Attendance",
        "Events",
        "Leaderboard",
      ].map((text) => (
        <ListItem
          button
          key={text}
          onClick={() => handleSidebarItemClick(text)}
          className={activeSection === text ? "active-sidebar-item" : ""}
        >
          <ListItemText
            primary={<span className="sidebar-text">{text}</span>}
          />
        </ListItem>
      ))}
    </List>
    <button onClick={handleLogout} className="logout-btn">
      Logout
    </button>
  </div>
</Drawer>


      <div className="main-content">
        <section
          ref={sectionRefs.Welcome}
          id="Welcome"
          className="full-height-section"
        >
          <Welcome />
        </section>
        <section
          ref={sectionRefs.Calendar}
          id="Calendar"
          className="full-height-section"
        >
          <Calendar />
        </section>
        <section
          ref={sectionRefs.Meetings}
          id="Meetings"
          className="full-height-section"
        >
          <Meetings />
        </section>
        <section
          ref={sectionRefs.Attendance}
          id="Attendance"
          className="full-height-section"
        >
          <Attendance />
        </section>
        <section
          ref={sectionRefs.Events}
          id="Events"
          className="full-height-section"
        >
          <Events />
        </section>
        <section
          ref={sectionRefs.Leaderboard}
          id="Leaderboard"
          className="full-height-section"
        >
          <Leaderboard />
        </section>
      </div>
    </div>
  );
};

export default AdminMain;


