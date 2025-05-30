package com.studio.Studio.controllers;

import com.studio.Studio.dto.PecaRecordDto;
import com.studio.Studio.model.PecaModel;
import com.studio.Studio.repositories.PecaRepository;
import com.studio.Studio.repositories.PecaServicoRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/peca")
public class PecaController {

    @Autowired
    private PecaRepository pecaRepository;

    @Autowired
    private PecaServicoRepository pecaServicoRepository;

    @PostMapping
    public ResponseEntity<PecaModel> savePeca(@RequestBody @Valid PecaRecordDto pecaRecordDto) {
        var pecaModel = new PecaModel();
        BeanUtils.copyProperties(pecaRecordDto, pecaModel);

        return ResponseEntity.status(HttpStatus.CREATED).body(pecaRepository.save(pecaModel));
    }

    @GetMapping
    public ResponseEntity<List<PecaModel>> getAllPecas() {
        return ResponseEntity.status(HttpStatus.OK).body(pecaRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getOnePeca(@PathVariable(value = "id") int id) {
        Optional<PecaModel> peca = pecaRepository.findById(id);
        if (peca.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Peça não encontrada");
        }
        return ResponseEntity.status(HttpStatus.OK).body(peca.get());
    }

    @GetMapping("/nome/{nome}")
    public ResponseEntity<List<PecaModel>> getPecasByNome(@PathVariable(value = "nome") String nome) {
        List<PecaModel> pecas = pecaRepository.findByNmPecaContainingIgnoreCase(nome);
        if (pecas.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.status(HttpStatus.OK).body(pecas);
    }

    @GetMapping("/estoque-baixo")
    public ResponseEntity<List<PecaModel>> getPecasByEstoqueBaixo() {
        List<PecaModel> pecas = pecaRepository.findAll();
        List<PecaModel> pecasEstoqueBaixo = pecas.stream()
                .filter(peca -> peca.getQtdEstoque() <= 2)
                .collect(Collectors.toList());

        return ResponseEntity.status(HttpStatus.OK).body(pecasEstoqueBaixo);
    }

    @PatchMapping("/{id}/estoque")
    public ResponseEntity<Object> ajustarEstoque(@PathVariable(value = "id") int id,
                                                 @RequestParam("quantidade") int quantidade) {
        Optional<PecaModel> peca = pecaRepository.findById(id);
        if (peca.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Peça não encontrada");
        }

        var pecaModel = peca.get();
        int estoqueAtual = pecaModel.getQtdEstoque();
        int novoEstoque = estoqueAtual + quantidade;

        // Verificar se o estoque ficará negativo
        if (novoEstoque < 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Estoque insuficiente para esta operação");
        }

        pecaModel.setQtdEstoque(novoEstoque);
        return ResponseEntity.status(HttpStatus.OK).body(pecaRepository.save(pecaModel));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> updatePeca(@PathVariable(value = "id") int id,
                                             @RequestBody @Valid PecaRecordDto pecaRecordDto) {
        Optional<PecaModel> peca = pecaRepository.findById(id);
        if (peca.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Peça não encontrada");
        }

        var pecaModel = peca.get();
        BeanUtils.copyProperties(pecaRecordDto, pecaModel);
        return ResponseEntity.status(HttpStatus.OK).body(pecaRepository.save(pecaModel));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Object> deletePeca(@PathVariable(value = "id") int id) {
        Optional<PecaModel> peca = pecaRepository.findById(id);
        if (peca.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Peça não encontrada");
        }

        try {
            // Remove todas as peças de serviço associadas à peça
            pecaServicoRepository.deleteByPeca_IdPeca(id);

            // Remove a peça
            pecaRepository.deleteById(id);

            return ResponseEntity.status(HttpStatus.OK).body("Peça excluída com sucesso");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erro ao excluir peça: " + e.getMessage());
        }
    }
}