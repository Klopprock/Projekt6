import React, { useState } from "react";

function ReservationForm({ onAdd }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    date: "",
    guests: 2,
    notes: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(form);
    setForm({ name: "", email: "", date: "", guests: 2, notes: "" });
  };

  return (
    <form className="reservation-form" onSubmit={handleSubmit}>
      <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
      <input name="email" value={form.email} onChange={handleChange} type="email" placeholder="E-Mail" required />
      <input name="date" value={form.date} onChange={handleChange} type="datetime-local" required />
      <input name="guests" value={form.guests} onChange={handleChange} type="number" min="1" />
      <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Notizen"></textarea>
      <button type="submit">Reservieren</button>
    </form>
  );
}

export default ReservationForm;
