import React, { useState, useEffect } from "react";
import axios from "axios";
import ReservationForm from "./components/ReservationForm";
import ReservationList from "./components/ReservationList";

const API_URL = "http://localhost:5000/api/reservations";

function App() {
  const [reservations, setReservations] = useState([]);

  const loadReservations = async () => {
    const res = await axios.get(API_URL);
    setReservations(res.data);
  };

  const addReservation = async (data) => {
    await axios.post(API_URL, data);
    loadReservations();
  };

  const deleteReservation = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    loadReservations();
  };

  useEffect(() => {
    loadReservations();
  }, []);

  return (
    <div className="app">
      <h1>🍝 Casa Lekka – Reservierungen</h1>
      <ReservationForm onAdd={addReservation} />
      <ReservationList data={reservations} onDelete={deleteReservation} />
    </div>
  );
}

export default App;
