USE pizzaria;

-- Remover chave estrangeira
ALTER TABLE order_items DROP FOREIGN KEY order_items_ibfk_2;

-- Limpar produtos existentes
TRUNCATE TABLE products;

-- Inserir pizzas tradicionais
INSERT INTO products (name, description, price, category, image) VALUES
('Pizza Margherita', 'Molho de tomate, mussarela, manjericão fresco', 45.90, 'pizza', 'images/pizzas/margherita.jpg'),
('Pizza Calabresa', 'Molho de tomate, calabresa, cebola, mussarela', 49.90, 'pizza', 'images/pizzas/calabresa.jpg'),
('Pizza Portuguesa', 'Molho de tomate, presunto, ovos, cebola, azeitona, mussarela', 52.90, 'pizza', 'images/pizzas/portuguesa.jpg'),
('Pizza Quatro Queijos', 'Molho de tomate, mussarela, parmesão, gorgonzola, catupiry', 54.90, 'pizza', 'images/pizzas/quatro-queijos.jpg'),
('Pizza Frango com Catupiry', 'Molho de tomate, frango desfiado, catupiry, milho, mussarela', 51.90, 'pizza', 'images/pizzas/frango-catupiry.jpg'),
('Pizza Napolitana', 'Molho de tomate, mussarela, tomate fatiado, parmesão, manjericão', 48.90, 'pizza', 'images/pizzas/napolitana.jpg');

-- Inserir bebidas
INSERT INTO products (name, description, price, category, image) VALUES
('Coca-Cola 2L', 'Refrigerante Coca-Cola 2 litros', 12.90, 'bebida', 'images/bebidas/coca.jpg'),
('Guaraná Antarctica 2L', 'Refrigerante Guaraná Antarctica 2 litros', 10.90, 'bebida', 'images/bebidas/guarana.jpg'),
('Suco de Laranja 1L', 'Suco natural de laranja', 14.90, 'bebida', 'images/bebidas/suco-laranja.jpg'),
('Água Mineral 500ml', 'Água mineral sem gás', 4.90, 'bebida', 'images/bebidas/agua.jpg'),
('Cerveja Heineken 330ml', 'Cerveja Heineken Long Neck', 8.90, 'bebida', 'images/bebidas/heineken.jpg'),
('Fanta Laranja 2L', 'Refrigerante Fanta Laranja 2 litros', 10.90, 'bebida', 'images/bebidas/fanta.jpg');

-- Inserir sobremesas
INSERT INTO products (name, description, price, category, image) VALUES
('Pudim', 'Pudim de leite condensado tradicional', 15.90, 'sobremesa', 'images/sobremesas/pudim.jpg'),
('Mousse de Chocolate', 'Mousse de chocolate meio amargo', 13.90, 'sobremesa', 'images/sobremesas/mousse-chocolate.jpg'),
('Sorvete de Creme', 'Sorvete de creme com calda de chocolate', 12.90, 'sobremesa', 'images/sobremesas/sorvete.jpg'),
('Petit Gateau', 'Bolo quente de chocolate com sorvete de creme', 18.90, 'sobremesa', 'images/sobremesas/petit-gateau.jpg'),
('Cheesecake', 'Cheesecake com calda de frutas vermelhas', 16.90, 'sobremesa', 'images/sobremesas/cheesecake.jpg'),
('Brownie', 'Brownie de chocolate com nozes', 14.90, 'sobremesa', 'images/sobremesas/brownie.jpg');

-- Recriar chave estrangeira
ALTER TABLE order_items
ADD CONSTRAINT order_items_ibfk_2 
FOREIGN KEY (product_id) REFERENCES products(id);
