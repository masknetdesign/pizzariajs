<?php
function getConnection() {
    $host = 'localhost';
    $dbname = 'pizzaria';  // Corrigido de 'pizzariajs' para 'pizzaria'
    $username = 'root';
    $password = '';
    
    try {
        $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $conn;
    } catch(PDOException $e) {
        throw new Exception("Erro na conexão: " . $e->getMessage());
    }
}
?>
