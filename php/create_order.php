<?php
require_once 'connection.php';
header('Content-Type: application/json');

try {
    // Receber dados do pedido
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        throw new Exception('Dados inválidos');
    }

    // Validar dados necessários
    if (!isset($data['user_id']) || !isset($data['items']) || empty($data['items'])) {
        throw new Exception('Dados incompletos');
    }

    $userId = $data['user_id'];
    $items = $data['items'];
    $subtotal = $data['subtotal'];
    $deliveryFee = $data['delivery_fee'];
    $total = $data['total'];

    // Iniciar transação
    $conn->begin_transaction();

    // Criar pedido
    $stmt = $conn->prepare("INSERT INTO orders (user_id, subtotal, delivery_fee, total, status) VALUES (?, ?, ?, ?, 'pending')");
    $stmt->bind_param("iddd", $userId, $subtotal, $deliveryFee, $total);
    $stmt->execute();
    
    $orderId = $conn->insert_id;

    // Inserir itens do pedido
    $stmt = $conn->prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
    
    foreach ($items as $item) {
        $stmt->bind_param("iiid", $orderId, $item['id'], $item['quantity'], $item['price']);
        $stmt->execute();
    }

    // Confirmar transação
    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Pedido criado com sucesso',
        'order_id' => $orderId
    ]);

} catch (Exception $e) {
    // Em caso de erro, reverter transação
    if (isset($conn) && $conn->ping()) {
        $conn->rollback();
    }
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

// Fechar conexão
if (isset($stmt)) {
    $stmt->close();
}
if (isset($conn)) {
    $conn->close();
}
?>
