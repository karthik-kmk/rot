import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "./calendaruser.css";
import axios from "axios";
import { API_BASE_URL } from "../constants";
import { get_headers, logout } from "../utils";
import { useNavigate } from "react-router-dom";

const UserEventCalendar = () => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [eventDetailsModalOpen, setEventDetailsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [selectedEventDetails, setSelectedEventDetails] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [filteredEvents, setFilteredEvents] = useState({});

  const navigate = useNavigate();
  // Fetch events when component mounts
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/get_events`,
          get_headers()
        );
        const fetchedEvents = response.data;

        // Format events by date
        const formattedEvents = fetchedEvents.reduce((acc, event) => {
          const eventDate = new Date(event.date).toLocaleDateString("en-CA");
          if (!acc[eventDate]) {
            acc[eventDate] = [];
          }
          acc[eventDate].push(event);
          return acc;
        }, {});

        setEvents(formattedEvents);
        setFilteredEvents(formattedEvents);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          logout(navigate); // Call logout if the status is 401
        } else {
          console.error("Error fetching events:", error);
        }
      }
    };

    console.log("Getting events");
    fetchEvents();
  }, []);

  // Function to render tile content for calendar
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
      setSelectedEventDetails(filteredEvents[formattedDate]);
      setEventDetailsModalOpen(true);
    }
  };

  // Function to display all events
  const renderAllEvents = () => {
    return Object.entries(filteredEvents).map(([date, eventList]) => (
      <div key={date}>
        {eventList.map((event, index) => (
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
            <hr />
          </div>
        ))}
      </div>
    ));
  };

  // Handle month change
  const handleMonthChange = (e) => {
    const monthIndex = e.target.value;
    setSelectedMonth(monthIndex);

    if (monthIndex === "all") {
      setFilteredEvents(events);
    } else {
      const filtered = Object.keys(events).reduce((acc, date) => {
        const eventDate = new Date(date);
        if (eventDate.getMonth() === parseInt(monthIndex, 10)) {
          acc[date] = events[date];
        }
        return acc;
      }, {});

      setFilteredEvents(filtered);
      const newDate = new Date(selectedDate);
      newDate.setMonth(parseInt(monthIndex, 10));
      setSelectedDate(newDate);
    }
  };

  return (
    <div className="calendar-container2">
      <div className="calen-cont-cont">
        <p className="header-calen-user">Calendar</p>
        <div className="btns-cal-user">

        
        <button  className="btns-calendar" onClick={() => setCalendarOpen(true)}>Open Calendar</button>

        {/* Month Dropdown */}
        <select   className="btns-calendar"  value={selectedMonth} onChange={handleMonthChange}>
          <option value="all">All</option>
          {Array.from({ length: 12 }, (_, index) => (
            <option key={index} value={index}>
              {new Date(0, index).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>

        </div>

        {/* Calendar Modal */}
        {calendarOpen && (
          <div className="modal">
            <div className="modal-content">
              <h2>Calendar</h2>
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                tileContent={tileContent}
                onClickDay={handleDateClick}
              />
              <button
                className="close-btn-user-cal"
                onClick={() => setCalendarOpen(false)}
              >
                Close Calendar
              </button>
            </div>
          </div>
        )}

        {/* Event Details Modal */}
        {eventDetailsModalOpen && selectedEventDetails.length > 0 && (
          <div className="modal">
            <div className="modal-content2">
              <h3 className="modal-heading1">Event Details for {selectedDate.toDateString()}</h3>
              {selectedEventDetails.map((event, index) => (
                <div key={index} className="event-detail">
                  <p>
                    <strong>Title:</strong> {event.title}
                  </p>
                  <p>
                    <strong>Date:</strong> {event.date}
                  </p>
                  <p>
                    <strong>Time:</strong> {event.time}
                  </p>
                  <p>
                    <strong>Location:</strong> {event.location}
                  </p>
                  <hr />
                </div>
              ))}
              <button  className="btn-close-yes-2"    onClick={() => setEventDetailsModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        )}

        {/* Display All Events Section */}
        <div className="all-events">
          <h3 className="events-for-cal">
            Events for{" "}
            {selectedMonth === "all"
              ? "All Months"
              : new Date(2020, selectedMonth).toLocaleString("default", {
                  month: "long",
                })}
          </h3>
          <div className="render-cal-events">
          {renderAllEvents()}
          </div>
         
        </div>
      </div>
    </div>
  );
};

export default UserEventCalendar;
