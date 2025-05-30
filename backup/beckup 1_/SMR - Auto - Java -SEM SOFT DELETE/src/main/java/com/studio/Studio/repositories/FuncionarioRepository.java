package com.studio.Studio.repositories;

import com.studio.Studio.model.FuncionarioModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FuncionarioRepository extends JpaRepository<FuncionarioModel, Integer> {
    Optional<FuncionarioModel> findById(int id);

    Optional<FuncionarioModel> findByCpfFuncionario(String cpf);

    List<FuncionarioModel> findByNmFuncionarioContainingIgnoreCase(String nome);

    List<FuncionarioModel> findByCargoContainingIgnoreCase(String cargo);
}