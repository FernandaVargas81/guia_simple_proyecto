<?php
require __DIR__ . '/config.php';
require __DIR__ . '/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $consejos = $pdo->query('SELECT id, autor_nombre, mensaje, created_at FROM comunidad_consejos ORDER BY created_at DESC')->fetchAll();
    respond(['consejos' => $consejos]);
}

if ($method === 'POST') {
    $input = json_input();
    $mensaje = trim($input['mensaje'] ?? '');
    if (!$mensaje) {
        respond(['error' => 'No puedes publicar un mensaje vacío.'], 422);
    }

    $usuarioId = current_user_id();
    $autor = 'Usuario Invitado';

    if ($usuarioId) {
        $stmt = $pdo->prepare('SELECT nombre FROM usuarios WHERE id = ?');
        $stmt->execute([$usuarioId]);
        $autor = $stmt->fetchColumn() ?: $autor;
    }

    $stmt = $pdo->prepare('INSERT INTO comunidad_consejos (usuario_id, autor_nombre, mensaje) VALUES (?, ?, ?)');
    $stmt->execute([$usuarioId, $autor, $mensaje]);

    respond(['consejo' => [
        'id' => (int) $pdo->lastInsertId(),
        'autor_nombre' => $autor,
        'mensaje' => $mensaje,
        'created_at' => date('Y-m-d H:i:s'),
    ]], 201);
}

respond(['error' => 'Método no permitido.'], 405);
