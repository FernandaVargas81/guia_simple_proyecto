<?php
require __DIR__ . '/config.php';
require __DIR__ . '/helpers.php';

$usuarioId = current_user_id();
if (!$usuarioId) {
    respond(['usuario' => null]);
}

$stmt = $pdo->prepare('SELECT * FROM usuarios WHERE id = ?');
$stmt->execute([$usuarioId]);
$usuario = $stmt->fetch();

if (!$usuario) {
    // El usuario fue borrado pero la sesión seguía activa.
    $_SESSION = [];
    session_destroy();
    respond(['usuario' => null]);
}

respond(['usuario' => user_payload($pdo, $usuario)]);
