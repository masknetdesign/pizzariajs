<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
require_once '../../php/connection.php';

try {
    $conn = getConnection();
    
    // Verificar se a tabela existe
    $query = "SHOW TABLES LIKE 'products'";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    
    $tableExists = $stmt->rowCount() > 0;
    
    if ($tableExists) {
        // Verificar estrutura da tabela
        $query = "DESCRIBE products";
        $stmt = $conn->prepare($query);
        $stmt->execute();
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'tableExists' => true,
            'columns' => $columns
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'tableExists' => false,
            'message' => 'A tabela products não existe'
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao verificar tabela: ' . $e->getMessage()
    ]);
}
?>
