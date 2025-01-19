<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
require_once '../../php/connection.php';

try {
    if (!isset($_POST['id'])) {
        throw new Exception('ID do produto não fornecido');
    }

    $id = intval($_POST['id']);
    $name = $_POST['name'] ?? '';
    $description = $_POST['description'] ?? '';
    $price = floatval($_POST['price'] ?? 0);
    $category = $_POST['category'] ?? '';

    if (empty($name) || empty($category) || $price <= 0) {
        throw new Exception('Dados inválidos');
    }

    $conn = getConnection();
    
    // Iniciar transação
    $conn->beginTransaction();

    // Atualizar dados básicos
    $query = "UPDATE products SET 
              name = :name,
              description = :description,
              price = :price,
              category = :category
              WHERE id = :id";
              
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':description', $description);
    $stmt->bindParam(':price', $price);
    $stmt->bindParam(':category', $category);
    $stmt->execute();

    // Se houver upload de imagem
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = '../../images/products/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $fileExtension = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
        
        if (!in_array($fileExtension, $allowedExtensions)) {
            throw new Exception('Tipo de arquivo não permitido');
        }

        $fileName = uniqid() . '.' . $fileExtension;
        $uploadFile = $uploadDir . $fileName;

        if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadFile)) {
            // Atualizar caminho da imagem no banco
            $imagePath = 'images/products/' . $fileName;
            $query = "UPDATE products SET image = :image WHERE id = :id";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->bindParam(':image', $imagePath);
            $stmt->execute();
        }
    }

    // Confirmar transação
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Produto atualizado com sucesso'
    ]);
    
} catch (Exception $e) {
    if (isset($conn)) {
        $conn->rollBack();
    }
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
