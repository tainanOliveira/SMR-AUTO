package com.studio.Studio.repositories;

import com.studio.Studio.model.ClienteModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<ClienteModel, Integer> {
    Optional<ClienteModel> findById(int id);

    Optional<ClienteModel> findByCpfCliente(String cpf);

    List<ClienteModel> findByNmClienteContainingIgnoreCase(String nome);

    // Novo método para buscar por nome ou CPF
    List<ClienteModel> findByNmClienteContainingIgnoreCaseOrCpfCliente(String nome, String cpf);
}