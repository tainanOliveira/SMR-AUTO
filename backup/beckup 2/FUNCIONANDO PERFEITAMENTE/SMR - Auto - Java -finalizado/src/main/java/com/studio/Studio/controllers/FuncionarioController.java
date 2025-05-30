package com.studio.Studio.controllers;

import com.studio.Studio.dto.FuncionarioRecordDto;
import com.studio.Studio.model.FuncionarioModel;
import com.studio.Studio.repositories.FuncionarioRepository;
import com.studio.Studio.repositories.OrdemServicoRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/funcionario")
public class FuncionarioController {

    @Autowired
    private FuncionarioRepository funcionarioRepository;

    @Autowired
    private OrdemServicoRepository ordemServicoRepository;

    @PostMapping
    public ResponseEntity<FuncionarioModel> saveFuncionario(@RequestBody @Valid FuncionarioRecordDto funcionarioRecordDto) {
        var funcionarioModel = new FuncionarioModel();
        BeanUtils.copyProperties(funcionarioRecordDto, funcionarioModel);

        // Verificar se já existe funcionário com o mesmo CPF
        Optional<FuncionarioModel> funcionarioExistente = funcionarioRepository.findByCpfFuncionario(funcionarioRecordDto.cpfFuncionario());
        if (funcionarioExistente.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(funcionarioRepository.save(funcionarioModel));
    }

    @GetMapping
    public ResponseEntity<List<FuncionarioModel>> getAllFuncionarios() {
        return ResponseEntity.status(HttpStatus.OK).body(funcionarioRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getOneFuncionario(@PathVariable(value = "id") int id) {
        Optional<FuncionarioModel> funcionario = funcionarioRepository.findById(id);
        if (funcionario.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Funcionário não encontrado");
        }
        return ResponseEntity.status(HttpStatus.OK).body(funcionario.get());
    }

    @GetMapping("/nome/{nome}")
    public ResponseEntity<List<FuncionarioModel>> getFuncionariosByNome(@PathVariable(value = "nome") String nome) {
        List<FuncionarioModel> funcionarios = funcionarioRepository.findByNmFuncionarioContainingIgnoreCase(nome);
        if (funcionarios.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.status(HttpStatus.OK).body(funcionarios);
    }

    @GetMapping("/cargo/{cargo}")
    public ResponseEntity<List<FuncionarioModel>> getFuncionariosByCargo(@PathVariable(value = "cargo") String cargo) {
        List<FuncionarioModel> funcionarios = funcionarioRepository.findByCargoContainingIgnoreCase(cargo);
        if (funcionarios.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.status(HttpStatus.OK).body(funcionarios);
    }

    @GetMapping("/cpf/{cpf}")
    public ResponseEntity<Object> getFuncionarioByCpf(@PathVariable(value = "cpf") String cpf) {
        Optional<FuncionarioModel> funcionario = funcionarioRepository.findByCpfFuncionario(cpf);
        if (funcionario.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Funcionário não encontrado");
        }
        return ResponseEntity.status(HttpStatus.OK).body(funcionario.get());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> updateFuncionario(@PathVariable(value = "id") int id,
                                                    @RequestBody @Valid FuncionarioRecordDto funcionarioRecordDto) {
        Optional<FuncionarioModel> funcionario = funcionarioRepository.findById(id);
        if (funcionario.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Funcionário não encontrado");
        }

        // Verificar se já existe outro funcionário com o mesmo CPF
        Optional<FuncionarioModel> funcionarioExistente = funcionarioRepository.findByCpfFuncionario(funcionarioRecordDto.cpfFuncionario());
        if (funcionarioExistente.isPresent() && funcionarioExistente.get().getIdFuncionario() != id) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("CPF já cadastrado para outro funcionário");
        }

        var funcionarioModel = funcionario.get();
        BeanUtils.copyProperties(funcionarioRecordDto, funcionarioModel);
        return ResponseEntity.status(HttpStatus.OK).body(funcionarioRepository.save(funcionarioModel));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Object> deleteFuncionario(@PathVariable(value = "id") int id) {
        Optional<FuncionarioModel> funcionario = funcionarioRepository.findById(id);
        if (funcionario.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Funcionário não encontrado");
        }

        try {
            // Remove todas as ordens de serviço associadas ao funcionário
            ordemServicoRepository.deleteByFuncionarioIdFuncionario(id);

            // Remove o funcionário
            funcionarioRepository.deleteById(id);

            return ResponseEntity.status(HttpStatus.OK).body("Funcionário excluído com sucesso");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erro ao excluir funcionário: " + e.getMessage());
        }
    }
}