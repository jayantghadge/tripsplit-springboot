package com.tripsplit.common.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record CreateExpenseRequest(
    @NotNull Long tripId,
    @NotNull Long paidByUserId,
    @NotNull @Positive BigDecimal amount,
    @NotBlank String description,
    @NotNull LocalDate date,
    String category,
    List<SplitEntry> splits
) {
    public record SplitEntry(@NotNull Long userId, @NotNull @Positive BigDecimal amount) {}
}
