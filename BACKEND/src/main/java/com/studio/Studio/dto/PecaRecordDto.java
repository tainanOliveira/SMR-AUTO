package com.studio.Studio.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PecaRecordDto(
        @NotBlank String nmPeca,
        @NotNull @Min(0) Integer qtdEstoque,
        @NotNull @Min(0) Double vlPeca
) {}