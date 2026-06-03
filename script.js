const cardContainer = document.querySelector('.card-container');
const searchInput = document.getElementById('busca-input');
let dados = [];
let musicas = [];
let currentTrackIndex = 0;
let isPlaying = true;

// Elemento de áudio
const audio = new Audio();
audio.volume = 0.1;

// Dados de fallback
const dadosFallback = [
    {
        nome: "Defaull7 Dev",
        descricao: "Defaull7 Dev é uma iniciativa inovadora focada em explorar novas fronteiras tecnológicas e científicas.",
        link: "https://www.linkedin.com/in/nickolas-oliveira-bonavita-magalhães-092a06189/",
        linkGithub: "https://github.com/Defaull7Dev"
    },
    {
        nome: "Projetos",
        descricao: "Conheça alguns projetos de exemplo desenvolvidos pela Defaull7 Tech.",
        link: "https://github.com/Defaull7Dev",
        linkGithub: "https://github.com/Defaull7Dev"
    }
];

// ============================================
// MINI PLAYER - FUNÇÕES
// ============================================

const mpTitle = document.getElementById('mpTitle');
const mpArtist = document.getElementById('mpArtist');
const mpPlayBtn = document.getElementById('mpPlay');
const mpPrevBtn = document.getElementById('mpPrev');
const mpNextBtn = document.getElementById('mpNext');
const mpProgress = document.getElementById('mpProgress');
const mpCurrent = document.getElementById('mpCurrent');
const mpDuration = document.getElementById('mpDuration');
const mpVolumeSlider = document.getElementById('mpVolume');
const mpToggle = document.getElementById('mpToggle');
const mpContent = document.getElementById('mpContent');

// Inicializar ícones dos botões de controle para garantir que apareçam
mpPrevBtn.textContent = '⏮';
mpNextBtn.textContent = '⏭';

function formatTime(segundos) {
    if (isNaN(segundos) || !isFinite(segundos)) return '0:00';
    const m = Math.floor(segundos / 60);
    const s = Math.floor(segundos % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function loadTrack(index) {
    if (!musicas || musicas.length === 0) {
        mpTitle.textContent = 'Nenhuma música';
        mpArtist.textContent = '—';
        return;
    }
    currentTrackIndex = (index + musicas.length) % musicas.length;
    const track = musicas[currentTrackIndex];
    audio.src = track.arquivo;
    mpTitle.textContent = track.titulo || 'Sem título';
    mpArtist.textContent = track.artista || 'Desconhecido';
    mpProgress.value = 0;
    mpCurrent.textContent = '0:00';
    mpOpenPlayer();
    if (isPlaying) {
        audio.play().then(() => {
            mpPlayBtn.textContent = '⏸';
        }).catch(err => {
            // Navegadores bloqueiam autoplay sem interação prévia
            console.warn('Autoplay bloqueado pelo navegador. Aguardando interação do usuário.', err);
            isPlaying = false;
            mpPlayBtn.textContent = '▶';
        });
    }
}

function togglePlay() {
    if (!musicas || musicas.length === 0) return;
    if (audio.paused) {
        audio.play().then(() => {
            isPlaying = true;
            mpPlayBtn.textContent = '⏸';
        }).catch(err => console.warn('Play falhou:', err));
    } else {
        audio.pause();
        isPlaying = false;
        mpPlayBtn.textContent = '▶';
    }
}

function nextTrack() { loadTrack(currentTrackIndex + 1); }
function prevTrack() { loadTrack(currentTrackIndex - 1); }

function mpOpenPlayer() {
    mpContent.classList.add('visible');
    mpToggle.classList.add('active');
}

function mpClosePlayer() {
    mpContent.classList.remove('visible');
    mpToggle.classList.remove('active');
}

mpToggle.addEventListener('click', mpOpenPlayer);
mpPlayBtn.addEventListener('click', togglePlay);
mpNextBtn.addEventListener('click', nextTrack);
mpPrevBtn.addEventListener('click', prevTrack);

audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        mpProgress.value = (audio.currentTime / audio.duration) * 100;
        mpCurrent.textContent = formatTime(audio.currentTime);
    }
});

audio.addEventListener('loadedmetadata', () => {
    mpDuration.textContent = formatTime(audio.duration);
});

audio.addEventListener('ended', nextTrack);

