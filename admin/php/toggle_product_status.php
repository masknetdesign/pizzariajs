<?php
require_once '../../php/connection.php';

try {
    // Obter dados do request
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['id']) || !isset($data['active'])) {
        throw new Exception('Dados incompletos');
    }
    
    $conn = getConnection();
    
    $query = "UPDATE products SET active = :active WHERE id = :id";
    $stmt = $conn->prepare($query);
    
    $stmt->execute([
        ':id' => $data['id'],
        ':active' => $data['active'] ? 1 : 0
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Status atualizado com sucesso'
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao atualizar status: ' . $e->getMessage()
    ]);
}
?>
