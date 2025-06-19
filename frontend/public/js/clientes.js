
const filtrarBtn = document.getElementById('filtrar-btn'); 

filtrarBtn?.addEventListener('click', function() {
  const searchTerm = document.querySelector('.search-container input').value.toLowerCase();

  // ex: filtrando localmente as linhas da tabela
  const rows = document.querySelectorAll('#clientes-table tr');
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? '' : 'none';
  });
});

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