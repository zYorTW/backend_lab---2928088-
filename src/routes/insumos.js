const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');

// Helpers
function likeParam(q) {
  return `%${(q || '').toLowerCase()}%`;
}

router.get('/aux', async (req, res) => {
  try {
    const [tipos] = await pool.query('SELECT id, nombre FROM tipo_reactivo ORDER BY nombre');
    const [clasif] = await pool.query('SELECT id, nombre FROM clasificacion_sga ORDER BY nombre');
    const [unidades] = await pool.query('SELECT id, nombre FROM unidades ORDER BY nombre');
    const [estado] = await pool.query('SELECT id, nombre FROM estado_fisico ORDER BY nombre');
    const [recipiente] = await pool.query('SELECT id, nombre FROM tipo_recipiente ORDER BY nombre');
    const [almacen] = await pool.query('SELECT id, nombre FROM almacenamiento ORDER BY id');
    res.json({ tipos, clasif, unidades, estado, recipiente, almacen });
  } catch (err) {
    console.error('Error /aux:', err);
    res.status(500).json({ message: 'Error obteniendo datos auxiliares' });
  }
});

// --- Catálogo de insumos ---
router.get('/catalogo', async (req, res) => {
  const q = (req.query.q || '').trim();
  let limit = parseInt(req.query.limit, 10);
  let offset = parseInt(req.query.offset, 10);
  if (isNaN(limit) || limit <= 0) limit = 0; // 0 => sin límite
  if (isNaN(offset) || offset < 0) offset = 0;
  if (limit > 500) limit = 500;
  try {
    const baseSelect = 'SELECT codigo, nombre, tipo_insumo, categoria, descripcion FROM catalogo_insumos';
    const where = q ? ' WHERE LOWER(codigo) LIKE ? OR LOWER(nombre) LIKE ?' : '';
    const order = ' ORDER BY codigo';
    if (limit > 0) {
      // Obtener total
      const countQuery = `SELECT COUNT(*) as total FROM catalogo_insumos${q ? ' WHERE LOWER(codigo) LIKE ? OR LOWER(nombre) LIKE ?' : ''}`;
      let totalRows;
      if (q) {
        [totalRows] = await pool.query(countQuery, [likeParam(q), likeParam(q)]);
      } else {
        [totalRows] = await pool.query(countQuery);
      }
      const total = totalRows[0]?.total || 0;
      let rows;
      if (q) {
        [rows] = await pool.query(`${baseSelect}${where}${order} LIMIT ? OFFSET ?`, [likeParam(q), likeParam(q), limit, offset]);
      } else {
        [rows] = await pool.query(`${baseSelect}${order} LIMIT ? OFFSET ?`, [limit, offset]);
      }
      return res.json({ rows, total });
    } else {
      // Sin limit => devolver sólo rows como antes
      let rows;
      if (q) {
        [rows] = await pool.query(`${baseSelect}${where}${order}`, [likeParam(q), likeParam(q)]);
      } else {
        [rows] = await pool.query(`${baseSelect}${order}`);
      }
      return res.json(rows);
    }
  } catch (err) {
    console.error('Error GET /catalogo:', err);
    res.status(500).json({ message: 'Error buscando catálogo' });
  }
});

router.get('/catalogo/:codigo', async (req, res) => {
  const { codigo } = req.params;
  try {
    const [rows] = await pool.query('SELECT codigo, nombre, tipo_insumo, categoria, descripcion FROM catalogo_insumos WHERE codigo = ?', [codigo]);
    if (!rows.length) return res.status(404).json({ message: 'No encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error GET /catalogo/:codigo:', err);
    res.status(500).json({ message: 'Error obteniendo catálogo' });
  }
});

router.post('/catalogo', async (req, res) => {
  const { codigo, nombre, tipo_insumo, categoria, descripcion } = req.body || {};
  if (!codigo || !nombre || !tipo_insumo || !categoria) {
    return res.status(400).json({ message: 'Faltan campos requeridos' });
  }
  try {
    await pool.query(
      'INSERT INTO catalogo_insumos (codigo, nombre, tipo_insumo, categoria, descripcion) VALUES (?, ?, ?, ?, ?)',
      [codigo, nombre, tipo_insumo, categoria, descripcion || null]
    );
    res.status(201).json({ codigo, nombre, tipo_insumo, categoria, descripcion: descripcion || null });
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Código ya existe en catálogo' });
    }
    console.error('Error POST /catalogo:', err);
    res.status(500).json({ message: 'Error creando catálogo' });
  }
});

