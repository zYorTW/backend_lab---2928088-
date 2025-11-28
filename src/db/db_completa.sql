CREATE TABLE `catalogo_insumos` (
`item` int(11) NOT NULL,
`nombre` varchar(200) NOT NULL,
`descripcion` text DEFAULT NULL,
`imagen` mediumblob DEFAULT NULL,
PRIMARY KEY (`item`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin

CREATE TABLE `catalogo_papeleria` (
`item` int(11) NOT NULL,
`nombre` varchar(200) NOT NULL,
`descripcion` text DEFAULT NULL,
`imagen` mediumblob DEFAULT NULL,
PRIMARY KEY (`item`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin

CREATE TABLE `catalogo_reactivos` (
`codigo` varchar(10) NOT NULL,
`nombre` varchar(200) NOT NULL,
`tipo_reactivo` varchar(50) NOT NULL,
`clasificacion_sga` varchar(100) NOT NULL,
`descripcion` text DEFAULT NULL,
`fecha_creacion` timestamp DEFAULT CURRENT_TIMESTAMP,
`fecha_actualizacion` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
PRIMARY KEY (`codigo`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin

CREATE TABLE `cert_analisis` (
`id` int(11) NOT NULL AUTO_INCREMENT,
`lote` varchar(30) NOT NULL,
`certificado_analisis` varchar(255) NOT NULL,
`fecha_subida` timestamp DEFAULT CURRENT_TIMESTAMP,
`contenido_pdf` longblob DEFAULT NULL,
PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
UNIQUE KEY `lote` (`lote`),
CONSTRAINT `fk_1` FOREIGN KEY (`lote`) REFERENCES `lab`.`reactivos` (`lote`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=330001

CREATE TABLE `clientes` (
`id_cliente` int(11) NOT NULL AUTO_INCREMENT,
`numero` int(11) NOT NULL,
`fecha_vinculacion` date NOT NULL,
`tipo_usuario` enum('Emprendedor','Persona Natural','Persona Jurídica','Aprendiz SENA','Instructor SENA','Centros SENA') NOT NULL,
`razon_social` varchar(255) DEFAULT NULL,
`nit` varchar(50) DEFAULT NULL,
`nombre_solicitante` varchar(255) NOT NULL,
`tipo_identificacion` enum('CC','TI','CE','NIT','PASAPORTE','OTRO') NOT NULL,
`numero_identificacion` varchar(50) NOT NULL,
`sexo` enum('M','F','Otro') NOT NULL,
`tipo_poblacion` varchar(100) DEFAULT NULL,
`direccion` varchar(255) DEFAULT NULL,
`id_ciudad` varchar(10) DEFAULT NULL,
`id_departamento` varchar(10) DEFAULT NULL,
`celular` varchar(20) DEFAULT NULL,
`telefono` varchar(20) DEFAULT NULL,
`correo_electronico` varchar(255) DEFAULT NULL,
`tipo_vinculacion` varchar(100) DEFAULT NULL,
`registro_realizado_por` varchar(255) DEFAULT NULL,
`observaciones` text DEFAULT NULL,
`activo` tinyint(1) DEFAULT '1',
`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
PRIMARY KEY (`id_cliente`) /*T![clustered_index] CLUSTERED */,
UNIQUE KEY `numero` (`numero`),
UNIQUE KEY `numero_identificacion` (`numero_identificacion`),
KEY `fk_1` (`id_ciudad`),
KEY `fk_2` (`id_departamento`),
CONSTRAINT `fk_1` FOREIGN KEY (`id_ciudad`) REFERENCES `lab`.`ciudades` (`codigo`) ON DELETE RESTRICT,
CONSTRAINT `fk_2` FOREIGN KEY (`id_departamento`) REFERENCES `lab`.`departamentos` (`codigo`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=180001

CREATE TABLE `ciudades` (
`codigo` varchar(10) NOT NULL,
`nombre` varchar(100) NOT NULL,
`codigo_departamento` varchar(10) NOT NULL,
PRIMARY KEY (`codigo`) /*T![clustered_index] CLUSTERED */,
KEY `fk_1` (`codigo_departamento`),
CONSTRAINT `fk_1` FOREIGN KEY (`codigo_departamento`) REFERENCES `lab`.`departamentos` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin

CREATE TABLE `clasificacion_sga` (
`id` int(11) NOT NULL AUTO_INCREMENT,
`nombre` varchar(100) NOT NULL,
PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001

CREATE TABLE `departamentos` (
`codigo` varchar(10) NOT NULL,
`nombre` varchar(100) NOT NULL,
PRIMARY KEY (`codigo`) /*T![clustered_index] CLUSTERED */,
UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin

CREATE TABLE `documentos_equipos` (
`id_documento` int(11) NOT NULL AUTO_INCREMENT,
`codigo_identificador` varchar(50) DEFAULT NULL,
`tipo_documento` enum('manual','certificado_calibracion','especificaciones_tecnicas') DEFAULT NULL,
`nombre_archivo` varchar(255) DEFAULT NULL,
`archivo_pdf` longblob DEFAULT NULL,
`fecha_upload` timestamp DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (`id_documento`) /*T![clustered_index] CLUSTERED */,
KEY `fk_1` (`codigo_identificador`),
CONSTRAINT `fk_1` FOREIGN KEY (`codigo_identificador`) REFERENCES `lab`.`ficha_tecnica_de_equipos` (`codigo_identificador`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=60001

CREATE TABLE `ficha_tecnica_de_equipos` (
`codigo_identificador` varchar(50) NOT NULL,
`nombre` varchar(100) DEFAULT NULL,
`marca` varchar(50) DEFAULT NULL,
`modelo` varchar(50) DEFAULT NULL,
`serie` varchar(50) DEFAULT NULL,
`fabricante` varchar(100) DEFAULT NULL,
`fecha_adq` date DEFAULT NULL,
`uso` varchar(100) DEFAULT NULL,
`fecha_func` date DEFAULT NULL,
`precio` decimal(10,2) DEFAULT NULL,
`accesorios` text DEFAULT NULL,
`manual_ope` enum('digital','Fisico','No') DEFAULT NULL,
`idioma_manual` varchar(30) DEFAULT NULL,
`magnitud` varchar(50) DEFAULT NULL,
`resolucion` varchar(50) DEFAULT NULL,
`precision_med` varchar(50) DEFAULT NULL,
`exactitud` varchar(50) DEFAULT NULL,
`rango_de_medicion` varchar(100) DEFAULT NULL,
`rango_de_uso` varchar(100) DEFAULT NULL,
`voltaje` varchar(50) DEFAULT NULL,
`potencia` varchar(50) DEFAULT NULL,
`amperaje` varchar(50) DEFAULT NULL,
`frecuencia` varchar(50) DEFAULT NULL,
`ancho` decimal(8,2) DEFAULT NULL,
`alto` decimal(8,2) DEFAULT NULL,
`peso_kg` decimal(8,2) DEFAULT NULL,
`profundidad` decimal(8,2) DEFAULT NULL,
`temperatura_c` decimal(5,2) DEFAULT NULL,
`humedad_porcentaje` decimal(5,2) DEFAULT NULL,
`limitaciones_e_interferencias` text DEFAULT NULL,
`otros` text DEFAULT NULL,
`especificaciones_software` text DEFAULT NULL,
`proveedor` varchar(100) DEFAULT NULL,
`email` varchar(100) DEFAULT NULL,
`telefono` varchar(20) DEFAULT NULL,
`fecha_de_instalacion` date DEFAULT NULL,
`alcance_del_servicio` text DEFAULT NULL,
`garantia` varchar(100) DEFAULT NULL,
`observaciones` text DEFAULT NULL,
`recibido_por` varchar(100) DEFAULT NULL,
`cargo_y_firma` varchar(100) DEFAULT NULL,
`fecha` date DEFAULT NULL,
PRIMARY KEY (`codigo_identificador`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin

CREATE TABLE `hoja_seguridad` (
`id` int(11) NOT NULL AUTO_INCREMENT,
`lote` varchar(30) NOT NULL,
`hoja_seguridad` varchar(255) NOT NULL,
`fecha_subida` timestamp DEFAULT CURRENT_TIMESTAMP,
`contenido_pdf` longblob DEFAULT NULL,
PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
UNIQUE KEY `lote` (`lote`),
CONSTRAINT `fk_1` FOREIGN KEY (`lote`) REFERENCES `lab`.`reactivos` (`lote`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=420001

CREATE TABLE `hv_equipos` (
`codigo_identificacion` varchar(100) NOT NULL,
`nombre` varchar(150) NOT NULL,
`modelo` varchar(100) DEFAULT NULL,
`marca` varchar(100) DEFAULT NULL,
`inventario_sena` varchar(100) DEFAULT NULL,
`ubicacion` varchar(100) DEFAULT NULL,
`acreditacion` enum('Si','No aplica') DEFAULT NULL,
`tipo_manual` enum('Fisico','Digital') DEFAULT NULL,
`numero_serie` varchar(100) DEFAULT NULL,
`tipo` varchar(100) DEFAULT NULL,
`clasificacion` varchar(100) DEFAULT NULL,
`manual_usuario` enum('Si','No') DEFAULT NULL,
`puesta_en_servicio` date DEFAULT NULL,
`fecha_adquisicion` date DEFAULT NULL,
`fecha_registro` timestamp DEFAULT CURRENT_TIMESTAMP,
`requerimientos_equipo` text DEFAULT NULL,
`elementos_electricos` enum('Si','No') DEFAULT NULL,
`voltaje` varchar(50) DEFAULT NULL,
`elementos_mecanicos` enum('Si','No') DEFAULT NULL,
`frecuencia` varchar(50) DEFAULT NULL,
`campo_medicion` varchar(100) DEFAULT NULL,
`exactitud` varchar(100) DEFAULT NULL,
`sujeto_verificar` enum('Si','No') DEFAULT NULL,
`sujeto_calibracion` enum('Si','No') DEFAULT NULL,
`resolucion_division` varchar(100) DEFAULT NULL,
`sujeto_calificacion` enum('Si','No') DEFAULT NULL,
`accesorios` text DEFAULT NULL,
PRIMARY KEY (`codigo_identificacion`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin

CREATE TABLE `insumos` (
`id` int(11) NOT NULL AUTO_INCREMENT,
`item_catalogo` int(11) NOT NULL,
`nombre` varchar(100) NOT NULL,
`cantidad_adquirida` int(11) NOT NULL,
`cantidad_existente` int(11) NOT NULL,
`presentacion` varchar(50) DEFAULT NULL,
`marca` varchar(100) DEFAULT NULL,
`referencia` varchar(20) DEFAULT NULL,
`descripcion` text DEFAULT NULL,
`fecha_adquisicion` date DEFAULT NULL,
`ubicacion` varchar(100) DEFAULT NULL,
`observaciones` text DEFAULT NULL,
PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
KEY `fk_1` (`item_catalogo`),
CONSTRAINT `fk_1` FOREIGN KEY (`item_catalogo`) REFERENCES `lab`.`catalogo_insumos` (`item`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=150001

CREATE TABLE `logs_acciones` (
`id_log_accion` int(11) NOT NULL AUTO_INCREMENT,
`usuario_id` int(11) NOT NULL,
`fecha` datetime DEFAULT CURRENT_TIMESTAMP,
`accion` varchar(50) NOT NULL,
`modulo` varchar(50) NOT NULL,
PRIMARY KEY (`id_log_accion`) /*T![clustered_index] CLUSTERED */,
KEY `fk_1` (`usuario_id`),
CONSTRAINT `fk_1` FOREIGN KEY (`usuario_id`) REFERENCES `lab`.`usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=1080001

CREATE TABLE `movimientos_inventario` (
`id_movimiento` int(11) NOT NULL AUTO_INCREMENT,
`producto_tipo` enum('INSUMO','REACTIVO','EQUIPO','PAPELERIA') NOT NULL,
`producto_referencia` varchar(100) NOT NULL,
`usuario_id` int(11) NOT NULL,
`fecha` datetime DEFAULT CURRENT_TIMESTAMP,
`tipo_movimiento` enum('ENTRADA','SALIDA','AJUSTE') NOT NULL,
PRIMARY KEY (`id_movimiento`) /*T![clustered_index] CLUSTERED */,
KEY `fk_1` (`usuario_id`),
CONSTRAINT `fk_1` FOREIGN KEY (`usuario_id`) REFERENCES `lab`.`usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=390001

CREATE TABLE `papeleria` (
`id` int(11) NOT NULL AUTO_INCREMENT,
`item_catalogo` int(11) NOT NULL,
`nombre` varchar(100) NOT NULL,
`cantidad_adquirida` int(11) NOT NULL,
`cantidad_existente` int(11) NOT NULL,
`presentacion` enum('unidad','paquete','caja','cajas') NOT NULL,
`marca` varchar(100) DEFAULT NULL,
`descripcion` text DEFAULT NULL,
`fecha_adquisicion` date DEFAULT NULL,
`ubicacion` varchar(100) DEFAULT NULL,
`observaciones` text DEFAULT NULL,
PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
KEY `fk_1` (`item_catalogo`),
CONSTRAINT `fk_1` FOREIGN KEY (`item_catalogo`) REFERENCES `lab`.`catalogo_papeleria` (`item`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=150001


CREATE TABLE `permisos` (
`id_permiso` int(11) NOT NULL AUTO_INCREMENT,
`nombre` varchar(50) NOT NULL,
`descripcion` text DEFAULT NULL,
PRIMARY KEY (`id_permiso`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001

CREATE TABLE `reactivos` (
`lote` varchar(30) NOT NULL,
`codigo` varchar(10) NOT NULL,
`nombre` varchar(200) NOT NULL,
`marca` varchar(50) NOT NULL,
`referencia` varchar(100) DEFAULT NULL,
`cas` varchar(50) DEFAULT NULL,
`presentacion` decimal(10,2) NOT NULL,
`presentacion_cant` decimal(10,2) NOT NULL,
`cantidad_total` decimal(10,2) NOT NULL,
`fecha_adquisicion` date NOT NULL,
`fecha_vencimiento` date NOT NULL,
`observaciones` text DEFAULT NULL,
`fecha_creacion` timestamp DEFAULT CURRENT_TIMESTAMP,
`fecha_actualizacion` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
`tipo_id` int(11) NOT NULL,
`clasificacion_id` int(11) NOT NULL,
`unidad_id` int(11) NOT NULL,
`estado_id` int(11) NOT NULL,
`almacenamiento_id` int(11) NOT NULL,
`tipo_recipiente_id` int(11) NOT NULL,
UNIQUE KEY `codigo` (`codigo`,`lote`),
PRIMARY KEY (`lote`) /*T![clustered_index] CLUSTERED */,
KEY `fk_2` (`tipo_id`),
KEY `fk_3` (`clasificacion_id`),
KEY `fk_4` (`unidad_id`),
KEY `fk_5` (`estado_id`),
KEY `fk_6` (`almacenamiento_id`),
KEY `fk_7` (`tipo_recipiente_id`),
CONSTRAINT `fk_1` FOREIGN KEY (`codigo`) REFERENCES `lab`.`catalogo_reactivos` (`codigo`),
CONSTRAINT `fk_2` FOREIGN KEY (`tipo_id`) REFERENCES `lab`.`tipo_reactivo` (`id`),
CONSTRAINT `fk_3` FOREIGN KEY (`clasificacion_id`) REFERENCES `lab`.`clasificacion_sga` (`id`),
CONSTRAINT `fk_4` FOREIGN KEY (`unidad_id`) REFERENCES `lab`.`unidades` (`id`),
CONSTRAINT `fk_5` FOREIGN KEY (`estado_id`) REFERENCES `lab`.`estado_fisico` (`id`),
CONSTRAINT `fk_6` FOREIGN KEY (`almacenamiento_id`) REFERENCES `lab`.`almacenamiento` (`id`),
CONSTRAINT `fk_7` FOREIGN KEY (`tipo_recipiente_id`) REFERENCES `lab`.`tipo_recipiente` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin


CREATE TABLE `almacenamiento` (
`id` int(11) NOT NULL AUTO_INCREMENT,
`nombre` varchar(255) NOT NULL,
PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=60001


CREATE TABLE `historial_hv` (
`consecutivo` int(11) NOT NULL,
`equipo_id` varchar(100) NOT NULL,
`fecha` date DEFAULT NULL,
`tipo_historial` varchar(100) DEFAULT NULL,
`codigo_registro` varchar(100) DEFAULT NULL,
`tolerancia_g` decimal(10,4) DEFAULT NULL,
`tolerancia_error_g` decimal(10,4) DEFAULT NULL,
`incertidumbre_u` decimal(10,4) DEFAULT NULL,
`realizo` varchar(150) DEFAULT NULL,
`superviso` varchar(150) DEFAULT NULL,
`observaciones` text DEFAULT NULL,
PRIMARY KEY (`consecutivo`) /*T![clustered_index] CLUSTERED */,
KEY `fk_1` (`equipo_id`),
CONSTRAINT `fk_1` FOREIGN KEY (`equipo_id`) REFERENCES `lab`.`hv_equipos` (`codigo_identificacion`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin

CREATE TABLE `ResultadosEncuestas` (
`id_encuesta` int(11) NOT NULL AUTO_INCREMENT,
`id_solicitud` int(11) DEFAULT NULL,
`fecha_encuesta` date DEFAULT NULL,
`puntuacion_satisfaccion` int(11) DEFAULT NULL,
`comentarios` text DEFAULT NULL,
`recomendaria_servicio` tinyint(1) DEFAULT NULL,
PRIMARY KEY (`id_encuesta`) /*T![clustered_index] CLUSTERED */,
KEY `fk_1` (`id_solicitud`),
CONSTRAINT `fk_1` FOREIGN KEY (`id_solicitud`) REFERENCES `lab`.`Solicitudes` (`id_solicitud`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001


CREATE TABLE `rol_permiso` (
`id_rol_permiso` int(11) NOT NULL AUTO_INCREMENT,
`rol_id` int(11) NOT NULL,
`permiso_id` int(11) NOT NULL,
PRIMARY KEY (`id_rol_permiso`) /*T![clustered_index] CLUSTERED */,
KEY `fk_1` (`rol_id`),
KEY `fk_2` (`permiso_id`),
CONSTRAINT `fk_1` FOREIGN KEY (`rol_id`) REFERENCES `lab`.`roles` (`id_rol`) ON DELETE CASCADE ON UPDATE CASCADE,
CONSTRAINT `fk_2` FOREIGN KEY (`permiso_id`) REFERENCES `lab`.`permisos` (`id_permiso`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001


CREATE TABLE `roles` (
`id_rol` int(11) NOT NULL AUTO_INCREMENT,
`nombre` varchar(50) NOT NULL,
PRIMARY KEY (`id_rol`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30002

CREATE TABLE `Solicitudes` (
`id_solicitud` int(11) NOT NULL AUTO_INCREMENT,
`numero_solicitud` int(11) NOT NULL,
`id_cliente` int(11) NOT NULL,
`codigo` varchar(50) DEFAULT NULL,
`fecha_solicitud` date DEFAULT NULL,
`tipo_solicitud` varchar(10) DEFAULT NULL,
`nombre_muestra_producto` varchar(255) DEFAULT NULL,
`lote_producto` varchar(100) DEFAULT NULL,
`fecha_vencimiento_producto` date DEFAULT NULL,
`tipo_muestra` varchar(100) DEFAULT NULL,
`condiciones_empaque` varchar(100) DEFAULT NULL,
`tipo_analisis_requerido` varchar(255) DEFAULT NULL,
`requiere_varios_analisis` tinyint(1) DEFAULT NULL,
`cantidad_muestras_analizar` int(11) DEFAULT NULL,
`fecha_estimada_entrega_muestra` date DEFAULT NULL,
`puede_suministrar_informacion_adicional` tinyint(1) DEFAULT NULL,
`servicio_viable` tinyint(1) DEFAULT NULL,
`genero_cotizacion` tinyint(1) DEFAULT NULL,
`valor_cotizacion` decimal(15,2) DEFAULT NULL,
`fecha_envio_oferta` date DEFAULT NULL,
`realizo_seguimiento_oferta` tinyint(1) DEFAULT NULL,
`observacion_oferta` text DEFAULT NULL,
`fecha_limite_entrega_resultados` date DEFAULT NULL,
`numero_informe_resultados` varchar(100) DEFAULT NULL,
`fecha_envio_resultados` date DEFAULT NULL,
`cliente_respondio_encuesta` tinyint(1) DEFAULT NULL,
`solicito_nueva_encuesta` tinyint(1) DEFAULT NULL,
`observaciones_generales` text DEFAULT NULL,
`mes_solicitud` int(11) DEFAULT NULL,
`fecha_creacion` timestamp DEFAULT CURRENT_TIMESTAMP,
`fecha_actualizacion` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
PRIMARY KEY (`id_solicitud`) /*T![clustered_index] CLUSTERED */,
UNIQUE KEY `numero_solicitud` (`numero_solicitud`),
KEY `fk_1` (`id_cliente`),
KEY `fk_2` (`tipo_solicitud`),
CONSTRAINT `fk_1` FOREIGN KEY (`id_cliente`) REFERENCES `lab`.`clientes` (`id_cliente`) ON DELETE RESTRICT,
CONSTRAINT `fk_2` FOREIGN KEY (`tipo_solicitud`) REFERENCES `lab`.`TiposSolicitud` (`codigo_tipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=90001


CREATE TABLE `tipo_reactivo` (
`id` int(11) NOT NULL AUTO_INCREMENT,
`nombre` varchar(50) NOT NULL,
PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001


CREATE TABLE `tipo_recipiente` (
`id` int(11) NOT NULL AUTO_INCREMENT,
`nombre` varchar(20) NOT NULL,
PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001


CREATE TABLE `TiposSolicitud` (
`id_tipo_solicitud` int(11) NOT NULL AUTO_INCREMENT,
`codigo_tipo` varchar(10) NOT NULL,
`nombre_tipo` varchar(100) NOT NULL,
`descripcion` text DEFAULT NULL,
`activo` tinyint(1) DEFAULT '1',
PRIMARY KEY (`id_tipo_solicitud`) /*T![clustered_index] CLUSTERED */,
UNIQUE KEY `codigo_tipo` (`codigo_tipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001


CREATE TABLE `unidades` (
`id` int(11) NOT NULL AUTO_INCREMENT,
`nombre` varchar(20) NOT NULL,
PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001


CREATE TABLE `usuarios` (
`id_usuario` int(11) NOT NULL AUTO_INCREMENT,
`email` varchar(100) NOT NULL,
`contrasena` varchar(255) NOT NULL,
`rol_id` int(11) NOT NULL,
`estado` enum('ACTIVO','INACTIVO') DEFAULT 'ACTIVO',
`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (`id_usuario`) /*T![clustered_index] CLUSTERED */,
UNIQUE KEY `email` (`email`),
KEY `fk_1` (`rol_id`),
CONSTRAINT `fk_1` FOREIGN KEY (`rol_id`) REFERENCES `lab`.`roles` (`id_rol`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=360001