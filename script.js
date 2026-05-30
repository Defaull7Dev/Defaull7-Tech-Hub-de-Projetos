const cardContainer = document.querySelector('.card-container');
const searchInput = document.getElementById('busca-input');
let dados = [];

// Dados de fallback caso o JSON não carregue (problema comum em file://)
const dadosFallback = [
  {
    nome: "Defaull7 Dev",
    descricao: "Defaull7 Dev é uma iniciativa inovadora focada em explorar novas fronteiras tecnológicas e científicas.",
    link: "https://www.linkedin.com/in/nickolas-oliveira-bonavita-magalhães-092a06189/"
  },
  {
    nome: "Projetos",
    descricao: "Conheça alguns projetos de exemplo desenvolvidos pela Defaull7 Tech.",
    link: "https://github.com/Defaull7Dev"
  }
];

async function botaoBusca() {
  const btn = document.querySelector('.btn-search');
  const originalText = btn.textContent;
  btn.textContent = 'Buscando...';
  btn.disabled = true;

  try {
    if (dados.length === 0) {
      const resposta = await fetch('data.json');
      if (!resposta.ok) throw new Error("JSON não encontrado");
      dados = await resposta.json();
    }

    const termoBusca = searchInput.value.toLowerCase().trim();
    
    const dadosFiltrados = dados.filter(dado =>
      dado.nome.toLowerCase().includes(termoBusca) ||
      dado.descricao.toLowerCase().includes(termoBusca)
    );

    renderizarCards(dadosFiltrados.length > 0 ? dadosFiltrados : dadosFallback);
  } catch (error) {
    console.warn("Erro ao carregar JSON, usando dados fallback:", error);
    // Usa dados fallback automaticamente se o fetch falhar
    const termoBusca = searchInput.value.toLowerCase().trim();
    const dadosFiltrados = dadosFallback.filter(dado =>
      dado.nome.toLowerCase().includes(termoBusca) ||
      dado.descricao.toLowerCase().includes(termoBusca)
    );
    renderizarCards(dadosFiltrados);
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

function renderizarCards(dados) {
  cardContainer.innerHTML = '';
  
  if (dados.length === 0) {
    cardContainer.innerHTML = `
      <div class="no-results">
        <p>Nenhum resultado encontrado para sua busca.</p>
      </div>
    `;
    return;
  }

  dados.forEach((dado, index) => {
    const article = document.createElement('article');
    article.classList.add('card');
    article.style.animation = `fadeIn 0.5s ease ${index * 0.1}s both`;
    
    article.innerHTML = `
      <h2>${dado.nome}</h2>
      <p>${dado.descricao}</p>
      <a href="${dado.link}" target="_blank">
        Acessar Projeto <span>→</span>
      </a>
    `;
    cardContainer.appendChild(article);
  });
}

// Animação CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);

// Buscar ao pressionar Enter
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') botaoBusca();
});

// Carregar dados ao iniciar
document.addEventListener('DOMContentLoaded', botaoBusca);