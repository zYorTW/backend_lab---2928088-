const express = require('express');
const router = express.Router();
const pool = require('../db');

// Helpers
function likeParam(q) {
  return `%${(q || '').toLowerCase()}%`;
}

// Generic DB helpers to reduce repeated logic across similar resources
function buildWhereForSearch(q, fields) {
  if (!q || !fields || !fields.length) return { sql: '', params: [] };
  const clauses = fields.map(() => "LOWER(??) LIKE ?");
  // We'll replace ?? manually since mysql placeholder for identifiers isn't supported by pool.query params safely
  const sql = ' WHERE ' + fields.map((f) => `LOWER(${f}) LIKE ?`).join(' OR ');
  const params = fields.map(() => likeParam(q));
  return { sql, params };
}

async function listGeneric(req, res, opts) {
  const q = (req.query.q || '').trim().toLowerCase();
  let limit = parseInt(req.query.limit, 10);
  let offset = parseInt(req.query.offset, 10) || 0;
  if (isNaN(limit) || limit <= 0) limit = 0;
  if (limit > 500) limit = 500;
  const table = opts.table;
  const order = opts.order || 'id DESC';
  try {
    const baseSelect = `SELECT * FROM ${table}`;
    if (limit > 0) {
      // count
      const countQuery = q
        ? `SELECT COUNT(*) as total FROM ${table}` + buildWhereForSearch(q, opts.searchFields).sql
        : `SELECT COUNT(*) as total FROM ${table}`;
      const countParams = q ? buildWhereForSearch(q, opts.searchFields).params : [];
      const [totalRows] = await pool.query(countQuery, countParams);
      const total = totalRows[0]?.total || 0;
      let rows;
      if (q) {
        const where = buildWhereForSearch(q, opts.searchFields);
        [rows] = await pool.query(`${baseSelect}${where.sql} ORDER BY ${order} LIMIT ? OFFSET ?`, [...where.params, limit, offset]);
      } else {
        [rows] = await pool.query(`${baseSelect} ORDER BY ${order} LIMIT ? OFFSET ?`, [limit, offset]);
      }
      return res.json({ rows, total });
    } else {
      if (q) {
        const where = buildWhereForSearch(q, opts.searchFields);
        const [rows] = await pool.query(`${baseSelect}${where.sql} ORDER BY ${order}`, where.params);
        return res.json(rows);
      } else {
        const [rows] = await pool.query(`${baseSelect} ORDER BY ${order}`);
        return res.json(rows);
      }
    }
  } catch (err) {
    console.error(`Error GET /${opts.table}:`, err);
    res.status(500).json({ message: `Error listando ${opts.table}` });
  }
}

