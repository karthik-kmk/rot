import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../constants";
import { get_headers } from "../utils";
import "./meetings.css";

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState({
    title: "",
    start_time: "",
    end_time: "",
    date: "",
    description: "",
  });
  const [selectedTask, setSelectedTask] = useState(null); // State for selected task to show in modal
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/get_tasks`,
        get_headers()
      );
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTask({ ...task, [name]: value });
  };

  const handleAddTask = async () => {
    if (
      task.title &&
      task.start_time &&
      task.end_time &&
      task.date &&
      task.description
    ) {
      try {
        await axios.post(`${API_BASE_URL}/api/meetings`, task, get_headers());
        fetchTasks(); // Refresh the tasks list after adding a new one
        setTask({
          title: "",
          start_time: "",
          end_time: "",
          date: "",
          description: "",
        });
      } catch (error) {
        console.error("Error adding task:", error);
      }
    } else {
      alert("Please fill out all fields");
    }
  };

  const handleDeleteAllTasks = async () => {
    if (tasks.length === 0) {
      alert("No meetings to delete.");
      return; // Exit the function early if there are no meetings
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete all meetings?"
    );
    if (confirmDelete) {
      try {
        await axios.delete(`${API_BASE_URL}/meetings-clear`, get_headers()); // Updated to match your API route
        fetchTasks(); // Refresh the tasks list after deletion
      } catch (error) {
        console.error("Error deleting tasks:", error);
      }
    }
  };

  // Open modal with task details
  const openModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  return (
    <div className="wrapper">
      <div className="meetings-container">
        <div className="task-container">
          <div className="task-input-container">
            <h1 className="app-title">Meetings and MoM's</h1>
            <input
              type="text"
              className="input-field"
              name="title"
              placeholder="Meeting Title"
              value={task.title}
              onChange={handleChange}
            />
            <div className="ip2">
              <input
                className="input-field ip1"
                name="start_time"
                placeholder="Start Time"
                value={task.start_time}
                onChange={handleChange}
              />
              <input
                className="input-field ip1"
                name="end_time"
                placeholder="End Time"
                value={task.end_time}
                onChange={handleChange}
              />
              <input
                type="date"
                className="input-field ip1"
                name="date"
                placeholder="Date"
                value={
                  task.date
                    ? new Date(task.date).toISOString().split("T")[0]
                    : ""
                } // Ensures it's in yyyy-mm-dd format
                onChange={handleChange}
              />
            </div>
            <textarea
              className="textarea-field"
              name="description"
              placeholder="Description"
              value={task.description}
              onChange={handleChange}
            />
            <button className="add-task-btn" onClick={handleAddTask}>
              Add Meeting
            </button>
            <button className="delete-all-btn" onClick={handleDeleteAllTasks}>
              Delete All Meetings
            </button>
            <div className="task-list-container">
              <h2 className="task-list-title">Meetings</h2>
              {tasks
                .slice() // Create a shallow copy to avoid mutating the original array
                .reverse() // Reverse the order of the tasks
                .map((t) => (
                  <div
                    key={t.id}
                    className="task-item"
                    onClick={() => openModal(t)} // Open modal on title click
                  >
                    <h3 className="task-item-title">{t.title}</h3>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for showing task details */}
      {isModalOpen && selectedTask && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedTask.title}</h2>
            <div className="flex-flex-flex1">
              <p>
                <strong className="golden-rod">Start Time:</strong>{" "}
                {selectedTask.start_time}
              </p>
              <p>
                <strong className="golden-rod">End Time:</strong>{" "}
                {selectedTask.end_time}
              </p>
              <p>
                <strong className="golden-rod">Date:</strong>{" "}
                {selectedTask.date
                  ? new Date(selectedTask.date).toLocaleDateString("en-GB", {
                      weekday: "long", // This will display the full day name (e.g., Monday)
                      day: "2-digit", // Display day in 2-digit format (e.g., 06)
                      month: "2-digit", // Display month in 2-digit format (e.g., 12)
                      year: "numeric", // Display full year (e.g., 2024)
                    })
                  : ""}
              </p>

              <p>
                <strong className="golden-rod">Description:</strong>{" "}
                {selectedTask.description}
              </p>
            </div>
            <button className="close-modal-btn" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
