<?php
// Ativar exibição de erros para debug
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Log para arquivo
error_log("Iniciando get_products.php");

// Definir headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Incluir arquivo de conexão
require_once '../../php/connection.php';

try {
    error_log("Tentando conectar ao banco");
    $conn = getConnection();
    error_log("Conexão bem sucedida");
    
    // Query para buscar todos os produtos
    $query = "SELECT * FROM products ORDER BY id DESC";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    error_log("Produtos encontrados: " . count($products));
    
    if (empty($products)) {
        error_log("Nenhum produto encontrado");
        echo json_encode([
            'success' => true,
            'products' => [],
            'message' => 'Nenhum produto encontrado'
        ]);
        exit;
    }
    
    // Debug dos produtos
    error_log("Produtos encontrados:");
    foreach ($products as $product) {
        error_log(json_encode($product));
    }
    
    // Formatar produtos de acordo com a estrutura da tabela
    $formattedProducts = array_map(function($product) {
        return [
            'id' => intval($product['id']),
            'name' => $product['name'],
            'description' => $product['description'] ?? '',
            'price' => floatval($product['price']),
            'type' => $product['category'], // usando o campo category como type
            'image' => $product['image'] ? $product['image'] : 'images/default.jpg',
            'created_at' => $product['created_at'],
            'active' => true // como não temos o campo active, definimos como true por padrão
        ];
    }, $products);
    
    $response = [
        'success' => true,
        'products' => $formattedProducts
    ];
    
    error_log("Enviando resposta: " . json_encode($response));
    echo json_encode($response);
    
} catch (Exception $e) {
    error_log("Erro em get_products.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao buscar produtos: ' . $e->getMessage(),
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
?>
