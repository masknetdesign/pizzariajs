<?php
// Ativar exibição de erros
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Configurações do banco de dados
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'pizzaria');  // Nome correto do banco de dados

// Criar conexão
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Verificar conexão
if ($conn->connect_error) {
    die(json_encode([
        'success' => false,
        'error' => 'Falha na conexão com o banco de dados: ' . $conn->connect_error
    ]));
}

// Definir charset para utf8
if (!$conn->set_charset("utf8")) {
    die(json_encode([
        'success' => false,
        'error' => 'Erro ao configurar charset: ' . $conn->error
    ]));
}
?>
