<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once '../../php/connection.php';

header('Content-Type: application/json; charset=utf-8');

try {
    // Validar campos obrigatórios
    $requiredFields = ['name', 'category', 'description', 'price'];
    foreach ($requiredFields as $field) {
        if (!isset($_POST[$field]) || empty($_POST[$field])) {
            throw new Exception("O campo {$field} é obrigatório");
        }
    }
    
    // Validar e processar imagem
    $imagePath = null;
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['image'];
        
        // Validar tipo
        $allowedTypes = ['image/jpeg', 'image/png'];
        if (!in_array($file['type'], $allowedTypes)) {
            throw new Exception('A imagem deve ser JPG ou PNG');
        }
        
        // Validar tamanho (2MB)
        if ($file['size'] > 2 * 1024 * 1024) {
            throw new Exception('A imagem deve ter no máximo 2MB');
        }
        
        // Criar diretório se não existir
        $uploadDir = '../../images/' . $_POST['category'] . 's/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        // Gerar nome único
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $fileName = uniqid() . '.' . $extension;
        $fullPath = $uploadDir . $fileName;
        
        // Mover arquivo
        if (!move_uploaded_file($file['tmp_name'], $fullPath)) {
            throw new Exception('Erro ao salvar imagem');
        }
        
        // Caminho relativo para o banco de dados
        $imagePath = 'images/' . $_POST['category'] . 's/' . $fileName;
        
        // Log para debug
        error_log("Imagem salva em: " . $fullPath);
        error_log("Caminho para o banco: " . $imagePath);
    }
    
    // Conectar ao banco
    $conn = getConnection();
    
    // Preparar query
    $query = "INSERT INTO products (name, category, description, price, image) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($query);
    
    // Executar query
    $stmt->execute([
        $_POST['name'],
        $_POST['category'],
        $_POST['description'],
        floatval($_POST['price']),
        $imagePath
    ]);
    
    // Log do produto inserido
    error_log("Produto inserido: " . json_encode([
        'name' => $_POST['name'],
        'category' => $_POST['category'],
        'description' => $_POST['description'],
        'price' => $_POST['price'],
        'image' => $imagePath
    ]));
    
    // Retornar sucesso
    echo json_encode([
        'success' => true,
        'message' => 'Produto adicionado com sucesso',
        'product' => [
            'id' => $conn->lastInsertId(),
            'name' => $_POST['name'],
            'category' => $_POST['category'],
            'description' => $_POST['description'],
            'price' => floatval($_POST['price']),
            'image' => $imagePath
        ]
    ]);

} catch (Exception $e) {
    error_log("Erro ao adicionar produto: " . $e->getMessage());
    
    // Se houver erro e uma imagem foi salva, tentar removê-la
    if (isset($fullPath) && file_exists($fullPath)) {
        unlink($fullPath);
    }
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao adicionar produto: ' . $e->getMessage()
    ]);
}
?>
