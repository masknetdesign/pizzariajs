<?php
error_log("Iniciando teste de produtos");
require_once 'connection.php';

try {
    $conn = getConnection();
    
    // Testar a conexão
    error_log("Conexão estabelecida com sucesso");
    
    // Verificar se a tabela existe
    $stmt = $conn->query("SHOW TABLES LIKE 'products'");
    $tableExists = $stmt->rowCount() > 0;
    
    if (!$tableExists) {
        throw new Exception("Tabela 'products' não existe");
    }
    
    error_log("Tabela products existe");
    
    // Contar produtos
    $stmt = $conn->query("SELECT COUNT(*) as total FROM products");
    $count = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    error_log("Total de produtos: " . $count);
    
    // Buscar produtos
    $stmt = $conn->query("SELECT * FROM products");
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<pre>";
    print_r($products);
    echo "</pre>";
    
} catch (Exception $e) {
    error_log("Erro: " . $e->getMessage());
    echo "Erro: " . $e->getMessage();
}
?>
