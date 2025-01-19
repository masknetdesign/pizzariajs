<?php
$password = 'admin123';
$hash = password_hash($password, PASSWORD_DEFAULT);
echo "Hash para a senha '$password': $hash\n";

// Verificar se o hash atual funciona
$current_hash = '$2y$10$8tVVZqX7BxKzVJqQsG3YWuKQz0tzn9OyqY3TXXrxeEHJXgZ4UhImG';
$verify = password_verify($password, $current_hash);
echo "\nVerificação do hash atual: " . ($verify ? "OK" : "FALHOU");
?>
