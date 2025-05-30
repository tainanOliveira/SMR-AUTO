package com.studio.Studio.repositories;

import com.studio.Studio.model.PecaServicoModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PecaServicoRepository extends JpaRepository<PecaServicoModel, Integer> {
    void deleteByPeca_IdPeca(int idPeca);
    void deleteByOrdemServico_IdServico(int idServico);
}