import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Modal,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  TextField,
} from "@mui/material";
import "./attendance.css";

const EventManager = () => {
  const [title, setTitle] = useState("");
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [open, setOpen] = useState(false); // State to manage modal visibility
  const [selectedEvent, setSelectedEvent] = useState(null); // State to store selected event
  const [users, setUsers] = useState([]); // State to store users data
  const [eventDetails, setEventDetails] = useState([]); // State to store event details (attendance and points)
  const [loadingUsers, setLoadingUsers] = useState(false); // State for loading status
  const [attendanceData, setAttendanceData] = useState({});
  const [bulkPoints, setBulkPoints] = useState(""); // State to store points for bulk add

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:5000/att_title_display"
        );
        setEvents(response.data);
      } catch (error) {
        setError(
          error.response ? error.response.data.error : "Something went wrong!"
        );
      }
    };

    fetchEvents();
  }, []);

  const handleAddClick = async () => {
    if (!title) {
      setError("Event name is required!");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:5000/add_att_title", {
        sname: title,
      });
      setMessage(response.data.message);
      setTitle(""); // Clear input after success
      setError(null);

      const eventsResponse = await axios.get(
        "http://127.0.0.1:5000/att_title_display"
      );
      setEvents(eventsResponse.data);
    } catch (error) {
      setError(
        error.response ? error.response.data.error : "Something went wrong!"
      );
    }
  };

  const handleDeleteEvent = async () => {
    // Show confirmation dialog
    const isConfirmed = window.confirm(
      "Are you sure you want to delete all event and attendance data?"
    );

    if (!isConfirmed) {
      return; // If user cancels, do nothing
    }

    try {
      // Call the API to delete the data
      const response = await axios.delete("http://127.0.0.1:5000/refresh_att");

      if (response.data.message === "No events to delete.") {
        // If no events are found to delete, show a "No events to delete" message
        setMessage("No events to delete.");
        setError(null);
      } else {
        // Show success message
        setMessage(response.data.message); // "All events and attendance data have been cleared."
        setError(null);

        // Optionally, reset the state or UI to reflect the cleared data
        setEvents([]); // Assuming `events` holds the list of events in the UI
      }
    } catch (error) {
      // Handle error if something goes wrong
      setError(
        error.response
          ? error.response.data.error
          : "Error refreshing attendance data."
      );
      setMessage(null);
    }
  };

  const handleTitleClick = async (event) => {
    setSelectedEvent(event);
    setOpen(true);

    try {
      // Fetch event details from backend when an event is selected
      const response = await axios.get(
        "http://127.0.0.1:5000/att_get_mod_dets",
        {
          params: { event_title: event.event_name },
        }
      );

      if (response.data.new_modal) {
        setEventDetails([]); // Show empty modal if no data found
        setMessage("No data found for the specified event title");
      } else {
        setEventDetails(response.data.data); // Set the event details to display
      }

      // Fetch users list
      setLoadingUsers(true);
      const usersResponse = await axios.get(
        "http://127.0.0.1:5000/att_get_users"
      );
      setUsers(usersResponse.data);
      setLoadingUsers(false);
    } catch (error) {
      setError(
        error.response
          ? error.response.data.error
          : "Error fetching event details!"
      );
      setLoadingUsers(false);
    }
  };

  const handleAttendanceChange = (userId, status) => {
    setAttendanceData((prev) => {
      const newData = { ...prev };
      newData[userId] = {
        ...newData[userId],
        attendance: status,
        points: status === "Absent" ? 0 : newData[userId]?.points || 0,
      };
      return newData;
    });
  };

  const handlePointsChange = (userId, points) => {
    if (attendanceData[userId]?.attendance === "Present") {
      setAttendanceData((prev) => {
        const newData = { ...prev };
        newData[userId] = { ...newData[userId], points: points };
        return newData;
      });
    }
  };

  const handleBulkPointsChange = (event) => {
    setBulkPoints(event.target.value);
  };

  const handleAddPoints = () => {
    if (bulkPoints === "" || isNaN(bulkPoints)) {
      setError("Please enter a valid number for points.");
      return;
    }

    setAttendanceData((prev) => {
      const newData = { ...prev };
      Object.keys(newData).forEach((userId) => {
        if (newData[userId]?.attendance === "Present") {
          newData[userId].points = parseInt(bulkPoints);
        }
      });
      return newData;
    });
    setError(null);
  };

  // Prepare data for API submission
  const handleSubmitToDB = async () => {
    const dataToSubmit = Object.keys(attendanceData).map((userId) => {
      const user = attendanceData[userId];
      return {
        eventTitle: selectedEvent.event_name,
        name: users.find((u) => u.rid === userId)?.name,
        rid: userId,
        attendance: user.attendance,
        points: user.points,
      };
    });

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/save_attendance",
        { data: dataToSubmit }
      );

      if (response.status === 200) {
        // Show a confirmation window if the attendance data is saved successfully
        setMessage("Attendance data saved successfully!");
        setError(null);

        // Open a confirmation window (you can replace this with a modal or custom popup)
        alert("Attendance data has been saved successfully!");

        handleClose();
      } else {
        setError("Error saving attendance data.");
      }
    } catch (error) {
      setError(
        error.response
          ? error.response.data.error
          : "Error saving attendance data"
      );
    }
  };

  const handleClose = () => {
    setOpen(false); // Close the modal
    setSelectedEvent(null); // Clear selected event
    setAttendanceData({}); // Clear attendance data
    setBulkPoints(""); // Clear bulk points input
  };

  return (
    <div className="wrapper">
      <div className="att-main-div-div">
        <div className="event-manager-container">
          <h2 className="att-heading">Attendance</h2>
          <input
          className="input-att"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter event title"
          />
          <div className="buttons-div-flex">
            <button onClick={handleAddClick} className="add-event-button">
              ADD EVENT
            </button>
            <Button
              className="refresh-events-button"
              onClick={handleDeleteEvent}
              variant="contained"
              color="primary"
            >
              Refresh Events
            </Button>
          </div>
          <div className="event-list-leaderboard-div">
            <h3 className="event-list-header">Event Titles</h3>
            <ul className="event-item">
  {events.slice().reverse().map((event) => (
    <li 
      className="att-li"
      key={event.id}
      onClick={() => handleTitleClick(event)}
      style={{ cursor: "pointer" }}
    >
      {event.event_name}
    </li>
  ))}
</ul>

            
          </div>

          <Modal open={open} onClose={handleClose}>
            <Box sx={modalStyle} className="hellobg">
              {selectedEvent && (
                <div>
                  <h2> Attendance for {selectedEvent.event_name}</h2>

                  {eventDetails.length > 0 ? (
                    <div>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>
                                <strong className="table-table1">Name</strong>
                              </TableCell>
                              <TableCell >
                                <strong className="table-table1">RID</strong>
                              </TableCell >
                              <TableCell>
                                <strong className="table-table1">Attendance</strong>
                              </TableCell>
                              <TableCell>
                                <strong className="table-table1">Points</strong>
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {eventDetails.map((detail) => (
                              <TableRow key={detail.rid}>
                                <TableCell className="table-table1">{detail.name}</TableCell>
                                <TableCell className="table-table1">{detail.rid}</TableCell>
                                <TableCell className="table-table1">{detail.attendance}</TableCell>
                                <TableCell className="table-table1">{detail.points}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </div>
                  ) : (
                    <div>
                     
                      <TextField
                        label="Bulk Points"
                        type="number"
                        value={bulkPoints}
                        onChange={handleBulkPointsChange}
                        fullWidth
                        margin="normal"
                      />
                      <Button onClick={handleAddPoints} variant="contained">
                        Add Points
                      </Button>
                      <Button onClick={handleSubmitToDB} variant="contained">
                        Submit Attendance
                      </Button>

                     
                      {loadingUsers ? (
                        <p>Loading users...</p>
                      ) : (
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>
                                  <strong className="table-table1">Name</strong>
                                </TableCell>
                                <TableCell>
                                  <strong className="table-table1">RID</strong>
                                </TableCell>
                                <TableCell>
                                  <strong className="table-table1">Attendance</strong>
                                </TableCell>
                                <TableCell>
                                  <strong className="table-table1"> Points</strong>
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {users.map((user) => (
                                <TableRow key={user.rid}>
                                  <TableCell className="table-table">{user.name}</TableCell>
                                  <TableCell className="table-table">{user.rid}</TableCell>
                                  <TableCell className="table-table">
                                    <Select
                                    className="table-table"
                                      value={
                                        attendanceData[user.rid]?.attendance ||
                                        ""
                                      }
                                      onChange={(e) =>
                                        handleAttendanceChange(
                                          user.rid,
                                          e.target.value
                                        )
                                      }
                                    >
                                      <MenuItem value="Present">
                                        Present
                                      </MenuItem>
                                      <MenuItem value="Absent">Absent</MenuItem>
                                    </Select>
                                  </TableCell>
                                  <TableCell className="table-table">
                                    {attendanceData[user.rid]?.attendance ===
                                      "Present" && (
                                      <TextField
                                      className="table-table"
                                        type="number"
                                        value={
                                          attendanceData[user.rid]?.points || ""
                                        }
                                        onChange={(e) =>
                                          handlePointsChange(
                                            user.rid,
                                            e.target.value
                                          )
                                        }
                                      />
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Box>
          </Modal>
        </div>{" "}
      </div>
    </div>
  );
};

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 700,
  backgroundColor: "white",
  padding: "16px",
  boxShadow: 24,
};

export default EventManager;
