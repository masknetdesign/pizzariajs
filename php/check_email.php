<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

// Verificar se é uma requisição POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit;
}

// Receber dados do formulário
$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['email'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Email não fornecido']);
    exit;
}

$email = $conn->real_escape_string($data['email']);

// Verificar se o email é válido
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email inválido']);
    exit;
}

// Verificar se o email já existe
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

$exists = $result->num_rows > 0;

echo json_encode([
    'exists' => $exists,
    'message' => $exists ? 'Email já cadastrado' : 'Email disponível para cadastro'
]);

$stmt->close();
$conn->close();
?>
