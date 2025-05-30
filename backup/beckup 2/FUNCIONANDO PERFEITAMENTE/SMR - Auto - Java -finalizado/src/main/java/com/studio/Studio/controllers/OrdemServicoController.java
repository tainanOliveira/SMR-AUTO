package com.studio.Studio.controllers;

import com.studio.Studio.dto.OrdemServicoRecordDto;
import com.studio.Studio.dto.PecaServicoRecordDto;
import com.studio.Studio.model.*;
import com.studio.Studio.repositories.*;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/ordem-servico")
public class OrdemServicoController {

    // Taxa de desconto para pagamentos em dinheiro e PIX (5%)
    private static final double TAXA_DESCONTO = 0.05;

    @Autowired
    private OrdemServicoRepository ordemServicoRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private FuncionarioRepository funcionarioRepository;

    @Autowired
    private PecaRepository pecaRepository;

    @Autowired
    private PecaServicoRepository pecaServicoRepository;

    // Endpoint de busca por nome do cliente ou CPF
    @GetMapping("/busca")
    public ResponseEntity<List<OrdemServicoModel>> buscarOrdensServico(
            @RequestParam(required = false) String termo
    ) {
        if (termo == null || termo.trim().isEmpty()) {
            return ResponseEntity.ok(ordemServicoRepository.findAll());
        }

        List<OrdemServicoModel> ordensEncontradas = ordemServicoRepository.findByClienteNomeOrCpf(termo);

        if (ordensEncontradas.isEmpty()) {
            return ResponseEntity.ok(new ArrayList<>());
        }

        return ResponseEntity.ok(ordensEncontradas);
    }

