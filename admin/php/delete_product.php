<?php
require_once '../../php/connection.php';

try {
    // Obter dados do request
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['id'])) {
        throw new Exception('ID do produto não fornecido');
    }
    
    $conn = getConnection();
    
    // Primeiro, vamos buscar a imagem do produto para excluí-la
    $query = "SELECT image FROM products WHERE id = :id";
    $stmt = $conn->prepare($query);
    $stmt->execute([':id' => $data['id']]);
    $product = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($product && $product['image']) {
        $imagePath = '../../' . $product['image'];
        if (file_exists($imagePath)) {
            unlink($imagePath);
        }
    }
    
    // Agora excluir o produto
    $query = "DELETE FROM products WHERE id = :id";
    $stmt = $conn->prepare($query);
    $stmt->execute([':id' => $data['id']]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Produto excluído com sucesso'
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao excluir produto: ' . $e->getMessage()
    ]);
}
?>
