<?php

function json_input(): array {
    $data = json_decode(file_get_contents('php://input'), true);
    return is_array($data) ? $data : [];
}

function respond($data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

function current_user_id(): ?int {
    return $_SESSION['usuario_id'] ?? null;
}

function require_login(): int {
    $id = current_user_id();
    if (!$id) {
        respond(['error' => 'Debes iniciar sesión.'], 401);
    }
    return $id;
}

// Calcula horas, trámites activos y completados de un usuario a partir del progreso real en BD.
function stats_for_user(PDO $pdo, int $usuarioId): array {
    $stmt = $pdo->prepare('SELECT horas_ahorradas FROM usuarios WHERE id = ?');
    $stmt->execute([$usuarioId]);
    $horas = (int) ($stmt->fetchColumn() ?: 0);

    $stmtCompletados = $pdo->prepare('SELECT COUNT(*) FROM tramite_completado_log WHERE usuario_id = ?');
    $stmtCompletados->execute([$usuarioId]);
    $completados = (int) $stmtCompletados->fetchColumn();

    // Activos: trámites con al menos un ítem marcado que todavía no están en el log de completados.
    $stmtActivos = $pdo->prepare('
        SELECT COUNT(DISTINCT ci.tramite_id)
        FROM checklist_progreso cp
        JOIN checklist_items ci ON ci.id = cp.checklist_item_id
        WHERE cp.usuario_id = ?
          AND ci.tramite_id NOT IN (
            SELECT tramite_id FROM tramite_completado_log WHERE usuario_id = ?
          )
    ');
    $stmtActivos->execute([$usuarioId, $usuarioId]);
    $activos = (int) $stmtActivos->fetchColumn();

    return ['horas' => $horas, 'activos' => $activos, 'completados' => $completados];
}

function user_payload(PDO $pdo, array $usuario): array {
    return [
        'id' => (int) $usuario['id'],
        'nombre' => $usuario['nombre'],
        'email' => $usuario['email'],
        'estadisticas' => stats_for_user($pdo, (int) $usuario['id']),
    ];
}
