// Constantes para URLs da API
const API_BASE_URL = `http://localhost:3010/api`;

// Referências dos elementos do DOM
const sidebar = document.querySelector('.sidebar');
const menuToggleBtn = document.querySelector('.menu-toggle-btn');
const closeSidebarBtn = document.getElementById('close-sidebar-btn');
const logoutBtn = document.getElementById('logout-btn');

// IDs para os contadores
const totalAguardandoAtendimento = document.getElementById('total-aguardando-atendimento');
const totalAguardandoReuniao = document.getElementById('total-aguardando-reuniao-time-tecnico');
const totalAguardandoAlinhamento = document.getElementById('total-aguardando-alinhamento-campanha');
const totalAguardandoDivulgacao = document.getElementById('total-aguardando-divulgacao');
const totalAguardandoResultados = document.getElementById('total-aguardando-resultados');
const totalAguardandoPagamento = document.getElementById('total-aguardando-pagamento');
const totalVendas = document.getElementById('total-vendas');
const conversao = document.getElementById('conversao');

// IDs para o perfil do usuário
const userProfileName = document.getElementById('user-profile-name');
const userProfileEmail = document.getElementById('user-profile-email');
const userProfileAvatar = document.getElementById('user-profile-avatar');

// IDs para os filtros
const filtroTimeSelect = document.getElementById('filtro-time');
const filtroFuncionarioSelect = document.getElementById('filtro-funcionario');
const btnAplicarFiltro = document.getElementById('btn-aplicar-filtro');

// ID para o corpo da tabela
const atendimentosTableBody = document.getElementById('atendimentos-table');

document.addEventListener('DOMContentLoaded', () => {
    console.log("Página do painel carregada. A verificar a autenticação...");
    checkAuthAndLoadData();
});

// Event listeners para o menu mobile
if (menuToggleBtn) {
    menuToggleBtn.addEventListener('click', () => {
        sidebar.classList.add('active');
    });
}

if (closeSidebarBtn) {
    closeSidebarBtn.addEventListener('click', () => {
        sidebar.classList.remove('active');
    });
}

// Event listener para o botão de logout
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log("A executar logout.");
        localStorage.clear();
        window.location.href = 'login.html';
    });
}

// Event listener para o botão de aplicar filtros
if (btnAplicarFiltro) {
    btnAplicarFiltro.addEventListener('click', () => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            // Recarrega os dados com os filtros aplicados
            fetchDashboardData(token, filtroFuncionarioSelect.value);
        }
    });
}

// Função para verificar a autenticação e carregar os dados
async function checkAuthAndLoadData() {
    const token = localStorage.getItem('jwtToken');
    const userRole = localStorage.getItem('userRole');

    // ADICIONADO: Logs de depuração para verificar o token e a função (role)
    console.log("Token no localStorage:", token);
    console.log("Papel do Utilizador no localStorage:", userRole);

    if (!token || !userRole) {
        console.error("Token de autenticação ou papel do utilizador não encontrado. A redirecionar para o login.");
        window.location.href = 'login.html';
        return;
    }

    // Exibir informações do utilizador na sidebar
    updateUserInfo();
    
    // Carregar funcionários (para o filtro) e dados do painel
    await fetchFuncionarios(token);
    await fetchDashboardData(token);
}

// Função para atualizar as informações do usuário na sidebar
function updateUserInfo() {
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    const userInitials = userName ? userName.split(' ').map(n => n[0]).join('') : 'A';
    
    if (userProfileName) userProfileName.textContent = userName || 'Administrador';
    if (userProfileEmail) userProfileEmail.textContent = userEmail || 'admin@nexaflow.com';
    if (userProfileAvatar) userProfileAvatar.src = `https://ui-avatars.com/api/?name=${userInitials}&background=4361ee&color=fff`;
}

