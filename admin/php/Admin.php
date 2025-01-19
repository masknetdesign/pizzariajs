<?php
require_once 'Database.php';

class Admin {
    private $conn;
    private $table = 'admins';

    public $id;
    public $username;
    public $password;
    public $name;
    public $email;
    public $last_login;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->connect();
    }

    // Verificar login
    public function login($username, $password) {
        $query = 'SELECT id, username, password, name, email FROM ' . $this->table . ' 
                  WHERE username = :username AND active = TRUE 
                  LIMIT 0,1';

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':username', $username);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if(password_verify($password, $row['password'])) {
                // Atualizar último login
                $this->updateLastLogin($row['id']);
                
                // Guardar dados do admin
                $this->id = $row['id'];
                $this->username = $row['username'];
                $this->name = $row['name'];
                $this->email = $row['email'];
                
                return true;
            }
        }
        
        return false;
    }

    // Atualizar último login
    private function updateLastLogin($id) {
        $query = 'UPDATE ' . $this->table . ' 
                  SET last_login = CURRENT_TIMESTAMP 
                  WHERE id = :id';
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
    }

    // Gerar token JWT
    public function generateToken() {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode([
            'id' => $this->id,
            'username' => $this->username,
            'name' => $this->name,
            'email' => $this->email,
            'exp' => time() + (60 * 60) // 1 hora de expiração
        ]);

        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));

        $secret = 'sua_chave_secreta_aqui'; // Em produção, use uma chave segura e armazene em variável de ambiente
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    // Verificar token JWT
    public static function verifyToken($token) {
        try {
            $tokenParts = explode('.', $token);
            if(count($tokenParts) != 3) return false;

            $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[1])));
            
            if($payload && isset($payload->exp) && $payload->exp > time()) {
                return $payload;
            }
            
            return false;
        } catch(Exception $e) {
            return false;
        }
    }

    // Alterar senha
    public function changePassword($currentPassword, $newPassword) {
        // Verificar senha atual
        $query = 'SELECT password FROM ' . $this->table . ' WHERE id = :id LIMIT 0,1';
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id);
        $stmt->execute();
        
        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if(password_verify($currentPassword, $row['password'])) {
                // Atualizar para nova senha
                $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
                
                $query = 'UPDATE ' . $this->table . ' 
                          SET password = :password 
                          WHERE id = :id';
                
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(':password', $hashedPassword);
                $stmt->bindParam(':id', $this->id);
                
                return $stmt->execute();
            }
        }
        
        return false;
    }
}
