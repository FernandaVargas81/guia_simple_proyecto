<?php
require __DIR__ . '/config.php';
require __DIR__ . '/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    respond(['error' => 'Método no permitido.'], 405);
}

$q = trim($_GET['q'] ?? '');

if ($q === '') {
    respond(['oficina' => null]);
}

$stmt = $pdo->prepare('SELECT nombre, direccion, clase FROM oficinas WHERE LOWER(nombre) LIKE ? OR LOWER(direccion) LIKE ? LIMIT 1');
$like = '%' . mb_strtolower($q) . '%';
$stmt->execute([$like, $like]);
$oficina = $stmt->fetch();

respond(['oficina' => $oficina ?: null]);
