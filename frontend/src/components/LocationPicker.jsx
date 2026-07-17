import { useCallback, useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Box, Button, HStack, Spinner, Text } from '@chakra-ui/react'

// Import marker icons from leaflet since leaflet's are broken when working with Vite.
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

// Default map center when the picker opens with no prior location. Rice
// University — a reasonable neutral starting view; the pin is what matters.
const DEFAULT_CENTER = [29.7174, -95.4018]

// Listens for clicks on the map and reports where the user tapped, so a click
// anywhere drops (or moves) the pin.
function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

// Programmatically re-centers the map when `target` changes. react-leaflet only
// reads the map's center once at open, so this is how we move the view after
// the user hits "use my current location" (their GPS spot may be off-screen).
// It deliberately does NOT work on plain clicks/drags, so the map doesn't fight
// the user while they make adjustments to the pin.
function Recenter({ target }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.setView(target, Math.max(map.getZoom(), 15))
  }, [target, map])
  return null
}

// A reusable map with a single draggable pin. Used for every location the app
// collects (origin, destination, pickups)
//
// The pin's coordinates are the source of truth. Whenever the pin moves (via
// map click, drag, or the "use my location" button) we take the coordinates
// then reverse-geocode (coords -> address) them with Nominatim to fill in a readable
// address label for the respective database attribute.
//
// Parameters:
//   initialValue { lat, lng, address } — where to place the pin on open (setting is optional)
//   onChange(value) — called with { lat, lng, address } every time the pin moves
//   height — map height in px (default 300)
function LocationPicker({ initialValue = null, onChange, height = 300 }) {
  const hasInitial = initialValue && initialValue.lat != null
  // The pin's current position (null until the user drops pin).
  const [pos, setPos] = useState(hasInitial ? { lat: initialValue.lat, lng: initialValue.lng } : null)

  // The human-readable label for the pin, filled in by reverse-geocoding.
  const [address, setAddress] = useState(initialValue?.address || '')

  // True while a reverse-geocode request is in progress.
  const [loading, setLoading] = useState(false)

  // Where to re-center the map next (set only by the location button / initial value).
  const [recenterTarget, setRecenterTarget] = useState(hasInitial ? [initialValue.lat, initialValue.lng] : null)
  const [geoError, setGeoError] = useState('')

  // Holds the pending debounce timer so rapid pin moves don't spam Nominatim.
  const debounceRef = useRef(null)

  // Turn coordinates into a readable address via Nominatim's reverse endpoint.
  // Debounced (~500ms) to respect Nominatim's ~1 req/sec policy while dragging.
  // Falls back to showing the raw coordinates if the lookup fails or is empty.
  const reverseGeocode = useCallback(
    (lat, lng) => {
      setLoading(true)
      clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(async () => {
        let label
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
          )
          const data = res.ok ? await res.json() : null
          label = data?.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
        } catch {
          label = `${lat.toFixed(5)}, ${lng.toFixed(5)}`
        }
        setAddress(label)
        onChange?.({ lat, lng, address: label })
        setLoading(false)
      }, 500)
    },
    [onChange]
  )

  // Move the pin to a new spot. Gets the coordinates with a blank address, then starts reverse-geocoding to
  // fill the label in.
  const handlePick = useCallback(
    (lat, lng) => {
      setPos({ lat, lng })
      setAddress('')
      onChange?.({ lat, lng, address: '' })
      reverseGeocode(lat, lng)
    },
    [onChange, reverseGeocode]
  )

  // Ask the browser for the user's GPS position and drop the pin there, then
  // re-center the map on it since it may be outside the current view.
  const useMyLocation = () => {
    setGeoError('')
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const { latitude, longitude } = p.coords
        handlePick(latitude, longitude)
        setRecenterTarget([latitude, longitude])
      },
      () => setGeoError('Could not get your location. Drop a pin on the map instead.'),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <Box>
      <HStack justify="space-between" mb={2}>
        <Button size="sm" variant="outline" onClick={useMyLocation}>
          📍 Use my current location
        </Button>
        {loading && <Spinner size="sm" color="blue.500" />}
      </HStack>

      <Box borderRadius="md" overflow="hidden" border="1px solid" borderColor="gray.200">
        <MapContainer
          center={pos ? [pos.lat, pos.lng] : DEFAULT_CENTER}
          zoom={13}
          style={{ height, width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <ClickHandler onPick={handlePick} />
          <Recenter target={recenterTarget} />
          {pos && (
            <Marker
              position={[pos.lat, pos.lng]}
              draggable
              eventHandlers={{
                dragend(e) {
                  const { lat, lng } = e.target.getLatLng()
                  handlePick(lat, lng)
                },
              }}
            />
          )}
        </MapContainer>
      </Box>

      <Text fontSize="sm" color="gray.600" mt={2}>
        {pos
          ? address || 'Locating address…'
          : 'Tap the map or use your location to drop a pin.'}
      </Text>
      {geoError && (
        <Text fontSize="sm" color="red.500" mt={1}>
          {geoError}
        </Text>
      )}
    </Box>
  )
}

export default LocationPicker