    // Métodos anteriores (getAllOrdensServico, getOneOrdemServico, etc.) permanecem os mesmos
    @GetMapping
    public ResponseEntity<List<OrdemServicoModel>> getAllOrdensServico() {
        return ResponseEntity.status(HttpStatus.OK).body(ordemServicoRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getOneOrdemServico(@PathVariable(value = "id") int id) {
        Optional<OrdemServicoModel> ordemServico = ordemServicoRepository.findById(id);
        if (ordemServico.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Ordem de serviço não encontrada");
        }
        return ResponseEntity.status(HttpStatus.OK).body(ordemServico.get());
    }

    @GetMapping("/cliente/{idCliente}")
    public ResponseEntity<Object> getOrdensByCliente(@PathVariable(value = "idCliente") int idCliente) {
        // Verificar se o cliente existe
        if (!clienteRepository.existsById(idCliente)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cliente não encontrado");
        }

        List<OrdemServicoModel> ordens = ordemServicoRepository.findByClienteIdCliente(idCliente);
        return ResponseEntity.status(HttpStatus.OK).body(ordens);
    }

    @GetMapping("/funcionario/{idFuncionario}")
    public ResponseEntity<Object> getOrdensByFuncionario(@PathVariable(value = "idFuncionario") int idFuncionario) {
        // Verificar se o funcionário existe
        if (!funcionarioRepository.existsById(idFuncionario)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Funcionário não encontrado");
        }

        List<OrdemServicoModel> ordens = ordemServicoRepository.findByFuncionarioIdFuncionario(idFuncionario);
        return ResponseEntity.status(HttpStatus.OK).body(ordens);
    }

    @PostMapping
    @Transactional
    public ResponseEntity<Object> saveOrdemServico(@RequestBody @Valid OrdemServicoRecordDto ordemServicoRecordDto) {
        // Verificar se o cliente existe
        Optional<ClienteModel> cliente = clienteRepository.findById(ordemServicoRecordDto.idCliente());
        if (cliente.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cliente não encontrado");
        }

        // Verificar se o funcionário existe
        Optional<FuncionarioModel> funcionario = funcionarioRepository.findById(ordemServicoRecordDto.idFuncionario());
        if (funcionario.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Funcionário não encontrado");
        }

        // Verificar quantidade mínima de peças (pelo menos 1)
        if (ordemServicoRecordDto.pecas() == null || ordemServicoRecordDto.pecas().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("A ordem de serviço deve conter pelo menos 1 peça");
        }

        // Criar a ordem de serviço
        var ordemServicoModel = new OrdemServicoModel();
        ordemServicoModel.setCliente(cliente.get());
        ordemServicoModel.setFuncionario(funcionario.get());
        ordemServicoModel.setDataInicio(new Date());
        ordemServicoModel.setDescricaoServico(ordemServicoRecordDto.descricaoServico());
        ordemServicoModel.setVeiculo(ordemServicoRecordDto.veiculo());

        // CORREÇÃO 1: Definir o valor do serviço exatamente como fornecido pelo usuário
        ordemServicoModel.setVlServico(ordemServicoRecordDto.vlServico());
        ordemServicoModel.setFormaPagamento(ordemServicoRecordDto.formaPagamento());

        // Salvar a ordem de serviço para obter o ID
        OrdemServicoModel ordemSalva = ordemServicoRepository.save(ordemServicoModel);

        // Processar as peças
        List<PecaServicoModel> pecasUtilizadas = new ArrayList<>();
        double valorTotalPecas = 0.0;

        for (PecaServicoRecordDto pecaDto : ordemServicoRecordDto.pecas()) {
            // Verificar se a peça existe
            Optional<PecaModel> peca = pecaRepository.findById(pecaDto.idPeca());
            if (peca.isEmpty()) {
                // Fazer rollback manual
                ordemServicoRepository.delete(ordemSalva);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Peça não encontrada: ID " + pecaDto.idPeca());
            }

            PecaModel pecaModel = peca.get();

            // Criar PecaServicoModel
            PecaServicoModel pecaServicoModel = new PecaServicoModel();
            pecaServicoModel.setPeca(pecaModel);
            pecaServicoModel.setOrdemServico(ordemSalva);

            // CORREÇÃO 2: Usar a quantidade exata fornecida
            pecaServicoModel.setQtdPecas(pecaDto.qtdPecas());

            // Calcular valor total da peça
            double valorPecaTotal = pecaModel.getVlPeca() * pecaDto.qtdPecas();
            pecaServicoModel.setValorTotal(valorPecaTotal);

            // Salvar peça de serviço
            pecaServicoRepository.save(pecaServicoModel);
            pecasUtilizadas.add(pecaServicoModel);

            // Atualizar estoque
            int novoEstoque = pecaModel.getQtdEstoque() - pecaDto.qtdPecas();
            pecaModel.setQtdEstoque(novoEstoque);
            pecaRepository.save(pecaModel);

            valorTotalPecas += valorPecaTotal;
        }

        // Atualizar ordem de serviço com peças
        ordemSalva.setPecasUtilizadas(pecasUtilizadas);

// Aplicar desconto para pagamentos em dinheiro ou PIX
        double vlServicoOriginal = ordemSalva.getVlServico(); // Guardar o valor original da mão de obra
        double valorTotal = valorTotalPecas + vlServicoOriginal; // Calcular valor total antes do desconto

        if (ordemServicoRecordDto.formaPagamento() == FormaPagamento.DINHEIRO ||
                ordemServicoRecordDto.formaPagamento() == FormaPagamento.PIX) {
            double desconto = valorTotal * TAXA_DESCONTO; // Aplicar desconto sobre o valor total
            ordemSalva.setDesconto(desconto);
        } else {
            ordemSalva.setDesconto(0.0);
        }

// Manter o valor da mão de obra intacto
        ordemSalva.setVlServico(vlServicoOriginal);

// Calcular valor final (valor total - desconto)
        double valorFinal = valorTotal - ordemSalva.getDesconto();
        ordemSalva.setValorFinal(valorFinal);





        // Salvar ordem de serviço atualizada
        return ResponseEntity.status(HttpStatus.CREATED).body(ordemServicoRepository.save(ordemSalva));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<Object> updateOrdemServico(@PathVariable(value = "id") int id,
                                                     @RequestBody @Valid OrdemServicoRecordDto ordemServicoRecordDto) {
        // Verificar se a ordem de serviço existe
        Optional<OrdemServicoModel> ordemServicoOpt = ordemServicoRepository.findById(id);
        if (ordemServicoOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Ordem de serviço não encontrada");
        }

        // Verificar se o cliente existe
        Optional<ClienteModel> cliente = clienteRepository.findById(ordemServicoRecordDto.idCliente());
        if (cliente.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cliente não encontrado");
        }

        // Verificar se o funcionário existe
        Optional<FuncionarioModel> funcionario = funcionarioRepository.findById(ordemServicoRecordDto.idFuncionario());
        if (funcionario.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Funcionário não encontrado");
        }

        var ordemServicoModel = ordemServicoOpt.get();

        // CORREÇÃO 4: Guardar o valor da mão de obra original fornecido pelo usuário
        double vlServicoOriginal = ordemServicoRecordDto.vlServico();

        // Limpar peças antigas e restaurar estoque
        for (PecaServicoModel pecaServico : ordemServicoModel.getPecasUtilizadas()) {
            // Restaurar estoque das peças removidas
            PecaModel peca = pecaServico.getPeca();
            peca.setQtdEstoque(peca.getQtdEstoque() + pecaServico.getQtdPecas());
            pecaRepository.save(peca);
        }

        pecaServicoRepository.deleteByOrdemServico_IdServico(id);
        ordemServicoModel.limparPecasServico();

        // Processar as novas peças
        double valorTotalPecas = 0.0;

        for (PecaServicoRecordDto pecaDto : ordemServicoRecordDto.pecas()) {
            // Verificar se a peça existe
            Optional<PecaModel> peca = pecaRepository.findById(pecaDto.idPeca());
            if (peca.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Peça não encontrada: ID " + pecaDto.idPeca());
            }

            PecaModel pecaModel = peca.get();

            // Criar PecaServicoModel
            PecaServicoModel pecaServicoModel = new PecaServicoModel();
            pecaServicoModel.setPeca(pecaModel);

            // CORREÇÃO 5: Usar a quantidade exata fornecida
            pecaServicoModel.setQtdPecas(pecaDto.qtdPecas());

            // Calcular valor total da peça
            double valorPecaTotal = pecaModel.getVlPeca() * pecaDto.qtdPecas();
            pecaServicoModel.setValorTotal(valorPecaTotal);

            // Adicionar peça à ordem de serviço
            ordemServicoModel.addPecaServico(pecaServicoModel);

            // Atualizar estoque
            int novoEstoque = pecaModel.getQtdEstoque() - pecaDto.qtdPecas();
            pecaModel.setQtdEstoque(novoEstoque);
            pecaRepository.save(pecaModel);

            valorTotalPecas += valorPecaTotal;
        }

        // Atualizar ordem de serviço
        ordemServicoModel.setCliente(cliente.get());
        ordemServicoModel.setFuncionario(funcionario.get());
        ordemServicoModel.setDescricaoServico(ordemServicoRecordDto.descricaoServico());
        ordemServicoModel.setVeiculo(ordemServicoRecordDto.veiculo());

        // CORREÇÃO 6: Manter o valor da mão de obra exatamente como fornecido pelo usuário
        ordemServicoModel.setVlServico(vlServicoOriginal);
        ordemServicoModel.setFormaPagamento(ordemServicoRecordDto.formaPagamento());

        // Aplicar desconto para dinheiro ou PIX
        double valorTotal = valorTotalPecas + vlServicoOriginal; // Calcular valor total antes do desconto

        if (ordemServicoRecordDto.formaPagamento() == FormaPagamento.DINHEIRO ||
                ordemServicoRecordDto.formaPagamento() == FormaPagamento.PIX) {
            double desconto = valorTotal * TAXA_DESCONTO; // Aplicar desconto sobre o valor total
            ordemServicoModel.setDesconto(desconto);
        } else {
            ordemServicoModel.setDesconto(0.0);
        }

// Calcular valor final (valor total - desconto)
        double valorFinal = valorTotal - ordemServicoModel.getDesconto();
        ordemServicoModel.setValorFinal(valorFinal);

        return ResponseEntity.status(HttpStatus.OK).body(ordemServicoRepository.save(ordemServicoModel));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Object> deleteOrdemServico(@PathVariable(value = "id") int id) {
        Optional<OrdemServicoModel> ordemServicoOpt = ordemServicoRepository.findById(id);
        if (ordemServicoOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Ordem de serviço não encontrada");
        }

        try {
            // Restaurar estoque das peças
            OrdemServicoModel ordem = ordemServicoOpt.get();
            for (PecaServicoModel pecaServico : ordem.getPecasUtilizadas()) {
                PecaModel peca = pecaServico.getPeca();
                peca.setQtdEstoque(peca.getQtdEstoque() + pecaServico.getQtdPecas());
                pecaRepository.save(peca);
            }

            // Remove as peças de serviço associadas
            pecaServicoRepository.deleteByOrdemServico_IdServico(id);

            // Remove a ordem de serviço
            ordemServicoRepository.deleteById(id);

            return ResponseEntity.status(HttpStatus.OK).body("Ordem de serviço excluída com sucesso");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erro ao excluir ordem de serviço: " + e.getMessage());
        }
    }

    // Endpoint para listar todas as formas de pagamento disponíveis
    @GetMapping("/formas-pagamento")
    public ResponseEntity<FormaPagamento[]> getFormasPagamento() {
        return ResponseEntity.status(HttpStatus.OK).body(FormaPagamento.values());
    }
}