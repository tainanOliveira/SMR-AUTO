package com.studio.Studio.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
@Table(name = "tbPecaServico")
public class PecaServicoModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "idPeca")
    private PecaModel peca;

    @ManyToOne
    @JoinColumn(name = "idServico", foreignKey = @ForeignKey(value = ConstraintMode.CONSTRAINT, foreignKeyDefinition = "FOREIGN KEY (idServico) REFERENCES tbOrdemServico(idServico) ON DELETE CASCADE"))
    @JsonBackReference
    private OrdemServicoModel ordemServico;

    @NotNull
    @Positive
    private int qtdPecas;

    @NotNull
    @Positive
    private double valorTotal;

    // Removido o campo ativo

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public PecaModel getPeca() {
        return peca;
    }

    public void setPeca(PecaModel peca) {
        this.peca = peca;
    }

    public OrdemServicoModel getOrdemServico() {
        return ordemServico;
    }

    public void setOrdemServico(OrdemServicoModel ordemServico) {
        this.ordemServico = ordemServico;
    }

    public int getQtdPecas() {
        return qtdPecas;
    }

    public void setQtdPecas(int qtdPecas) {
        this.qtdPecas = qtdPecas;
    }

    public double getValorTotal() {
        return valorTotal;
    }

    public void setValorTotal(double valorTotal) {
        this.valorTotal = valorTotal;
    }
}