router.put('/catalogo/:codigo', async (req, res) => {
  const { codigo } = req.params;
  const { nombre, tipo_insumo, categoria, descripcion } = req.body || {};
  try {
    const [result] = await pool.query(
      'UPDATE catalogo_insumos SET nombre = ?, tipo_insumo = ?, categoria = ?, descripcion = ? WHERE codigo = ?',
      [nombre || null, tipo_insumo || null, categoria || null, descripcion || null, codigo]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'No encontrado' });
    res.json({ codigo, nombre: nombre || null, tipo_insumo: tipo_insumo || null, categoria: categoria || null, descripcion: descripcion || null });
  } catch (err) {
    console.error('Error PUT /catalogo/:codigo:', err);
    res.status(500).json({ message: 'Error actualizando catálogo' });
  }
});

// --- Insumos (CRUD) ---
router.get('/', async (req, res) => {
  const q = (req.query.q || '').trim().toLowerCase();
  let limit = parseInt(req.query.limit, 10);
  if (isNaN(limit) || limit <= 0) limit = 0; // 0 => sin límite explícito
  // Máximo duro para evitar abusos
  if (limit > 500) limit = 500;
  try {
    if (!q) {
      if (limit > 0) {
        const [rows] = await pool.query('SELECT * FROM insumos ORDER BY fecha_creacion DESC LIMIT ?', [limit]);
        return res.json(rows);
      } else {
        const [rows] = await pool.query('SELECT * FROM insumos ORDER BY fecha_creacion DESC');
        return res.json(rows);
      }
    }
    if (limit > 0) {
      const [rows] = await pool.query(
        `SELECT * FROM insumos
         WHERE LOWER(nombre) LIKE ? OR LOWER(marca) LIKE ? OR LOWER(descripcion) LIKE ?
         ORDER BY fecha_creacion DESC LIMIT ?`,
        [likeParam(q), likeParam(q), likeParam(q), limit]
      );
      return res.json(rows);
    } else {
      const [rows] = await pool.query(
        `SELECT * FROM insumos
         WHERE LOWER(nombre) LIKE ? OR LOWER(marca) LIKE ? OR LOWER(descripcion) LIKE ?
         ORDER BY fecha_creacion DESC`,
        [likeParam(q), likeParam(q), likeParam(q)]
      );
      return res.json(rows);
    }
  } catch (err) {
    console.error('Error GET / (insumos):', err);
    res.status(500).json({ message: 'Error listando insumos' });
  }
});

// GET /api/insumos/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM insumos WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ message: 'No encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error GET /:id:', err);
    res.status(500).json({ message: 'Error obteniendo insumo' });
  }
});

