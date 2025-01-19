<?php
// Desabilitar a saída de erros para o navegador
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Garantir que não há saída antes do JSON
ob_start();

require_once 'connection.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $conn = getConnection();
    
    // Buscar todos os produtos
    $query = "SELECT id, name, description, price, image, category FROM products ORDER BY category, name";
    
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Mapear produtos
    $products = array_map(function($product) {
        return [
            'id' => intval($product['id']),
            'name' => $product['name'],
            'description' => $product['description'],
            'price' => floatval($product['price']),
            'image' => $product['image'],
            'category' => $product['category']
        ];
    }, $products);
    
    // Limpar qualquer saída anterior
    ob_clean();
    
    // Retornar JSON
    echo json_encode([
        'success' => true,
        'products' => $products
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    // Limpar qualquer saída anterior
    ob_clean();
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao buscar produtos: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

// Garantir que não há mais saída após o JSON
exit();
?>
