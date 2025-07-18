import { useState, useEffect } from 'react'
import { Marker, Popup, useMapEvents } from 'react-leaflet'
import { supabase } from "../../../supabaseClient";

function LocationMarkers() {
  const [markers, setMarkers] = useState([])

  // Fetch existing markers from Supabase on load
  useEffect(() => {
    const fetchMarkers = async () => {
      const { data, error } = await supabase.from('markers').select('*')
      if (!error && data) {
        // Convert lat and lng to number
        const markersData = data.map(marker => ({
          ...marker,
          lat: Number(marker.lat),
          lng: Number(marker.lng),
          draggable: true,
        }))
        setMarkers(markersData)
      } else {
        console.error('Error fetching markers:', error)
      }
    }

    fetchMarkers()
  }, [])

  // Add marker on map click
  useMapEvents({
    click(e) {
      const newMarker = {
        id: Date.now(), // temp local ID
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        draggable: true,
      }

      setMarkers(prev => [...prev, newMarker])

      // Save to Supabase
      supabase.from('markers').insert([{
        lat: newMarker.lat,
        lng: newMarker.lng,
      }]).then(({ error }) => {
        if (error) console.error('Insert error:', error)
      })
    },
  })

  // Handle drag
  const handleDragEnd = async (index, e) => {
    const newLatLng = e.target.getLatLng()
    const updated = [...markers]
    updated[index].lat = newLatLng.lat
    updated[index].lng = newLatLng.lng
    setMarkers(updated)

    const id = updated[index].id
    if (typeof id === 'number') return // skip updating temp-only markers

    // Update in Supabase
    const { error } = await supabase
      .from('markers')
      .update({
        lat: newLatLng.lat,
        lng: newLatLng.lng,
      })
      .eq('id', id)

    if (error) console.error('Update error:', error)
  }

  // Handle delete
  const handleDelete = async (idToDelete) => {
    setMarkers(prev => prev.filter(m => m.id !== idToDelete))

    if (typeof idToDelete === 'number') return // skip deleting temp-only

    const { error } = await supabase.from('markers').delete().eq('id', idToDelete)
    if (error) console.error('Delete error:', error)
  }

  return (
    <>
      {markers.map((marker, index) => (
        <Marker
          key={marker.id}
          position={[marker.lat, marker.lng]}
          draggable={marker.draggable}
          eventHandlers={{
            dragend: (e) => handleDragEnd(index, e),
          }}
        >
          <Popup>
            Marker<br />
            Lat: {Number(marker.lat).toFixed(4)}<br />
            Lng: {Number(marker.lng).toFixed(4)}<br />
            <button onClick={() => handleDelete(marker.id)} className="text-red-600 underline">
              🗑 Delete
            </button>
          </Popup>
        </Marker>
      ))}
    </>
  )
}

export default LocationMarkers
