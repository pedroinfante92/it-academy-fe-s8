import { useState, useEffect } from "react";
import { Marker, Popup } from "react-leaflet";
import { supabase } from "../../../supabaseClient";

function LocationMarker() {
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    const fetchMarkers = async () => {
      const { data, error } = await supabase.from("SupaCRUD").select("*");
      if (!error && data) {
        const markersData = data.map((marker) => ({
          ...marker,
          lat: Number(marker.latitude),
          lng: Number(marker.longitude),
          draggable: false,
        }));
        setMarkers(markersData);
      } else {
        console.error("Error fetching markers:", error);
      }
    };

    fetchMarkers();
  }, []);

  return (
    <>
      {markers.map((marker) => (
        <Marker key={marker.id} position={[marker.lat, marker.lng]}>
          <Popup>
            {marker.first_name} {marker.last_name}<br />
            {marker.location}<br />
            Lat: {marker.lat.toFixed(4)}<br />
            Lng: {marker.lng.toFixed(4)}
          </Popup>
        </Marker>
      ))}
    </>
  );
}

export default LocationMarker;