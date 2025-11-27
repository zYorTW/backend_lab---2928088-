const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const authController = {
  // Login con JWT - VALIDACIONES COMPLETAS
  login: async (req, res) => {
    const { email, contrasena } = req.body;
    
    // 🔧 VALIDACIONES DE ENTRADA COMPLETAS
    if (!email || !contrasena) {
      return res.status(400).json({ 
        success: false,
        message: 'Email y contraseña son requeridos' 
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Formato de email inválido' 
      });
    }

    // Validar longitud mínima de contraseña
    if (contrasena.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    // Validar longitud máxima
    if (email.length > 100) {
      return res.status(400).json({ 
        success: false,
        message: 'El email es demasiado largo' 
      });
    }

    try {
      // Consulta mejorada con manejo de errores
      const [rows] = await pool.query(
        `SELECT u.id_usuario, u.email, u.contrasena, u.estado, 
                r.nombre as rol_nombre, r.id_rol 
         FROM usuarios u 
         JOIN roles r ON u.rol_id = r.id_rol 
         WHERE u.email = ?`,
        [email.trim().toLowerCase()] // Normalizar email
      );
      
      // 🔧 USUARIO NO ENCONTRADO
      if (!rows.length) {
        return res.status(401).json({ 
          success: false,
          message: 'Usuario no encontrado' 
        });
      }
      
      const user = rows[0];
      
      // 🔧 USUARIO INACTIVO
      if (user.estado !== 'ACTIVO') {
        return res.status(403).json({ 
          success: false,
          message: 'Cuenta desactivada. Contacta al administrador' 
        });
      }
      
      // 🔧 VERIFICAR CONTRASEÑA
      const passwordMatch = await bcrypt.compare(contrasena, user.contrasena);
      if (!passwordMatch) {
        return res.status(401).json({ 
          success: false,
          message: 'Contraseña incorrecta' 
        });
      }

      // Generar JWT token
      const tokenPayload = {
        id: user.id_usuario, 
        email: user.email,
        rol: user.rol_nombre,
        id_rol: user.id_rol 
      };

      const token = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET || 'secreto-temporal-desarrollo',
        { expiresIn: '24h' }
      );

      // 🔧 RESPUESTA DE ÉXITO MEJORADA
      res.json({
        success: true,
        message: 'Login exitoso',
        data: {
          id_usuario: user.id_usuario, 
          email: user.email,
          rol: user.rol_nombre,
          id_rol: user.id_rol,
          token: token
        }
      });
      
    } catch (err) {
      console.error('🔥 Error en login:', err);
      
      // 🔧 MANEJO DE ERRORES ESPECÍFICOS
      if (err.code === 'ECONNREFUSED') {
        return res.status(503).json({ 
          success: false,
          message: 'Error de conexión con la base de datos' 
        });
      }
      
      if (err.code === 'ER_ACCESS_DENIED_ERROR') {
        return res.status(503).json({ 
          success: false,
          message: 'Error de autenticación con la base de datos' 
        });
      }
      
      res.status(500).json({ 
        success: false,
        message: 'Error interno del servidor' 
      });
    }
  },

  // 🔧 WHOAMI CORREGIDO - VERSIÓN BACKEND
  me: async (req, res) => {
    try {
      const authHeader = req.headers['authorization'] || req.headers['Authorization'];
      
      // VALIDAR HEADER DE AUTORIZACIÓN
      if (!authHeader) {
        return res.status(401).json({ 
          success: false,
          message: 'Token de autorización requerido' 
        });
      }

      // VALIDAR FORMATO DEL TOKEN
      const tokenParts = authHeader.split(' ');
      if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        return res.status(401).json({ 
          success: false,
          message: 'Formato de token inválido. Use: Bearer {token}' 
        });
      }

      const token = tokenParts[1];
      
      if (!token || token === 'null' || token === 'undefined') {
        return res.status(401).json({ 
          success: false,
          message: 'Token vacío o inválido' 
        });
      }

      // Verificar JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto-temporal-desarrollo');
      
      // Verificar que el usuario aún existe en la BD
      const [rows] = await pool.query(
        `SELECT u.id_usuario, u.email, u.estado, r.nombre as rol_nombre, r.id_rol 
         FROM usuarios u 
         JOIN roles r ON u.rol_id = r.id_rol 
         WHERE u.id_usuario = ? AND u.estado = 'ACTIVO'`,
        [decoded.id]
      );
      
      if (!rows.length) {
        return res.status(401).json({ 
          success: false,
          message: 'Usuario no encontrado o inactivo' 
        });
      }
      
      const user = rows[0];
      
      return res.json({ 
        success: true,
        data: {
          id: user.id_usuario, 
          email: user.email,
          rol: user.rol_nombre,
          id_rol: user.id_rol
        }
      });
      
    } catch (err) {
      console.error('🔥 Error en whoami:', err);
      
      // MANEJO DE ERRORES JWT ESPECÍFICOS
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false,
          message: 'Token inválido' 
        });
      }
      
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false,
          message: 'Token expirado. Inicia sesión nuevamente' 
        });
      }
      
      if (err.code === 'ECONNREFUSED') {
        return res.status(503).json({ 
          success: false,
          message: 'Error de conexión con la base de datos' 
        });
      }
      
      return res.status(500).json({ 
        success: false,
        message: 'Error del servidor' 
      });
    }
  }
};

module.exports = authController;