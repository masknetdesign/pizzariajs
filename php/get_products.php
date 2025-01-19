<?php
require_once 'connection.php';
header('Content-Type: application/json');

try {
    // Buscar todos os produtos
    $stmt = $conn->prepare("
        SELECT id, name, description, price, image, category 
        FROM products 
        ORDER BY 
            CASE 
                WHEN category = 'pizza' THEN 1
                WHEN category = 'bebida' THEN 2
                WHEN category = 'sobremesa' THEN 3
            END,
            name
    ");
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $products = [];
    while ($row = $result->fetch_assoc()) {
        $products[] = [
            'id' => intval($row['id']),
            'name' => $row['name'],
            'description' => $row['description'],
            'price' => floatval($row['price']),
            'image' => $row['image'],
            'category' => $row['category']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'products' => $products
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao buscar produtos: ' . $e->getMessage()
    ]);
}

// Fechar conexões
if (isset($stmt)) {
    $stmt->close();
}
if (isset($conn)) {
    $conn->close();
}
?>
