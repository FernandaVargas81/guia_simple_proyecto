<?php
require __DIR__ . '/config.php';
require __DIR__ . '/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    respond(['error' => 'Método no permitido.'], 405);
}

$tramites = $pdo->query('SELECT id, titulo, descripcion, categoria, duracion, dificultad, icono, url FROM tramites ORDER BY titulo')->fetchAll();

respond(['tramites' => $tramites]);
