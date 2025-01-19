<?php
header('Content-Type: application/json');
require_once '../../php/connection.php';

try {
    $conn = getConnection();
    echo json_encode([
        'success' => true,
        'message' => 'Conexão estabelecida com sucesso!'
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro na conexão: ' . $e->getMessage()
    ]);
}
?>
