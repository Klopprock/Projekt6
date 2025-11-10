import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const BUCKET_NAME = process.env.BUCKET_NAME;

// Hilfsfunktionen für S3
async function getReservations() {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: 'reservations.json'
    });
    const response = await s3Client.send(command);
    const data = await response.Body.transformToString();
    return JSON.parse(data);
  } catch (error) {
    if (error.name === 'NoSuchKey') return [];
    throw error;
  }
}

async function saveReservations(reservations) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: 'reservations.json',
    Body: JSON.stringify(reservations),
    ContentType: 'application/json'
  });
  await s3Client.send(command);
}

export const handler = async (event) => {
  try {
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod === 'GET') {
      const reservations = await getReservations();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(reservations)
      };
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);
      const { name, email, date, guests, notes } = body;

      if (!name || !email || !date) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Name, E-Mail und Datum sind Pflichtfelder.' })
        };
      }

      const newReservation = {
        id: uuidv4(),
        name,
        email,
        date,
        guests: guests || 2,
        notes: notes || null,
        createdAt: new Date().toISOString()
      };

      const reservations = await getReservations();
      reservations.push(newReservation);
      await saveReservations(reservations);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(newReservation)
      };
    }

    if (event.httpMethod === 'DELETE') {
      const id = event.pathParameters?.id;
      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'ID fehlt' })
        };
      }

      const reservations = await getReservations();
      const index = reservations.findIndex(r => r.id === id);
      
      if (index === -1) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Reservierung nicht gefunden' })
        };
      }

      reservations.splice(index, 1);
      await saveReservations(reservations);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Reservierung gelöscht', id })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Methode nicht erlaubt' })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Interner Server-Fehler' })
    };
  }
};