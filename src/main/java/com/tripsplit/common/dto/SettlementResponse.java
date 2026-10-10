package com.tripsplit.common.dto;

import java.math.BigDecimal;

public record SettlementResponse(
    Long fromUserId, String fromUserName,
    Long toUserId, String toUserName,
    BigDecimal amount
) {}
