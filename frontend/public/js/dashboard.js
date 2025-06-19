// ========== DASHBOARD ==========

async function carregarDashboard() {
  try {
    const res = await fetch("http://localhost:3010/dashboard");
    const data = await res.json();

    const cards = document.querySelectorAll(".stat-card");
    cards[0].querySelector("p").textContent = data.totalProspecao;
    cards[1].querySelector("p").textContent = data.totalVendas;
    cards[2].querySelector("p").textContent = data.totalTecnico;
    cards[3].querySelector("p").textContent = `${data.conversao}%`;

    const tbody = document.getElementById("atendimentos-table");
    tbody.innerHTML = "";

    data.recentes.forEach((a) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${a.cliente.nome}</td>
        <td>${new Date(a.data).toLocaleDateString()}</td>
        <td>${a.funcionario.nome}</td>
        <td>${a.origem}</td>
        <td><span class="status-badge status-${a.status}">${a.status}</span></td>
        <td><button class="action-btn"><i class="fas fa-eye"></i></button></td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error("Erro ao carregar dashboard:", error);
  }
}

// ========== CLIENTES (SOMENTE SE A TABELA EXISTIR) ==========

function carregarClientes() {
  const clientes = [
    { id: 1, nome: "João Silva", email: "joao@empresa.com", telefone: "(11) 99999-9999", origem: "Site", ultimoContato: "10/05/2024", status: "ativo" },
    { id: 2, nome: "Maria Souza", email: "maria@empresa.com", telefone: "(11) 98888-8888", origem: "WhatsApp", ultimoContato: "09/05/2024", status: "potencial" },
    { id: 3, nome: "Carlos Oliveira", email: "carlos@empresa.com", telefone: "(11) 97777-7777", origem: "Indicação", ultimoContato: "08/05/2024", status: "inativo" },
    { id: 4, nome: "Ana Santos", email: "ana@empresa.com", telefone: "(11) 96666-6666", origem: "Evento", ultimoContato: "07/05/2024", status: "ativo" },
    { id: 5, nome: "Pedro Costa", email: "pedro@empresa.com", telefone: "(11) 95555-5555", origem: "Site", ultimoContato: "06/05/2024", status: "ativo" },
  ];

  const tableBody = document.getElementById("clientes-table");
  tableBody.innerHTML = "";

  clientes.forEach((cliente) => {
    const row = document.createElement("tr");

    let statusClass = "";
    let statusText = "";

    switch (cliente.status) {
      case "ativo":
        statusClass = "status-concluido";
        statusText = "Ativo";
        break;
      case "potencial":
        statusClass = "status-andamento";
        statusText = "Potencial";
        break;
      case "inativo":
        statusClass = "status-pendente";
        statusText = "Inativo";
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

function setupModal() {
  const modal = document.getElementById("modal-cliente");
  const btnNovo = document.querySelector(".btn-primary");
  const btnCancelar = document.querySelector(".btn-cancel");
  const btnFechar = document.querySelector(".close-modal");

  if (!modal || !btnNovo || !btnCancelar || !btnFechar) return;

  btnNovo.addEventListener("click", () => (modal.style.display = "flex"));
  btnCancelar.addEventListener("click", () => (modal.style.display = "none"));
  btnFechar.addEventListener("click", () => (modal.style.display = "none"));

  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });
}

// ========== INICIALIZAÇÃO GERAL ==========

window.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("atendimentos-table")) {
    carregarDashboard();
  }

  if (document.getElementById("clientes-table")) {
    carregarClientes();
    setupModal();

    const searchInput = document.querySelector(".search-container input");
    searchInput?.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase();
      const rows = document.querySelectorAll("#clientes-table tr");

      rows.forEach((row) => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? "" : "none";
      });
    });
  }

  // Menu lateral abre/fecha
  const btnOpen = document.getElementById("open-btn");
  const toggleBtn = document.getElementById("menu-toggle"); // novo botão fixo
  const sidebar = document.querySelector(".sidebar");
  const main = document.querySelector(".main-content");

  const toggleSidebar = () => {
    sidebar.classList.toggle("collapsed");
    main.classList.toggle("expanded");
    toggleBtn.classList.toggle("active");
  };

  btnOpen?.addEventListener("click", toggleSidebar);
  toggleBtn?.addEventListener("click", toggleSidebar);
});
