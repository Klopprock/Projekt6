import React, { useState, useEffect } from "react";
import axios from "axios";
import ReservationForm from "./components/ReservationForm";
import ReservationList from "./components/ReservationList";
import './App.css';

// Diese URL wird später durch die API Gateway URL ersetzt
const API_URL = "https://YOUR_API_GATEWAY_URL/prod/reservations";

function App() {
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState(null);

  const loadReservations = async () => {
    try {
      const res = await axios.get(API_URL);
      setReservations(res.data);
      setError(null);
    } catch (err) {
      console.error('Fehler beim Laden:', err);
      setError('Fehler beim Laden der Reservierungen');
    }
  };

  const addReservation = async (data) => {
    try {
      await axios.post(API_URL, data);
      loadReservations();
      setError(null);
    } catch (err) {
      console.error('Fehler beim Erstellen:', err);
      setError('Fehler beim Erstellen der Reservierung');
    }
  };

  const deleteReservation = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      loadReservations();
      setError(null);
    } catch (err) {
      console.error('Fehler beim Löschen:', err);
      setError('Fehler beim Löschen der Reservierung');
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  return (
    <div className="app">
      <h1>🍝 Casa Lekka – Reservierungen</h1>
      {error && <div className="error-message">{error}</div>}
      <ReservationForm onAdd={addReservation} />
      <ReservationList data={reservations} onDelete={deleteReservation} />
    </div>
  );
}

export default App;
