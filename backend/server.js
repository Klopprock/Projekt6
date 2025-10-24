import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Sequelize, DataTypes } from "sequelize";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// DB-Verbindung (Postgres)
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL ist nicht gesetzt. Lege backend/.env an.");
  process.exit(1);
}
const sequelize = new Sequelize(DATABASE_URL, {
  dialect: "postgres",
  logging: false,
});

app.use(cors());
app.use(express.json());

// Modell: Reservation (direkt in dieser Datei)
const Reservation = sequelize.define(
  "Reservation",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    date: { type: DataTypes.DATE, allowNull: false },
    guests: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 2 },
    notes: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    timestamps: true, // createdAt / updatedAt
    tableName: "reservations",
  }
);

// Endpoints: GET, POST, DELETE
app.get("/api/reservations", async (req, res) => {
  try {
    const list = await Reservation.findAll({ order: [["createdAt", "DESC"]] });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "DB-Fehler", details: err.message });
  }
});

app.post("/api/reservations", async (req, res) => {
  try {
    const { name, email, date, guests, notes } = req.body;
    if (!name || !email || !date) {
      return res.status(400).json({ error: "Name, E-Mail und Datum sind Pflichtfelder." });
    }
    const r = await Reservation.create({
      name,
      email,
      date,
      guests: guests || 2,
      notes: notes || null,
    });
    res.status(201).json(r);
  } catch (err) {
    res.status(400).json({ error: "Erstellung fehlgeschlagen", details: err.message });
  }
});

app.delete("/api/reservations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const r = await Reservation.findByPk(id);
    if (!r) return res.status(404).json({ error: "Reservierung nicht gefunden" });
    await r.destroy();
    res.json({ message: "Reservierung gelöscht", id });
  } catch (err) {
    res.status(500).json({ error: "DB-Fehler", details: err.message });
  }
});

// Start: DB prüfen, Tabellen anlegen und Server starten
async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // erstellt Tabelle falls fehlt
    app.listen(PORT, () => console.log(`✅ Backend läuft auf http://localhost:${PORT}`));
  } catch (err) {
    console.error("Fehler beim Starten:", err);
    process.exit(1);
  }
}

start();
