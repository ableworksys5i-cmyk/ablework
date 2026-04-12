import { useEffect, useState } from "react";
import { getGeofences, createGeofence, deleteGeofence } from "../../api/api";
import "./Geofences.css";
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function Geofences({ employerId }) {
  const [geofences, setGeofences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", latitude: "", longitude: "", radius: "" });
  const [userLocation, setUserLocation] = useState(null);

  const loadGeofences = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getGeofences(employerId);
      setGeofences(data);
    } catch (err) {
      console.error("Failed to load geofences", err);
      setError("Unable to load geofence zones right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employerId) {
      loadGeofences();
    }

    // Get user's real-time location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );

      // Watch position for real-time updates
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Geolocation watch error:", error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [employerId]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.name || !form.latitude || !form.longitude || !form.radius) {
      setError("All fields are required.");
      return;
    }

    const geofenceData = {
      name: form.name,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      radius: parseInt(form.radius, 10)
    };

    if (Number.isNaN(geofenceData.latitude) || Number.isNaN(geofenceData.longitude) || Number.isNaN(geofenceData.radius)) {
      setError("Latitude, longitude, and radius must be valid numbers.");
      return;
    }

    try {
      await createGeofence(employerId, geofenceData);
      setForm({ name: "", latitude: "", longitude: "", radius: "" });
      await loadGeofences();
    } catch (err) {
      console.error("Failed to create geofence", err);
      setError("Failed to save geofence zone.");
    }
  };

  const handleDelete = async (geofenceId) => {
    if (!window.confirm("Delete this geofence zone?")) {
      return;
    }

    try {
      await deleteGeofence(employerId, geofenceId);
      await loadGeofences();
    } catch (err) {
      console.error("Failed to delete geofence", err);
      setError("Unable to remove this geofence.");
    }
  };

  const mapCenter = userLocation ? [userLocation.lat, userLocation.lng] : [14.5995, 120.9842]; // Default to Manila if no location

  return (
    <div className="geofences-container">
      <div className="geofences-header">
        <h2>Geofence Zones</h2>
        <p>Define geofence zones where nearby jobs should be matched. Circles represent geofence boundaries.</p>
      </div>

      <div className="geofence-map-card">
        <h3>Geofence Map</h3>
        <div className="geofence-map">
          <MapContainer center={mapCenter} zoom={13} style={{ height: '400px', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]}>
                <Popup>Your current location</Popup>
              </Marker>
            )}
            {geofences.map((zone) => (
              <Circle
                key={zone.geofence_id}
                center={[zone.latitude, zone.longitude]}
                radius={zone.radius}
                pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }}
              >
                <Popup>{zone.name} (Radius: {zone.radius}m)</Popup>
              </Circle>
            ))}
          </MapContainer>
        </div>
      </div>

      <div className="geofence-form-card">
        <h3>Create a geofence zone</h3>
        <form onSubmit={handleSubmit} className="geofence-form">
          <label>
            Zone name
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g. Main Campus"
            />
          </label>

          <label>
            Latitude
            <input
              type="text"
              value={form.latitude}
              onChange={(e) => handleChange("latitude", e.target.value)}
              placeholder="e.g. 14.5995"
            />
          </label>

          <label>
            Longitude
            <input
              type="text"
              value={form.longitude}
              onChange={(e) => handleChange("longitude", e.target.value)}
              placeholder="e.g. 120.9842"
            />
          </label>

          <label>
            Radius (meters)
            <input
              type="number"
              min="1"
              value={form.radius}
              onChange={(e) => handleChange("radius", e.target.value)}
              placeholder="e.g. 1000"
            />
          </label>

          {error && <div className="geofence-error">{error}</div>}

          <button type="submit" className="geofence-submit-btn">
            Save geofence
          </button>
        </form>
      </div>

      <div className="geofence-list-card">
        <h3>Existing zones</h3>
        {loading ? (
          <p>Loading zones...</p>
        ) : geofences.length === 0 ? (
          <p>No geofence zones yet. Create one to enable zone-based matching.</p>
        ) : (
          <table className="geofence-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Latitude</th>
                <th>Longitude</th>
                <th>Radius (m)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {geofences.map((zone) => (
                <tr key={zone.geofence_id}>
                  <td>{zone.name}</td>
                  <td>{zone.latitude}</td>
                  <td>{zone.longitude}</td>
                  <td>{zone.radius}</td>
                  <td>
                    <button
                      className="delete-geofence-btn"
                      onClick={() => handleDelete(zone.geofence_id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Geofences;
