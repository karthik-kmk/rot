import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../constants";
import { get_headers } from "../utils";
import "./profile.css";

// Import the default image from the assets folder
import defaultProfileImage from "../assets/manimage.jpeg";

const UserProfile = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const rid = localStorage.getItem("userRID");
      if (!rid) {
        setError("No RID found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/profile?rid=${rid}`,
          get_headers()
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user details");
        }
        const data = await response.json();
        setUserDetails(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Ensure '91' prefix for phone number
    const updatedValue =
      name === "phnumber" && !value.startsWith("91") ? `91${value}` : value;

    setUserDetails((prevState) => ({ ...prevState, [name]: updatedValue }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const rid = localStorage.getItem("userRID");

    const formData = new FormData();
    formData.append("rid", rid);
    formData.append("name", userDetails.name);
    formData.append("email", userDetails.email);
    formData.append("password", userDetails.password);
    formData.append("dob", userDetails.dob);
    formData.append("gender", userDetails.gender);
    formData.append("bio", userDetails.bio);
    formData.append("clubrole", userDetails.clubrole);
    formData.append("phnumber", userDetails.phnumber);
    if (file) {
      formData.append("profile_photo", file);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/update`, {
        method: "POST",
        body: formData,
        ...get_headers(),
      });

      if (!response.ok) {
        throw new Error("Failed to update user details");
      }

      alert("User details updated successfully!");
      setIsEditing(false);
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) return <div className="user-profile-loading">Loading...</div>;
  if (error) return <div className="user-profile-error">Error: {error}</div>;

  return (
    <div className="wrapper1">
      <div className="user-profile-container">
        <h2 className="user-profile-heading">User Profile</h2>
        {userDetails ? (
          <form onSubmit={handleSubmit} className="user-profile-form">
            <span className="user-profile-label1">
              <label>
                <div className="user-profile-preview">
                  <img
                    src={
                      preview
                        ? preview
                        : userDetails.profilephoto
                        ? `data:image/png;base64,${userDetails.profilephoto}`
                        : defaultProfileImage // Use the imported default image if no photo is available
                    }
                    alt="Profile"
                    className="user-profile-image"
                  />
                </div>
                {isEditing && (
                  <input
                    type="file"
                    name="profile_photo"
                    onChange={handleFileChange}
                    className="user-profile-file-input1"
                  />
                )}
              </label>
            </span>

            <div className="flex-flex-div">
              <div className="flex-div">
                <label className="user-profile-label">
                  <strong>Name:</strong>
                  <input
                    type="text"
                    name="name"
                    value={userDetails.name || ""}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    className="user-profile-input"
                  />
                </label>

                <label className="user-profile-label">
                  <strong>Email:</strong>
                  <input
                    type="email"
                    name="email"
                    value={userDetails.email || ""}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    className="user-profile-input"
                  />
                </label>
              </div>

              <div className="flex-div">
                <label className="user-profile-label">
                  <strong>RID:</strong>
                  <input
                    type="text"
                    name="rid"
                    value={userDetails.rid}
                    readOnly
                    className="user-profile-input"
                  />
                </label>

                <label className="user-profile-label">
                  <strong>Password:</strong>
                  <input
                    type="password"
                    name="password"
                    value={userDetails.password || ""}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    className="user-profile-input"
                  />
                </label>
              </div>

              <div className="flex-div">
                <label className="user-profile-label">
                  <strong>Phone Number:</strong>
                  <input
                    type="number"
                    name="phnumber"
                    value={userDetails.phnumber || ""}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    className="user-profile-input"
                  />
                </label>

                <label className="user-profile-label">
                  <strong>Date of Birth:</strong>
                  <input
                    type="date"
                    name="dob"
                    value={
                      userDetails.dob
                        ? userDetails.dob.split("T")[0] // Extract date part only if time is present
                        : ""
                    }
                    onChange={handleChange}
                    readOnly={!isEditing}
                    className="user-profile-input"
                  />
                </label>
              </div>

              <div className="flex-div">
                <label className="user-profile-label">
                  <strong>Gender:</strong>
                  <select
                    name="gender"
                    value={userDetails.gender || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="user-profile-select"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </label>

                <label className="user-profile-label">
                  <strong>Club Role:</strong>
                  <input
                    type="text"
                    name="clubrole"
                    value={userDetails.clubrole || ""}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    className="user-profile-input"
                  />
                </label>
              </div>
              <label className="user-profile-label">
                <strong>Bio:</strong>
                <textarea
                  name="bio"
                  value={userDetails.bio || ""}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  className="user-profile-textarea"
                />
              </label>

              <div className="user-profile-buttons">
                <button
                  type="button"
                  onClick={handleEdit}
                  className="user-profile-button"
                >
                  {isEditing ? "Cancel" : "Edit"}
                </button>
                {isEditing && (
                  <button type="submit" className="user-profile-button">
                    Save Changes
                  </button>
                )}
              </div>
            </div>
          </form>
        ) : (
          <p className="user-profile-message">No user details available.</p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
