import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : (
    <Marker 
      position={position} 
      draggable
      eventHandlers={{
        dragend: (e) => {
          const latlng = e.target.getLatLng();
          setPosition([latlng.lat, latlng.lng]);
        },
      }}
    />
  );
}

function JobModal({ jobForm, setJobForm, setShowJobModal, handleCreateJob }) {
  const [showMap, setShowMap] = useState(false);
  const [mapPosition, setMapPosition] = useState([
    parseFloat(jobForm.latitude) || 14.5995,
    parseFloat(jobForm.longitude) || 120.9842
  ]);
  const [gettingLocation, setGettingLocation] = useState(false);

  const handleChange = (field, value) => {
    setJobForm(prev => ({ ...prev, [field]: value }));
  };

  // Sync map changes to form
  useEffect(() => {
    if (mapPosition) {
      setJobForm(prev => ({
        ...prev,
        latitude: mapPosition[0].toFixed(6),
        longitude: mapPosition[1].toFixed(6),
        location: `${mapPosition[0].toFixed(6)}, ${mapPosition[1].toFixed(6)}`
      }));
    }
  }, [mapPosition, setJobForm]);

  const handleUseCurrentLocation = () => {
    setGettingLocation(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMapPosition([latitude, longitude]);
        setGettingLocation(false);
      },
      (error) => {
        alert("Unable to retrieve your location. Please allow location access or pick manually on the map.");
        setGettingLocation(false);
      }
    );
  };

  const handleSave = async () => {
    if (!jobForm.title.trim() || !jobForm.description.trim()) {
      alert("Please fill in Job Title and Description.");
      return;
    }
    await handleCreateJob();
    setShowJobModal(false);
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.6)", display: "flex",
      justifyContent: "center", alignItems: "center", zIndex: 1000
    }}>
      <div style={{
        backgroundColor: "white", padding: "30px", borderRadius: "12px",
        width: "90%", maxWidth: "650px", maxHeight: "90vh", overflowY: "auto"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
          <h2 style={{ margin: 0 }}>{jobForm.id ? "✏️ Edit Job" : "➕ Create New Job"}</h2>
          <button onClick={() => setShowJobModal(false)} style={{ fontSize: "28px", background: "none", border: "none", cursor: "pointer" }}>×</button>
        </div>

        <div style={{ display: "grid", gap: "20px" }}>
          {/* Job Title */}
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>Job Title *</label>
            <input
              type="text"
              value={jobForm.title}
              onChange={e => handleChange("title", e.target.value)}
              style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "16px" }}
              placeholder="Enter job title"
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>Description *</label>
            <textarea
              value={jobForm.description}
              onChange={e => handleChange("description", e.target.value)}
              style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px", minHeight: "110px", resize: "vertical" }}
              placeholder="Describe the job role and responsibilities..."
            />
          </div>

          {/* Location Section */}
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>Location</label>
            <input
              type="text"
              value={jobForm.location}
              onChange={e => handleChange("location", e.target.value)}
              style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px", marginBottom: "10px" }}
              placeholder="City, Address or coordinates"
            />

            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              <button
                onClick={() => setShowMap(!showMap)}
                style={{
                  padding: "10px 16px",
                  backgroundColor: showMap ? "#dc3545" : "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  flex: 1
                }}
              >
                {showMap ? "Hide Map" : "📍 Pick on Map"}
              </button>

              <button
                onClick={handleUseCurrentLocation}
                disabled={gettingLocation}
                style={{
                  padding: "10px 16px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: gettingLocation ? "not-allowed" : "pointer",
                  opacity: gettingLocation ? 0.7 : 1,
                  flex: 1
                }}
              >
                {gettingLocation ? "Getting Location..." : "📍 Use My Location"}
              </button>
            </div>

            {showMap && (
              <div style={{ marginTop: "12px", border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden" }}>
                <MapContainer
                  center={mapPosition}
                  zoom={13}
                  style={{ height: "340px", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker position={mapPosition} setPosition={setMapPosition} />
                </MapContainer>
              </div>
            )}
          </div>

          {/* Salary Range */}
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>Salary Range</label>
            <input
              type="text"
              value={jobForm.salary}
              onChange={e => handleChange("salary", e.target.value)}
              style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px" }}
              placeholder="e.g., ₱50,000 - ₱80,000"
            />
          </div>

          {/* Job Type & Category */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>Job Type</label>
              <select
                value={jobForm.job_type}
                onChange={e => handleChange("job_type", e.target.value)}
                style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px" }}
              >
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>Category</label>
              <select
                value={jobForm.category}
                onChange={e => handleChange("category", e.target.value)}
                style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px" }}
              >
                <option value="technology">Technology</option>
                <option value="marketing">Marketing</option>
                <option value="finance">Finance</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>Status</label>
              <select
                value={jobForm.status || "active"}
                onChange={e => handleChange("status", e.target.value)}
                style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px" }}
              >
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Requirements */}
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>Requirements</label>
            <textarea
              value={jobForm.requirements}
              onChange={e => handleChange("requirements", e.target.value)}
              style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px", minHeight: "90px", resize: "vertical" }}
              placeholder="List required skills and qualifications..."
            />
          </div>

          {/* Latitude, Longitude, Radius */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Latitude</label>
              <input
                type="number"
                step="0.000001"
                value={jobForm.latitude || ""}
                onChange={e => handleChange("latitude", e.target.value)}
                style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px" }}
                placeholder="Auto-filled"
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Longitude</label>
              <input
                type="number"
                step="0.000001"
                value={jobForm.longitude || ""}
                onChange={e => handleChange("longitude", e.target.value)}
                style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px" }}
                placeholder="Auto-filled"
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Search Radius (km)</label>
              <input
                type="number"
                value={jobForm.job_radius || ""}
                onChange={e => handleChange("job_radius", e.target.value)}
                style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px" }}
                placeholder="10"
              />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "35px" }}>
          <button
            onClick={() => setShowJobModal(false)}
            style={{ padding: "12px 24px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{ padding: "12px 24px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}
          >
            {jobForm.id ? "Update Job" : "Create Job"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default JobModal;