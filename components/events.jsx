import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField } from "@mui/material";

const App = () => {
  const [eventName, setEventName] = useState(""); // State for input field
  const [events, setEvents] = useState([]); // State for events list
  const [selectedEvent, setSelectedEvent] = useState(null); // State for selected event
  const [isEventModalOpen, setEventModalOpen] = useState(false); // State for event modal visibility
  const [isRotaractorModalOpen, setRotaractorModalOpen] = useState(false); // State for Rotaractor modal visibility
  const [rotaractors, setRotaractors] = useState([]); // State for storing Rotaractors
  const [eventChairs, setEventChairs] = useState({}); // State to track chairs for each event
  
  // Base URL for API
  const BASE_URL = "http://127.0.0.1:5000"; // Replace with your Flask server's URL

  // Fetch events from API on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // Function to fetch events
  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/att_title_display`);
      setEvents(response.data.reverse()); // Reverse the events list to show the latest event at the top
    } catch (error) {
      console.error("Error fetching events:", error);
      alert("Failed to fetch events!");
    }
  };

  // Function to handle adding an event
  const handleAddEvent = async () => {
    if (eventName.trim()) {
      try {
        await axios.post(`${BASE_URL}/add_att_title`, {
          sname: eventName,
        });
        alert("Event added successfully!");
        setEventName(""); // Clear input field
        fetchEvents(); // Refresh events list
      } catch (error) {
        console.error("Error adding event:", error);
        alert("Failed to add event!");
      }
    } else {
      alert("Event name cannot be empty!");
    }
  };

  // Function to handle opening the event modal with event details
  const handleEventClick = (event) => {
    setSelectedEvent(event); // Set the selected event
    setEventModalOpen(true); // Open the event modal
  };

  // Function to close the event modal
  const handleCloseEventModal = () => {
    setEventModalOpen(false);
    setSelectedEvent(null); // Clear the selected event
  };

  // Function to open the Rotaractor modal
  const handleAddRotaractors = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/att_get_users`);
      setRotaractors(response.data); // Store the fetched Rotaractors
      setRotaractorModalOpen(true); // Open the Rotaractor modal
    } catch (error) {
      console.error("Error fetching Rotaractors:", error);
      alert("Failed to fetch Rotaractors!");
    }
  };

  // Function to close the Rotaractor modal
  const handleCloseRotaractorModal = () => {
    setRotaractorModalOpen(false);
  };

  // Function to handle adding/removing a Rotaractor as a chair in the second modal
  const handleToggleChair = (rotaractor) => {
    const updatedEventChairs = { ...eventChairs };

    // If chairs already exist for this event, we add/remove the chair
    if (updatedEventChairs[selectedEvent.event_name]) {
      const chairIndex = updatedEventChairs[selectedEvent.event_name].findIndex(
        (chair) => chair.rid === rotaractor.rid
      );

      if (chairIndex !== -1) {
        // If chair already exists, remove it
        updatedEventChairs[selectedEvent.event_name].splice(chairIndex, 1);
      } else {
        // If chair doesn't exist, add it
        updatedEventChairs[selectedEvent.event_name].push(rotaractor);
      }
    } else {
      // If no chairs exist for this event, add the first one
      updatedEventChairs[selectedEvent.event_name] = [rotaractor];
    }

    setEventChairs(updatedEventChairs); // Update the state
  };

 const eventSubmit = async () => {
    try{
      
    }
 }



  // Function to handle points input change
  const handlePointsChange = (event, rotaractorId) => {
    const updatedEventChairs = { ...eventChairs };
    const updatedRotaractors = updatedEventChairs[selectedEvent.event_name].map((chair) => {
      if (chair.rid === rotaractorId) {
        chair.points = event.target.value; // Update the points for the Rotaractor
      }
      return chair;
    });

    updatedEventChairs[selectedEvent.event_name] = updatedRotaractors; // Update event chairs with new points
    setEventChairs(updatedEventChairs); // Set the updated chairs in the state
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Event Manager</h1>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter event name"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          style={{
            padding: "10px",
            fontSize: "16px",
            marginRight: "10px",
            width: "300px",
          }}
        />
        <button
          onClick={handleAddEvent}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          Add Event
        </button>
      </div>
      <h2>Events</h2>
      <ul>
        {events.length > 0 ? (
          events.map((event, index) => (
            <li
              key={index}
              onClick={() => handleEventClick(event)} // Add click handler
              style={{
                fontSize: "18px",
                marginBottom: "10px",
                cursor: "pointer",
                color: "#007BFF",
              }}
            >
              {event.event_name}
            </li>
          ))
        ) : (
          <p style={{ fontSize: "18px", color: "gray" }}>No events available.</p>
        )}
      </ul>

      {/* Modal for displaying event details */}
      <Modal open={isEventModalOpen} onClose={handleCloseEventModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" component="h2">
            Event Details
          </Typography>
          <Typography sx={{ mt: 2 }}>
            {selectedEvent ? `Event Name: ${selectedEvent.event_name}` : ""}
          </Typography>

          {/* Display chairs in a structured table */}
          {selectedEvent && eventChairs[selectedEvent.event_name] && (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Rotaractor ID</TableCell>
                    <TableCell>Points</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {eventChairs[selectedEvent.event_name].map((rotaractor, index) => (
                    <TableRow key={index}>
                      <TableCell>{rotaractor.name}</TableCell>
                      <TableCell>{rotaractor.rid}</TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={rotaractor.points || ""}
                          onChange={(e) => handlePointsChange(e, rotaractor.rid)}
                          variant="outlined"
                          size="small"
                          inputProps={{ min: 0 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Button
            onClick={handleAddRotaractors}
            variant="contained"
            sx={{ mt: 2 }}
            color="primary"
          >
            Add Rotaractors
          </Button>
          <Button
            onClick={handleCloseEventModal}
            variant="contained"
            sx={{ mt: 2 }}
            color="secondary"
          >
            Close
          </Button>
          <Button onClick={handle}>Save</Button>
        </Box>
      </Modal>

      {/* Modal for adding Rotaractors (with table) */}
      <Modal open={isRotaractorModalOpen} onClose={handleCloseRotaractorModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" component="h2">
            Select Rotaractors to Assign Chairs
          </Typography>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Rotaractor ID</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rotaractors.length > 0 ? (
                  rotaractors.map((rotaractor, index) => {
                    const isChair = eventChairs[selectedEvent?.event_name]?.some(
                      (chair) => chair.rid === rotaractor.rid
                    );

                    return (
                      <TableRow key={index}>
                        <TableCell>{rotaractor.name}</TableCell>
                        <TableCell>{rotaractor.rid}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color={isChair ? "secondary" : "primary"}
                            onClick={() => handleToggleChair(rotaractor)}
                          >
                            {isChair ? "Remove Chair" : "Add Chair"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={3}>No Rotaractors available.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Button
            onClick={handleCloseRotaractorModal}
            variant="contained"
            sx={{ mt: 2 }}
            color="secondary"
          >
            Close
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default App;
