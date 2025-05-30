package com.studio.Studio.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "tbPeca")
public class PecaModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int idPeca;

    @NotBlank
    private String nmPeca;

    @NotNull
    @Min(0)
    private int qtdEstoque;

    @NotNull
    @Min(0)
    private double vlPeca;

    // Getters e Setters
    public int getIdPeca() {
        return idPeca;
    }

    public void setIdPeca(int idPeca) {
        this.idPeca = idPeca;
    }

    public String getNmPeca() {
        return nmPeca;
    }

    public void setNmPeca(String nmPeca) {
        this.nmPeca = nmPeca;
    }

    public int getQtdEstoque() {
        return qtdEstoque;
    }

    public void setQtdEstoque(int qtdEstoque) {
        this.qtdEstoque = qtdEstoque;
    }

    public double getVlPeca() {
        return vlPeca;
    }

    public void setVlPeca(double vlPeca) {
        this.vlPeca = vlPeca;
    }
}