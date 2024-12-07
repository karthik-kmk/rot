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
  Modal,
  Box,
  Button,
  CircularProgress,
} from "@mui/material";
import { get_headers } from "../utils";
import { API_BASE_URL } from "../constants";
import "./eventsuser.css";
import defaultProfileImage1 from "../assets/manimage.jpeg";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null); // To store selected user details
  const [isModalOpen, setIsModalOpen] = useState(false); // To handle modal open/close
  const [profileLoading, setProfileLoading] = useState(false); // Loading state for profile
  const [profileError, setProfileError] = useState(null); // Error state for profile

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/get_users_with_points`,
          get_headers()
        );
        const sortedUsers = response.data.sort((a, b) => b.points - a.points); // Sort by points in descending order
        setUsers(sortedUsers);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Open modal and fetch user profile
  const handleRowClick = async (user) => {
    setSelectedUser(null); // Reset previous profile data
    setProfileError(null);
    setProfileLoading(true);
    setIsModalOpen(true);

    try {
      const response = await axios.get(`${API_BASE_URL}/api/profile`, {
        params: { rid: user.rid }, // Send RID as query parameter
        ...get_headers(),
      });
      setSelectedUser(response.data);
    } catch (err) {
      setProfileError(err.response?.data?.error || "Failed to fetch profile");
    } finally {
      setProfileLoading(false);
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  return (
    <div className="wrapper">
      <div className="leaderboard-cont-cont-user">
        <div className="leaderboard-containe2">
          <div className="leader-board-main-div">
            <Typography variant="h4" className="leaderboard-heading1">
              Leaderboard
            </Typography>
            <TableContainer
              component={Paper}
              className="leaderboard-container2"
            >
              <Table className="leaderboard-table">
                <TableHead>
                  <TableRow>
                    <TableCell className="table-cell">Sl. No</TableCell>
                    <TableCell className="table-cell">Name</TableCell>
                    <TableCell className="table-cell">RID</TableCell>
                    <TableCell className="table-cell">Points</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user, index) => (
                    <TableRow
                      key={user.email}
                      className="table-row"
                      onClick={() => handleRowClick(user)} // Add click handler
                      style={{ cursor: "pointer" }} // Change cursor to pointer for better UX
                    >
                      <TableCell className="table-cell">{index + 1}</TableCell>
                      <TableCell className="table-cell">{user.name}</TableCell>
                      <TableCell className="table-cell">{user.rid}</TableCell>
                      <TableCell className="table-cell">
                        {user.points}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="user-modal-title"
        aria-describedby="user-modal-description"
      >
        <Box
          className="leaderboard-div-div1"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",

            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography id="user-modal-title" variant="h6" component="h2">
            Profile of {selectedUser ? selectedUser.name : "User"}
          </Typography>
          {profileLoading ? (
            <CircularProgress />
          ) : profileError ? (
            <Typography color="error">{profileError}</Typography>
          ) : selectedUser ? (
            <Box>
              <div className="leaderboard-div-2-image">
                {selectedUser.profilephoto ? (
                  <img
                    src={`data:image/jpeg;base64,${selectedUser.profilephoto}`}
                    alt="Profile"
                    className="leaderboard-div-img"
                  />
                ) : (
                  <img
                    src={defaultProfileImage1}
                    alt="Default Profile"
                    className="leaderboard-div-img"
                  />
                )}
              </div>
              <div className="leader-flex-flex1">
                <Typography>
                  <span className="gold-span">Name:</span> <br />
                  <div className="span-span">{selectedUser.name}</div>
                </Typography>
                <Typography>
                  <span className="gold-span">RID:</span> <br />{" "}
                  <div className="span-span">{selectedUser.rid}</div>
                </Typography>
              </div>
              <div className="leader-flex-flex1">
                <Typography>
                  <span className="gold-span">Email:</span>
                  <br /> <div className="span-span">{selectedUser.email}</div>
                </Typography>
                <Typography>
                  <span className="gold-span">Phone Number:</span>
                  <br />{" "}
                  <div className="span-span">+{selectedUser.phnumber}</div>{" "}
                </Typography>
              </div>
              <div className="leader-flex-flex1">
                <Typography>
                  <span className="gold-span">DOB:</span> <br />
                  <div className="span-span">
                    {selectedUser.dob
                      ? new Date(selectedUser.dob).toLocaleDateString("en-GB") // Formats as dd/mm/yyyy
                      : "N/A"}
                  </div>
                </Typography>

                <Typography>
                  <span className="gold-span">Gender:</span> <br />
                  <div className="span-span">{selectedUser.gender}</div>
                </Typography>
              </div>
              <div className="leader-flex-flex1">
                <Typography>
                  <span className="gold-span">Club Role:</span>
                  <br />{" "}
                  <div className="span-span">{selectedUser.clubrole}</div>
                </Typography>
              </div>
              <div className="leader-flex-flex1">
                <Typography>
                  <span className="gold-span">Bio:</span>
                  <br /> <div className="span-span1">{selectedUser.bio}</div>
                </Typography>
              </div>
            </Box>
          ) : (
            <Typography>No profile data available.</Typography>
          )}
          <div>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCloseModal}
              sx={{ mt: 2 }}
              className="close-leader"
            >
              Close
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default UserList;
