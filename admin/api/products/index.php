<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

require_once '../../php/Product.php';
require_once '../../php/AuthMiddleware.php';

// Autenticar todas as requisições
$admin = AuthMiddleware::authenticate();

$product = new Product();

// Determinar o método HTTP
$method = $_SERVER['REQUEST_METHOD'];

// Log para debug
error_log('Método: ' . $method);
error_log('Admin: ' . print_r($admin, true));

switch($method) {
    case 'GET':
        if(isset($_GET['id'])) {
            // Ler um produto específico
            $product->id = $_GET['id'];
            if($product->read_single()) {
                $product_arr = array(
                    'id' => $product->id,
                    'name' => $product->name,
                    'price' => $product->price,
                    'description' => $product->description,
                    'category' => $product->category,
                    'image' => $product->image
                );
                echo json_encode($product_arr);
            } else {
                echo json_encode(array('message' => 'Produto não encontrado'));
            }
        } else {
            // Ler todos os produtos
            $result = $product->read();
            $num = $result->rowCount();

            if($num > 0) {
                $products_arr = array();

                while($row = $result->fetch(PDO::FETCH_ASSOC)) {
                    extract($row);
                    $product_item = array(
                        'id' => $id,
                        'name' => $name,
                        'price' => $price,
                        'description' => $description,
                        'category' => $category,
                        'image' => $image
                    );
                    array_push($products_arr, $product_item);
                }
                echo json_encode($products_arr);
            } else {
                echo json_encode(array('message' => 'Nenhum produto encontrado'));
            }
        }
        break;

    case 'POST':
        // Criar produto
        $data = json_decode(file_get_contents("php://input"));
        error_log('Dados recebidos POST: ' . print_r($data, true));

        $product->name = $data->name;
        $product->price = $data->price;
        $product->description = $data->description;
        $product->category = $data->category;
        $product->image = $data->image;

        if($product->create()) {
            echo json_encode(array('message' => 'Produto criado com sucesso'));
        } else {
            http_response_code(500);
            echo json_encode(array('message' => 'Erro ao criar produto'));
        }
        break;

    case 'PUT':
        // Atualizar produto
        $data = json_decode(file_get_contents("php://input"));
        error_log('Dados recebidos PUT: ' . print_r($data, true));

        $product->id = isset($_GET['id']) ? $_GET['id'] : die();
        $product->name = $data->name;
        $product->price = $data->price;
        $product->description = $data->description;
        $product->category = $data->category;
        $product->image = $data->image;

        if($product->update()) {
            echo json_encode(array('message' => 'Produto atualizado com sucesso'));
        } else {
            http_response_code(500);
            echo json_encode(array('message' => 'Erro ao atualizar produto'));
        }
        break;

    case 'DELETE':
        // Deletar produto
        $product->id = isset($_GET['id']) ? $_GET['id'] : die();

        if($product->delete()) {
            echo json_encode(array('message' => 'Produto deletado com sucesso'));
        } else {
            http_response_code(500);
            echo json_encode(array('message' => 'Erro ao deletar produto'));
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(array('message' => 'Método não permitido'));
}
