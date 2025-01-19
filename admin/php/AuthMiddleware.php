<?php
require_once 'Admin.php';

class AuthMiddleware {
    public static function authenticate() {
        // Verificar se o token está presente no header
        $headers = getallheaders();
        if(!isset($headers['Authorization'])) {
            http_response_code(401);
            echo json_encode(array(
                'success' => false,
                'message' => 'Token não fornecido'
            ));
            exit;
        }

        // Extrair o token do header (formato: Bearer <token>)
        $token = str_replace('Bearer ', '', $headers['Authorization']);

        // Verificar o token
        $payload = Admin::verifyToken($token);
        if(!$payload) {
            http_response_code(401);
            echo json_encode(array(
                'success' => false,
                'message' => 'Token inválido ou expirado'
            ));
            exit;
        }

        // Token válido, retornar payload
        return $payload;
    }
}
