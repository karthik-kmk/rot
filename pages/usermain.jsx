import React, { useState, useRef, useEffect } from "react";
import { Drawer, List, ListItem, ListItemText } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import "./adminmain.css";
import Welcomeuser from "../components/welcomeuser.jsx";
import Calendaruser from "../components/calendaruser.jsx";
import Leaderboarduser from "../components/eventsuser.jsx";
import ProfileUser from "../components/profile.jsx";  // New import

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
    Profile: useRef(null), // New reference for Profile section
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
          {["Welcome", "Calendar", "Leaderboard", "Profile"].map((text) => (
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
            {["Welcome", "Calendar", "Leaderboard", "Profile"].map((text) => (
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
          <Welcomeuser />
        </section>
        <section
          ref={sectionRefs.Calendar}
          id="Calendar"
          className="full-height-section"
        >
          <Calendaruser />
        </section>
        <section
          ref={sectionRefs.Leaderboard}
          id="Leaderboard"
          className="full-height-section"
        >
          <Leaderboarduser />
        </section>
        <section
          ref={sectionRefs.Profile}
          id="Profile"
          className="full-height-section"
        >
          <ProfileUser /> {/* New Profile section */}
        </section>
      </div>
    </div>
  );
};

export default AdminMain;
