package com.studio.Studio.repositories;

import com.studio.Studio.model.PecaModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PecaRepository extends JpaRepository<PecaModel, Integer> {
    Optional<PecaModel> findById(int id);

    List<PecaModel> findByNmPecaContainingIgnoreCase(String nome);
}