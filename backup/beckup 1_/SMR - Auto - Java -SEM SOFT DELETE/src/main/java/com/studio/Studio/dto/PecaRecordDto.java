package com.studio.Studio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record PecaRecordDto(
        @NotBlank String nmPeca,
        @NotNull @Positive Integer qtdEstoque,
        @NotNull @Positive Double vlPeca
) {}