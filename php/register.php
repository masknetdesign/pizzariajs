<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

// Ativar exibição de erros
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Criar arquivo de log
$logFile = __DIR__ . '/register_log.txt';
function writeLog($message) {
    global $logFile;
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($logFile, "[$timestamp] $message\n", FILE_APPEND);
}

try {
    writeLog("Iniciando processo de registro");

    // Verificar se é uma requisição POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        writeLog("Método não permitido: " . $_SERVER['REQUEST_METHOD']);
        throw new Exception('Método não permitido');
    }

    // Receber dados do formulário
    $rawData = file_get_contents('php://input');
    writeLog("Dados recebidos: " . $rawData);
    
    $data = json_decode($rawData, true);

    if (!$data) {
        writeLog("Erro ao decodificar JSON: " . json_last_error_msg());
        throw new Exception('Dados inválidos');
    }

    // Validar campos obrigatórios
    if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
        writeLog("Campos obrigatórios faltando");
        throw new Exception('Todos os campos são obrigatórios');
    }

    $name = trim($conn->real_escape_string($data['name']));
    $email = trim($conn->real_escape_string($data['email']));
    $password = $data['password'];

    writeLog("Dados processados - Nome: $name, Email: $email");

    // Validar nome (mínimo 3 caracteres)
    if (strlen($name) < 3) {
        writeLog("Nome inválido: menos que 3 caracteres");
        throw new Exception('O nome deve ter pelo menos 3 caracteres');
    }

    // Validar email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        writeLog("Email inválido: $email");
        throw new Exception('Email inválido');
    }

    // Validar senha (mínimo 6 caracteres)
    if (strlen($password) < 6) {
        writeLog("Senha inválida: menos que 6 caracteres");
        throw new Exception('A senha deve ter pelo menos 6 caracteres');
    }

    // Verificar se o email já existe
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    if (!$stmt) {
        writeLog("Erro ao preparar consulta de verificação de email: " . $conn->error);
        throw new Exception('Erro ao verificar email');
    }
    
    $stmt->bind_param("s", $email);
    if (!$stmt->execute()) {
        writeLog("Erro ao executar consulta de verificação de email: " . $stmt->error);
        throw new Exception('Erro ao verificar email');
    }
    
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        writeLog("Email já cadastrado: $email");
        throw new Exception('Este email já está cadastrado');
    }
    $stmt->close();

    // Hash da senha
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    writeLog("Senha hash gerada com sucesso");

    // Inserir usuário
    $stmt = $conn->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
    if (!$stmt) {
        writeLog("Erro ao preparar query de inserção: " . $conn->error);
        throw new Exception('Erro ao preparar cadastro');
    }

    $stmt->bind_param("sss", $name, $email, $passwordHash);

    if (!$stmt->execute()) {
        writeLog("Erro ao executar inserção: " . $stmt->error);
        throw new Exception('Erro ao cadastrar usuário: ' . $conn->error);
    }

    $userId = $conn->insert_id;
    writeLog("Usuário inserido com sucesso. ID: $userId");
    
    // Criar array com dados do usuário (exceto a senha)
    $user = [
        'id' => $userId,
        'name' => $name,
        'email' => $email
    ];
    
    writeLog("Registro concluído com sucesso");
    echo json_encode([
        'success' => true,
        'message' => 'Cadastro realizado com sucesso',
        'user' => $user
    ]);

} catch (Exception $e) {
    writeLog("ERRO: " . $e->getMessage());
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
