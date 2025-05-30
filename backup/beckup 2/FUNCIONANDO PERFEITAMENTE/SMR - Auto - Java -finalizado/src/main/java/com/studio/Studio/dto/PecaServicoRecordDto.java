package com.studio.Studio.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record PecaServicoRecordDto(
        @NotNull Integer idPeca,
        @NotNull @Positive Integer qtdPecas
) {}