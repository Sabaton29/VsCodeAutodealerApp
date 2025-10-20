// backend/server.js
require('dotenv').config(); // Lee las variables de entorno del archivo .env
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 3001; // Puerto para el servidor backend

// Habilita CORS para permitir peticiones desde tu frontend
app.use(cors());
// Habilita el middleware para parsear JSON
app.use(express.json());

// Configuración de la conexión a Cloud SQL para PostgreSQL
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  // Para Cloud SQL, el host es la ruta del socket del proxy
  host: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`,
  database: 'autodealer_db', // Reemplaza con el nombre de tu base de datos
  port: 5432,
};

const pool = new Pool(dbConfig);

// --- Endpoints de la API ---

// GET all staff
app.get('/api/personal', async(req, res) => {
  console.log('Recibida petición GET a /api/personal');
  try {
    const client = await pool.connect();
    // Asegúrate de que tu tabla se llame 'staff_members' o ajústalo
    const result = await client.query('SELECT * FROM staff_members');
    client.release();
    
    // El frontend espera el formato de la interfaz 'StaffMember'
    // Mapeamos los nombres de columna de la DB (ej: 'avatar_url') a camelCase ('avatarUrl')
    const formattedResults = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      avatarUrl: row.avatar_url,
      locationId: row.location_id,
      specialty: row.specialty,
      documentType: row.document_type,
      documentNumber: row.document_number,
      customPermissions: row.custom_permissions || [],
    }));
    
    res.json(formattedResults);

  } catch (error) {
    console.error('Error al conectar o consultar la base de datos:', error);
    res.status(500).json({ error: 'Error interno del servidor al obtener datos del personal.' });
  }
});

// POST (create) new staff member
app.post('/api/personal', async(req, res) => {
    console.log('Recibida petición POST a /api/personal');
    const { name, email, role, locationId, specialty, documentType, documentNumber } = req.body;
    
    if (!name || !email || !role || !locationId || !documentType || !documentNumber) {
        return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }

    try {
        const client = await pool.connect();
        const avatarUrl = `https://i.pravatar.cc/48?u=${Date.now()}`;
        
        const query = `
            INSERT INTO staff_members (name, email, role, avatar_url, location_id, specialty, document_type, document_number)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
        const values = [name, email, role, avatarUrl, locationId, specialty, documentType, documentNumber];
        
        const result = await client.query(query, values);
        client.release();

        const newStaff = result.rows[0];
        res.status(201).json({
          id: newStaff.id,
          name: newStaff.name,
          email: newStaff.email,
          role: newStaff.role,
          avatarUrl: newStaff.avatar_url,
          locationId: newStaff.location_id,
          specialty: newStaff.specialty,
          documentType: newStaff.document_type,
          documentNumber: newStaff.document_number,
          customPermissions: newStaff.custom_permissions || [],
        });
    } catch (error) {
        console.error('Error al crear personal:', error);
        res.status(500).json({ error: 'Error interno del servidor al crear personal.' });
    }
});

// PUT (update) a staff member
app.put('/api/personal/:id', async(req, res) => {
    const { id } = req.params;
    const { name, email, role, locationId, specialty, documentType, documentNumber } = req.body;
    console.log(`Recibida petición PUT a /api/personal/${id}`);

    if (!name || !email || !role || !locationId || !documentType || !documentNumber) {
        return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }

    try {
        const client = await pool.connect();
        const query = `
            UPDATE staff_members
            SET name = $1, email = $2, role = $3, location_id = $4, specialty = $5, document_type = $6, document_number = $7
            WHERE id = $8
            RETURNING *;
        `;
        const values = [name, email, role, locationId, specialty, documentType, documentNumber, id];
        
        const result = await client.query(query, values);
        client.release();

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Miembro del personal no encontrado.' });
        }

        const updatedStaff = result.rows[0];
        res.json({
          id: updatedStaff.id,
          name: updatedStaff.name,
          email: updatedStaff.email,
          role: updatedStaff.role,
          avatarUrl: updatedStaff.avatar_url,
          locationId: updatedStaff.location_id,
          specialty: updatedStaff.specialty,
          documentType: updatedStaff.document_type,
          documentNumber: updatedStaff.document_number,
          customPermissions: updatedStaff.custom_permissions || [],
        });
    } catch (error) {
        console.error(`Error al actualizar personal ${id}:`, error);
        res.status(500).json({ error: 'Error interno del servidor al actualizar personal.' });
    }
});

// DELETE a staff member
app.delete('/api/personal/:id', async(req, res) => {
    const { id } = req.params;
    console.log(`Recibida petición DELETE a /api/personal/${id}`);

    try {
        const client = await pool.connect();
        const result = await client.query('DELETE FROM staff_members WHERE id = $1 RETURNING id;', [id]);
        client.release();

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Miembro del personal no encontrado.' });
        }
        res.status(204).send(); // No content
    } catch (error) {
        console.error(`Error al eliminar personal ${id}:`, error);
        res.status(500).json({ error: 'Error interno del servidor al eliminar personal.' });
    }
});


app.listen(port, () => {
  console.log(`Servidor backend escuchando en http://localhost:${port}`);
});