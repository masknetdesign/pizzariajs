<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once 'connection.php';

header('Content-Type: application/json; charset=utf-8');

try {
    // Validar ID
    if (!isset($_GET['id']) || empty($_GET['id'])) {
        throw new Exception('ID do produto não especificado');
    }
    
    $id = intval($_GET['id']);
    
    // Conectar ao banco
    $conn = getConnection();
    
    // Buscar produto
    $query = "SELECT * FROM products WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->execute([$id]);
    
    $product = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$product) {
        throw new Exception('Produto não encontrado');
    }
    
    // Retornar produto
    echo json_encode([
        'success' => true,
        'product' => $product
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