// POST /api/insumos
router.post('/', async (req, res) => {
  const i = req.body || {};
  try {
    await pool.query(
      `INSERT INTO insumos (
        item, nombre, cantidad_adquirida, cantidad_existente, presentacion, marca, 
        descripcion, fecha_adquisicion, ubicacion, observaciones
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        i.item, i.nombre, i.cantidad_adquirida, i.cantidad_existente, i.presentacion || null,
        i.marca || null, i.descripcion || null, i.fecha_adquisicion || null,
        i.ubicacion || null, i.observaciones || null
      ]
    );
    res.status(201).json({ message: 'Creado' });
  } catch (err) {
    console.error('Error POST / (insumos):', err);
    res.status(500).json({ message: 'Error creando insumo' });
  }
});

// PUT /api/insumos/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const i = req.body || {};
  try {
    const [result] = await pool.query(
      `UPDATE insumos SET
        item = ?, nombre = ?, cantidad_adquirida = ?, cantidad_existente = ?, 
        presentacion = ?, marca = ?, descripcion = ?, fecha_adquisicion = ?, 
        ubicacion = ?, observaciones = ?
      WHERE id = ?`,
      [
        i.item, i.nombre, i.cantidad_adquirida, i.cantidad_existente, i.presentacion || null,
        i.marca || null, i.descripcion || null, i.fecha_adquisicion || null,
        i.ubicacion || null, i.observaciones || null, id
      ]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'No encontrado' });
    res.json({ message: 'Actualizado' });
  } catch (err) {
    console.error('Error PUT /:id (insumos):', err);
    res.status(500).json({ message: 'Error actualizando insumo' });
  }
});

// DELETE /api/insumos/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM insumos WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'No encontrado' });
    res.json({ message: 'Eliminado' });
  } catch (err) {
    console.error('Error DELETE /:id (insumos):', err);
    res.status(500).json({ message: 'Error eliminando insumo' });
  }
});

// --- Papelería (CRUD) ---
// GET /api/insumos/papeleria?q=
router.get('/papeleria', async (req, res) => {
  const q = (req.query.q || '').trim().toLowerCase();
  let limit = parseInt(req.query.limit, 10);
  if (isNaN(limit) || limit <= 0) limit = 0;
  if (limit > 500) limit = 500;
  try {
    if (!q) {
      if (limit > 0) {
        const [rows] = await pool.query('SELECT * FROM papeleria ORDER BY id DESC LIMIT ?', [limit]);
        return res.json(rows);
      } else {
        const [rows] = await pool.query('SELECT * FROM papeleria ORDER BY id DESC');
        return res.json(rows);
      }
    }
    if (limit > 0) {
      const [rows] = await pool.query(
        `SELECT * FROM papeleria
         WHERE LOWER(nombre) LIKE ? OR LOWER(marca) LIKE ? OR LOWER(descripcion) LIKE ?
         ORDER BY id DESC LIMIT ?`,
        [likeParam(q), likeParam(q), likeParam(q), limit]
      );
      return res.json(rows);
    } else {
      const [rows] = await pool.query(
        `SELECT * FROM papeleria
         WHERE LOWER(nombre) LIKE ? OR LOWER(marca) LIKE ? OR LOWER(descripcion) LIKE ?
         ORDER BY id DESC`,
        [likeParam(q), likeParam(q), likeParam(q)]
      );
      return res.json(rows);
    }
  } catch (err) {
    console.error('Error GET /papeleria:', err);
    res.status(500).json({ message: 'Error listando papelería' });
  }
});

// GET /api/insumos/papeleria/:id
router.get('/papeleria/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM papeleria WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ message: 'No encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error GET /papeleria/:id:', err);
    res.status(500).json({ message: 'Error obteniendo papelería' });
  }
});

// POST /api/insumos/papeleria
router.post('/papeleria', async (req, res) => {
  const p = req.body || {};
  try {
    await pool.query(
      `INSERT INTO papeleria (
        item, nombre, cantidad_adquirida, cantidad_existente, presentacion, marca, 
        descripcion, fecha_adquisicion, ubicacion, observaciones
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.item, p.nombre, p.cantidad_adquirida, p.cantidad_existente, p.presentacion || null,
        p.marca || null, p.descripcion || null, p.fecha_adquisicion || null,
        p.ubicacion || null, p.observaciones || null
      ]
    );
    res.status(201).json({ message: 'Creado' });
  } catch (err) {
    console.error('Error POST /papeleria:', err);
    res.status(500).json({ message: 'Error creando papelería' });
  }
});

// PUT /api/insumos/papeleria/:id
router.put('/papeleria/:id', async (req, res) => {
  const { id } = req.params;
  const p = req.body || {};
  try {
    const [result] = await pool.query(
      `UPDATE papeleria SET
        item = ?, nombre = ?, cantidad_adquirida = ?, cantidad_existente = ?, 
        presentacion = ?, marca = ?, descripcion = ?, fecha_adquisicion = ?, 
        ubicacion = ?, observaciones = ?
      WHERE id = ?`,
      [
        p.item, p.nombre, p.cantidad_adquirida, p.cantidad_existente, p.presentacion || null,
        p.marca || null, p.descripcion || null, p.fecha_adquisicion || null,
        p.ubicacion || null, p.observaciones || null, id
      ]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'No encontrado' });
    res.json({ message: 'Actualizado' });
  } catch (err) {
    console.error('Error PUT /papeleria/:id:', err);
    res.status(500).json({ message: 'Error actualizando papelería' });
  }
});

// DELETE /api/insumos/papeleria/:id
router.delete('/papeleria/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM papeleria WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'No encontrado' });
    res.json({ message: 'Eliminado' });
  } catch (err) {
    console.error('Error DELETE /papeleria/:id:', err);
    res.status(500).json({ message: 'Error eliminando papelería' });
  }
});

