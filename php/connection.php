<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "pizzaria";

try {
    $conn = new mysqli($servername, $username, $password, $dbname);
    
    if ($conn->connect_error) {
        throw new Exception("Conexão falhou: " . $conn->connect_error);
    }
    
    // Configurar charset
    $conn->set_charset("utf8mb4");
    
} catch (Exception $e) {
    die("Erro de conexão: " . $e->getMessage());
}
?>
