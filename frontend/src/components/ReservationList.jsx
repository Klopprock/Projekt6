import React from "react";

function ReservationList({ data, onDelete }) {
  if (!data.length) return <p>Keine Reservierungen vorhanden.</p>;

  return (
    <ul className="reservation-list">
      {data.map((r) => (
        <li key={r.id}>
          <strong>{r.name}</strong> ({r.guests} Gäste) – {new Date(r.date).toLocaleString()}
          <button onClick={() => onDelete(r.id)}>🗑️</button>
        </li>
      ))}
    </ul>
  );
}

export default ReservationList;
