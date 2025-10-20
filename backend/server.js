import express from "express";
import cors from "cors";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const app = express();
const PORT = 5000;
const DATA_FILE = "./backend/reservations.json";

app.use(cors());
app.use(express.json());

// Hilfsfunktionen
function loadReservations() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8") || "[]");
}

function saveReservations(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// GET: Alle Reservierungen
app.get("/api/reservations", (req, res) => {
  res.json(loadReservations());
});

// POST: Neue Reservierung
app.post("/api/reservations", (req, res) => {
  const { name, email, date, guests, notes } = req.body;
  if (!name || !email || !date) {
    return res.status(400).json({ error: "Name, E-Mail und Datum sind Pflichtfelder." });
  }

  const reservations = loadReservations();
  const newRes = {
    id: uuidv4(),
    name,
    email,
    date,
    guests: guests || 2,
    notes: notes || "",
    createdAt: new Date().toISOString(),
  };

  reservations.push(newRes);
  saveReservations(reservations);
  res.status(201).json(newRes);
});

// DELETE: Reservierung löschen
app.delete("/api/reservations/:id", (req, res) => {
  const { id } = req.params;
  const reservations = loadReservations();
  const updated = reservations.filter((r) => r.id !== id);

  if (updated.length === reservations.length) {
    return res.status(404).json({ error: "Reservierung nicht gefunden" });
  }

  saveReservations(updated);
  res.json({ message: "Reservierung gelöscht", id });
});

// Server starten
app.listen(PORT, () => console.log(`✅ Backend läuft auf http://localhost:${PORT}`));
