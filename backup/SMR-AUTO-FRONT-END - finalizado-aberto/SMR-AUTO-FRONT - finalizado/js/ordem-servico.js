document.addEventListener('DOMContentLoaded', () => {
    // Elementos da página
    const orderList = document.getElementById('order-list');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const newOrderButton = document.getElementById('new-order-button');
    const orderForm = document.getElementById('order-form');
    const noOrdersMessage = document.getElementById('no-orders-message');
    const addPecaButton = document.getElementById('add-peca-button');
    const pecasContainer = document.getElementById('pecas-container');
    
    // Log para depuração
    console.log("Iniciando script de ordens de serviço...");
    console.log("Elementos encontrados:", {
        orderList: !!orderList,
        searchInput: !!searchInput,
        searchButton: !!searchButton,
        newOrderButton: !!newOrderButton,
        orderForm: !!orderForm,
        noOrdersMessage: !!noOrdersMessage,
        addPecaButton: !!addPecaButton,
        pecasContainer: !!pecasContainer
    });
    
    // Contador para IDs dinâmicos de peças
    let pecaCounter = 2; // Começando do 2 pois já temos 1 inicial no HTML

    // Obter parâmetros da URL
    const params = new URLSearchParams(window.location.search);
    const clienteId = params.get('cliente');
    const funcionarioId = params.get('funcionario');

    // Inicializar página
    carregarClientes();
    carregarFuncionarios();
    carregarPecas();
    carregarOrdens();

    // Definir data atual no formulário (se existir)
    const dataInput = document.getElementById('data');
    if (dataInput) {
        const hoje = new Date().toISOString().split('T')[0];
        dataInput.value = hoje;
    }

    // Atualizar texto da informação para exigir apenas 1 peça
    const infoText = document.querySelector('.info-text');
    if (infoText) {
        infoText.textContent = "Pelo menos 1 peça é necessária";
    }

    // Event listeners
    if (searchButton) {
        searchButton.addEventListener('click', buscarOrdens);
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                buscarOrdens();
            }
        });
    }

    if (newOrderButton) {
        newOrderButton.addEventListener('click', () => {
            console.log("Botão Nova Ordem clicado");
            // Limpar formulário e ID antes de abrir o modal
            if (orderForm) {
                orderForm.reset();
                delete orderForm.dataset.id;
                
                // Resetar peças para apenas 1 inicial
                if (pecasContainer) {
                    while (pecasContainer.children.length > 1) {
                        pecasContainer.removeChild(pecasContainer.lastChild);
                    }
                }
                
                // Resetar o contador de peças
                pecaCounter = 2;
                
                // Definir data atual
                const hoje = new Date().toISOString().split('T')[0];
                if (dataInput) {
                    dataInput.value = hoje;
                }
                
                // Pré-selecionar cliente ou funcionário se vier da página deles
                if (clienteId) {
                    const clienteSelect = document.getElementById('cliente');
                    if (clienteSelect) {
                        clienteSelect.value = clienteId;
                    }
                }
                
                if (funcionarioId) {
                    const funcionarioSelect = document.getElementById('funcionario');
                    if (funcionarioSelect) {
                        funcionarioSelect.value = funcionarioId;
                    }
                }
            }
            abrirModal('order-modal');
        });
    }

    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log("Formulário de ordem submetido");
            salvarOrdem(e);
        });
    }

    if (addPecaButton) {
        addPecaButton.addEventListener('click', adicionarCampoPeca);
    }
    
    // Funções
    async function carregarClientes() {
        console.log("Carregando clientes...");
        try {
            const { response, data } = await fetchApi('/cliente');
            console.log("Resposta da API (clientes):", response.status, data ? data.length : 0);
            
            if (response.ok && data) {
                const clienteSelect = document.getElementById('cliente');
                if (clienteSelect) {
                    // Limpar opções existentes, exceto a primeira (placeholder)
                    while (clienteSelect.options.length > 1) {
                        clienteSelect.remove(1);
                    }
                    
                    // Adicionar clientes ao select
                    data.forEach(cliente => {
                        const option = document.createElement('option');
                        option.value = cliente.idCliente;
                        option.textContent = cliente.nmCliente;
                        clienteSelect.appendChild(option);
                    });
                    
                    // Se tiver ID do cliente na URL, selecioná-lo
                    if (clienteId) {
                        clienteSelect.value = clienteId;
                    }
                    
                    console.log(`Carregados ${data.length} clientes para o select`);
                } else {
                    console.error("Elemento select de clientes não encontrado");
                }
            } else {
                console.error("Erro na resposta da API (clientes):", response.status);
            }
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
        }
    }

    async function carregarFuncionarios() {
        console.log("Carregando funcionários...");
        try {
            const { response, data } = await fetchApi('/funcionario');
            console.log("Resposta da API (funcionários):", response.status, data ? data.length : 0);
            
            if (response.ok && data) {
                const funcionarioSelect = document.getElementById('funcionario');
                if (funcionarioSelect) {
                    // Limpar opções existentes, exceto a primeira (placeholder)
                    while (funcionarioSelect.options.length > 1) {
                        funcionarioSelect.remove(1);
                    }
                    
                    // Adicionar funcionários ao select
                    data.forEach(funcionario => {
                        const option = document.createElement('option');
                        option.value = funcionario.idFuncionario;
                        option.textContent = `${funcionario.nmFuncionario} (${funcionario.cargo})`;
                        funcionarioSelect.appendChild(option);
                    });
                    
                    // Se tiver ID do funcionário na URL, selecioná-lo
                    if (funcionarioId) {
                        funcionarioSelect.value = funcionarioId;
                    }
                    
                    console.log(`Carregados ${data.length} funcionários para o select`);
                } else {
                    console.error("Elemento select de funcionários não encontrado");
                }
            } else {
                console.error("Erro na resposta da API (funcionários):", response.status);
            }
        } catch (error) {
            console.error('Erro ao carregar funcionários:', error);
        }
    }

    // Nova função auxiliar para carregar opções apenas para um select específico
    async function carregarOpcoesParaSelect(select) {
        try {
            const { response, data } = await fetchApi('/peca');
            
            if (response.ok && data) {
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
            } else {
                console.error("Erro na resposta da API (peças):", response.status);
            }
        } catch (error) {
            console.error('Erro ao carregar opções para o select:', error);
        }
    }

    async function carregarPecas() {
        console.log("Carregando peças...");
        try {
            const { response, data } = await fetchApi('/peca');
            console.log("Resposta da API (peças):", response.status, data ? data.length : 0);
            
            if (response.ok && data) {
                const pecaSelects = document.querySelectorAll('.peca-select');
                
                pecaSelects.forEach(select => {
                    carregarOpcoesParaSelect(select);
                });
                
                console.log(`Carregadas opções para ${pecaSelects.length} selects de peças`);
            } else {
                console.error("Erro na resposta da API (peças):", response.status);
                mostrarAlerta('Erro ao carregar peças', 'danger');
            }
        } catch (error) {
            console.error('Erro ao carregar peças:', error);
            mostrarAlerta('Erro ao carregar peças. Verifique se o servidor está ativo.', 'danger');
        }
    }
    
    async function carregarOrdens() {
        console.log("Carregando ordens de serviço...");
        try {
            let url = '/ordem-servico';
            
            // Se tiver ID do cliente ou funcionário na URL, filtrar
            if (clienteId) {
                url = `/ordem-servico/cliente/${clienteId}`;
                console.log(`Filtrando por cliente: ${clienteId}`);
            } else if (funcionarioId) {
                url = `/ordem-servico/funcionario/${funcionarioId}`;
                console.log(`Filtrando por funcionário: ${funcionarioId}`);
            }
            
            const { response, data } = await fetchApi(url);
            console.log("Resposta da API (ordens):", response.status);
            
            if (response.ok && data) {
                console.log("Dados completos recebidos:", JSON.stringify(data));
                
                // Verificar se data é um array ou é um objeto com mensagem de erro
                if (Array.isArray(data)) {
                    console.log(`Recebidas ${data.length} ordens de serviço`);
                    renderizarOrdens(data);
                } else if (typeof data === 'object' && data !== null) {
                    if (data.message) {
                        // Provavelmente é uma mensagem de erro
                        mostrarAlerta(`Erro: ${data.message}`, 'danger');
                    } else if (Object.keys(data).length > 0) {
                        // Tentar renderizar mesmo que não seja um array (pode ser uma ordem única)
                        renderizarOrdens([data]);
                    } else {
                        mostrarAlerta('Nenhuma ordem de serviço encontrada', 'info');
                        renderizarOrdens([]);
                    }
                } else {
                    mostrarAlerta('Formato de dados inválido ao carregar ordens', 'danger');
                }
            } else {
                console.error("Erro na resposta da API (ordens):", response.status);
                mostrarAlerta('Erro ao carregar ordens de serviço', 'danger');
            }
        } catch (error) {
            console.error('Erro ao carregar ordens de serviço:', error);
            mostrarAlerta('Erro ao carregar ordens de serviço. Verifique o console para mais detalhes.', 'danger');
        }
    }
    
    async function buscarOrdens() {
        const searchTerm = searchInput.value.trim();
        if (!searchTerm) {
            carregarOrdens();
            return;
        }

        console.log(`Buscando ordens por: "${searchTerm}"`);
        
        try {
            const { response, data } = await fetchApi(`/ordem-servico/busca?termo=${encodeURIComponent(searchTerm)}`);
            console.log("Resposta da API para busca:", response.status, data ? data.length : 0);
            
            if (response.ok) {
                if (data.length > 0) {
                    console.log(`Encontradas ${data.length} ordens`);
                    renderizarOrdens(data);
                    mostrarAlerta(`Encontradas ${data.length} ordens de serviço`, 'success');
                } else {
                    // Limpar lista atual
                    if (orderList) {
                        orderList.innerHTML = '<p>Nenhuma ordem de serviço encontrada.</p>';
                    }
                    mostrarAlerta('Nenhuma ordem de serviço encontrada para este cliente', 'warning');
                }
            } else {
                console.error("Erro na resposta da API (busca):", response.status);
                mostrarAlerta('Erro ao buscar ordens de serviço', 'danger');
            }
        } catch (error) {
            console.error('Erro ao buscar ordens de serviço:', error);
            mostrarAlerta('Erro ao buscar ordens de serviço', 'danger');
        }
    }
    
    function adicionarCampoPeca() {
        console.log("Adicionando novo campo de peça...");
        const novaPecaItem = document.createElement('div');
        novaPecaItem.className = 'peca-item';
        novaPecaItem.innerHTML = `
            <div class="form-group">
                <label for="peca-${pecaCounter}">Peça*</label>
                <select id="peca-${pecaCounter}" name="peca-${pecaCounter}" class="peca-select" required>
                    <option value="">Selecione uma peça</option>
                </select>
            </div>
            <div class="form-group">
                <label for="qtd-${pecaCounter}">Quantidade*</label>
                <input type="number" id="qtd-${pecaCounter}" name="qtd-${pecaCounter}" min="1" value="1" required>
            </div>
            <button type="button" class="remove-peca-button">Remover</button>
        `;

        pecasContainer.appendChild(novaPecaItem);
        
        // Adicionar event listener para remover peça
        const removeButton = novaPecaItem.querySelector('.remove-peca-button');
        if (removeButton) {
            removeButton.addEventListener('click', () => {
                novaPecaItem.remove();
            });
        }
        
        // Carregar as opções para APENAS o novo select adicionado
        const novoSelect = novaPecaItem.querySelector('.peca-select');
        if (novoSelect) {
            carregarOpcoesParaSelect(novoSelect);
        }
        
        pecaCounter++;
        console.log(`Campo de peça adicionado. Contador atual: ${pecaCounter}`);
    }

    async function salvarOrdem(e) {
        e.preventDefault();
        console.log("Iniciando salvamento de ordem de serviço...");
        
        try {
            // Coletar dados do formulário
            const idCliente = parseInt(document.getElementById('cliente').value);
            if (isNaN(idCliente)) {
                mostrarAlerta('Selecione um cliente', 'danger');
                return;
            }
            
            const idFuncionario = parseInt(document.getElementById('funcionario').value);
            if (isNaN(idFuncionario)) {
                mostrarAlerta('Selecione um funcionário', 'danger');
                return;
            }
            
            const descricaoServico = document.getElementById('descricao').value;
            const veiculo = document.getElementById('veiculo').value;
            
            const vlServico = parseFloat(document.getElementById('vlServico').value);
            if (isNaN(vlServico) || vlServico <= 0) {
                mostrarAlerta('Informe um valor válido para o serviço', 'danger');
                return;
            }
            
            const formaPagamento = document.getElementById('formaPagamento').value;
            
            // Coletar dados das peças
            const pecasItems = pecasContainer.querySelectorAll('.peca-item');
            const pecas = [];
            
            // Verificar se tem pelo menos 1 peça
            if (pecasItems.length < 1) {
                mostrarAlerta('É necessário adicionar pelo menos 1 peça', 'danger');
                return;
            }
            
            // Array para verificação de duplicidade de peças
            const pecasIds = new Set();
            
            for (const item of pecasItems) {
                const select = item.querySelector('.peca-select');
                const idPeca = select ? parseInt(select.value) : null;
                
                const inputQtd = item.querySelector('input[type="number"]');
                const qtdPecas = inputQtd ? parseInt(inputQtd.value) : null;
                
                if (!idPeca) {
                    mostrarAlerta('Selecione todas as peças', 'danger');
                    return;
                }
                
                if (isNaN(qtdPecas) || qtdPecas <= 0) {
                    mostrarAlerta('Quantidade de peças deve ser maior que zero', 'danger');
                    return;
                }
                
                // Verificar duplicidade
                if (pecasIds.has(idPeca)) {
                    mostrarAlerta('Há peças duplicadas. Use a quantidade para adicionar mais unidades da mesma peça.', 'danger');
                    return;
                }
                
                pecasIds.add(idPeca);
                
                pecas.push({
                    idPeca,
                    qtdPecas
                });
            }
            
            // Construir objeto da ordem de serviço
            const ordemServico = {
                idCliente,
                idFuncionario,
                descricaoServico,
                veiculo,
                vlServico,
                formaPagamento,
                pecas
            };
            
            // Debug: Verificar o JSON antes de enviar
            console.log('Objeto da ordem:', ordemServico);
            console.log('JSON da ordem:', JSON.stringify(ordemServico));
            
            const ordemId = orderForm.dataset.id;
            let url = '/ordem-servico';
            let method = 'POST';
            
            // Se tiver ID, é uma atualização
            if (ordemId) {
                url = `/ordem-servico/${ordemId}`;
                method = 'PUT';
            }
            
            console.log(`Enviando ${method} para ${url}`);
            
            const { response, data } = await fetchApi(url, {
                method,
                body: JSON.stringify(ordemServico)
            });
            
            console.log("Resposta da API:", response.status, data);
            
            if (response.ok) {
                mostrarAlerta(ordemId ? 'Ordem de serviço atualizada com sucesso!' : 'Ordem de serviço criada com sucesso!', 'success');
                orderForm.reset();
                fecharModal('order-modal');
                carregarOrdens();
            } else if (response.status === 400) {
                // Tentar obter a mensagem de erro da resposta
                let mensagemErro = 'Erro ao salvar a ordem de serviço';
                if (typeof data === 'string') {
                    mensagemErro = data;
                }
                mostrarAlerta(mensagemErro, 'danger');
            } else if (response.status === 404) {
                mostrarAlerta('Cliente, funcionário ou peça não encontrado', 'danger');
            } else {
                mostrarAlerta('Erro ao salvar a ordem de serviço. Status: ' + response.status, 'danger');
            }
        } catch (error) {
            console.error('Erro ao salvar ordem de serviço:', error);
            mostrarAlerta(`Erro ao salvar: ${error.message}`, 'danger');
        }
    }

    // Função para renderizar ordens
    function renderizarOrdens(ordens) {
        console.log("Renderizando ordens:", ordens);
        
        if (!orderList) {
            console.error("Elemento orderList não encontrado");
            return;
        }
        
        orderList.innerHTML = '';
        
        if (!ordens || ordens.length === 0) {
            if (noOrdersMessage) {
                noOrdersMessage.style.display = 'block';
            } else {
                orderList.innerHTML = '<p>Nenhuma ordem de serviço encontrada.</p>';
            }
            console.log("Nenhuma ordem para renderizar");
            return;
        }
        
        if (noOrdersMessage) {
            noOrdersMessage.style.display = 'none';
        }
        
        console.log(`Renderizando ${ordens.length} ordens`);
        
        ordens.forEach((ordem, index) => {
            try {
                console.log(`Processando ordem #${index+1}:`, ordem.idServico);
                
                const card = document.createElement('div');
                card.className = 'order-card';
                
                // Determinar classe de status
                let statusClass = '';
                let statusText = '';
                
                // Isso é um exemplo, adapte conforme seu backend
                if (ordem.dataFim) {
                    statusClass = 'status-concluida';
                    statusText = 'Concluída';
                } else {
                    statusClass = 'status-aberta';
                    statusText = 'Aberta';
                }
                
                // Verificar propriedades obrigatórias
                if (!ordem.idServico) {
                    console.error("Ordem sem ID:", ordem);
                }
                
                if (!ordem.cliente) {
                    console.error("Ordem sem cliente:", ordem);
                }
                
                if (!ordem.funcionario) {
                    console.error("Ordem sem funcionário:", ordem);
                }
                
                // Tratamento seguro para valores ausentes
                const clienteNome = ordem.cliente && ordem.cliente.nmCliente ? ordem.cliente.nmCliente : 'Cliente não informado';
                const funcionarioNome = ordem.funcionario && ordem.funcionario.nmFuncionario ? ordem.funcionario.nmFuncionario : 'Funcionário não informado';
                
                // Tratar com segurança os dados que podem estar ausentes
                const valorPecas = ordem.pecasUtilizadas && Array.isArray(ordem.pecasUtilizadas) 
                    ? ordem.pecasUtilizadas.reduce((total, item) => {
                        return total + (item.valorTotal || 0);
                    }, 0) 
                    : 0;
                
                const valorDesconto = ordem.desconto || 0;
                const valorTotal = ordem.valorFinal || (valorPecas + (ordem.vlServico || 0) - valorDesconto);
                
                card.innerHTML = `
                    <div class="order-header">
                        <div class="order-id">Ordem #${ordem.idServico || 'N/A'}</div>
                        <div class="order-date">${formatarData(ordem.dataInicio) || 'Data não informada'}</div>
                        <div class="order-status ${statusClass}">${statusText}</div>
                    </div>
                    
                    <div class="order-customer-info">
                        <span class="order-customer-name">Cliente: ${clienteNome}</span>
                    </div>
                    
                    <div class="order-details">
                        <div class="detail-item">
                            <div class="detail-label">Veículo:</div>
                            <div class="detail-value">${ordem.veiculo || 'Não informado'}</div>
                        </div>
                        
                        <div class="detail-item">
                            <div class="detail-label">Responsável:</div>
                            <div class="detail-value">${funcionarioNome}</div>
                        </div>
                        
                        <div class="detail-item">
                            <div class="detail-label">Pagamento:</div>
                            <div class="detail-value">${ordem.formaPagamento || 'Não informado'}</div>
                        </div>
                    </div>
                    
                    <div class="order-description">
                        <div class="detail-label">Descrição:</div>
                        <div>${ordem.descricaoServico || 'Sem descrição'}</div>
                    </div>
                    
                    <div class="order-parts">
                        <div class="parts-title">Peças utilizadas:</div>
                        <div class="parts-list">
                            ${ordem.pecasUtilizadas && Array.isArray(ordem.pecasUtilizadas) && ordem.pecasUtilizadas.length > 0 
                                ? ordem.pecasUtilizadas.map(item => {
                                    const pecaNome = item.peca && item.peca.nmPeca ? item.peca.nmPeca : 'Peça não identificada';
                                    const qtdPecas = item.qtdPecas || 0;
                                    return `
                                        <div class="part-item">
                                            ${pecaNome} (${qtdPecas}x)
                                        </div>
                                    `;
                                }).join('') 
                                : 'Nenhuma peça registrada'}
                        </div>
                    </div>
                    
                    <div class="order-values">
                        <div class="value-item">
                            <div class="value-label">Valor das Peças:</div>
                            <div class="value-amount">${formatarMoeda(valorPecas)}</div>
                        </div>
                        
                        <div class="value-item">
                            <div class="value-label">Valor do Serviço:</div>
                            <div class="value-amount">${formatarMoeda(ordem.vlServico || 0)}</div>
                        </div>
                        
                        ${valorDesconto > 0 ? `
                            <div class="value-item">
                                <div class="value-label">Desconto:</div>
                                <div class="value-amount discount">-${formatarMoeda(valorDesconto)}</div>
                            </div>
                        ` : ''}
                        
                        <div class="value-item">
                            <div class="value-label">Total:</div>
                            <div class="value-amount total-value">${formatarMoeda(valorTotal)}</div>
                        </div>
                    </div>
                    
                    <div class="order-actions">
                        <button class="btn-secondary edit-button" data-id="${ordem.idServico}">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn-danger delete-button" data-id="${ordem.idServico}">
                            <i class="fas fa-trash-alt"></i> Excluir
                        </button>
                    </div>
                `;

                orderList.appendChild(card);

                // Adicionar event listeners para os botões
                const editButton = card.querySelector('.edit-button');
                if (editButton) {
                    editButton.addEventListener('click', () => editarOrdem(ordem.idServico));
                }
                
                const deleteButton = card.querySelector('.delete-button');
                if (deleteButton) {
                    deleteButton.addEventListener('click', () => excluirOrdem(ordem.idServico));
                }
            } catch (error) {
                console.error(`Erro ao renderizar ordem ${index+1}:`, error, ordem);
            }
        });
        
        console.log("Renderização de ordens concluída");
    }

    async function editarOrdem(id) {
        console.log(`Carregando ordem ${id} para edição`);
        try {
            const { response, data } = await fetchApi(`/ordem-servico/${id}`);
            console.log("Resposta API (editar ordem):", response.status, data);
            
            if (response.ok && data) {
                // Preencher o formulário com os dados da ordem
                const form = document.getElementById('order-form');
                
                // Dados básicos
                if (data.cliente && data.cliente.idCliente) {
                    form.elements.cliente.value = data.cliente.idCliente;
                } else {
                    console.error("Cliente não definido na ordem:", data);
                }
                
                if (data.funcionario && data.funcionario.idFuncionario) {
                    form.elements.funcionario.value = data.funcionario.idFuncionario;
                } else {
                    console.error("Funcionário não definido na ordem:", data);
                }
                
                form.elements.descricao.value = data.descricaoServico || '';
                form.elements.veiculo.value = data.veiculo || '';
                form.elements.vlServico.value = data.vlServico || 0;
                form.elements.formaPagamento.value = data.formaPagamento || 'DINHEIRO';
                
                // Limpar peças existentes
                while (pecasContainer.children.length > 0) {
                    pecasContainer.removeChild(pecasContainer.lastChild);
                }
                
                // Adicionar peças da ordem
                pecaCounter = 1;
                
                console.log("Peças utilizadas:", data.pecasUtilizadas);
                
                if (Array.isArray(data.pecasUtilizadas) && data.pecasUtilizadas.length > 0) {
                    data.pecasUtilizadas.forEach((pecaServico) => {
                        if (!pecaServico || !pecaServico.peca) {
                            console.error("Peça inválida:", pecaServico);
                            return;
                        }
                        
                        const novaPecaItem = document.createElement('div');
                        novaPecaItem.className = 'peca-item';
                        novaPecaItem.innerHTML = `
                            <div class="form-group">
                                <label for="peca-${pecaCounter}">Peça*</label>
                                <select id="peca-${pecaCounter}" name="peca-${pecaCounter}" class="peca-select" required>
                                    <option value="">Selecione uma peça</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="qtd-${pecaCounter}">Quantidade*</label>
                                <input type="number" id="qtd-${pecaCounter}" name="qtd-${pecaCounter}" min="1" value="${pecaServico.qtdPecas || 1}" required>
                            </div>
                        `;

                        if (pecaCounter > 1) {
                            novaPecaItem.innerHTML += `<button type="button" class="remove-peca-button">Remover</button>`;
                        }
                        
                        pecasContainer.appendChild(novaPecaItem);
                        
                        // Adicionar event listener para remover peça
                        const removeButton = novaPecaItem.querySelector('.remove-peca-button');
                        if (removeButton) {
                            removeButton.addEventListener('click', () => {
                                novaPecaItem.remove();
                            });
                        }
                        
                        pecaCounter++;
                    });
                } else {
                    // Se pecasUtilizadas não for um array, adicionar uma peça em branco
                    adicionarCampoPeca();
                    console.log("Nenhuma peça encontrada, adicionando campo em branco");
                }
                
                // Carregar as opções de peças para cada select
                const pecaSelects = document.querySelectorAll('.peca-select');
                const fetchPromises = [];
                
                // Obter dados das peças uma única vez
                const { response: pecasResponse, data: pecasData } = await fetchApi('/peca');
                
                if (pecasResponse.ok && pecasData) {
                    // Preencher todos os selects com as opções
                    pecaSelects.forEach((select, index) => {
                        // Limpar opções existentes, exceto a primeira (placeholder)
                        while (select.options.length > 1) {
                            select.remove(1);
                        }
                        
                        // Adicionar peças ao select
                        pecasData.forEach(peca => {
                            const option = document.createElement('option');
                            option.value = peca.idPeca;
                            option.textContent = `${peca.nmPeca} - ${formatarMoeda(peca.vlPeca)} (${peca.qtdEstoque} un)`;
                            option.dataset.estoque = peca.qtdEstoque;
                            select.appendChild(option);
                        });
                        
                        // Selecionar a peça correta se tivermos os dados
                        if (Array.isArray(data.pecasUtilizadas) && data.pecasUtilizadas[index]) {
                            const pecaServico = data.pecasUtilizadas[index];
                            if (pecaServico && pecaServico.peca && pecaServico.peca.idPeca) {
                                select.value = pecaServico.peca.idPeca;
                            }
                        }
                    });
                }
                
                // Armazenar o ID para usar no submit
                form.dataset.id = id;
                
                abrirModal('order-modal');
            } else {
                console.error("Erro ao carregar ordem:", response.status);
                mostrarAlerta('Erro ao carregar dados da ordem de serviço', 'danger');
            }
        } catch (error) {
            console.error('Erro ao carregar ordem para edição:', error);
            mostrarAlerta('Erro ao carregar dados da ordem de serviço', 'danger');
        }
    }

    async function excluirOrdem(id) {
        confirmarExclusao('Tem certeza que deseja excluir esta ordem de serviço? Isso retornará as peças ao estoque.', async () => {
            try {
                console.log(`Excluindo ordem ${id}...`);
                const { response, data } = await fetchApi(`/ordem-servico/${id}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    mostrarAlerta('Ordem de serviço excluída com sucesso!', 'success');
                    carregarOrdens();
                } else {
                    console.error("Erro ao excluir ordem:", response.status);
                    mostrarAlerta('Erro ao excluir ordem de serviço', 'danger');
                }
            } catch (error) {
                console.error('Erro ao excluir ordem de serviço:', error);
                mostrarAlerta('Erro ao excluir ordem de serviço', 'danger');
            }
        });
    }
    
    console.log("Script de ordens de serviço inicializado com sucesso");
});