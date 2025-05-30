// Configuração base da API
const API_BASE_URL = 'http://localhost:8080';

// Funções utilitárias globais
const formatarCpf = (cpf) => {
    if (!cpf) return '';
    cpf = cpf.replace(/\D/g, '');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

const formatarData = (data) => {
    if (!data) return '';
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR');
};

const formatarMoeda = (valor) => {
    return parseFloat(valor).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
};

// Funções para exibir mensagens de notificação
const mostrarAlerta = (mensagem, tipo = 'info') => {
    // Remover alertas anteriores
    const alertaAnterior = document.querySelector('.alert');
    if (alertaAnterior) {
        alertaAnterior.remove();
    }

    // Criar novo alerta
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo}`;
    alerta.textContent = mensagem;

    // Adicionar ao DOM
    const main = document.querySelector('main');
    if (main) {
        main.prepend(alerta);
    } else {
        document.body.prepend(alerta);
    }

    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        alerta.remove();
    }, 5000);
};

// Funções para controle de modais
const abrirModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
};

const fecharModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
};

// Funções para requisições HTTP
const fetchApi = async (endpoint, options = {}) => {
    try {
        const url = `${API_BASE_URL}${endpoint}`;

        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        let data;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            try {
                data = await response.json();
            } catch (jsonError) {
                // Se não for possível parsear JSON, tenta obter texto
                data = await response.text();
            }
        } else {
            data = await response.text();
        }

        return { response, data };
    } catch (error) {
        console.error('Erro na requisição:', error);
        mostrarAlerta(`Erro na comunicação com o servidor: ${error.message}`, 'danger');
        throw error;
    }
};

// Função para confirmar exclusão
const confirmarExclusao = (mensagem, callback) => {
    if (confirm(mensagem)) {
        callback();
    }
};

// Configuração de event listeners para modais
document.addEventListener('DOMContentLoaded', () => {
    // Fechar modal com botão de fechar
    const closeButtons = document.querySelectorAll('.close-button');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                fecharModal(modal.id);
            }
        });
    });

    // Fechar modal com botão cancelar
    const cancelButtons = document.querySelectorAll('#cancel-button');
    cancelButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                fecharModal(modal.id);
            }
        });
    });

    // Fechar modal clicando fora
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                fecharModal(modal.id);
            }
        });
    });
});