<?php
require_once 'Database.php';

class Product {
    private $conn;
    private $table = 'products';

    public $id;
    public $name;
    public $price;
    public $description;
    public $category;
    public $image;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->connect();
    }

    // Listar todos os produtos
    public function read() {
        $query = 'SELECT * FROM ' . $this->table;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Ler um produto específico
    public function read_single() {
        $query = 'SELECT * FROM ' . $this->table . ' WHERE id = :id LIMIT 0,1';
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if($row) {
            $this->name = $row['name'];
            $this->price = $row['price'];
            $this->description = $row['description'];
            $this->category = $row['category'];
            $this->image = $row['image'];
            return true;
        }
        return false;
    }

    // Criar produto
    public function create() {
        $query = 'INSERT INTO ' . $this->table . ' 
            SET
                name = :name,
                price = :price,
                description = :description,
                category = :category,
                image = :image';

        $stmt = $this->conn->prepare($query);

        // Limpar dados
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->price = htmlspecialchars(strip_tags($this->price));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->category = htmlspecialchars(strip_tags($this->category));
        $this->image = htmlspecialchars(strip_tags($this->image));

        // Bind dados
        $stmt->bindParam(':name', $this->name);
        $stmt->bindParam(':price', $this->price);
        $stmt->bindParam(':description', $this->description);
        $stmt->bindParam(':category', $this->category);
        $stmt->bindParam(':image', $this->image);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Atualizar produto
    public function update() {
        $query = 'UPDATE ' . $this->table . '
            SET
                name = :name,
                price = :price,
                description = :description,
                category = :category,
                image = :image
            WHERE
                id = :id';

        $stmt = $this->conn->prepare($query);

        // Limpar dados
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->price = htmlspecialchars(strip_tags($this->price));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->category = htmlspecialchars(strip_tags($this->category));
        $this->image = htmlspecialchars(strip_tags($this->image));
        $this->id = htmlspecialchars(strip_tags($this->id));

        // Bind dados
        $stmt->bindParam(':name', $this->name);
        $stmt->bindParam(':price', $this->price);
        $stmt->bindParam(':description', $this->description);
        $stmt->bindParam(':category', $this->category);
        $stmt->bindParam(':image', $this->image);
        $stmt->bindParam(':id', $this->id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Deletar produto
    public function delete() {
        $query = 'DELETE FROM ' . $this->table . ' WHERE id = :id';
        $stmt = $this->conn->prepare($query);

        // Limpar id
        $this->id = htmlspecialchars(strip_tags($this->id));

        // Bind id
        $stmt->bindParam(':id', $this->id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }
}
