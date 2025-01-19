<?php
require_once 'connection.php';

try {
    // Ler o arquivo SQL
    $sql = file_get_contents(__DIR__ . '/../sql/insert_products.sql');
    
    // Executar as queries
    if ($conn->multi_query($sql)) {
        do {
            // Consumir os resultados
            if ($result = $conn->store_result()) {
                $result->free();
            }
        } while ($conn->next_result());
    }
    
    echo "Produtos inseridos com sucesso!";
    
} catch (Exception $e) {
    echo "Erro ao inserir produtos: " . $e->getMessage();
}

// Fechar conexão
if (isset($conn)) {
    $conn->close();
}
?>
