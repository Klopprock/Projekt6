import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const BUCKET = process.env.BUCKET_NAME || "mein-reservierungs-bucket";
const FILE_KEY = "reservations.json";
const s3 = new S3Client({ region: process.env.AWS_REGION || "eu-central-1" });

// Helper, um S3-File zu holen
async function getReservationList() {
  try {
    const data = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: FILE_KEY }));
    const body = await data.Body.transformToString(); // Node.js AWS SDK v3
    return JSON.parse(body);
  } catch (err) {
    // Datei existiert evtl. noch nicht
    return [];
  }
}

// Helper, um S3-File zu speichern
async function putReservationList(list) {
  const body = JSON.stringify(list, null, 2);
  await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: FILE_KEY, Body: body, ContentType: "application/json" }));
}

export const handler = async (event) => {
  try {
    // GET /api/reservations
    if (event.httpMethod === "GET" && event.path === "/api/reservations") {
      const list = await getReservationList();
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(list),
      };
    }

    // POST /api/reservations
    if (event.httpMethod === "POST" && event.path === "/api/reservations") {
      const body = JSON.parse(event.body);
      if (!body.name || !body.email || !body.date) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Name, E-Mail und Datum sind Pflichtfelder." }),
        };
      }
      const list = await getReservationList();
      const reservation = {
        id: uuidv4(),
        name: body.name,
        email: body.email,
        date: body.date,
        guests: body.guests || 2,
        notes: body.notes || null,
        createdAt: new Date().toISOString(),
      };
      list.unshift(reservation);
      await putReservationList(list);
      return {
        statusCode: 201,
        body: JSON.stringify(reservation),
      };
    }

    // DELETE /api/reservations/{id}
    if (event.httpMethod === "DELETE" && event.resource === "/api/reservations/{id}") {
      const id = event.pathParameters.id;
      let list = await getReservationList();
      const idx = list.findIndex(r => r.id === id);
      if (idx === -1) {
        return { statusCode: 404, body: JSON.stringify({ error: "Reservierung nicht gefunden" }) };
      }
      const deleted = list[idx];
      list.splice(idx, 1);
      await putReservationList(list);
      return { statusCode: 200, body: JSON.stringify({ message: "Reservierung gelöscht", id, deleted }) };
    }

    return { statusCode: 404, body: JSON.stringify({ error: "Not found" }) };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "S3-Fehler", details: err.message }),
    };
  }
};