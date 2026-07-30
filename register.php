<?php
require __DIR__ . '/config.php';
require __DIR__ . '/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['error' => 'Método no permitido.'], 405);
}

$input = json_input();
$nombre = trim($input['nombre'] ?? '');
$email = trim($input['email'] ?? '');
$pass = (string) ($input['password'] ?? '');
$passConfirm = (string) ($input['password_confirm'] ?? '');

$errors = [];
if (mb_strlen($nombre) < 3) $errors['nombre'] = 'Ingresa tu nombre completo.';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors['email'] = 'Correo electrónico inválido.';
if (mb_strlen($pass) < 6) $errors['password'] = 'Mínimo 6 caracteres.';
if ($pass !== $passConfirm) $errors['password_confirm'] = 'Las contraseñas no coinciden.';

if ($errors) {
    respond(['errors' => $errors], 422);
}

$stmt = $pdo->prepare('SELECT id FROM usuarios WHERE email = ?');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    respond(['errors' => ['email' => 'Ya existe una cuenta con este correo. Inicia sesión.']], 422);
}

$stmt = $pdo->prepare('INSERT INTO usuarios (nombre, email, password_hash) VALUES (?, ?, ?)');
$stmt->execute([$nombre, $email, password_hash($pass, PASSWORD_DEFAULT)]);

$usuarioId = (int) $pdo->lastInsertId();
$_SESSION['usuario_id'] = $usuarioId;

$stmt = $pdo->prepare('SELECT * FROM usuarios WHERE id = ?');
$stmt->execute([$usuarioId]);
$usuario = $stmt->fetch();

respond(['usuario' => user_payload($pdo, $usuario)], 201);
