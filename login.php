<?php
require __DIR__ . '/config.php';
require __DIR__ . '/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['error' => 'Método no permitido.'], 405);
}

$input = json_input();
$email = trim($input['email'] ?? '');
$pass = (string) ($input['password'] ?? '');

$stmt = $pdo->prepare('SELECT * FROM usuarios WHERE email = ?');
$stmt->execute([$email]);
$usuario = $stmt->fetch();

if (!$usuario || !password_verify($pass, $usuario['password_hash'])) {
    respond(['errors' => ['login' => 'Correo o contraseña incorrectos.']], 401);
}

$_SESSION['usuario_id'] = (int) $usuario['id'];

respond(['usuario' => user_payload($pdo, $usuario)]);
