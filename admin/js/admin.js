document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupEventListeners();
});

async function loadProducts() {
    try {
        console.log('Iniciando carregamento de produtos...');
        const response = await fetch('./php/get_products.php');
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Resposta não ok:', response.status, errorText);
            throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Resposta não é JSON válido');
        }
        
        const data = await response.json();
        console.log('Dados recebidos:', data);
        
        if (data.success) {
            renderProducts(data.products);
        } else {
            throw new Error(data.message || 'Erro ao carregar produtos');
        }
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        Swal.fire({
            title: 'Erro!',
            text: 'Não foi possível carregar os produtos. ' + error.message,
            icon: 'error',
            confirmButtonColor: '#c41230'
        });
        
        // Em caso de erro, limpar a tabela e mostrar mensagem
        const tableBody = document.querySelector('#productsTable tbody');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">
                        <div class="alert alert-danger">
                            Erro ao carregar produtos. Por favor, tente novamente.
                        </div>
                    </td>
                </tr>
            `;
        }
    }
}

function renderProducts(products) {
    console.log('Renderizando produtos:', products);
    const tableBody = document.querySelector('#productsTable tbody');
    if (!tableBody) return;

    if (!Array.isArray(products) || products.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    Nenhum produto encontrado
                </td>
            </tr>
        `;
        return;
    }

    const categoryLabels = {
        'pizza': 'Pizza',
        'bebida': 'Bebida',
        'sobremesa': 'Sobremesa'
    };

    tableBody.innerHTML = products.map(product => {
        // Validar produto
        if (!product || typeof product !== 'object') {
            console.error('Produto inválido:', product);
            return '';
        }

        // Garantir valores padrão seguros
        const safeProduct = {
            id: product.id || 0,
            name: product.name || 'Sem nome',
            category: product.category || 'outro',
            description: product.description || '-',
            price: parseFloat(product.price || 0),
            image: product.image || 'images/default.jpg'
        };

        // Ajustar caminho da imagem
        let imageUrl = safeProduct.image;
        if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
            imageUrl = '../' + imageUrl;
        }

        return `
        <tr data-id="${safeProduct.id}">
            <td>
                <img src="${imageUrl}" 
                     alt="${safeProduct.name}" 
                     class="product-thumbnail" 
                     onerror="this.onerror=null; this.src='../images/default.jpg';">
            </td>
            <td>${safeProduct.name}</td>
            <td>${categoryLabels[safeProduct.category] || safeProduct.category}</td>
            <td>${safeProduct.description}</td>
            <td>R$ ${safeProduct.price.toFixed(2)}</td>
            <td>
                <div class="status-badge active">
                    Ativo
                </div>
            </td>
            <td>
                <div class="action-buttons">
                    <button onclick="editProduct(${safeProduct.id})" class="btn-edit" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteProduct(${safeProduct.id})" class="btn-delete" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
    }).join('');
}

function setupEventListeners() {
    const addButton = document.getElementById('addProductBtn');
    if (addButton) {
        addButton.addEventListener('click', () => {
            window.location.href = 'add-product.html';
        });
    }

    const searchInput = document.getElementById('searchProduct');
    if (searchInput) {
        let timeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                const searchTerm = e.target.value.toLowerCase();
                filterProducts(searchTerm);
            }, 300);
        });
    }
}

function filterProducts(searchTerm) {
    const rows = document.querySelectorAll('#productsTable tbody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

async function editProduct(id) {
    window.location.href = `edit-product.html?id=${id}`;
}

async function deleteProduct(id) {
    try {
        const result = await Swal.fire({
            title: 'Confirmar exclusão',
            text: 'Tem certeza que deseja excluir este produto?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim, excluir',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#333'
        });

        if (result.isConfirmed) {
            const response = await fetch('./php/delete_product.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            });

            const data = await response.json();

            if (data.success) {
                Swal.fire({
                    title: 'Sucesso!',
                    text: 'Produto excluído com sucesso',
                    icon: 'success',
                    confirmButtonColor: '#28a745'
                });
                loadProducts(); // Recarregar a lista
            } else {
                throw new Error(data.message);
            }
        }
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        Swal.fire({
            title: 'Erro!',
            text: 'Não foi possível excluir o produto',
            icon: 'error',
            confirmButtonColor: '#c41230'
        });
    }
}
