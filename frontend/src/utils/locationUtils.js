export const isCoordinateLocation = (location) => {
  return typeof location === "string" && /^\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*$/.test(location.trim());
};

export const formatJobLocationText = (location) => {
  if (!location) return "Location not specified";
  return isCoordinateLocation(location) ? "View exact location" : location;
};

export const parseLocationCoordinates = (location) => {
  if (!isCoordinateLocation(location)) return null;
  const [latitude, longitude] = location.split(",").map((value) => parseFloat(value.trim()));
  return { latitude, longitude };
};

export const getGoogleMapsLink = (location) => {
  if (!location) return "https://www.google.com/maps";
  const coords = parseLocationCoordinates(location);
  if (coords) {
    return `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.trim())}`;
};

export const getOpenStreetMapEmbedUrl = (location) => {
  const coords = parseLocationCoordinates(location);
  if (!coords) return null;
  const delta = 0.01;
  const minLng = coords.longitude - delta;
  const minLat = coords.latitude - delta;
  const maxLng = coords.longitude + delta;
  const maxLat = coords.latitude + delta;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng}%2C${minLat}%2C${maxLng}%2C${maxLat}&layer=mapnik&marker=${coords.latitude}%2C${coords.longitude}`;
};
