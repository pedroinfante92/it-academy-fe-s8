import { MapContainer, TileLayer } from "react-leaflet";
import LocationMarker from "./LocationMarker";

function Map() {
  return (
    <MapContainer
      center={[45, 10]}
      zoom={5}
      scrollWheelZoom={true}
      className="h-[700px] w-screen"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker />
    </MapContainer>
  );
}

export default Map;
