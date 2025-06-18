// atendimentos.js

async function carregarAtendimentos() {
  try {
    const res = await fetch("http://localhost:3010/atendimentos");
    const atendimentos = await res.json();

    const tbody = document.getElementById("tabela-atendimentos");
    tbody.innerHTML = "";

    atendimentos.forEach((a) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${a.cliente?.nome || "-"}</td>
        <td>${new Date(a.data).toLocaleDateString()}</td>
        <td>${a.funcionario?.nome || "-"}</td>
        <td>${a.origem}</td>
        <td><span class="status-badge status-${a.status}">${a.status}</span></td>
        <td>
          <button class="action-btn" title="Ver"><i class="fas fa-eye"></i></button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error("Erro ao carregar atendimentos:", error);
  }
}

// Filtro por texto
function setupBusca() {
  const input = document.getElementById("search-atendimento");
  input?.addEventListener("input", () => {
    const termo = input.value.toLowerCase();
    const linhas = document.querySelectorAll("#tabela-atendimentos tr");

    linhas.forEach((linha) => {
      const texto = linha.textContent.toLowerCase();
      linha.style.display = texto.includes(termo) ? "" : "none";
    });
  });
}

window.addEventListener("DOMContentLoaded", () => {
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

// Inicializa
window.addEventListener("DOMContentLoaded", () => {
  carregarAtendimentos();
  setupBusca();
  setupMenuToggle();
});
