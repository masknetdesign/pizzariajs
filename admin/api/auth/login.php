<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Ativar exibição de erros
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Log para debug
error_log('Recebendo requisição de login');

try {
    // Conectar ao banco
    $conn = new PDO('mysql:host=localhost;dbname=pizzaria', 'root', '');
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Receber dados do POST
    $rawData = file_get_contents("php://input");
    error_log('Dados recebidos: ' . $rawData);
    
    $data = json_decode($rawData);
    
    if (!$data || !isset($data->username) || !isset($data->password)) {
        throw new Exception('Dados incompletos');
    }

    // Buscar usuário
    $stmt = $conn->prepare('SELECT * FROM admins WHERE username = ?');
    $stmt->execute([$data->username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    error_log('Usuário encontrado: ' . ($user ? 'sim' : 'não'));
    
    // Verificar senha
    if ($user && password_verify($data->password, $user['password'])) {
        // Login bem sucedido
        error_log('Login bem sucedido para: ' . $data->username);
        
        $token = bin2hex(random_bytes(32)); // Token simples para exemplo
        
        echo json_encode([
            'success' => true,
            'token' => $token,
            'user' => [
                'name' => $user['name'],
                'email' => $user['email']
            ],
            'message' => 'Login realizado com sucesso'
        ]);
    } else {
        // Login falhou
        error_log('Login falhou para: ' . $data->username);
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Usuário ou senha inválidos'
        ]);
    }
} catch (Exception $e) {
    error_log('Erro no login: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro: ' . $e->getMessage()
    ]);
}
