package com.studio.Studio.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "tbCliente")
public class ClienteModel {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private int idCliente;

        @NotBlank
        private String nmCliente;

        private String rua;
        private String cidade;
        private String estado;
        private String cep;

        @NotBlank
        private String telefoneCliente;

        @NotBlank
        private String cpfCliente;


        // Getters e Setters
        public int getIdCliente() {
                return idCliente;
        }

        public void setIdCliente(int idCliente) {
                this.idCliente = idCliente;
        }

        public String getNmCliente() {
                return nmCliente;
        }

        public void setNmCliente(String nmCliente) {
                this.nmCliente = nmCliente;
        }

        public String getRua() {
                return rua;
        }

        public void setRua(String rua) {
                this.rua = rua;
        }

        public String getCidade() {
                return cidade;
        }

        public void setCidade(String cidade) {
                this.cidade = cidade;
        }

        public String getEstado() {
                return estado;
        }

        public void setEstado(String estado) {
                this.estado = estado;
        }

        public String getCep() {
                return cep;
        }

        public void setCep(String cep) {
                this.cep = cep;
        }

        public String getTelefoneCliente() {
                return telefoneCliente;
        }

        public void setTelefoneCliente(String telefoneCliente) {
                this.telefoneCliente = telefoneCliente;
        }

        public String getCpfCliente() {
                return cpfCliente;
        }

        public void setCpfCliente(String cpfCliente) {
                this.cpfCliente = cpfCliente;
        }

        }