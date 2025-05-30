document.addEventListener('DOMContentLoaded', () => {
    // Elementos da página
    const funcionarioList = document.getElementById('funcionario-list');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const newFuncionarioButton = document.getElementById('new-funcionario-button');
    const funcionarioForm = document.getElementById('funcionario-form');

    // Inicializar página
    carregarFuncionarios();

    // Event listeners
    if (searchButton) {
        searchButton.addEventListener('click', buscarFuncionarios);
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                buscarFuncionarios();
            }
        });
    }

    if (newFuncionarioButton) {
        newFuncionarioButton.addEventListener('click', () => {
            // Limpar formulário e ID antes de abrir o modal
            if (funcionarioForm) {
                funcionarioForm.reset();
                delete funcionarioForm.dataset.id;
            }
            abrirModal('funcionario-modal');
        });
    }

    if (funcionarioForm) {
        funcionarioForm.addEventListener('submit', salvarFuncionario);
        
        // Adicionar máscara para telefone
        const telefoneInput = document.getElementById('telefoneFuncionario');
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
        const cpfInput = document.getElementById('cpfFuncionario');
        if (cpfInput) {
            cpfInput.addEventListener('input', function (e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length <= 11) {
                    e.target.value = value;
                }
            });
        }
    }

    // Funções
    async function carregarFuncionarios() {
        try {
            const { response, data } = await fetchApi('/funcionario');
            
            if (response.ok) {
                renderizarFuncionarios(data);
            } else {
                mostrarAlerta('Erro ao carregar funcionários', 'danger');
            }
        } catch (error) {
            console.error('Erro ao carregar funcionários:', error);
            mostrarAlerta('Erro ao carregar funcionários. Verifique se o servidor está ativo.', 'danger');
        }
    }

    async function buscarFuncionarios() {
        const searchTerm = searchInput.value.trim();
        if (!searchTerm) {
            carregarFuncionarios();
            return;
        }

        try {
            // Verificar se é um CPF (apenas dígitos)
            if (/^\d{11}$/.test(searchTerm.replace(/\D/g, ''))) {
                const cpfLimpo = searchTerm.replace(/\D/g, '');
                const { response, data } = await fetchApi(`/
                    funcionario/cpf/${cpfLimpo}`);
                
                if (response.ok) {
                    renderizarFuncionarios([data]);
                } else {
                    mostrarAlerta('Funcionário não encontrado', 'warning');
                    funcionarioList.innerHTML = '<p>Nenhum funcionário encontrado com este CPF.</p>';
                }
            } else if (searchTerm.length >= 3) {
                // Tentar buscar por nome primeiro
                const { response, data } = await fetchApi(`/funcionario/nome/${searchTerm}`);
                
                if (response.ok && data.length > 0) {
                    renderizarFuncionarios(data);
                } else {
                    // Se não encontrar por nome, tentar por cargo
                    const cargoResponse = await fetchApi(`/funcionario/cargo/${searchTerm}`);
                    
                    if (cargoResponse.response.ok && cargoResponse.data.length > 0) {
                        renderizarFuncionarios(cargoResponse.data);
                    } else {
                        mostrarAlerta('Nenhum funcionário encontrado', 'warning');
                        funcionarioList.innerHTML = '<p>Nenhum funcionário encontrado.</p>';
                    }
                }
            } else {
                mostrarAlerta('Digite pelo menos 3 caracteres para buscar por nome ou cargo', 'warning');
            }
        } catch (error) {
            console.error('Erro ao buscar funcionários:', error);
            mostrarAlerta('Erro na busca de funcionários', 'danger');
        }
    }

    async function salvarFuncionario(e) {
        e.preventDefault();
        
        const formData = new FormData(funcionarioForm);
        const funcionario = {
            nmFuncionario: formData.get('nmFuncionario'),
            cargo: formData.get('cargo'),
            cpfFuncionario: formData.get('cpfFuncionario').replace(/\D/g, ''),
            telefoneFuncionario: formData.get('telefoneFuncionario')
        };

        const funcionarioId = funcionarioForm.dataset.id;
        let url = '/funcionario';
        let method = 'POST';

        // Se tiver ID, é uma atualização
        if (funcionarioId) {
            url = `/funcionario/${funcionarioId}`;
            method = 'PUT';
        }

        try {
            const { response, data } = await fetchApi(url, {
                method,
                body: JSON.stringify(funcionario)
            });

            if (response.ok) {
                mostrarAlerta(funcionarioId ? 'Funcionário atualizado com sucesso!' : 'Funcionário cadastrado com sucesso!', 'success');
                funcionarioForm.reset();
                fecharModal('funcionario-modal');
                carregarFuncionarios();
            } else if (response.status === 409) {
                mostrarAlerta('CPF já cadastrado para outro funcionário', 'danger');
            } else {
                mostrarAlerta('Erro ao salvar funcionário', 'danger');
            }
        } catch (error) {
            console.error('Erro ao salvar funcionário:', error);
            mostrarAlerta('Erro ao salvar funcionário', 'danger');
        }
    }

    function renderizarFuncionarios(funcionarios) {
        if (!funcionarioList) return;
        
        funcionarioList.innerHTML = '';

        if (!funcionarios || funcionarios.length === 0) {
            funcionarioList.innerHTML = '<p>Nenhum funcionário encontrado.</p>';
            return;
        }

        funcionarios.forEach(funcionario => {
            const card = document.createElement('div');
            card.className = 'funcionario-card';
            card.innerHTML = `
                <div class="funcionario-header">
                    <div class="funcionario-name">${funcionario.nmFuncionario}</div>
                    <div class="funcionario-cargo">${funcionario.cargo}</div>
                </div>
                <div class="funcionario-info">
                    <div class="info-item">
                        <span class="info-label">CPF:</span>
                        <span>${formatarCpf(funcionario.cpfFuncionario)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Telefone:</span>
                        <span>${funcionario.telefoneFuncionario}</span>
                    </div>
                </div>
                <div class="funcionario-actions">
                    <button class="action-button edit-button" data-id="${funcionario.idFuncionario}">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="action-button delete-button" data-id="${funcionario.idFuncionario}">
                        <i class="fas fa-trash-alt"></i> Excluir
                    </button>
                    <button class="action-button view-orders-button" data-id="${funcionario.idFuncionario}">
                        <i class="fas fa-file-alt"></i> Ver Ordens
                    </button>
                </div>
            `;

            funcionarioList.appendChild(card);

            // Adicionar event listeners para os botões
            card.querySelector('.edit-button').addEventListener('click', () => editarFuncionario(funcionario.idFuncionario));
            card.querySelector('.delete-button').addEventListener('click', () => excluirFuncionario(funcionario.idFuncionario));
            card.querySelector('.view-orders-button').addEventListener('click', () => verOrdensFuncionario(funcionario.idFuncionario));
        });
    }

    async function editarFuncionario(id) {
        try {
            const { response, data } = await fetchApi(`/funcionario/${id}`);
            
            if (response.ok) {
                // Preencher o formulário com os dados do funcionário
                funcionarioForm.elements.nmFuncionario.value = data.nmFuncionario;
                funcionarioForm.elements.cargo.value = data.cargo;
                funcionarioForm.elements.cpfFuncionario.value = data.cpfFuncionario;
                funcionarioForm.elements.telefoneFuncionario.value = data.telefoneFuncionario;

                // Armazenar o ID para usar no submit
                funcionarioForm.dataset.id = id;
                
                abrirModal('funcionario-modal');
            } else {
                mostrarAlerta('Erro ao carregar dados do funcionário', 'danger');
            }
        } catch (error) {
            console.error('Erro ao carregar funcionário para edição:', error);
            mostrarAlerta('Erro ao carregar dados do funcionário', 'danger');
        }
    }

    async function excluirFuncionario(id) {
        confirmarExclusao('Tem certeza que deseja excluir este funcionário? Todas as ordens de serviço relacionadas serão excluídas.', async () => {
            try {
                const { response, data } = await fetchApi(`/funcionario/${id}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    mostrarAlerta('Funcionário excluído com sucesso!', 'success');
                    carregarFuncionarios();
                } else {
                    mostrarAlerta('Erro ao excluir funcionário', 'danger');
                }
            } catch (error) {
                console.error('Erro ao excluir funcionário:', error);
                mostrarAlerta('Erro ao excluir funcionário', 'danger');
            }
        });
    }

    async function verOrdensFuncionario(id) {
        window.location.href = `ordens-servico.html?funcionario=${id}`;
    }
});