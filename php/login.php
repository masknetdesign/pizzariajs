<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

try {
    // Verificar se é uma requisição POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método não permitido');
    }

    // Receber dados do formulário
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data) {
        throw new Exception('Dados inválidos');
    }

    // Validar campos obrigatórios
    if (empty($data['email']) || empty($data['password'])) {
        throw new Exception('Email e senha são obrigatórios');
    }

    $email = trim($conn->real_escape_string($data['email']));
    $password = $data['password'];

    // Validar email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Email inválido');
    }

    // Buscar usuário
    $stmt = $conn->prepare("SELECT id, name, email, password FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception('Email ou senha incorretos');
    }

    $user = $result->fetch_assoc();

    // Verificar senha
    if (!password_verify($password, $user['password'])) {
        throw new Exception('Email ou senha incorretos');
    }

    // Remover senha do array antes de retornar
    unset($user['password']);

    echo json_encode([
        'success' => true,
        'message' => 'Login realizado com sucesso',
        'user' => $user
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
    if (isset($conn)) {
        $conn->close();
    }
}
?>
