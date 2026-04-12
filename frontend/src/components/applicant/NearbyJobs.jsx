import React, { useMemo, useState, useEffect } from 'react';
import './NearbyJobs.css';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { formatJobLocationText, isCoordinateLocation, getGoogleMapsLink } from '../../utils/locationUtils';
import { getNearbyJobs } from '../../api/api';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for approximate locations
const approximateIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const defaultIcon = new L.Icon.Default();
const FIXED_SEARCH_RADIUS_KM = 10;

function NearbyJobs({ jobs, userLocation, onApply, onSaveJob, onViewJob, savedJobs }) {
  // jobs prop now contains the already filtered nearby jobs from the backend
  const [displayedJobs, setDisplayedJobs] = useState(jobs || []);
  const [realTimeUserLocation, setRealTimeUserLocation] = useState(null);
  const [manualLocation, setManualLocation] = useState({ lat: '', lng: '', query: '' });
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchMessage, setSearchMessage] = useState('');
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    setDisplayedJobs(jobs || []);
  }, [jobs]);

  const handleLocationSearch = async () => {
    const query = manualLocation.query.trim();
    if (!query) {
      alert('Please enter a city, neighborhood, or address.');
      return;
    }

    setSearchLoading(true);
    setSearchError('');
    setSearchMessage('Looking up location...');

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`
      );
      if (!response.ok) {
        throw new Error('Location lookup failed. Please try again.');
      }
      const results = await response.json();
      if (!results.length) {
        throw new Error('No location found. Try a more specific place name.');
      }

      const { lat, lon, display_name } = results[0];
      setManualLocation(prev => ({ ...prev, lat, lng: lon }));
      setSearchMessage(`Showing jobs within ${FIXED_SEARCH_RADIUS_KM} km of ${display_name}`);
      const nearby = await getNearbyJobs(null, lat, lon, FIXED_SEARCH_RADIUS_KM);
      setDisplayedJobs(nearby || []);
    } catch (err) {
      console.error('Location search error:', err);
      const message = err?.message || 'Failed to find that location.';
      setSearchError(message);
      alert(message);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleResetLocation = () => {
    setManualLocation({ lat: '', lng: '', query: '' });
    setSearchMessage('');
    setSearchError('');
    setDisplayedJobs(jobs || []);
  };

  const nearbyJobs = displayedJobs;

  useEffect(() => {
    // Get user's real-time location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setRealTimeUserLocation({
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
          setRealTimeUserLocation({
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
  }, []);

  const isJobSaved = (jobId) => savedJobs.some(saved => saved.job_id === jobId || saved.id === jobId);

  const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getJobCoordinates = (job) => {
    if (job.latitude && job.longitude) {
      const lat = parseFloat(job.latitude);
      const lng = parseFloat(job.longitude);
      if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
    }
    if (isCoordinateLocation(job.location)) {
      const [lat, lng] = job.location.split(',').map(c => parseFloat(c.trim()));
      if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
    }
    return getApproximateCoordinates(job.location);
  };

  const userCoordinates = useMemo(() => {
    if (!isCoordinateLocation(userLocation)) return null;
    const [lat, lng] = userLocation.split(',').map(c => parseFloat(c.trim()));
    if (isNaN(lat) || isNaN(lng)) return null;
    return [lat, lng];
  }, [userLocation]);

  const searchAreaCenter = useMemo(() => {
    if (manualLocation.lat && manualLocation.lng) {
      const lat = parseFloat(manualLocation.lat);
      const lng = parseFloat(manualLocation.lng);
      if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
    }
    if (userCoordinates) return userCoordinates;
    if (realTimeUserLocation) return [realTimeUserLocation.lat, realTimeUserLocation.lng];
    return null;
  }, [manualLocation, userCoordinates, realTimeUserLocation]);

  const isJobInsideRadius = useMemo(() => {
    if (!searchAreaCenter) return () => true;
    return (job) => {
      const jobCoords = getJobCoordinates(job);
      if (!jobCoords) return false;
      const [jobLat, jobLng] = jobCoords;
      const [centerLat, centerLng] = searchAreaCenter;
      const distance = calculateDistanceKm(centerLat, centerLng, jobLat, jobLng);
      return distance <= FIXED_SEARCH_RADIUS_KM;
    };
  }, [searchAreaCenter]);

  const jobsWithinRadius = useMemo(() => {
    return nearbyJobs.filter(isJobInsideRadius);
  }, [nearbyJobs, isJobInsideRadius]);

  const jobCoordinates = useMemo(() => {
    return jobsWithinRadius
      .map(getJobCoordinates)
      .filter(coords => coords !== null);
  }, [jobsWithinRadius]);

  const mapCenter = useMemo(() => {
    if (searchAreaCenter) return searchAreaCenter;

    // Find first job with coordinates (exact or approximate)
    for (const job of nearbyJobs) {
      if (job.latitude && job.longitude) {
        const lat = parseFloat(job.latitude);
        const lng = parseFloat(job.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          return [lat, lng];
        }
      }
      if (isCoordinateLocation(job.location)) {
        const [lat, lng] = job.location.split(',').map(c => parseFloat(c.trim()));
        if (!isNaN(lat) && !isNaN(lng)) {
          return [lat, lng];
        }
      }
      const approxCoords = getApproximateCoordinates(job.location);
      if (approxCoords) {
        return approxCoords;
      }
    }

    // Default to Manila if no coordinates found
    return [14.5995, 120.9842];
  }, [manualLocation, realTimeUserLocation, userCoordinates, nearbyJobs]);

  const mapBounds = useMemo(() => {
    const bounds = [...jobCoordinates];
    if (userCoordinates) bounds.push(userCoordinates);
    if (searchAreaCenter) bounds.push(searchAreaCenter);
    return bounds.length ? bounds : null;
  }, [jobCoordinates, userCoordinates, searchAreaCenter]);


  return (
    <div className="nearby-jobs">
      <h2>Nearby Jobs</h2>

      {/* Location Info */}
      <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#f9f9f9", marginBottom: "30px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
          <span style={{ fontSize: "1.5rem" }}>📍</span>
          <div>
            <h3 style={{ margin: "0 0 5px 0" }}>Jobs in your area</h3>
            <p style={{ margin: 0, color: "#666" }}>
              Found {jobsWithinRadius.length} job{jobsWithinRadius.length !== 1 ? 's' : ''} within {FIXED_SEARCH_RADIUS_KM} km
            </p>
          </div>
        </div>
        <p style={{ margin: "10px 0 0 0", fontSize: "14px", color: "#666" }}>
          💡 Tip: Enable location services for more accurate nearby job recommendations
        </p>
      </div>

      {/* Manual Location Setting */}
      <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#f9f9f9", marginBottom: "30px" }}>
        <h3 style={{ margin: "0 0 15px 0" }}>🔧 Set Preferred Location</h3>
        <p style={{ margin: "0 0 15px 0", fontSize: "14px", color: "#666" }}>
          Type a city, town, or address to search jobs around that area.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1.8fr auto", gap: "10px", alignItems: "center", marginBottom: "10px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="e.g. Manila, Philippines"
            value={manualLocation.query}
            onChange={(e) => setManualLocation(prev => ({ ...prev, query: e.target.value }))}
            style={{ flex: 1, minWidth: "220px", padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}
          />
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={handleLocationSearch}
              disabled={searchLoading}
              style={{ padding: "10px 18px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "6px", cursor: searchLoading ? "not-allowed" : "pointer" }}
            >
              {searchLoading ? 'Searching…' : 'Search Location'}
            </button>
            <button
              type="button"
              onClick={handleResetLocation}
              style={{ padding: "10px 18px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
            >
              Reset
            </button>
          </div>
        </div>
        {searchMessage && (
          <p style={{ margin: "10px 0 0 0", fontSize: "14px", color: "#2e7d32" }}>{searchMessage}</p>
        )}
        {searchError && (
          <p style={{ margin: "10px 0 0 0", fontSize: "14px", color: "#c62828" }}>{searchError}</p>
        )}
      </div>

      {/* Interactive Map */}
      {(jobsWithinRadius.length > 0 || searchAreaCenter) && (
        <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#f9f9f9", marginBottom: "30px" }}>
          <h3 style={{ margin: "0 0 20px 0" }}>🗺️ Job Locations Map</h3>
          <div style={{ height: "400px", borderRadius: "8px", overflow: "hidden" }}>
            <MapContainer
              center={mapCenter}
              zoom={10}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {userCoordinates && (
                <Marker position={userCoordinates}>
                  <Popup>
                    <div>
                      <strong>Your location</strong>
                      <p>Based on your current coordinates</p>
                    </div>
                  </Popup>
                </Marker>
              )}
              {realTimeUserLocation && (
                <Marker position={[realTimeUserLocation.lat, realTimeUserLocation.lng]}>
                  <Popup>
                    <div>
                      <strong>Your real-time location</strong>
                      <p>Live GPS position</p>
                    </div>
                  </Popup>
                </Marker>
              )}
              {searchAreaCenter && (
                <Circle
                  center={searchAreaCenter}
                  radius={FIXED_SEARCH_RADIUS_KM * 1000}
                  pathOptions={{
                    color: '#1b5e20',
                    fillColor: '#1b5e20',
                    fillOpacity: 0.12,
                    weight: 2
                  }}
                />
              )}
              {manualLocation.lat && manualLocation.lng && (
                <Marker position={[parseFloat(manualLocation.lat), parseFloat(manualLocation.lng)]}>
                  <Popup>
                    <div>
                      <strong>Manual location</strong>
                      <p>{manualLocation.query || 'Set location'}</p>
                      <p>Radius: {FIXED_SEARCH_RADIUS_KM} km</p>
                    </div>
                  </Popup>
                </Marker>
              )}
              {jobsWithinRadius.map((job) => {
                let position = null;
                let isApproximate = false;
                let displayLocation = job.location || 'Location not specified';

                // First try to use exact coordinates if available
                if (job.latitude && job.longitude) {
                  position = [parseFloat(job.latitude), parseFloat(job.longitude)];
                  isApproximate = false;
                } else if (isCoordinateLocation(job.location)) {
                  // Fallback to coordinate parsing from location string
                  const [lat, lng] = job.location.split(',').map(c => parseFloat(c.trim()));
                  if (!isNaN(lat) && !isNaN(lng)) {
                    position = [lat, lng];
                    isApproximate = false;
                  }
                } else {
                  // Try to get approximate coordinates from location text
                  position = getApproximateCoordinates(job.location);
                  isApproximate = position !== null;
                  if (isApproximate) {
                    displayLocation = `${job.location} (approximate)`;
                  }
                }

                if (position) {
                  return (
                    <React.Fragment key={job.job_id || job.id || `${job.job_title}-${job.company}`}> 
                      <Marker
                        position={position}
                        icon={isApproximate ? approximateIcon : defaultIcon}
                      >
                        <Popup>
                          <div className="job-popup">
                            <h3>{job.job_title}</h3>
                            <p><strong>Company:</strong> {job.company || "Company"}</p>
                            <p><strong>Location:</strong> {displayLocation}</p>
                            <p><strong>Distance:</strong> {job.distance_km ? `${job.distance_km.toFixed(1)} km` : 'N/A'}</p>
                            <p><strong>Salary:</strong> {job.salary ? `$${job.salary}` : 'Not specified'}</p>
                            <p><strong>Description:</strong> {job.description ? job.description.substring(0, 100) + '...' : 'No description available'}</p>
                            <button
                              className="view-job-btn"
                              onClick={() => window.open(getGoogleMapsLink(job.location), '_blank')}
                            >
                              View Location
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    </React.Fragment>
                  );
                }
                return null;
              })}
            </MapContainer>
          </div>
          <p style={{ margin: "10px 0 0 0", fontSize: "14px", color: "#666", textAlign: "center" }}>
            Showing {jobsWithinRadius.length} job{jobsWithinRadius.length !== 1 ? 's' : ''} on map
          </p>
        </div>
      )}

      {/* Job Listings */}
      <div style={{ display: "grid", gap: "20px" }}>
        {jobsWithinRadius.map((job, index) => (
          <div key={index} style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#f9f9f9" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 5px 0", fontSize: "1.5rem" }}>{job.job_title}</h3>
                <p style={{ margin: "0 0 10px 0", color: "#666", fontSize: "1.1rem" }}>{job.company || "Company"}</p>
                <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginBottom: "10px" }}>
                  <span
                    onClick={() => window.open(getGoogleMapsLink(job.location), '_blank')}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      fontSize: "14px",
                      color: "#007bff",
                      cursor: "pointer",
                      textDecoration: "underline"
                    }}
                  >
                    {formatJobLocationText(job.location)}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "14px" }}>
                    Salary: {job.salary || "N/A"}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "14px" }}>
                    {job.job_type || "Full-time"}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "14px", color: "#28a745" }}>
                    {job.distance_km.toFixed(1)} km away
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => onSaveJob(job.job_id || job.id)}
                  disabled={isJobSaved(job.job_id || job.id)}
                  style={{
                    padding: "8px 12px",
                    backgroundColor: isJobSaved(job.job_id) ? "#6c757d" : "#ffc107",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: isJobSaved(job.job_id) ? "not-allowed" : "pointer",
                    fontSize: "14px"
                  }}
                >
                  {isJobSaved(job.job_id) ? "💾 Saved" : "💾 Save"}
                </button>
                <button
                  onClick={() => onViewJob ? onViewJob(job) : null}
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "#17a2b8",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  👁️ View Job
                </button>
                <button
                  onClick={() => onApply(job)}
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  📤 Apply Now
                </button>
              </div>
            </div>

            <p style={{ margin: "0 0 15px 0", color: "#555", lineHeight: "1.5" }}>
              {job.job_description && job.job_description.length > 200 ? `${job.job_description.substring(0, 200)}...` : job.job_description || "No description available"}
            </p>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {job.job_category ? (
                  <span
                    style={{
                      backgroundColor: "#e9ecef",
                      padding: "3px 8px",
                      borderRadius: "12px",
                      fontSize: "12px"
                    }}
                  >
                    {job.job_category}
                  </span>
                ) : null}
                {job.skills && job.skills.length > 0 ? job.skills.slice(0, 2).map((skill, skillIndex) => (
                  <span
                    key={skillIndex}
                    style={{
                      backgroundColor: "#e9ecef",
                      padding: "3px 8px",
                      borderRadius: "12px",
                      fontSize: "12px"
                    }}
                  >
                    {skill}
                  </span>
                )) : null}
                {(!job.skills || job.skills.length === 0) && !job.job_category && (
                  <span style={{ fontSize: "12px", color: "#666" }}>
                    No category specified
                  </span>
                )}
              </div>
              <span style={{ fontSize: "14px", color: "#666" }}>
                Posted {job.created_at ? new Date(job.created_at).toLocaleDateString() : "Recently"}
              </span>
            </div>
          </div>
        ))}

        {jobsWithinRadius.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px", border: "2px dashed #ddd", borderRadius: "12px", backgroundColor: "#f9f9f9" }}>
            <h3 style={{ margin: "0 0 10px 0", color: "#666" }}>No nearby jobs found</h3>
            <p style={{ margin: "0 0 20px 0", color: "#666" }}>
              We couldn't find any jobs in your immediate area. Try expanding your search or updating your location.
            </p>
            <button
              style={{ padding: "12px 24px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px" }}
            >
              🔍 Search All Locations
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

// Mock distance calculation - in real app this would use geolocation APIs
function calculateDistance(userLocation, jobLocation) {
  // Calculate actual distance using Haversine formula
  try {
    // Parse user location coordinates
    if (typeof userLocation === 'string') {
      const [userLat, userLng] = userLocation.split(',').map(c => parseFloat(c.trim()));
      
      // Parse job location coordinates
      const [jobLat, jobLng] = jobLocation.split(',').map(c => parseFloat(c.trim()));
      
      if (isNaN(userLat) || isNaN(userLng) || isNaN(jobLat) || isNaN(jobLng)) {
        return "N/A";
      }
      
      // Haversine formula
      const toRad = (value) => (value * Math.PI) / 180;
      const R = 3959; // Earth radius in miles
      const dLat = toRad(jobLat - userLat);
      const dLng = toRad(jobLng - userLng);
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(userLat)) * Math.cos(toRad(jobLat)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      
      return distance.toFixed(1);
    }
  } catch (err) {
    console.error("Error calculating distance:", err);
  }
  
  return "N/A";
}

// Convert kilometers to miles
function convertKmToMiles(distanceKm) {
  if (!distanceKm || isNaN(distanceKm)) return "N/A";
  const miles = (distanceKm * 0.621371).toFixed(1);
  return miles;
}

// Mock function to get approximate coordinates for text locations
// In a real application, this would use a geocoding service
function getApproximateCoordinates(location) {
  if (!location || typeof location !== 'string') return null;

  const locationLower = location.toLowerCase().trim();

  // Simple mapping of common locations to coordinates
  // This is a placeholder - in production, use a proper geocoding service
  const locationMap = {
    'new york': [40.7128, -74.0060],
    'new york, ny': [40.7128, -74.0060],
    'manhattan': [40.7589, -73.9851],
    'brooklyn': [40.6782, -73.9442],
    'queens': [40.7282, -73.7949],
    'bronx': [40.8448, -73.8648],
    'staten island': [40.5795, -74.1502],
    'los angeles': [34.0522, -118.2437],
    'los angeles, ca': [34.0522, -118.2437],
    'san francisco': [37.7749, -122.4194],
    'san francisco, ca': [37.7749, -122.4194],
    'chicago': [41.8781, -87.6298],
    'chicago, il': [41.8781, -87.6298],
    'houston': [29.7604, -95.3698],
    'houston, tx': [29.7604, -95.3698],
    'phoenix': [33.4484, -112.0740],
    'phoenix, az': [33.4484, -112.0740],
    'philadelphia': [39.9526, -75.1652],
    'philadelphia, pa': [39.9526, -75.1652],
    'san antonio': [29.4241, -98.4936],
    'san antonio, tx': [29.4241, -98.4936],
    'san diego': [32.7157, -117.1611],
    'san diego, ca': [32.7157, -117.1611],
    'dallas': [32.7767, -96.7970],
    'dallas, tx': [32.7767, -96.7970],
    'san jose': [37.3382, -121.8863],
    'san jose, ca': [37.3382, -121.8863],
    'austin': [30.2672, -97.7431],
    'austin, tx': [30.2672, -97.7431],
    'jacksonville': [30.3322, -81.6557],
    'jacksonville, fl': [30.3322, -81.6557],
    'fort worth': [32.7555, -97.3308],
    'fort worth, tx': [32.7555, -97.3308],
    'columbus': [39.9612, -82.9988],
    'columbus, oh': [39.9612, -82.9988],
    'indianapolis': [39.7684, -86.1581],
    'indianapolis, in': [39.7684, -86.1581],
    'charlotte': [35.2271, -80.8431],
    'charlotte, nc': [35.2271, -80.8431],
    'sf': [37.7749, -122.4194],
    'nyc': [40.7128, -74.0060],
    'la': [34.0522, -118.2437],
    'boston': [42.3601, -71.0589],
    'boston, ma': [42.3601, -71.0589],
    'seattle': [47.6062, -122.3321],
    'seattle, wa': [47.6062, -122.3321],
    'denver': [39.7392, -104.9903],
    'denver, co': [39.7392, -104.9903],
    'el paso': [31.7619, -106.4850],
    'el paso, tx': [31.7619, -106.4850],
    'detroit': [42.3314, -83.0458],
    'detroit, mi': [42.3314, -83.0458],
    'nashville': [36.1627, -86.7816],
    'nashville, tn': [36.1627, -86.7816],
    'portland': [45.5152, -122.6784],
    'portland, or': [45.5152, -122.6784],
    'memphis': [35.1495, -90.0490],
    'memphis, tn': [35.1495, -90.0490],
    'oklahoma city': [35.4676, -97.5164],
    'oklahoma city, ok': [35.4676, -97.5164],
    'las vegas': [36.1699, -115.1398],
    'las vegas, nv': [36.1699, -115.1398],
    'louisville': [38.2527, -85.7585],
    'louisville, ky': [38.2527, -85.7585],
    'baltimore': [39.2904, -76.6122],
    'baltimore, md': [39.2904, -76.6122],
    'milwaukee': [43.0389, -87.9065],
    'milwaukee, wi': [43.0389, -87.9065],
    'albuquerque': [35.0844, -106.6504],
    'albuquerque, nm': [35.0844, -106.6504],
    'tucson': [32.2226, -110.9747],
    'tucson, az': [32.2226, -110.9747],
    'fresno': [36.7378, -119.7871],
    'fresno, ca': [36.7378, -119.7871],
    'mesa': [33.4152, -111.8315],
    'mesa, az': [33.4152, -111.8315],
    'sacramento': [38.5816, -121.4944],
    'sacramento, ca': [38.5816, -121.4944],
    'atlanta': [33.7490, -84.3880],
    'atlanta, ga': [33.7490, -84.3880],
    'kansas city': [39.0997, -94.5786],
    'kansas city, mo': [39.0997, -94.5786],
    'colorado springs': [38.8339, -104.8214],
    'colorado springs, co': [38.8339, -104.8214],
    'miami': [25.7617, -80.1918],
    'miami, fl': [25.7617, -80.1918],
    'raleigh': [35.7796, -78.6382],
    'raleigh, nc': [35.7796, -78.6382],
    'omaha': [41.2565, -95.9345],
    'omaha, ne': [41.2565, -95.9345],
    'long beach': [33.7701, -118.1937],
    'long beach, ca': [33.7701, -118.1937],
    'virginia beach': [36.8529, -75.9780],
    'virginia beach, va': [36.8529, -75.9780],
    'oakland': [37.8044, -122.2711],
    'oakland, ca': [37.8044, -122.2711],
    'minneapolis': [44.9778, -93.2650],
    'minneapolis, mn': [44.9778, -93.2650],
    'tulsa': [36.1540, -95.9928],
    'tulsa, ok': [36.1540, -95.9928],
    'arlington': [32.7357, -97.1081],
    'arlington, tx': [32.7357, -97.1081],
    'tampa': [27.9506, -82.4572],
    'tampa, fl': [27.9506, -82.4572],
    'new orleans': [29.9511, -90.0715],
    'new orleans, la': [29.9511, -90.0715],
    'wichita': [37.6872, -97.3301],
    'wichita, ks': [37.6872, -97.3301],
    'bakersfield': [35.3733, -119.0187],
    'bakersfield, ca': [35.3733, -119.0187],
    'cleveland': [41.4993, -81.6944],
    'cleveland, oh': [41.4993, -81.6944],
    'aurora': [39.7294, -104.8319],
    'aurora, co': [39.7294, -104.8319],
    'anaheim': [33.8366, -117.9143],
    'anaheim, ca': [33.8366, -117.9143],
    'honolulu': [21.3069, -157.8583],
    'honolulu, hi': [21.3069, -157.8583],
    'santa ana': [33.7455, -117.8677],
    'santa ana, ca': [33.7455, -117.8677],
    'corpus christi': [27.8006, -97.3964],
    'corpus christi, tx': [27.8006, -97.3964],
    'riverside': [33.9806, -117.3755],
    'riverside, ca': [33.9806, -117.3755],
    'lexington': [38.0406, -84.5037],
    'lexington, ky': [38.0406, -84.5037],
    'stockton': [37.9577, -121.2908],
    'stockton, ca': [37.9577, -121.2908],
    'henderson': [36.0395, -114.9817],
    'henderson, nv': [36.0395, -114.9817],
    'saint paul': [44.9537, -93.0900],
    'saint paul, mn': [44.9537, -93.0900],
    'st. louis': [38.6270, -90.1994],
    'st. louis, mo': [38.6270, -90.1994],
    'cincinnati': [39.1031, -84.5120],
    'cincinnati, oh': [39.1031, -84.5120],
    'pittsburgh': [40.4406, -79.9959],
    'pittsburgh, pa': [40.4406, -79.9959],
    'greensboro': [36.0726, -79.7920],
    'greensboro, nc': [36.0726, -79.7920],
    'anchorage': [61.2181, -149.9003],
    'anchorage, ak': [61.2181, -149.9003],
    'plano': [33.0198, -96.6989],
    'plano, tx': [33.0198, -96.6989],
    'lincoln': [40.8136, -96.7026],
    'lincoln, ne': [40.8136, -96.7026],
    'orlando': [28.5383, -81.3792],
    'orlando, fl': [28.5383, -81.3792],
    'irvine': [33.6846, -117.8265],
    'irvine, ca': [33.6846, -117.8265],
    'newark': [40.7357, -74.1724],
    'newark, nj': [40.7357, -74.1724],
    'durham': [35.9940, -78.8986],
    'durham, nc': [35.9940, -78.8986],
    'chula vista': [32.6401, -117.0842],
    'chula vista, ca': [32.6401, -117.0842],
    'toledo': [41.6528, -83.5379],
    'toledo, oh': [41.6528, -83.5379],
    'fort wayne': [41.0793, -85.1394],
    'fort wayne, in': [41.0793, -85.1394],
    'st. petersburg': [27.7663, -82.6404],
    'st. petersburg, fl': [27.7663, -82.6404],
    'laredo': [27.5064, -99.5075],
    'laredo, tx': [27.5064, -99.5075],
    'jersey city': [40.7178, -74.0431],
    'jersey city, nj': [40.7178, -74.0431],
    'chandler': [33.3062, -111.8413],
    'chandler, az': [33.3062, -111.8413],
    'madison': [43.0731, -89.4012],
    'madison, wi': [43.0731, -89.4012],
    'lubbock': [33.5779, -101.8552],
    'lubbock, tx': [33.5779, -101.8552],
    'scottsdale': [33.4942, -111.9261],
    'scottsdale, az': [33.4942, -111.9261],
    'reno': [39.5296, -119.8138],
    'reno, nv': [39.5296, -119.8138],
    'buffalo': [42.8864, -78.8784],
    'buffalo, ny': [42.8864, -78.8784],
    'gilbert': [33.3528, -111.7890],
    'gilbert, az': [33.3528, -111.7890],
    'glendale': [33.5387, -112.1859],
    'glendale, az': [33.5387, -112.1859],
    'north las vegas': [36.1989, -115.1175],
    'north las vegas, nv': [36.1989, -115.1175],
    'winston-salem': [36.0999, -80.2442],
    'winston-salem, nc': [36.0999, -80.2442],
    'chesapeake': [36.7682, -76.2875],
    'chesapeake, va': [36.7682, -76.2875],
    'norfolk': [36.8508, -76.2859],
    'norfolk, va': [36.8508, -76.2859],
    'fremont': [37.5483, -121.9886],
    'fremont, ca': [37.5483, -121.9886],
    'garland': [32.9126, -96.6389],
    'garland, tx': [32.9126, -96.6389],
    'irving': [32.8140, -96.9489],
    'irving, tx': [32.8140, -96.9489],
    'hialeah': [25.8576, -80.2781],
    'hialeah, fl': [25.8576, -80.2781],
    'richmond': [37.5407, -77.4360],
    'richmond, va': [37.5407, -77.4360],
    'boise': [43.6150, -114.2100],
    'boise, id': [43.6150, -114.2100],
    'spokane': [47.6587, -117.4260],
    'spokane, wa': [47.6587, -117.4260],
    'baton rouge': [30.4515, -91.1871],
    'baton rouge, la': [30.4515, -91.1871]
  };

  // Check for exact matches first
  if (locationMap[locationLower]) {
    return locationMap[locationLower];
  }

  // Check for partial matches (city names without state)
  for (const [key, coords] of Object.entries(locationMap)) {
    if (key.includes(locationLower) || locationLower.includes(key.split(',')[0])) {
      return coords;
    }
  }

  // If no match found, return null (job won't be shown on map)
  return null;
}

export default NearbyJobs;