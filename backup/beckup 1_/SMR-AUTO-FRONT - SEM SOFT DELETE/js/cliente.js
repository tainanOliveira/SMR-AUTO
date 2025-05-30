document.addEventListener('DOMContentLoaded', () => {
    // Elementos da página
    const clienteList = document.getElementById('client-list');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const newClientButton = document.getElementById('new-client-button');
    const clientForm = document.getElementById('client-form');

    // Inicializar página
    carregarClientes();

    // Event listeners
    if (searchButton) {
        searchButton.addEventListener('click', buscarClientes);
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                buscarClientes();
            }
        });
    }

    if (newClientButton) {
        newClientButton.addEventListener('click', () => {
            // Limpar formulário e ID antes de abrir o modal
            if (clientForm) {
                clientForm.reset();
                delete clientForm.dataset.id;
            }
            abrirModal('client-modal');
        });
    }

    if (clientForm) {
        clientForm.addEventListener('submit', salvarCliente);
        
        // Adicionar máscara para telefone
        const telefoneInput = document.getElementById('telefoneCliente');
        if (telefoneInput) {
            telefoneInput.addEventListener('input', function (e) {
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
        }
        
        // Adicionar máscara para CPF
        const cpfInput = document.getElementById('cpfCliente');
        if (cpfInput) {
            cpfInput.addEventListener('input', function (e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length <= 11) {
                    e.target.value = value;
                }
            });
        }
        
        // Adicionar máscara para CEP
        const cepInput = document.getElementById('cep');
        if (cepInput) {
            cepInput.addEventListener('input', function (e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length <= 8) {
                    e.target.value = value;
                }
            });
        }
    }

    // Funções
    async function carregarClientes() {
        try {
            const { response, data } = await fetchApi('/cliente');
            
            if (response.ok) {
                renderizarClientes(data);
            } else {
                mostrarAlerta('Erro ao carregar clientes', 'danger');
            }
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
            mostrarAlerta('Erro ao carregar clientes. Verifique se o servidor está ativo.', 'danger');
        }
    }

    async function buscarClientes() {
        const searchTerm = searchInput.value.trim();
        if (!searchTerm) {
            carregarClientes();
            return;
        }

        try {
            // Verificar se é um CPF (contém apenas dígitos e tem 11 caracteres)
            if (/^\d{11}$/.test(searchTerm.replace(/\D/g, ''))) {
                const cpfLimpo = searchTerm.replace(/\D/g, '');
                const { response, data } = await fetchApi(`/cliente/cpf/${cpfLimpo}`);
                
                if (response.ok) {
                    renderizarClientes([data]);
                } else {
                    mostrarAlerta('Cliente não encontrado', 'warning');
                    clienteList.innerHTML = '<p>Nenhum cliente encontrado com este CPF.</p>';
                }
            } else {
                // Buscar por nome
                const { response, data } = await fetchApi(`/cliente/nome/${searchTerm}`);
                
                if (response.ok && data.length > 0) {
                    renderizarClientes(data);
                } else {
                    mostrarAlerta('Nenhum cliente encontrado', 'warning');
                    clienteList.innerHTML = '<p>Nenhum cliente encontrado com este nome.</p>';
                }
            }
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
            mostrarAlerta('Erro na busca de clientes', 'danger');
        }
    }

    async function salvarCliente(e) {
        e.preventDefault();
        
        const formData = new FormData(clientForm);
        const cliente = {
            nmCliente: formData.get('nmCliente'),
            cpfCliente: formData.get('cpfCliente').replace(/\D/g, ''),
            telefoneCliente: formData.get('telefoneCliente'),
            rua: formData.get('rua'),
            cidade: formData.get('cidade'),
            estado: formData.get('estado'),
            cep: formData.get('cep').replace(/\D/g, '')
        };

        const clienteId = clientForm.dataset.id;
        let url = '/cliente';
        let method = 'POST';

        // Se tiver ID, é uma atualização
        if (clienteId) {
            url = `/cliente/${clienteId}`;
            method = 'PUT';
        }

        try {
            const { response, data } = await fetchApi(url, {
                method,
                body: JSON.stringify(cliente)
            });

            if (response.ok) {
                mostrarAlerta(clienteId ? 'Cliente atualizado com sucesso!' : 'Cliente cadastrado com sucesso!', 'success');
                clientForm.reset();
                fecharModal('client-modal');
                carregarClientes();
            } else if (response.status === 409) {
                mostrarAlerta('CPF já cadastrado para outro cliente', 'danger');
            } else {
                mostrarAlerta('Erro ao salvar cliente', 'danger');
            }
        } catch (error) {
            console.error('Erro ao salvar cliente:', error);
            mostrarAlerta('Erro ao salvar cliente', 'danger');
        }
    }

    function renderizarClientes(clientes) {
        if (!clienteList) return;
        
        clienteList.innerHTML = '';

        if (!clientes || clientes.length === 0) {
            clienteList.innerHTML = '<p>Nenhum cliente encontrado.</p>';
            return;
        }

        clientes.forEach(cliente => {
            const card = document.createElement('div');
            card.className = 'client-card';
            card.innerHTML = `
                <div class="client-name">${cliente.nmCliente}</div>
                <div class="client-info">
                    <div class="info-item">
                        <span class="info-label">CPF:</span>
                        <span>${formatarCpf(cliente.cpfCliente)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Telefone:</span>
                        <span>${cliente.telefoneCliente}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Endereço:</span>
                        <span>${cliente.rua}, ${cliente.cidade} - ${cliente.estado}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">CEP:</span>
                        <span>${cliente.cep}</span>
                    </div>
                </div>
                <div class="client-actions">
                    <button class="action-button edit-button" data-id="${cliente.idCliente}">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="action-button delete-button" data-id="${cliente.idCliente}">
                        <i class="fas fa-trash-alt"></i> Excluir
                    </button>
                    <button class="action-button view-orders-button" data-id="${cliente.idCliente}">
                        <i class="fas fa-file-alt"></i> Ver Ordens
                    </button>
                </div>
            `;

            clienteList.appendChild(card);

            // Adicionar event listeners para os botões
            card.querySelector('.edit-button').addEventListener('click', () => editarCliente(cliente.idCliente));
            card.querySelector('.delete-button').addEventListener('click', () => excluirCliente(cliente.idCliente));
            card.querySelector('.view-orders-button').addEventListener('click', () => verOrdensCliente(cliente.idCliente));
        });
    }

    async function editarCliente(id) {
        try {
            const { response, data } = await fetchApi(`/cliente/${id}`);
            
            if (response.ok) {
                // Preencher o formulário com os dados do cliente
                clientForm.elements.nmCliente.value = data.nmCliente;
                clientForm.elements.cpfCliente.value = data.cpfCliente;
                clientForm.elements.telefoneCliente.value = data.telefoneCliente;
                clientForm.elements.rua.value = data.rua;
                clientForm.elements.cidade.value = data.cidade;
                clientForm.elements.estado.value = data.estado;
                clientForm.elements.cep.value = data.cep;

                // Armazenar o ID para usar no submit
                clientForm.dataset.id = id;
                
                abrirModal('client-modal');
            } else {
                mostrarAlerta('Erro ao carregar dados do cliente', 'danger');
            }
        } catch (error) {
            console.error('Erro ao carregar cliente para edição:', error);
            mostrarAlerta('Erro ao carregar dados do cliente', 'danger');
        }
    }

    async function excluirCliente(id) {
        confirmarExclusao('Tem certeza que deseja excluir este cliente? Todas as ordens de serviço relacionadas serão excluídas.', async () => {
            try {
                const { response, data } = await fetchApi(`/cliente/${id}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    mostrarAlerta('Cliente excluído com sucesso!', 'success');
                    carregarClientes();
                } else {
                    mostrarAlerta('Erro ao excluir cliente', 'danger');
                }
            } catch (error) {
                console.error('Erro ao excluir cliente:', error);
                mostrarAlerta('Erro ao excluir cliente', 'danger');
            }
        });
    }

    async function verOrdensCliente(id) {
        window.location.href = `ordens-servico.html?cliente=${id}`;
    }
});