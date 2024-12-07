import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Link,
  Snackbar,
  TextField,
} from "@mui/material";
import "./leaderboard.css";
import { API_BASE_URL } from "../constants";
import { get_headers } from "../utils";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notificationLinks, setNotificationLinks] = useState([]);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [threshold, setThreshold] = useState(50); // Default threshold

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/get_users_with_points`,
        get_headers()
      ); // Adjust the URL as needed
      const sortedUsers = response.data.sort((a, b) => b.points - a.points); // Sort by points in descending order
      setUsers(sortedUsers);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle refresh
  const handleRefresh = async () => {
    try {
      // Reset points by making a POST request to the reset endpoint
      await axios.post(`${API_BASE_URL}/reset_points`, {}, get_headers());
      // Fetch the updated user list
      fetchUsers();
    } catch (err) {
      setError(err);
    }
  };

  // Handle low points notification
  const handleNotifyLowPoints = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/notify_low_points`,
        { threshold }, // Send the dynamic threshold
        get_headers()
      );

      if (response.data.links && response.data.links.length > 0) {
        // Set notification links with actual user names and links
        setNotificationLinks(response.data.links);
        setNotificationMessage(response.data.message);
      } else {
        setNotificationLinks([]); // Ensure no links are shown
        setNotificationMessage(`No user below ${threshold} points`); // Display the message
      }
      setOpenSnackbar(true);
    } catch (err) {
      setError(err);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  return (
    <div className="wrapper">
      <div className="leaderboard-div-div">
        <div className="leaderboard-container">
          <Typography variant="h4" className="leaderboard-heading">
            Leaderboard
          </Typography>
          <div className="leader-flex1">

          
          <Button
            className="button-leaderboard"
            variant="contained"
            color="primary"
            onClick={handleRefresh}
            style={{ marginBottom: "20px", marginRight: "10px" }}
          >
            Refresh Points
          </Button>
          <TextField
            label="Points Threshold"
            type="number"
            className="leaderboard-input-no"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
          
            inputProps={{ min: 0 }}
          />
          <Button
            className="button-leaderboard"
            variant="contained"
            color="secondary"
            onClick={handleNotifyLowPoints}
            style={{ marginBottom: "20px" }}
          >
            Notify Low Points
          </Button>
          </div>

          <TableContainer component={Paper} className="leaderboard-div">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sl. No</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>RID</TableCell>
                  <TableCell>Points</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow
                    key={index}
                    className={
                      user.points < threshold
                        ? "row-below-threshold"
                        : "row-above-threshold"
                    }
                  >
                    <TableCell>{index + 1}</TableCell> {/* Serial number */}
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.rid}</TableCell>
                    <TableCell>{user.points}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Snackbar for notifications */}
          <Snackbar
            open={openSnackbar}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            message={notificationMessage}
          />

       

          {/* Display WhatsApp links for low points */}
          {notificationLinks.length > 0 && (
            <div className="links">
              <Typography variant="h6" className="notiheading">
                Notification Links:
              </Typography>
              {notificationLinks.map((linkObj, index) => (
                <div key={index}>
                  <Link href={linkObj.link} target="_blank" rel="noopener">
                    Send WhatsApp Message to {linkObj.name}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserList;
