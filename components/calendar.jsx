import React, { useState, useEffect } from "react";
import Calendar from "react-calendar"; // Import react-calendar
import "./calendar.css";
import axios from "axios";
import { API_BASE_URL } from "../constants";
import { get_headers, logout } from "../utils";
import { useNavigate } from "react-router-dom";


const EventCalendar = () => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [eventDetailsModalOpen, setEventDetailsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [eventTitle, setEventTitle] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [events, setEvents] = useState({}); // Store events by date
  const [selectedEventDetails, setSelectedEventDetails] = useState([]); // State for selected event details
  const [selectedMonth, setSelectedMonth] = useState("all"); // Set default to "all"
  const [filteredEvents, setFilteredEvents] = useState({}); // Store filtered events by month

  const navigate = useNavigate();
  // Load events from the database when the component mounts
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/get_events`,
          get_headers()
        ); // API endpoint to get events
        const fetchedEvents = response.data; // Assuming your API returns the events in the expected format

        // Format the events into an object by date
        const formattedEvents = fetchedEvents.reduce((acc, event) => {
          const eventDate = new Date(event.date).toLocaleDateString("en-CA"); // Format date
          if (!acc[eventDate]) {
            acc[eventDate] = []; // Initialize array for this date if it doesn't exist
          }
          acc[eventDate].push(event); // Push the event into the array for that date
          return acc; // Return the accumulator for the next iteration
        }, {});

        setEvents(formattedEvents); // Set the formatted events in state
        setFilteredEvents(formattedEvents); // Initialize filtered events
      } catch (error) {
        if (error.response && error.response.status === 401) {
          logout(navigate); // Call logout if the status is 401
        } else {
          console.error("Error fetching events:", error);
        }
      }
    };

    fetchEvents(); // Call the function to fetch events
  }, []);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setEventModalOpen(true); // Open the event input modal
  };


  const handleSubmit = async () => {
    const localDate = new Date(selectedDate);
    const formattedDate = localDate.toLocaleDateString("en-CA");
  
    const eventData = {
      title: eventTitle,
      time: eventTime,
      location: eventLocation,
      date: formattedDate,
    };
  
    try {
      const response = await axios.post(
        `${API_BASE_URL}/add_event`,
        eventData,
        get_headers()
      );
      alert(response.data.message);
  
      // Add new event to the state at the top of the list
      const updatedEvents = {
        ...events,
        [formattedDate]: [
          {
            title: eventTitle,
            time: eventTime,
            location: eventLocation,
          },
          ...(events[formattedDate] || []), // Append existing events
        ],
      };
  
      setEvents(updatedEvents);
      setFilteredEvents(updatedEvents); // Update filtered events as well
  
      setEventModalOpen(false);
      setEventTitle("");
      setEventTime("");
      setEventLocation("");
    } catch (error) {
      alert("Error adding event: " + error.response.data.error);
    }
  };

  // Function to render tile content
  const tileContent = ({ date }) => {
    const formattedDate = date.toLocaleDateString("en-CA");
    return filteredEvents[formattedDate] ? (
      <div className="event-indicator">E</div>
    ) : null;
  };

  // Function to handle date click and show event details
  const handleDateClick = (date) => {
    const formattedDate = date.toLocaleDateString("en-CA");
    if (filteredEvents[formattedDate]) {
      setSelectedEventDetails(filteredEvents[formattedDate]); // Get all event details for the selected date
      setEventDetailsModalOpen(true); // Open event details modal
    }
  };

  // Function to open event modal when adding more events
  const handleAddMoreEvents = () => {
    setEventModalOpen(true);
    setEventDetailsModalOpen(false); // Close the event details modal
  };



  // Function to display all events
  const renderAllEvents = () => {
    // Sort dates in descending order (latest dates first)
    const sortedDates = Object.keys(filteredEvents).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateB - dateA; // Descending order
    });
  

    return sortedDates.map((date) => (
      <div key={date}>
        {filteredEvents[date].map((event, index) => (
          <div key={index} className="event-detail">
            <p>
              <strong>Title:</strong> {event.title}
            </p>
            <p>
              <strong>Date:</strong> {date}
            </p>
            <p>
              <strong>Time:</strong> {event.time}
            </p>
            <p>
              <strong>Location:</strong> {event.location}
            </p>
        
          </div>
        ))}
      </div>
    ));
  };

 

  const handleRefresh = async () => {
    if (Object.keys(events).length === 0) {
      window.confirm("No events to delete.");
      return;
    }

    const confirmRefresh = window.confirm(
      "Are you sure you want to delete all events?"
    );
    if (confirmRefresh) {
      try {
        await axios.delete(`${API_BASE_URL}/clear_events`, get_headers()); // Call the clear events API
        setEvents({}); // Clear events from the front-end state
        setFilteredEvents({}); // Clear filtered events as well
        alert("All events have been cleared successfully!");
      } catch (error) {
        alert("Error clearing events: " + error.response.data.error);
      }
    }
  };

  // Handle month change
  const handleMonthChange = (e) => {
    const monthIndex = e.target.value; // Get selected month value
    setSelectedMonth(monthIndex);

    if (monthIndex === "all") {
      setFilteredEvents(events); // If "All" is selected, show all events
    } else {
      // Filter events by the selected month
      const filtered = Object.keys(events).reduce((acc, date) => {
        const eventDate = new Date(date);
        if (eventDate.getMonth() === parseInt(monthIndex, 10)) {
          acc[date] = events[date]; // Include event if it matches the selected month
        }
        return acc;
      }, {});

      setFilteredEvents(filtered); // Update the filtered events
      const newDate = new Date(selectedDate);
      newDate.setMonth(parseInt(monthIndex, 10));
      setSelectedDate(newDate); // Update selected date to the first day of the selected month
    }
  };

  return (
    <div className="wrapper">
      <div className="calendar-container">
        <div className="calendar-border">
          <h1 className="calendar-heading">Calendar</h1>

          <button
            className="calendar-button"
            onClick={() => setCalendarOpen(true)}
          >
            Open Calendar
          </button>
          <button
            className="calendar-button refresh-button"
            onClick={handleRefresh}
          >
            Refresh Events
          </button>

          {/* Month Dropdown */}
          <select
            className="month-dropdown"
            value={selectedMonth}
            onChange={handleMonthChange}
          >
            <option value="all">All</option>
            {Array.from({ length: 12 }, (_, index) => (
              <option key={index} value={index}>
                {new Date(0, index).toLocaleString("default", {
                  month: "long",
                })}
              </option>
            ))}
          </select>

          {/* Calendar Modal */}
          {calendarOpen && (
            <div className="modal">
              <div className="modal-content5">
                <h2 className="modal-heading">Select a Date</h2>
                <Calendar
                  onChange={handleDateChange}
                  value={selectedDate}
                  tileContent={tileContent}
                  onClickDay={handleDateClick}
                />
                <button
                  className="calendar-button close-button"
                  onClick={() => setCalendarOpen(false)}
                >
                  Close Calendar
                </button>
              </div>
            </div>
          )}

          {/* Event Input Modal */}
          {eventModalOpen && (
            <div className="modal">
              <div className="modal-content">
                <h3 className="modal-heading">
                  Add Event for {selectedDate.toDateString()}
                </h3>
                <input
                  type="text"
                  className="event-input"
                  placeholder="Event Title"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                />
                <input
                  type="time"
                  className="event-input eventip2"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                />
                <input
                  type="text"
                  className="event-input"
                  placeholder="Location"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                />
                <button
                  className="calendar-button submit-button"
                  onClick={handleSubmit}
                >
                  Submit
                </button>
                <button
                  className="calendar-button close-button"
                  onClick={() => setEventModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Event Details Modal */}
          {eventDetailsModalOpen && selectedEventDetails.length > 0 && (
            <div className="modal">
              <div className="modal-content1">
                <h3 className="modal-heading">
                  Event Details for {selectedDate.toDateString()}
                </h3>
                {selectedEventDetails.map((event, index) => (
                  <div key={index} className="event-detail">
                    <p className="event-info">
                      <strong>Title:</strong> {event.title}
                    </p>
                    <p className="event-info">
                      <strong>Date:</strong> {event.date}
                    </p>
                    <p className="event-info">
                      <strong>Time:</strong> {event.time}
                    </p>
                    <p className="event-info">
                      <strong>Location:</strong> {event.location}
                    </p>
                    <hr />
                  </div>
                ))}
                <button
                  className="calendar-button add-more-button"
                  onClick={handleAddMoreEvents}
                >
                  Add More Events
                </button>
                <button
                  className="calendar-button close-button"
                  onClick={() => setEventDetailsModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Display All Events Section */}
          <div className="all-events">
          
              <h3 className="events-heading">
                Events for{" "}
                {selectedMonth === "all"
                  ? "All Months"
                  : new Date(2020, selectedMonth).toLocaleString("default", {
                      month: "long",
                    })}
              </h3>
              {renderAllEvents()}
            </div>
       
        </div>
      </div>
    </div>
  );
};

export default EventCalendar;