// Função para buscar a lista de funcionários para o filtro
async function fetchFuncionarios(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/funcionarios`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            // ADICIONADO: Log de status de resposta para melhor depuração
            console.error(`Falha no pedido de funcionários. Status: ${response.status}`);
            throw new Error('Falha ao carregar funcionários.');
        }
        const funcionarios = await response.json();
        renderFuncionarios(funcionarios);
    } catch (error) {
        console.error('Erro ao carregar funcionários:', error);
    }
}

// Função para renderizar os funcionários no select de filtro
function renderFuncionarios(funcionarios) {
    if (!filtroFuncionarioSelect) return;
    filtroFuncionarioSelect.innerHTML = '<option value="">Todos</option>';
    funcionarios.forEach(funcionario => {
        const option = document.createElement('option');
        option.value = funcionario.id;
        option.textContent = funcionario.nomeCompleto;
        filtroFuncionarioSelect.appendChild(option);
    });
}
        
// Função para carregar os dados do painel a partir do backend
async function fetchDashboardData(token, funcionarioId = '') {
    console.log("A tentar carregar dados do painel...");
    try {
        const url = new URL(`${API_BASE_URL}/dashboard`);
        if (funcionarioId) {
            url.searchParams.append('funcionarioId', funcionarioId);
        }

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                console.error('Sessão expirada. A redirecionar para o login.');
                localStorage.clear();
                window.location.href = 'login.html';
            }
            // ADICIONADO: Log de status de resposta para melhor depuração
            console.error(`Falha no pedido do painel. Status: ${response.status}`);
            throw new Error('Falha ao carregar os dados do painel.');
        }

        const data = await response.json();
        console.log('Dados do painel recebidos:', data);
        renderDashboard(data);
    } catch (error) {
        console.error('Erro ao buscar dados do painel:', error);
        // Exibir mensagem de erro ou manter os valores em 0
    }
}

// Função para atualizar o DOM com os dados recebidos
function renderDashboard(data) {
    if (!data) return;

    if (totalAguardandoAtendimento) totalAguardandoAtendimento.textContent = data.aguardandoAtendimento || 0;
    if (totalAguardandoReuniao) totalAguardandoReuniao.textContent = data.aguardandoReuniao || 0;
    if (totalAguardandoAlinhamento) totalAguardandoAlinhamento.textContent = data.aguardandoAlinhamento || 0;
    if (totalAguardandoDivulgacao) totalAguardandoDivulgacao.textContent = data.aguardandoDivulgacao || 0;
    if (totalAguardandoResultados) totalAguardandoResultados.textContent = data.aguardandoResultados || 0;
    if (totalAguardandoPagamento) totalAguardandoPagamento.textContent = data.aguardandoPagamento || 0;
    if (totalVendas) totalVendas.textContent = data.vendasFechadas || 0;

    const conversaoValue = data.conversao ? `${data.conversao}%` : '0%';
    if (conversao) conversao.textContent = conversaoValue;

    // Renderizar atendimentos recentes
    renderAtendimentosRecentes(data.atendimentosRecentes);
}

// Função para converter o status da API para uma classe CSS
function getStatusClass(status) {
    const statusMap = {
        'Aguardando Atendimento': 'status-aguardando_atendimento',
        'Aguardando Reunião - Time Técnico': 'status-aguardando_reuniao_time_tecnico',
        'Aguardando Alinhamento - Campanha': 'status-aguardando_alinhamento_campanha',
        'Aguardando Divulgação': 'status-aguardando_divulgacao',
        'Aguardando Resultados': 'status-aguardando_resultados',
        'Aguardando Pagamento': 'status-aguardando_pagamento',
        'Vendido': 'status-vendido'
    };
    return statusMap[status] || 'status-default'; // Retorna 'status-default' se não houver correspondência
}

function renderAtendimentosRecentes(atendimentos) {
    if (!atendimentosTableBody) return;
    atendimentosTableBody.innerHTML = ''; // Limpar a tabela

    if (!atendimentos || atendimentos.length === 0) {
        const noDataRow = document.createElement('tr');
        noDataRow.innerHTML = `<td colspan="6" style="text-align: center; color: var(--gray);">
                                    Nenhum atendimento recente encontrado.
                                </td>`;
        atendimentosTableBody.appendChild(noDataRow);
        return;
    }

    atendimentos.forEach(atendimento => {
        const row = document.createElement('tr');
        const statusClass = getStatusClass(atendimento.status);
        row.innerHTML = `
            <td>${atendimento.clienteNome}</td>
            <td>${new Date(atendimento.dataCriacao).toLocaleDateString()}</td>
            <td>${atendimento.responsavelNome}</td>
            <td>${atendimento.canal}</td>
            <td>
                <span class="status-badge ${statusClass}">
                    ${atendimento.status}
                </span>
            </td>
            <td>
                <button class="action-btn"><i class="fas fa-eye"></i></button>
                <button class="action-btn"><i class="fas fa-edit"></i></button>
                <button class="action-btn"><i class="fas fa-trash"></i></button>
            </td>
        `;
        atendimentosTableBody.appendChild(row);
    });
}
