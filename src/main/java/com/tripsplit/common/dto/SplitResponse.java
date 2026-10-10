package com.tripsplit.common.dto;

import java.math.BigDecimal;

public record SplitResponse(Long expenseId, Long userId, String userName, BigDecimal amount, boolean settled) {}