mpProgress.addEventListener('input', (e) => {
    if (audio.duration) audio.currentTime = (e.target.value / 100) * audio.duration;
});

mpVolumeSlider.addEventListener('input', (e) => {
    audio.volume = parseFloat(e.target.value);
});

document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
    if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
    if (e.code === 'ArrowRight') { e.preventDefault(); nextTrack(); }
    if (e.code === 'ArrowLeft') { e.preventDefault(); prevTrack(); }
});

// ============================================
// HUB DE COMENTÁRIOS - FUNÇÕES
// ============================================

const commentToggle = document.getElementById('commentToggle');
const commentContent = document.getElementById('commentContent');
const commentClose = document.getElementById('commentClose');
const commentForm = document.getElementById('commentForm');
const commentMessages = document.getElementById('commentMessages');
const commentBadge = document.getElementById('commentBadge');
const comProjetoSelect = document.getElementById('comProjeto');
const formStatus = document.getElementById('formStatus');

let comentarios = JSON.parse(localStorage.getItem('defaull7_comentarios') || '[]');

function openComments() {
    commentContent.classList.add('visible');
    commentToggle.classList.add('active');
    renderComentarios();
}

function closeComments() {
    commentContent.classList.remove('visible');
    commentToggle.classList.remove('active');
}

commentToggle.addEventListener('click', openComments);
commentClose.addEventListener('click', closeComments);

function atualizarBadge() {
    const count = comentarios.length;
    if (count > 0) {
        commentBadge.style.display = 'flex';
        commentBadge.textContent = count > 99 ? '99+' : count;
    } else {
        commentBadge.style.display = 'none';
    }
}

function renderComentarios() {
    if (comentarios.length === 0) {
        commentMessages.innerHTML = `
            <div class="comment-empty">
                <p>Nenhum comentário ainda.</p>
                <p class="comment-hint">Seja o primeiro a comentar!</p>
            </div>`;
        return;
    }
    commentMessages.innerHTML = comentarios.slice().reverse().map(c => `
        <div class="comment-item">
            <div class="comment-item-header">
                <span class="comment-author">${escapeHtml(c.nome)}</span>
                <span class="comment-project">${escapeHtml(c.projeto)}</span>
            </div>
            <div class="comment-text">${escapeHtml(c.comentario)}</div>
        </div>
    `).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function preencherSelectProjetos() {
    comProjetoSelect.innerHTML = '<option value="">Selecione o projeto *</option>';
    if (dados && dados.length > 0) {
        dados.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d.nome;
            opt.textContent = d.nome;
            comProjetoSelect.appendChild(opt);
        });
    }
}

async function enviarComentarioParaLog(comentario) {
    // PREPARA DADOS PARA EMAILJS
    const templateParams = {
        from_name: comentario.nome,
        from_email: comentario.email,
        projeto: comentario.projeto,
        mensagem: comentario.comentario,
        datetime: new Date().toLocaleString('pt-BR'),
        ip: 'Cliente',
        to_email: 'defaull7contato@gmail.com'
    };

    try {
        // ENVIA VIA EMAILJS
        // SUBSTITUA PELOS SEUS IDs DO EMAILJS
        const serviceID = 'service_4pe3q7q';
        const templateID = 'template_7pryx1l';
        
        await emailjs.send(serviceID, templateID, templateParams);
        
        console.log('Email enviado com sucesso!');
        return true;
    } catch (err) {
        console.error('Erro ao enviar email:', err);
        
        // FALLBACK: Salva no localStorage se falhar
        console.log('Salvando localmente...');
        return false;
    }
}

function validarFormulario() {
    let valido = true;
    const campos = [
        { id: 'comNome', err: 'errNome', msg: 'Nome é obrigatório' },
        { id: 'comEmail', err: 'errEmail', msg: 'Email válido é obrigatório' },
        { id: 'comProjeto', err: 'errProjeto', msg: 'Selecione um projeto' },
        { id: 'comComentario', err: 'errComentario', msg: 'Comentário é obrigatório' }
    ];
    
    campos.forEach(({ id, err, msg }) => {
        const el = document.getElementById(id);
        const errEl = document.getElementById(err);
        const val = el.value.trim();
        
        if (id === 'comEmail') {
            const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
            if (!val || !emailOk) {
                el.classList.add('error');
                errEl.textContent = msg;
                valido = false;
            } else {
                el.classList.remove('error');
                errEl.textContent = '';
            }
        } else {
            if (!val) {
                el.classList.add('error');
                errEl.textContent = msg;
                valido = false;
            } else {
                el.classList.remove('error');
                errEl.textContent = '';
            }
        }
    });
    
    return valido;
}

commentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;
    
    const btn = document.getElementById('commentSubmit');
    btn.disabled = true;
    btn.textContent = 'Enviando...';
    formStatus.textContent = '';
    formStatus.className = 'form-status';
    
    const comentario = {
        nome: document.getElementById('comNome').value.trim(),
        email: document.getElementById('comEmail').value.trim(),
        projeto: document.getElementById('comProjeto').value,
        comentario: document.getElementById('comComentario').value.trim()
    };
    
    const enviado = await enviarComentarioParaLog(comentario);
    
    // Salva sempre no localStorage (backup)
    comentarios.push(comentario);
    localStorage.setItem('defaull7_comentarios', JSON.stringify(comentarios));
    
    renderComentarios();
    atualizarBadge();
    
    commentForm.reset();
    btn.disabled = false;
    btn.textContent = 'Enviar comentário';
    
    formStatus.textContent = enviado 
        ? '✓ Comentário enviado com sucesso!' 
        : '✓ Comentário salvo localmente';
    formStatus.className = 'form-status success';
    
    setTimeout(() => {
        formStatus.textContent = '';
        formStatus.className = 'form-status';
    }, 4000);
});

// ============================================
// CARREGAR JSON (dados + músicas)
// ============================================

async function carregarDados() {
    const resposta = await fetch('data.json');
    if (!resposta.ok) throw new Error("JSON não encontrado");
    const json = await resposta.json();
    
    if (Array.isArray(json)) {
        dados = json;
        musicas = [];
    } else {
        dados = json.dados || json;
        musicas = json.musicas || [];
    }
    
    if (musicas.length === 0) {
        musicas = [
            { titulo: 'Demo Track 1', artista: 'Defaull7 Dev', arquivo: 'musicas/track01.mp3' },
            { titulo: 'Demo Track 2', artista: 'Defaull7 Dev', arquivo: 'musicas/track02.mp3' }
        ];
    }
    
    preencherSelectProjetos();
    if (musicas.length > 0) loadTrack(0);
}

// ============================================
// BUSCA E RENDERIZAÇÃO
// ============================================

async function botaoBusca() {
    const btn = document.querySelector('.btn-search');
    const originalText = btn.textContent;
    btn.textContent = 'Buscando...';
    btn.disabled = true;
    
    try {
        if (dados.length === 0) await carregarDados();
        
        const termoBusca = searchInput.value.toLowerCase().trim();
        const dadosFiltrados = dados.filter(dado =>
            dado.nome.toLowerCase().includes(termoBusca) ||
            dado.descricao.toLowerCase().includes(termoBusca)
        );
        
        renderizarCards(dadosFiltrados.length > 0 ? dadosFiltrados : dadosFallback);
    } catch (error) {
        console.warn("Erro ao carregar JSON, usando fallback:", error);
        renderizarCards(dadosFallback);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

function renderizarCards(dados) {
    cardContainer.innerHTML = '';
    if (dados.length === 0) {
        cardContainer.innerHTML = `<div class="no-results"><p>Nenhum resultado encontrado.</p></div>`;
        return;
    }
    dados.forEach((dado, index) => {
        const article = document.createElement('article');
        article.classList.add('card');
        article.style.animation = `fadeIn 0.5s ease ${index * 0.1}s both`;
        const linkGithub = dado.linkGithub || dado.link;
        article.innerHTML = `
            <h2>${dado.nome}</h2>
            <p>${dado.descricao}</p>
            <div class="card-actions">
                <a href="${dado.link}" target="_blank" class="card-btn card-btn-primary">
                    Acessar Site <span>→</span>
                </a>
                <a href="${linkGithub}" target="_blank" class="card-btn card-btn-github">
                    GitHub <span>→</span>
                </a>
            </div>
        `;
        cardContainer.appendChild(article);
    });
}

// Animação CSS
const style = document.createElement('style');
style.textContent = `@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`;
document.head.appendChild(style);

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') botaoBusca();
});

// Inicializar
document.addEventListener('DOMContentLoaded', async () => {
    await carregarDados();
    botaoBusca();
    atualizarBadge();
});