async function getByIdGeneric(req, res, table) {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE id = ?`, [id]);
    if (!rows.length) return res.status(404).json({ message: 'No encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(`Error GET /${table}/:id:`, err);
    res.status(500).json({ message: `Error obteniendo ${table}` });
  }
}

async function createGeneric(req, res, table, fields) {
  const body = req.body || {};
  try {
    const placeholders = fields.map(() => '?').join(', ');
    const cols = fields.join(', ');
    const params = fields.map((f) => (body[f] === undefined ? null : body[f]));
    await pool.query(`INSERT INTO ${table} (${cols}) VALUES (${placeholders})`, params);
    res.status(201).json({ message: 'Creado' });
  } catch (err) {
    console.error(`Error POST /${table}:`, err);
    res.status(500).json({ message: `Error creando ${table}` });
  }
}

async function updateGeneric(req, res, table, fields) {
  const { id } = req.params;
  const body = req.body || {};
  try {
    const setSql = fields.map((f) => `${f} = ?`).join(', ');
    const params = fields.map((f) => (body[f] === undefined ? null : body[f]));
    params.push(id);
    const [result] = await pool.query(`UPDATE ${table} SET ${setSql} WHERE id = ?`, params);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'No encontrado' });
    res.json({ message: 'Actualizado' });
  } catch (err) {
    console.error(`Error PUT /${table}/:id:`, err);
    res.status(500).json({ message: `Error actualizando ${table}` });
  }
}

async function deleteGeneric(req, res, table) {
  const { id } = req.params;
  try {
    const [result] = await pool.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'No encontrado' });
    res.json({ message: 'Eliminado' });
  } catch (err) {
    console.error(`Error DELETE /${table}/:id:`, err);
    res.status(500).json({ message: `Error eliminando ${table}` });
  }
}

// Validators
function validatePapeleriaBody(body) {
  const errors = [];
  const allowedPresentaciones = ['unidad', 'paquete', 'caja', 'cajas'];
  if (body.presentacion && !allowedPresentaciones.includes(body.presentacion)) {
    errors.push(`presentacion debe ser una de: ${allowedPresentaciones.join(', ')}`);
  }
  ['item','nombre','cantidad_adquirida','cantidad_existente'].forEach((f) => {
    if (body[f] === undefined || body[f] === null) errors.push(`${f} es requerido`);
  });
  return errors;
}

function validateMaterialesBody(body) {
  const errors = [];
  ['item','nombre_material'].forEach((f) => {
    if (body[f] === undefined || body[f] === null) errors.push(`${f} es requerido`);
  });
  return errors;
}

// Restore papeleria routes using generic helpers
router.get('/papeleria', async (req, res) => {
  return listGeneric(req, res, { table: 'papeleria', searchFields: ['nombre','marca','descripcion'], order: 'id DESC' });
});

router.get('/papeleria/:id', async (req, res) => {
  return getByIdGeneric(req, res, 'papeleria');
});

router.post('/papeleria', async (req, res) => {
  const errs = validatePapeleriaBody(req.body || {});
  if (errs.length) return res.status(400).json({ message: 'Invalid body', errors: errs });
  return createGeneric(req, res, 'papeleria', ['item','nombre','cantidad_adquirida','cantidad_existente','presentacion','marca','descripcion','fecha_adquisicion','ubicacion','observaciones']);
});

router.put('/papeleria/:id', async (req, res) => {
  const errs = validatePapeleriaBody(req.body || {});
  if (errs.length) return res.status(400).json({ message: 'Invalid body', errors: errs });
  return updateGeneric(req, res, 'papeleria', ['item','nombre','cantidad_adquirida','cantidad_existente','presentacion','marca','descripcion','fecha_adquisicion','ubicacion','observaciones']);
});

router.delete('/papeleria/:id', async (req, res) => {
  return deleteGeneric(req, res, 'papeleria');
});

// Restore materiales_volumetricos routes using generic helpers
router.get('/materiales-volumetricos', async (req, res) => {
  return listGeneric(req, res, { table: 'materiales_volumetricos', searchFields: ['nombre_material','marca','referencia'], order: 'id DESC' });
});

router.get('/materiales-volumetricos/:id', async (req, res) => {
  return getByIdGeneric(req, res, 'materiales_volumetricos');
});

router.post('/materiales-volumetricos', async (req, res) => {
  const errs = validateMaterialesBody(req.body || {});
  if (errs.length) return res.status(400).json({ message: 'Invalid body', errors: errs });
  return createGeneric(req, res, 'materiales_volumetricos', ['item','nombre_material','clase','marca','referencia','fecha_adquisicion','cantidad','codigo_calibrado','fecha_calibracion','codigo_en_uso','codigo_fuera_de_uso','observaciones']);
});

router.put('/materiales-volumetricos/:id', async (req, res) => {
  const errs = validateMaterialesBody(req.body || {});
  if (errs.length) return res.status(400).json({ message: 'Invalid body', errors: errs });
  return updateGeneric(req, res, 'materiales_volumetricos', ['item','nombre_material','clase','marca','referencia','fecha_adquisicion','cantidad','codigo_calibrado','fecha_calibracion','codigo_en_uso','codigo_fuera_de_uso','observaciones']);
});

router.delete('/materiales-volumetricos/:id', async (req, res) => {
  return deleteGeneric(req, res, 'materiales_volumetricos');
});

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
  return listGeneric(req, res, { table: 'insumos', searchFields: ['nombre', 'marca', 'descripcion'], order: 'fecha_creacion DESC' });
});

// GET /api/insumos/:id
router.get('/:id', async (req, res) => {
  return getByIdGeneric(req, res, 'insumos');
});

// POST /api/insumos
router.post('/', async (req, res) => {
  return createGeneric(req, res, 'insumos', ['item','nombre','cantidad_adquirida','cantidad_existente','presentacion','marca','descripcion','fecha_adquisicion','ubicacion','observaciones']);
});

// PUT /api/insumos/:id
router.put('/:id', async (req, res) => {
  return updateGeneric(req, res, 'insumos', ['item','nombre','cantidad_adquirida','cantidad_existente','presentacion','marca','descripcion','fecha_adquisicion','ubicacion','observaciones']);
});

// DELETE /api/insumos/:id
router.delete('/:id', async (req, res) => {
  return deleteGeneric(req, res, 'insumos');
});

// Papelería routes removed — use generic handlers if needed elsewhere

// Materiales volumétricos routes removed — use generic handlers if needed elsewhere

module.exports = router;
