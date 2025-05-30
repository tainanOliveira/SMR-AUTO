package com.studio.Studio.dto;

import com.studio.Studio.model.FormaPagamento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.util.List;

public record OrdemServicoRecordDto(
        @NotNull Integer idCliente,
        @NotNull Integer idFuncionario,
        @NotNull String descricaoServico,
        @NotBlank String veiculo,
        @NotNull @Positive Double vlServico,
        @NotNull FormaPagamento formaPagamento,
        @NotNull String status,  // Adicionar este campo
        @NotNull @Size(min = 1, message = "A ordem de serviço deve ter pelo menos 1 peça")
        List<PecaServicoRecordDto> pecas
) {}