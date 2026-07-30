<?php
require __DIR__ . '/config.php';
require __DIR__ . '/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $tramiteId = $_GET['tramite_id'] ?? '';
    if (!$tramiteId) {
        respond(['error' => 'Falta tramite_id.'], 422);
    }

    $stmt = $pdo->prepare('SELECT id, posicion, titulo, descripcion FROM checklist_items WHERE tramite_id = ? ORDER BY posicion ASC');
    $stmt->execute([$tramiteId]);
    $items = $stmt->fetchAll();

    $marcados = [];
    $usuarioId = current_user_id();
    if ($usuarioId) {
        $stmt = $pdo->prepare('
            SELECT ci.id
            FROM checklist_progreso cp
            JOIN checklist_items ci ON ci.id = cp.checklist_item_id
            WHERE cp.usuario_id = ? AND ci.tramite_id = ?
        ');
        $stmt->execute([$usuarioId, $tramiteId]);
        $marcados = array_map('intval', array_column($stmt->fetchAll(), 'id'));
    }

    foreach ($items as &$item) {
        $item['id'] = (int) $item['id'];
        $item['posicion'] = (int) $item['posicion'];
        $item['completado'] = in_array($item['id'], $marcados, true);
    }

    respond(['tramite_id' => $tramiteId, 'items' => $items]);
}

if ($method === 'POST') {
    $usuarioId = require_login();
    $input = json_input();
    $itemId = (int) ($input['item_id'] ?? 0);
    $completado = (bool) ($input['completado'] ?? false);

    $stmt = $pdo->prepare('SELECT tramite_id FROM checklist_items WHERE id = ?');
    $stmt->execute([$itemId]);
    $tramiteId = $stmt->fetchColumn();
    if (!$tramiteId) {
        respond(['error' => 'Ítem no encontrado.'], 404);
    }

    if ($completado) {
        $stmt = $pdo->prepare('INSERT IGNORE INTO checklist_progreso (usuario_id, checklist_item_id) VALUES (?, ?)');
        $stmt->execute([$usuarioId, $itemId]);
    } else {
        $stmt = $pdo->prepare('DELETE FROM checklist_progreso WHERE usuario_id = ? AND checklist_item_id = ?');
        $stmt->execute([$usuarioId, $itemId]);
    }

    // ¿El trámite quedó 100% completo? Si es la primera vez, se registra el logro y se suman horas.
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM checklist_items WHERE tramite_id = ?');
    $stmt->execute([$tramiteId]);
    $total = (int) $stmt->fetchColumn();

    $stmt = $pdo->prepare('
        SELECT COUNT(*) FROM checklist_progreso cp
        JOIN checklist_items ci ON ci.id = cp.checklist_item_id
        WHERE cp.usuario_id = ? AND ci.tramite_id = ?
    ');
    $stmt->execute([$usuarioId, $tramiteId]);
    $marcadosCount = (int) $stmt->fetchColumn();

    if ($total > 0 && $marcadosCount === $total) {
        $stmt = $pdo->prepare('SELECT id FROM tramite_completado_log WHERE usuario_id = ? AND tramite_id = ?');
        $stmt->execute([$usuarioId, $tramiteId]);
        if (!$stmt->fetch()) {
            $pdo->prepare('INSERT INTO tramite_completado_log (usuario_id, tramite_id) VALUES (?, ?)')
                ->execute([$usuarioId, $tramiteId]);

            $stmt = $pdo->prepare('SELECT horas_estimadas FROM tramites WHERE id = ?');
            $stmt->execute([$tramiteId]);
            $horas = (int) $stmt->fetchColumn();

            $pdo->prepare('UPDATE usuarios SET horas_ahorradas = horas_ahorradas + ? WHERE id = ?')
                ->execute([$horas, $usuarioId]);
        }
    }

    $stmt = $pdo->prepare('SELECT * FROM usuarios WHERE id = ?');
    $stmt->execute([$usuarioId]);
    $usuario = $stmt->fetch();

    respond(['ok' => true, 'usuario' => user_payload($pdo, $usuario)]);
}

respond(['error' => 'Método no permitido.'], 405);
