const KEY = 'lexglobe_trips'

export function getTrips() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || []
  } catch {
    return []
  }
}

export function saveTrip(trip) {
  const trips = getTrips()
  trips.push({ ...trip, id: Date.now().toString() })
  localStorage.setItem(KEY, JSON.stringify(trips))
}

export function deleteTrip(id) {
  localStorage.setItem(KEY, JSON.stringify(getTrips().filter(t => t.id !== id)))
}

export function updateTrip(id, updates) {
  localStorage.setItem(
    KEY,
    JSON.stringify(getTrips().map(t => (t.id === id ? { ...t, ...updates } : t)))
  )
}
