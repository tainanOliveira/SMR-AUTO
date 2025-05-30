package com.studio.Studio.controllers;

import com.studio.Studio.dto.ClienteRecordDto;
import com.studio.Studio.model.ClienteModel;
import com.studio.Studio.repositories.ClienteRepository;
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
@RequestMapping("/cliente")
public class ClienteController {

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private OrdemServicoRepository ordemServicoRepository;

    @PostMapping
    public ResponseEntity<ClienteModel> saveCliente(@RequestBody @Valid ClienteRecordDto clienteRecordDto) {
        var clienteModel = new ClienteModel();
        BeanUtils.copyProperties(clienteRecordDto, clienteModel);

        // Verificar se já existe cliente com o mesmo CPF
        Optional<ClienteModel> clienteExistente = clienteRepository.findByCpfCliente(clienteRecordDto.cpfCliente());
        if (clienteExistente.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(clienteRepository.save(clienteModel));
    }

    @GetMapping
    public ResponseEntity<List<ClienteModel>> getAllClientes() {
        return ResponseEntity.status(HttpStatus.OK).body(clienteRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getOneCliente(@PathVariable(value = "id") int id) {
        Optional<ClienteModel> cliente = clienteRepository.findById(id);
        if (cliente.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cliente não encontrado");
        }
        return ResponseEntity.status(HttpStatus.OK).body(cliente.get());
    }

    @GetMapping("/nome/{nome}")
    public ResponseEntity<List<ClienteModel>> getClientesByNome(@PathVariable(value = "nome") String nome) {
        List<ClienteModel> clientes = clienteRepository.findByNmClienteContainingIgnoreCase(nome);
        if (clientes.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.status(HttpStatus.OK).body(clientes);
    }

    @GetMapping("/cpf/{cpf}")
    public ResponseEntity<Object> getClienteByCpf(@PathVariable(value = "cpf") String cpf) {
        Optional<ClienteModel> cliente = clienteRepository.findByCpfCliente(cpf);
        if (cliente.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cliente não encontrado");
        }
        return ResponseEntity.status(HttpStatus.OK).body(cliente.get());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> updateCliente(@PathVariable(value = "id") int id,
                                                @RequestBody @Valid ClienteRecordDto clienteRecordDto) {
        Optional<ClienteModel> cliente = clienteRepository.findById(id);
        if (cliente.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cliente não encontrado");
        }

        // Verificar se já existe outro cliente com o mesmo CPF
        Optional<ClienteModel> clienteExistente = clienteRepository.findByCpfCliente(clienteRecordDto.cpfCliente());
        if (clienteExistente.isPresent() && clienteExistente.get().getIdCliente() != id) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("CPF já cadastrado para outro cliente");
        }

        var clienteModel = cliente.get();
        BeanUtils.copyProperties(clienteRecordDto, clienteModel);
        return ResponseEntity.status(HttpStatus.OK).body(clienteRepository.save(clienteModel));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Object> deleteCliente(@PathVariable(value = "id") int id) {
        Optional<ClienteModel> cliente = clienteRepository.findById(id);
        if (cliente.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cliente não encontrado");
        }

        try {
            // Remove todas as ordens de serviço associadas ao cliente
            ordemServicoRepository.deleteByClienteIdCliente(id);

            // Remove o cliente
            clienteRepository.deleteById(id);

            return ResponseEntity.status(HttpStatus.OK).body("Cliente excluído com sucesso");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erro ao excluir cliente: " + e.getMessage());
        }
    }
}