// Função para obter o token de autenticação
function getAuthToken() {
    return localStorage.getItem('adminToken');
}

// Função para adicionar headers de autenticação
function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
    };
}

// Função para carregar produtos
async function loadProducts() {
    try {
        const response = await fetch('api/products/', {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Erro ao carregar produtos');
        const products = await response.json();
        renderProducts(Array.isArray(products) ? products : []);
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        if (error.message.includes('Token')) {
            // Redirecionar para login se o token for inválido
            window.location.href = 'login.html';
        } else {
            alert('Erro ao carregar produtos');
        }
    }
}

// Função para renderizar produtos na tabela
function renderProducts(products) {
    const tbody = document.getElementById('products-list');
    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">Nenhum produto encontrado</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.id}</td>
            <td><img src="${product.image}" alt="${product.name}" class="product-image"></td>
            <td>${product.name}</td>
            <td>R$ ${parseFloat(product.price).toFixed(2)}</td>
            <td>${product.category}</td>
            <td class="action-buttons">
                <button onclick="editProduct(${product.id})" class="btn-edit">
                    <i class="fas fa-edit"></i>
                    Editar
                </button>
                <button onclick="deleteProduct(${product.id})" class="btn-delete">
                    <i class="fas fa-trash"></i>
                    Excluir
                </button>
            </td>
        </tr>
    `).join('');
}

// Função para abrir o modal
function openModal(title = 'Adicionar Produto') {
    const modal = document.getElementById('product-modal');
    const modalTitle = document.getElementById('modal-title');
    modalTitle.textContent = title;
    modal.style.display = 'block';
}

// Função para fechar o modal
function closeModal() {
    const modal = document.getElementById('product-modal');
    modal.style.display = 'none';
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
}

// Função para editar produto
async function editProduct(id) {
    try {
        const response = await fetch(`api/products/?id=${id}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Erro ao carregar produto');
        const product = await response.json();
        
        // Preencher o formulário
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-description').value = product.description;
        document.getElementById('product-image').value = product.image;
        
        openModal('Editar Produto');
    } catch (error) {
        console.error('Erro ao carregar produto:', error);
        alert('Erro ao carregar dados do produto');
    }
}

// Função para deletar produto
async function deleteProduct(id) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        try {
            const response = await fetch(`api/products/?id=${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            
            if (!response.ok) throw new Error('Erro ao deletar produto');
            
            const data = await response.json();
            alert(data.message);
            loadProducts();
        } catch (error) {
            console.error('Erro ao deletar produto:', error);
            alert('Erro ao deletar produto');
        }
    }
}

// Função para salvar produto
async function saveProduct(formData) {
    const productData = {
        name: formData.get('product-name'),
        price: formData.get('product-price'),
        description: formData.get('product-description'),
        category: formData.get('product-category'),
        image: formData.get('product-image')
    };

    const id = formData.get('product-id');
    const method = id ? 'PUT' : 'POST';
    const url = id ? `api/products/?id=${id}` : 'api/products/';

    try {
        const response = await fetch(url, {
            method,
            headers: getAuthHeaders(),
            body: JSON.stringify(productData)
        });

        if (!response.ok) throw new Error('Erro ao salvar produto');
        
        const data = await response.json();
        alert(data.message);
        closeModal();
        loadProducts();
    } catch (error) {
        console.error('Erro ao salvar produto:', error);
        alert('Erro ao salvar produto');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando gerenciamento de produtos');
    
    // Verificar autenticação
    if (!getAuthToken()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Carregar produtos
    loadProducts();

    // Setup do botão de adicionar produto
    const addButton = document.getElementById('add-product-btn');
    if (addButton) {
        addButton.addEventListener('click', () => openModal());
    }

    // Setup do botão de fechar modal
    const closeButton = document.querySelector('.close');
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }

    // Setup do formulário de produto
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(productForm);
            saveProduct(formData);
        });
    }

    // Fechar modal quando clicar fora
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('product-modal');
        if (e.target === modal) {
            closeModal();
        }
    });
});
