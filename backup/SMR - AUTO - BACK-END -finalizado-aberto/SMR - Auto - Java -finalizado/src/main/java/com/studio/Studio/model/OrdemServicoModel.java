package com.studio.Studio.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "tbOrdemServico")
public class OrdemServicoModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int idServico;

    @ManyToOne
    @JoinColumn(name = "idCliente", foreignKey = @ForeignKey(value = ConstraintMode.CONSTRAINT, foreignKeyDefinition = "FOREIGN KEY (idCliente) REFERENCES tbCliente(idCliente) ON DELETE CASCADE"))
    @NotNull
    private ClienteModel cliente;

    @Temporal(TemporalType.TIMESTAMP)
    @NotNull
    private Date dataInicio;

    @NotNull
    private String descricaoServico;

    @ManyToOne
    @JoinColumn(name = "idFuncionario")
    @NotNull
    private FuncionarioModel funcionario;

    @NotBlank
    private String veiculo;

    @OneToMany(mappedBy = "ordemServico", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<PecaServicoModel> pecasUtilizadas = new ArrayList<>();

    // Adicione métodos auxiliares para gerenciar a coleção
    public void addPecaServico(PecaServicoModel pecaServico) {
        if (pecasUtilizadas == null) {
            pecasUtilizadas = new ArrayList<>();
        }
        pecasUtilizadas.add(pecaServico);
        pecaServico.setOrdemServico(this);
    }

    public void removePecaServico(PecaServicoModel pecaServico) {
        if (pecasUtilizadas != null) {
            pecasUtilizadas.remove(pecaServico);
            pecaServico.setOrdemServico(null);
        }
    }

    public void limparPecasServico() {
        if (pecasUtilizadas != null) {
            pecasUtilizadas.clear();
        }
    }

    @NotNull
    private double vlServico;

    @Enumerated(EnumType.STRING)
    @NotNull
    private FormaPagamento formaPagamento;

    private double desconto;

    // Adicionando o campo valorFinal
    private double valorFinal;

    // Getters e Setters
    public int getIdServico() {
        return idServico;
    }

    public void setIdServico(int idServico) {
        this.idServico = idServico;
    }

    public ClienteModel getCliente() {
        return cliente;
    }

    public void setCliente(ClienteModel cliente) {
        this.cliente = cliente;
    }

    public Date getDataInicio() {
        return dataInicio;
    }

    public void setDataInicio(Date dataInicio) {
        this.dataInicio = dataInicio;
    }

    public String getDescricaoServico() {
        return descricaoServico;
    }

    public void setDescricaoServico(String descricaoServico) {
        this.descricaoServico = descricaoServico;
    }

    public FuncionarioModel getFuncionario() {
        return funcionario;
    }

    public void setFuncionario(FuncionarioModel funcionario) {
        this.funcionario = funcionario;
    }

    public String getVeiculo() {
        return veiculo;
    }

    public void setVeiculo(String veiculo) {
        this.veiculo = veiculo;
    }

    public List<PecaServicoModel> getPecasUtilizadas() {
        return pecasUtilizadas;
    }

    public void setPecasUtilizadas(List<PecaServicoModel> pecasUtilizadas) {
        this.pecasUtilizadas = pecasUtilizadas;
    }

    public double getVlServico() {
        return vlServico;
    }

    public void setVlServico(double vlServico) {
        this.vlServico = vlServico;
    }

    public FormaPagamento getFormaPagamento() {
        return formaPagamento;
    }

    public void setFormaPagamento(FormaPagamento formaPagamento) {
        this.formaPagamento = formaPagamento;
    }

    public double getDesconto() {
        return desconto;
    }

    public void setDesconto(double desconto) {
        this.desconto = desconto;
    }

    // Getter e Setter para o novo campo valorFinal
    public double getValorFinal() {
        return valorFinal;
    }

    public void setValorFinal(double valorFinal) {
        this.valorFinal = valorFinal;
    }
}