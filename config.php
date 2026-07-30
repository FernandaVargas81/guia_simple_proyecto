<?php
// Configuración de conexión a MySQL (valores por defecto de XAMPP).
// Si tu instalación tiene contraseña de root distinta, ajústala aquí.
define('DB_HOST', 'localhost');
define('DB_NAME', 'guia_simple');
define('DB_USER', 'root');
define('DB_PASS', '');

session_start();
header('Content-Type: application/json; charset=utf-8');

try {
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'No se pudo conectar a la base de datos. Verifica que MySQL esté activo en XAMPP y que importaste sql/schema.sql.',
    ]);
    exit;
}
