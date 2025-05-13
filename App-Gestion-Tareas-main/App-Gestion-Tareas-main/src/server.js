const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

let tareas = [];
let contadorId = 1;

// Obtener todas las tareas
app.get('/tareas', (req, res) => {
  res.json(tareas);
});

// Crear una tarea
app.post('/tareas', (req, res) => {
  const { titulo, descripcion, fechaInicio, fechaFin } = req.body;
  const hoy = new Date().toISOString().split("T")[0];
  let estado = 'in-progress';
  if (fechaInicio && hoy < fechaInicio) estado = 'todo';
  if (fechaFin && hoy > fechaFin) estado = 'done';

  const nuevaTarea = {
    id: contadorId++,
    titulo,
    descripcion,
    fechaInicio,
    fechaFin,
    estado
  };
  tareas.push(nuevaTarea);
  res.status(201).json(nuevaTarea);
});

// Editar una tarea
app.put('/tareas/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = tareas.findIndex(t => t.id === id);
  if (index === -1) return res.status(404).json({ mensaje: 'Tarea no encontrada' });

  const { titulo, descripcion, fechaInicio, fechaFin } = req.body;
  const hoy = new Date().toISOString().split("T")[0];
  let estado = 'in-progress';
  if (fechaInicio && hoy < fechaInicio) estado = 'todo';
  if (fechaFin && hoy > fechaFin) estado = 'done';

  tareas[index] = { id, titulo, descripcion, fechaInicio, fechaFin, estado };
  res.json(tareas[index]);
});

// Eliminar una tarea
app.delete('/tareas/:id', (req, res) => {
  const id = parseInt(req.params.id);
  tareas = tareas.filter(t => t.id !== id);
  res.json({ mensaje: 'Tarea eliminada' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
