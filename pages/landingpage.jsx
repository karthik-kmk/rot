import "./landingpage.css";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef, useState } from "react";
import logo from "../assets/rotaractlogo.png";
import Button from "@mui/material/Button";
import Footer from "../components/footer";
import image from "../assets/landing2.png";
import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Modal from "@mui/material/Modal";
import CloseIcon from "@mui/icons-material/Close";
import { API_BASE_URL } from "../constants";

gsap.registerPlugin(useGSAP);

function App() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => {
    // Check if logged in
    if (
      localStorage.getItem("userRID") &&
      localStorage.getItem("auth_token") &&
      localStorage.getItem("login_page")
    ) {
      window.location.href = localStorage.getItem("login_page");
    } else {
      setOpen(true);
    }
  };
  const handleClose = () => setOpen(false);

  const box = useRef();
  const [isLoading, setIsLoading] = useState(true);
  const [rid, setRid] = useState("");
  const [password, setPassword] = useState("");

  useGSAP(
    () => {
      var tl = gsap.timeline();
      tl.from("#loader img", {
        delay: 1,
        x: 100,
        opacity: 0,
        duration: 3,
        stagger: 0.1,
      });
    },
    { scope: box }
  );

  React.useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 4000);
  }, []);

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

  const handleLogin = async () => {
    if (!rid || !password) {
      alert("Please enter both RID and password.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "1",
        },
        body: JSON.stringify({ rid, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store user's RID in local storage

        localStorage.setItem("userRID", rid); // Store RID locally
        localStorage.setItem("auth_token", data.auth_token); // Store auth_token locally
        localStorage.setItem("login_page", data.redirect); // Store auth_token locally

        // Redirect based on the role
        window.location.href = data.redirect;
      } else {
        // Handle error
        alert(data.error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while logging in.");
    }
  };

  return (
    <div ref={box}>
      {isLoading && (
        <div id="loader">
          <img src={logo} alt="Loading..." />
        </div>
      )}

      <div className="bgimage">
        <img src={image} alt="" className="image-bg" />
      </div>
      <div className="header">
        <img src={logo} alt="" className="logo-header" />
        <Button variant="contained" className="login-btn" onClick={handleOpen}>
          Login
        </Button>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style} className="modalbox">
            <div>
              <CloseIcon className="close-btn" onClick={handleClose} />
            </div>
            <TextField
              id="rid"
              label="Enter your RID"
              variant="outlined"
              className="textfields-login"
              value={rid}
              onChange={(e) => setRid(e.target.value)}
            />

            <TextField
              id="password"
              label="Enter your password"
              variant="outlined"
              className="textfields-login"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLogin();
              }}
            />
            <Button
              variant="contained"
              className="textfields-login-btn"
              onClick={handleLogin}
            >
              Login
            </Button>
          </Box>
        </Modal>
      </div>

      <Footer />
    </div>
  );
}

export default App;