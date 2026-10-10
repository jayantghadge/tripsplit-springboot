package com.tripsplit.common.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseResponse(
    Long id, Long tripId,
    Long paidByUserId, String paidByName,
    BigDecimal amount, String description,
    String category, LocalDate date
) {}
