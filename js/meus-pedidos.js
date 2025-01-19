// Função para formatar data
function formatDate(dateString) {
    const options = { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
}

// Função para obter classe CSS do status
function getStatusClass(status) {
    const statusClasses = {
        'pending': 'status-pending',
        'preparing': 'status-preparing',
        'delivering': 'status-delivering',
        'completed': 'status-completed',
        'cancelled': 'status-cancelled'
    };
    return statusClasses[status] || 'status-pending';
}

// Função para traduzir status
function translateStatus(status) {
    const statusTranslations = {
        'pending': 'Pendente',
        'preparing': 'Preparando',
        'delivering': 'Em Entrega',
        'completed': 'Entregue',
        'cancelled': 'Cancelado'
    };
    return statusTranslations[status] || 'Pendente';
}

// Função para criar card de pedido
function createOrderCard(order, index) {
    const orderItems = order.items.map(item => `
        <div class="order-item">
            <span class="item-name">${item.name}</span>
            <span class="item-quantity">x${item.quantity}</span>
            <span class="item-price">${formatPrice(item.price * item.quantity)}</span>
        </div>
    `).join('');

    return `
        <div class="order-card">
            <div class="order-header">
                <span class="order-number">Pedido #${index + 1}</span>
                <span class="order-date">${formatDate(order.date)}</span>
                <span class="order-status ${getStatusClass(order.status)}">
                    ${translateStatus(order.status)}
                </span>
            </div>
            
            <div class="order-items">
                ${orderItems}
            </div>
            
            <div class="order-footer">
                <span class="order-total">Total: ${formatPrice(order.total)}</span>
                <button class="reorder-btn" onclick="reorder(${index})">
                    Pedir Novamente
                </button>
            </div>
        </div>
    `;
}

// Verificar se o usuário está logado
function checkAuth() {
    const userData = localStorage.getItem('userData');
    if (!userData) {
        window.location.href = 'login.html?redirect=meus-pedidos.html';
        return false;
    }
    return true;
}

// Carregar pedidos do usuário
async function loadOrders() {
    if (!checkAuth()) return;

    const userData = JSON.parse(localStorage.getItem('userData'));
    const ordersList = document.getElementById('orders-list');
    const noOrdersMessage = document.getElementById('no-orders-message');

    try {
        const response = await fetch('php/get_orders.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userData.id
            })
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar pedidos');
        }

        const orders = await response.json();

        if (orders.length === 0) {
            ordersList.style.display = 'none';
            noOrdersMessage.style.display = 'block';
            return;
        }

        ordersList.style.display = 'block';
        noOrdersMessage.style.display = 'none';

        ordersList.innerHTML = orders.map(order => {
            const items = JSON.parse(order.items);
            const itemsHtml = items.map(item => `
                <div class="order-item">
                    <div class="item-details">
                        <span class="item-quantity">${item.quantity}x</span>
                        <span class="item-name">${item.name}</span>
                    </div>
                    <span class="item-price">R$ ${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `).join('');

            return `
                <div class="order-card">
                    <div class="order-header">
                        <span class="order-number">Pedido #${order.id}</span>
                        <span class="order-date">${new Date(order.created_at).toLocaleDateString()}</span>
                        <span class="order-status status-${order.status.toLowerCase()}">${getStatusText(order.status)}</span>
                    </div>
                    <div class="order-items">
                        ${itemsHtml}
                    </div>
                    <div class="order-total">
                        <span class="total-label">Total</span>
                        <span class="total-value">R$ ${parseFloat(order.total).toFixed(2)}</span>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Erro:', error);
        ordersList.innerHTML = '<p class="error-message">Erro ao carregar pedidos. Por favor, tente novamente mais tarde.</p>';
    }
}

function getStatusText(status) {
    const statusMap = {
        'PENDING': 'Pendente',
        'PREPARING': 'Preparando',
        'DELIVERING': 'Em Entrega',
        'COMPLETED': 'Entregue',
        'CANCELLED': 'Cancelado'
    };
    return statusMap[status] || status;
}

// Carregar pedidos quando a página carregar
document.addEventListener('DOMContentLoaded', loadOrders);