// --- Materiales Volumétricos (CRUD) ---
// GET /api/insumos/materiales-volumetricos?q=
router.get('/materiales-volumetricos', async (req, res) => {
  const q = (req.query.q || '').trim().toLowerCase();
  let limit = parseInt(req.query.limit, 10);
  if (isNaN(limit) || limit <= 0) limit = 0;
  if (limit > 500) limit = 500;
  try {
    if (!q) {
      if (limit > 0) {
        const [rows] = await pool.query('SELECT * FROM materiales_volumetricos ORDER BY id DESC LIMIT ?', [limit]);
        return res.json(rows);
      } else {
        const [rows] = await pool.query('SELECT * FROM materiales_volumetricos ORDER BY id DESC');
        return res.json(rows);
      }
    }
    if (limit > 0) {
      const [rows] = await pool.query(
        `SELECT * FROM materiales_volumetricos
         WHERE LOWER(nombre_material) LIKE ? OR LOWER(marca) LIKE ? OR LOWER(referencia) LIKE ?
         ORDER BY id DESC LIMIT ?`,
        [likeParam(q), likeParam(q), likeParam(q), limit]
      );
      return res.json(rows);
    } else {
      const [rows] = await pool.query(
        `SELECT * FROM materiales_volumetricos
         WHERE LOWER(nombre_material) LIKE ? OR LOWER(marca) LIKE ? OR LOWER(referencia) LIKE ?
         ORDER BY id DESC`,
        [likeParam(q), likeParam(q), likeParam(q)]
      );
      return res.json(rows);
    }
  } catch (err) {
    console.error('Error GET /materiales-volumetricos:', err);
    res.status(500).json({ message: 'Error listando materiales volumétricos' });
  }
});

// GET /api/insumos/materiales-volumetricos/:id
router.get('/materiales-volumetricos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM materiales_volumetricos WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ message: 'No encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error GET /materiales-volumetricos/:id:', err);
    res.status(500).json({ message: 'Error obteniendo material volumétrico' });
  }
});

// POST /api/insumos/materiales-volumetricos
router.post('/materiales-volumetricos', async (req, res) => {
  const m = req.body || {};
  try {
    await pool.query(
      `INSERT INTO materiales_volumetricos (
        item, nombre_material, clase, marca, referencia, fecha_adquisicion, 
        cantidad, codigo_calibrado, fecha_calibracion, codigo_en_uso, 
        codigo_fuera_de_uso, observaciones
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        m.item, m.nombre_material, m.clase || null, m.marca || null, m.referencia || null,
        m.fecha_adquisicion || null, m.cantidad || null, m.codigo_calibrado || null,
        m.fecha_calibracion || null, m.codigo_en_uso || null, m.codigo_fuera_de_uso || null,
        m.observaciones || null
      ]
    );
    res.status(201).json({ message: 'Creado' });
  } catch (err) {
    console.error('Error POST /materiales-volumetricos:', err);
    res.status(500).json({ message: 'Error creando material volumétrico' });
  }
});

// PUT /api/insumos/materiales-volumetricos/:id
router.put('/materiales-volumetricos/:id', async (req, res) => {
  const { id } = req.params;
  const m = req.body || {};
  try {
    const [result] = await pool.query(
      `UPDATE materiales_volumetricos SET
        item = ?, nombre_material = ?, clase = ?, marca = ?, referencia = ?, 
        fecha_adquisicion = ?, cantidad = ?, codigo_calibrado = ?, fecha_calibracion = ?, 
        codigo_en_uso = ?, codigo_fuera_de_uso = ?, observaciones = ?
      WHERE id = ?`,
      [
        m.item, m.nombre_material, m.clase || null, m.marca || null, m.referencia || null,
        m.fecha_adquisicion || null, m.cantidad || null, m.codigo_calibrado || null,
        m.fecha_calibracion || null, m.codigo_en_uso || null, m.codigo_fuera_de_uso || null,
        m.observaciones || null, id
      ]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'No encontrado' });
    res.json({ message: 'Actualizado' });
  } catch (err) {
    console.error('Error PUT /materiales-volumetricos/:id:', err);
    res.status(500).json({ message: 'Error actualizando material volumétrico' });
  }
});

// DELETE /api/insumos/materiales-volumetricos/:id
router.delete('/materiales-volumetricos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM materiales_volumetricos WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'No encontrado' });
    res.json({ message: 'Eliminado' });
  } catch (err) {
    console.error('Error DELETE /materiales-volumetricos/:id:', err);
    res.status(500).json({ message: 'Error eliminando material volumétrico' });
  }
});

module.exports = router;
