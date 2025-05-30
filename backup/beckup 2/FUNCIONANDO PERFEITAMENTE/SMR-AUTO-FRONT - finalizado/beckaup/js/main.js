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
    document.querySelector('main').prepend(alerta);

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

// Função auxiliar para debug
function debugResponseData(endpoint, data) {
    console.log(`DEBUG [${endpoint}] - Tipo de dados:`, typeof data);

    if (Array.isArray(data)) {
        console.log(`DEBUG [${endpoint}] - É um array com ${data.length} itens`);
        if (data.length > 0) {
            console.log(`DEBUG [${endpoint}] - Primeiro item:`, data[0]);
        }
    } else if (typeof data === 'object' && data !== null) {
        console.log(`DEBUG [${endpoint}] - É um objeto:`, data);
    } else {
        console.log(`DEBUG [${endpoint}] - Valor:`, data);
    }
}

// Funções para requisições HTTP
const fetchApi = async (endpoint, options = {}) => {
    console.log(`FETCH: Iniciando requisição para ${endpoint}`, options);
    try {
        const url = `${API_BASE_URL}${endpoint}`;
        console.log(`FETCH: URL completa: ${url}`);

        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        console.log(`FETCH: Resposta recebida, status: ${response.status}`);

        const contentType = response.headers.get('content-type');
        let data;

        if (contentType && contentType.includes('application/json')) {
            try {
                data = await response.json();
                debugResponseData(endpoint, data);
            } catch (jsonError) {
                console.error(`FETCH: Erro ao fazer parse do JSON:`, jsonError);
                data = await response.text();
                console.log(`FETCH: Resposta como texto:`, data);
            }
        } else {
            data = await response.text();
            console.log(`FETCH: Dados texto recebidos:`, data);
        }

        return { response, data };
    } catch (error) {
        console.error('FETCH: Erro na requisição:', error);
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

// Função para aplicar máscara de telefone
const aplicarMascaraTelefone = (input) => {
    input.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 11) {
            if (value.length > 2) {
                value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
            }
            if (value.length > 10) {
                value = `${value.substring(0, 10)}-${value.substring(10)}`;
            }
            e.target.value = value;
        }
    });
};

// Função para aplicar máscara de CPF
const aplicarMascaraCpf = (input) => {
    input.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 11) {
            e.target.value = value;
        }
    });
};

// Função para aplicar máscara de CEP
const aplicarMascaraCep = (input) => {
    input.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 8) {
            e.target.value = value;
        }
    });
};

// Função para inicializar event listeners comuns
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.close-button').forEach(button => {
        const modalId = button.closest('.modal').id;
        button.addEventListener('click', () => fecharModal(modalId));
    });

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                fecharModal(modal.id);
            }
        });
    });

    document.querySelectorAll('.btn-secondary[id="cancel-button"]').forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.closest('.modal').id;
            fecharModal(modalId);
        });
    });

    const telefoneInputs = document.querySelectorAll('input[id$="telefoneCliente"], input[id$="telefoneFuncionario"]');
    telefoneInputs.forEach(aplicarMascaraTelefone);

    const cpfInputs = document.querySelectorAll('input[id$="cpfCliente"], input[id$="cpfFuncionario"]');
    cpfInputs.forEach(aplicarMascaraCpf);

    const cepInputs = document.querySelectorAll('input[id="cep"]');
    cepInputs.forEach(aplicarMascaraCep);
});
