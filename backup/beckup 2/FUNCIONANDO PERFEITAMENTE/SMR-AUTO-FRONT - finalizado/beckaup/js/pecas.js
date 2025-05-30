document.addEventListener('DOMContentLoaded', () => {
    // Elementos da página
    const pecaList = document.getElementById('peca-list');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const estoqueBaixoButton = document.getElementById('estoque-baixo-button');
    const newPecaButton = document.getElementById('new-peca-button');
    const pecaForm = document.getElementById('peca-form');
    
    // Log para depuração
    console.log("Iniciando script de peças...");
    console.log("Elementos encontrados:", {
        pecaList: !!pecaList,
        searchInput: !!searchInput,
        searchButton: !!searchButton,
        estoqueBaixoButton: !!estoqueBaixoButton,
        newPecaButton: !!newPecaButton,
        pecaForm: !!pecaForm
    });
    
    // Inicializar página
    carregarPecas();

    // Event listeners
    if (searchButton) {
        searchButton.addEventListener('click', buscarPecas);
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                buscarPecas();
            }
        });
    }

    if (estoqueBaixoButton) {
        estoqueBaixoButton.addEventListener('click', mostrarEstoqueBaixo);
    }

    if (newPecaButton) {
        newPecaButton.addEventListener('click', () => {
            console.log("Botão Nova Peça clicado");
            // Limpar formulário e ID antes de abrir o modal
            if (pecaForm) {
                pecaForm.reset();
                delete pecaForm.dataset.id;
            }
            abrirModal('peca-modal');
        });
    }

    if (pecaForm) {
        pecaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log("Formulário de peça submetido");
            salvarPeca(e);
        });
    }

    // Configurar fechamento do modal
    const closeButtons = document.querySelectorAll('.close-button');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                fecharModal(modal.id);
            }
        });
    });

    const cancelButtons = document.querySelectorAll('#cancel-button');
    cancelButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                fecharModal(modal.id);
            }
        });
    });

    // Fechar modal ao clicar fora dele
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                fecharModal(modal.id);
            }
        });
    });

    // Funções
    async function carregarPecas() {
        console.log("Carregando peças...");
        try {
            const { response, data } = await fetchApi('/peca');
            console.log("Resposta da API (peças):", response.status);
            
            if (response.ok && data) {
                console.log("Dados recebidos:", data);
                
                // Verificar se data é um array
                if (!Array.isArray(data)) {
                    console.error("Erro: dados recebidos não são um array", data);
                    mostrarAlerta('Formato de dados inválido ao carregar peças', 'danger');
                    return;
                }
                
                const pecaList = document.getElementById('peca-list');
                if (pecaList) {
                    renderizarPecas(data);
                }
                
                // Também lidar com os selects para o caso de estar em uma ordem de serviço
                const pecaSelects = document.querySelectorAll('.peca-select');
                if (pecaSelects.length > 0) {
                    pecaSelects.forEach(select => {
                        // Limpar opções existentes, exceto a primeira (placeholder)
                        while (select.options.length > 1) {
                            select.remove(1);
                        }
                        
                        // Adicionar peças ao select
                        data.forEach(peca => {
                            const option = document.createElement('option');
                            option.value = peca.idPeca;
                            option.textContent = `${peca.nmPeca} - ${formatarMoeda(peca.vlPeca)} (${peca.qtdEstoque} un)`;
                            option.dataset.estoque = peca.qtdEstoque;
                            select.appendChild(option);
                        });
                    });
                }
            } else {
                console.error("Erro na resposta da API (peças):", response.status);
                mostrarAlerta('Erro ao carregar peças', 'danger');
            }
        } catch (error) {
            console.error('Erro ao carregar peças:', error);
            mostrarAlerta('Erro ao carregar peças. Verifique se o servidor está ativo.', 'danger');
        }
    }

    async function buscarPecas() {
        const searchTerm = searchInput.value.trim();
        if (!searchTerm) {
            carregarPecas();
            return;
        }

        try {
            const { response, data } = await fetchApi(`/peca/nome/${searchTerm}`);
            
            if (response.ok && data && data.length > 0) {
                renderizarPecas(data);
            } else {
                mostrarAlerta('Nenhuma peça encontrada', 'warning');
                pecaList.innerHTML = '<p>Nenhuma peça encontrada com este nome.</p>';
            }
        } catch (error) {
            console.error('Erro ao buscar peças:', error);
            mostrarAlerta('Erro ao buscar peças', 'danger');
        }
    }

    async function mostrarEstoqueBaixo() {
        try {
            const { response, data } = await fetchApi('/peca/estoque-baixo');
            
            if (response.ok) {
                // Filtrar peças com 2 ou menos unidades
                const pecasBaixoEstoque = data 
                    ? data.filter(peca => peca.qtdEstoque <= 2) 
                    : [];
                
                if (pecasBaixoEstoque.length > 0) {
                    renderizarPecas(pecasBaixoEstoque);
                    mostrarAlerta(`${pecasBaixoEstoque.length} peças com estoque baixo encontradas`, 'warning');
                } else {
                    mostrarAlerta('Nenhuma peça com estoque baixo', 'success');
                    carregarPecas();
                }
            } else {
                mostrarAlerta('Erro ao verificar estoque baixo', 'danger');
            }
        } catch (error) {
            console.error('Erro ao verificar estoque baixo:', error);
            mostrarAlerta('Erro ao verificar estoque baixo', 'danger');
        }
    }
    

    async function salvarPeca(e) {
        e.preventDefault();
        console.log("Iniciando salvamento de peça...");
        
        try {
            const formData = new FormData(pecaForm);
            const peca = {
                nmPeca: formData.get('nmPeca'),
                qtdEstoque: parseInt(formData.get('qtdEstoque')),
                vlPeca: parseFloat(formData.get('vlPeca'))
            };
            
            console.log("Dados da peça a serem enviados:", peca);
    
            const pecaId = pecaForm.dataset.id;
            let url = '/peca';
            let method = 'POST';
    
            // Se tiver ID, é uma atualização
            if (pecaId) {
                url = `/peca/${pecaId}`;
                method = 'PUT';
            }
    
            // Validação adicional
            if (!peca.nmPeca) {
                mostrarAlerta('Nome da peça é obrigatório', 'danger');
                return;
            }
            
            if (isNaN(peca.qtdEstoque) || peca.qtdEstoque < 0) {
                mostrarAlerta('Quantidade em estoque deve ser um número positivo', 'danger');
                return;
            }
            
            if (isNaN(peca.vlPeca) || peca.vlPeca <= 0) {
                mostrarAlerta('Valor da peça deve ser maior que zero', 'danger');
                return;
            }
    
            const requestOptions = {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(peca)
            };
    
            console.log(`Enviando ${method} para ${url}:`, requestOptions);
            
            const response = await fetch(`${API_BASE_URL}${url}`, requestOptions);
            console.log("Status da resposta:", response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log("Peça salva com sucesso:", data);
                
                mostrarAlerta(pecaId ? 'Peça atualizada com sucesso!' : 'Peça cadastrada com sucesso!', 'success');
                pecaForm.reset();
                fecharModal('peca-modal');
                
                // Recarregar a lista de peças
                setTimeout(() => {
                    carregarPecas();
                }, 500); // Pequeno delay para garantir que os dados sejam atualizados no banco
            } else {
                const errorText = await response.text();
                console.error("Erro ao salvar peça:", response.status, errorText);
                mostrarAlerta(`Erro ao salvar peça. Status: ${response.status}`, 'danger');
            }
        } catch (error) {
            console.error('Exceção ao salvar peça:', error);
            mostrarAlerta(`Erro ao salvar peça: ${error.message}`, 'danger');
        }
    }
    
    function renderizarPecas(pecas) {
        console.log("Renderizando peças:", pecas);
        if (!pecaList) {
            console.error("Elemento pecaList não encontrado");
            return;
        }
        
        pecaList.innerHTML = '';

        if (!pecas || pecas.length === 0) {
            pecaList.innerHTML = '<p>Nenhuma peça encontrada.</p>';
            return;
        }

        const table = document.createElement('table');
        table.className = 'peca-table';
        
        // Cabeçalho da tabela
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Valor Unitário</th>
                    <th>Estoque</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        `;

        const tbody = table.querySelector('tbody');

        pecas.forEach(peca => {
            // Verificar valores obrigatórios
            if (!peca.idPeca || !peca.nmPeca) {
                console.error("Peça com dados incompletos:", peca);
                return;
            }
            
            // Definir classe para estoque (baixo, médio, alto)
            let estoqueClass = 'stock-high';
            if (peca.qtdEstoque <= 2) {
                estoqueClass = 'stock-low';
            } else if (peca.qtdEstoque <= 5) {
                estoqueClass = 'stock-medium';
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="peca-name">${peca.nmPeca}</td>
                <td class="peca-price">${formatarMoeda(peca.vlPeca)}</td>
                <td class="${estoqueClass}">${peca.qtdEstoque} un</td>
                <td>
                    <div class="peca-actions">
                        <button class="action-button edit-button" data-id="${peca.idPeca}">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="action-button delete-button" data-id="${peca.idPeca}">
                            <i class="fas fa-trash-alt"></i> Excluir
                        </button>
                        <button class="action-button adjust-stock-button" data-id="${peca.idPeca}">
                            <i class="fas fa-boxes"></i> Ajustar
                        </button>
                    </div>
                </td>
            `;

            tbody.appendChild(row);

            // Adicionar event listeners para os botões
            const editButton = row.querySelector('.edit-button');
            if (editButton) {
                editButton.addEventListener('click', () => editarPeca(peca.idPeca));
            }
            
            const deleteButton = row.querySelector('.delete-button');
            if (deleteButton) {
                deleteButton.addEventListener('click', () => excluirPeca(peca.idPeca));
            }
            
            const adjustButton = row.querySelector('.adjust-stock-button');
            if (adjustButton) {
                adjustButton.addEventListener('click', () => ajustarEstoque(peca.idPeca, peca.nmPeca, peca.qtdEstoque));
            }
        });

        pecaList.appendChild(table);
        console.log("Tabela de peças renderizada com sucesso");
    }
    
    async function editarPeca(id) {
        try {
            console.log(`Carregando peça ${id} para edição`);
            const { response, data } = await fetchApi(`/peca/${id}`);
            
            if (response.ok && data) {
                console.log("Dados da peça recebidos:", data);
                
                // Preencher o formulário com os dados da peça
                pecaForm.elements.nmPeca.value = data.nmPeca || '';
                pecaForm.elements.qtdEstoque.value = data.qtdEstoque || 0;
                pecaForm.elements.vlPeca.value = data.vlPeca || 0;

                // Armazenar o ID para usar no submit
                pecaForm.dataset.id = id;
                
                abrirModal('peca-modal');
            } else {
                console.error("Erro ao carregar peça:", response.status);
                mostrarAlerta('Erro ao carregar dados da peça', 'danger');
            }
        } catch (error) {
            console.error('Erro ao carregar peça para edição:', error);
            mostrarAlerta('Erro ao carregar dados da peça', 'danger');
        }
    }

    async function excluirPeca(id) {
        confirmarExclusao('Tem certeza que deseja excluir esta peça?', async () => {
            try {
                console.log(`Excluindo peça ${id}...`);
                const { response, data } = await fetchApi(`/peca/${id}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    mostrarAlerta('Peça excluída com sucesso!', 'success');
                    carregarPecas();
                } else {
                    console.error("Erro ao excluir peça:", response.status);
                    mostrarAlerta('Erro ao excluir peça', 'danger');
                }
            } catch (error) {
                console.error('Erro ao excluir peça:', error);
                mostrarAlerta('Erro ao excluir peça', 'danger');
            }
        });
    }

    async function ajustarEstoque(id, nome, estoqueAtual) {
        // Criar o modal de ajuste de estoque dinamicamente
        const modalHTML = `
            <div id="stock-modal" class="modal">
                <div class="modal-content">
                    <span class="close-button">&times;</span>
                    <h2>Ajustar Estoque - ${nome}</h2>
                    <p>Estoque atual: <span class="stock-value">${estoqueAtual}</span></p>
                    
                    <form id="stock-form">
                        <div class="form-group">
                            <label for="quantidade">Nova quantidade:</label>
                            <input type="number" id="quantidade" name="quantidade" min="0" value="${estoqueAtual}" required>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn-primary">Salvar</button>
                            <button type="button" id="stock-cancel" class="btn-secondary">Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Adicionar o modal ao DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Configurar event listeners
        const stockModal = document.getElementById('stock-modal');
        const stockForm = document.getElementById('stock-form');
        const closeButton = stockModal.querySelector('.close-button');
        const cancelButton = document.getElementById('stock-cancel');

        const fecharModalEstoque = () => {
            stockModal.remove();
        };

        closeButton.addEventListener('click', fecharModalEstoque);
        cancelButton.addEventListener('click', fecharModalEstoque);
        stockModal.addEventListener('click', (e) => {
            if (e.target === stockModal) {
                fecharModalEstoque();
            }
        });

        stockForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const novaQuantidade = parseInt(stockForm.elements.quantidade.value);
            const diferenca = novaQuantidade - estoqueAtual;
            
            try {
                console.log(`Ajustando estoque da peça ${id}. Diferença: ${diferenca}`);
                const { response, data } = await fetchApi(`/peca/${id}/estoque`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `quantidade=${diferenca}`
                });
                
                if (response.ok) {
                    mostrarAlerta('Estoque atualizado com sucesso!', 'success');
                    fecharModalEstoque();
                    carregarPecas();
                } else if (response.status === 400) {
                    mostrarAlerta('Estoque insuficiente para esta operação', 'danger');
                } else {
                    console.error("Erro ao atualizar estoque:", response.status);
                    mostrarAlerta('Erro ao atualizar estoque', 'danger');
                }
            } catch (error) {
                console.error('Erro ao atualizar estoque:', error);
                mostrarAlerta('Erro ao atualizar estoque', 'danger');
            }
        });

        // Exibir o modal
        stockModal.style.display = 'block';
    }
    
    console.log("Script de peças inicializado com sucesso");
});