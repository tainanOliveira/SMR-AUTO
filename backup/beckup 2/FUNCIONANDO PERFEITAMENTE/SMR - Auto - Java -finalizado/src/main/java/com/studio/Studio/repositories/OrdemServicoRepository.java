package com.studio.Studio.repositories;

import com.studio.Studio.model.OrdemServicoModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrdemServicoRepository extends JpaRepository<OrdemServicoModel, Integer> {
    // Métodos de exclusão por cliente e funcionário
    @Modifying
    void deleteByClienteIdCliente(int idCliente);

    @Modifying
    void deleteByFuncionarioIdFuncionario(int idFuncionario);

    // Métodos de busca por cliente e funcionário
    List<OrdemServicoModel> findByClienteIdCliente(int idCliente);

    List<OrdemServicoModel> findByFuncionarioIdFuncionario(int idFuncionario);

    // Novo método para busca por nome do cliente ou CPF
    @Query("SELECT o FROM OrdemServicoModel o " +
            "JOIN o.cliente c " +
            "WHERE LOWER(c.nmCliente) LIKE LOWER(CONCAT('%', :termo, '%')) " +
            "OR c.cpfCliente LIKE CONCAT('%', :termo, '%')")
    List<OrdemServicoModel> findByClienteNomeOrCpf(@Param("termo") String termo);
}