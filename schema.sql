-- Guía Simple - Esquema de base de datos (MySQL / XAMPP)
-- Importar en phpMyAdmin o con: mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS guia_simple
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE guia_simple;

-- ==================== USUARIOS ====================
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  horas_ahorradas INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ==================== TRÁMITES ====================
CREATE TABLE IF NOT EXISTS tramites (
  id VARCHAR(50) PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT,
  categoria VARCHAR(50) NOT NULL,
  duracion VARCHAR(50),
  dificultad VARCHAR(20),
  icono VARCHAR(50),
  url VARCHAR(150),
  horas_estimadas INT NOT NULL DEFAULT 1
) ENGINE=InnoDB;

INSERT INTO tramites (id, titulo, descripcion, categoria, duracion, dificultad, icono, url, horas_estimadas) VALUES
('licencia', 'Renovación de Licencia de Conducir', 'Mantén tu libertad de movimiento. Te acompañamos paso a paso.', 'transporte', '2 a 4 h (en sede)', 'Media', 'car', 'html/tramite_licencia.html', 3),
('pasaporte', 'Renovación de Pasaporte', 'Solicita o actualiza tu pasaporte colombiano de forma ágil y segura.', 'identificacion', '24 a 48 h', 'Baja', 'file-text', 'html/tramite_pasaporte.html', 2),
('domicilio', 'Cambio de Domicilio', 'Actualiza tu dirección de correspondencia y tu puesto de votación oficial.', 'personales', '20 minutos', 'Baja', 'map-pin', 'html/tramite_domicilio.html', 1),
('certificado', 'Certificado de Antecedentes', 'Obtén tu certificado judicial de manera inmediata y totalmente digital.', 'personales', '10 minutos', 'Baja', 'shield-check', 'html/tramite_certificado.html', 1),
('impuesto', 'Pago de Impuesto Vehicular', 'Liquida y paga el impuesto sobre vehículos de forma segura.', 'transporte', '30 minutos', 'Media', 'badge-dollar-sign', 'html/tramite_impuesto.html', 1);

-- ==================== CHECKLIST (pasos por trámite) ====================
CREATE TABLE IF NOT EXISTS checklist_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tramite_id VARCHAR(50) NOT NULL,
  posicion INT NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descripcion VARCHAR(255),
  FOREIGN KEY (tramite_id) REFERENCES tramites(id) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO checklist_items (tramite_id, posicion, titulo, descripcion) VALUES
('licencia', 0, 'Verificar multas pendientes en el SIMIT', 'Debes estar a paz y salvo para poder continuar con el trámite.'),
('licencia', 1, 'Realizarse el examen médico en un CRC autorizado', 'Centro de Reconocimiento de Conductores para certificar tu aptitud física.'),
('licencia', 2, 'Agendar cita de entrega en el Organismo de Tránsito', 'Dirígete a tu sede seleccionada con tu documento de identidad original.'),

('pasaporte', 0, 'Diligenciar el formulario en línea de la Cancillería', 'Ingresa todos tus datos personales exactos para agilizar el proceso.'),
('pasaporte', 1, 'Agendar cita presencial en la sede de pasaportes', 'Las citas se habilitan de lunes a viernes a las 5:00 PM para el día siguiente.'),
('pasaporte', 2, 'Presentar documento original y realizar primer pago', 'Asiste a la cita con tu cédula de ciudadanía original en formato físico.'),

('domicilio', 0, 'Consultar puesto de votación actual en la Registraduría', 'Verifica dónde estás registrado actualmente antes de realizar el cambio.'),
('domicilio', 1, 'Acudir al puesto de inscripción más cercano con cédula original', 'Presenta tu documento original para capturar tu huella digital.'),

('certificado', 0, 'Ingresar al sitio web oficial de la Procuraduría', 'Dirígete a la sección de consulta ciudadana de antecedentes.'),
('certificado', 1, 'Escribir número de cédula y descargar el PDF', 'Genera de forma gratuita el documento oficial con firma digital.'),

('impuesto', 0, 'Consultar liquidación con la placa del vehículo', 'Ingresa al portal de la gobernación departamental respectiva.'),
('impuesto', 1, 'Pagar en línea mediante el botón PSE', 'Transacción totalmente segura directamente desde tu cuenta bancaria.');

-- Progreso de checklist por usuario (una fila = un ítem marcado)
CREATE TABLE IF NOT EXISTS checklist_progreso (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  checklist_item_id INT NOT NULL,
  completado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_progreso (usuario_id, checklist_item_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (checklist_item_id) REFERENCES checklist_items(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Registro de trámites completados al 100% (para no volver a sumar horas ni perder el logro)
CREATE TABLE IF NOT EXISTS tramite_completado_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  tramite_id VARCHAR(50) NOT NULL,
  completado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_completado (usuario_id, tramite_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (tramite_id) REFERENCES tramites(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==================== CITAS / RECORDATORIOS ====================
CREATE TABLE IF NOT EXISTS citas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  tramite VARCHAR(150) NOT NULL,
  fecha DATE NOT NULL,
  sede VARCHAR(150) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==================== OFICINAS (buscador del mapa) ====================
CREATE TABLE IF NOT EXISTS oficinas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  direccion VARCHAR(200) NOT NULL,
  clase VARCHAR(50)
) ENGINE=InnoDB;

INSERT INTO oficinas (nombre, direccion, clase) VALUES
('Ventanilla Única de Tránsito (Licencias)', 'Calle 10 # 23-45 — Yopal, Casanare', 'Tránsito'),
('Oficina Departamental de Pasaportes', 'Carrera 15 # 14-20 (Edificio Gobernación)', 'Pasaportes');

-- ==================== COMUNIDAD / CONSEJOS ====================
CREATE TABLE IF NOT EXISTS comunidad_consejos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NULL,
  autor_nombre VARCHAR(150) NOT NULL,
  mensaje TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO comunidad_consejos (usuario_id, autor_nombre, mensaje) VALUES
(NULL, 'Andrés Mendoza', 'Para el trámite del pasaporte, lo mejor es pagar el recibo del banco del estado el mismo día que agendas la cita. ¡Ahorra muchísimo tiempo en fila!');
