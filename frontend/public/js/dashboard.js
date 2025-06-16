// Dados mockados para demonstração
const atendimentos = [
    { 
        id: 1, 
        cliente: "João Silva", 
        data: "10/05/2024", 
        responsavel: "Carlos (Vendas)", 
        canal: "E-mail", 
        status: "concluido" 
    },
    { 
        id: 2, 
        cliente: "Maria Souza", 
        data: "09/05/2024", 
        responsavel: "Ana (Prospecção)", 
        canal: "WhatsApp", 
        status: "andamento" 
    },
    { 
        id: 3, 
        cliente: "Pedro Santos", 
        data: "08/05/2024", 
        responsavel: "Luiz (Técnico)", 
        canal: "Telefone", 
        status: "pendente" 
    },
    { 
        id: 4, 
        cliente: "Ana Oliveira", 
        data: "07/05/2024", 
        responsavel: "Carlos (Vendas)", 
        canal: "Site", 
        status: "concluido" 
    },
    { 
        id: 5, 
        cliente: "Lucas Pereira", 
        data: "06/05/2024", 
        responsavel: "Ana (Prospecção)", 
        canal: "WhatsApp", 
        status: "andamento" 
    }
];

// Preenche a tabela com dados
document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.getElementById('atendimentos-table');
    
    atendimentos.forEach(atendimento => {
        const row = document.createElement('tr');
        
        // Determina a classe de status
        let statusClass = '';
        let statusText = '';
        
        switch(atendimento.status) {
            case 'pendente':
                statusClass = 'status-pendente';
                statusText = 'Pendente';
                break;
            case 'andamento':
                statusClass = 'status-andamento';
                statusText = 'Em andamento';
                break;
            case 'concluido':
                statusClass = 'status-concluido';
                statusText = 'Concluído';
                break;
        }
        
        row.innerHTML = `
            <td>${atendimento.cliente}</td>
            <td>${atendimento.data}</td>
            <td>${atendimento.responsavel}</td>
            <td>${atendimento.canal}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <button class="action-btn" title="Visualizar"><i class="fas fa-eye"></i></button>
                <button class="action-btn" title="Editar"><i class="fas fa-edit"></i></button>
                <button class="action-btn" title="Arquivar"><i class="fas fa-archive"></i></button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Simula busca
    const searchInput = document.querySelector('.search-container input');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = document.querySelectorAll('#atendimentos-table tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
});

// Menu mobile (opcional)
document.querySelector('.menu-toggle').addEventListener('click', function() {
    document.querySelector('.sidebar').classList.toggle('active');
});

// Dados mockados de clientes
const clientes = [
    {
        id: 1,
        nome: "João Silva",
        email: "joao@empresa.com",
        telefone: "(11) 99999-9999",
        origem: "Site",
        ultimoContato: "10/05/2024",
        status: "ativo"
    },
    {
        id: 2,
        nome: "Maria Souza",
        email: "maria@empresa.com",
        telefone: "(11) 98888-8888",
        origem: "WhatsApp",
        ultimoContato: "09/05/2024",
        status: "potencial"
    },
    {
        id: 3,
        nome: "Carlos Oliveira",
        email: "carlos@empresa.com",
        telefone: "(11) 97777-7777",
        origem: "Indicação",
        ultimoContato: "08/05/2024",
        status: "inativo"
    },
    {
        id: 4,
        nome: "Ana Santos",
        email: "ana@empresa.com",
        telefone: "(11) 96666-6666",
        origem: "Evento",
        ultimoContato: "07/05/2024",
        status: "ativo"
    },
    {
        id: 5,
        nome: "Pedro Costa",
        email: "pedro@empresa.com",
        telefone: "(11) 95555-5555",
        origem: "Site",
        ultimoContato: "06/05/2024",
        status: "ativo"
    }
];

// Preenche a tabela de clientes
function carregarClientes() {
    const tableBody = document.getElementById('clientes-table');
    tableBody.innerHTML = '';
    
    clientes.forEach(cliente => {
        const row = document.createElement('tr');
        
        // Determina a classe de status
        let statusClass = '';
        let statusText = '';
        
        switch(cliente.status) {
            case 'ativo':
                statusClass = 'status-concluido';
                statusText = 'Ativo';
                break;
            case 'potencial':
                statusClass = 'status-andamento';
                statusText = 'Potencial';
                break;
            case 'inativo':
                statusClass = 'status-pendente';
                statusText = 'Inativo';
                break;
        }
        
        row.innerHTML = `
            <td><input type="checkbox"></td>
            <td>
                <div class="client-name">${cliente.nome}</div>
                <small class="client-id">ID: ${cliente.id}</small>
            </td>
            <td>
                <div>${cliente.email}</div>
                <small>${cliente.telefone}</small>
            </td>
            <td>${cliente.origem}</td>
            <td>${cliente.ultimoContato}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <button class="action-btn" title="Editar"><i class="fas fa-edit"></i></button>
                <button class="action-btn" title="Histórico"><i class="fas fa-history"></i></button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Controle do modal
function setupModal() {
    const modal = document.getElementById('modal-cliente');
    const btnNovo = document.querySelector('.btn-primary');
    const btnCancelar = document.querySelector('.btn-cancel');
    const btnFechar = document.querySelector('.close-modal');
    
    btnNovo.addEventListener('click', () => {
        modal.style.display = 'flex';
    });
    
    btnCancelar.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    btnFechar.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Fechar ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('clientes-table')) {
        carregarClientes();
        setupModal();
        
        // Busca de clientes
        const searchInput = document.querySelector('.search-container input');
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('#clientes-table tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
});