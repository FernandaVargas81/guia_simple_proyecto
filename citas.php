<?php
require __DIR__ . '/config.php';
require __DIR__ . '/helpers.php';

$usuarioId = require_login();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->prepare('SELECT id, tramite, fecha, sede FROM citas WHERE usuario_id = ? ORDER BY fecha ASC');
    $stmt->execute([$usuarioId]);
    respond(['citas' => $stmt->fetchAll()]);
}

if ($method === 'POST') {
    $input = json_input();
    $tramite = trim($input['tramite'] ?? '');
    $fecha = trim($input['fecha'] ?? '');
    $sede = trim($input['sede'] ?? '');

    if (!$tramite || !$fecha || !$sede) {
        respond(['error' => 'Completa todos los campos de la cita.'], 422);
    }

    $stmt = $pdo->prepare('INSERT INTO citas (usuario_id, tramite, fecha, sede) VALUES (?, ?, ?, ?)');
    $stmt->execute([$usuarioId, $tramite, $fecha, $sede]);

    respond(['cita' => [
        'id' => (int) $pdo->lastInsertId(),
        'tramite' => $tramite,
        'fecha' => $fecha,
        'sede' => $sede,
    ]], 201);
}

if ($method === 'DELETE') {
    $id = (int) ($_GET['id'] ?? 0);
    $stmt = $pdo->prepare('DELETE FROM citas WHERE id = ? AND usuario_id = ?');
    $stmt->execute([$id, $usuarioId]);
    respond(['ok' => true]);
}

respond(['error' => 'Método no permitido.'], 405);
