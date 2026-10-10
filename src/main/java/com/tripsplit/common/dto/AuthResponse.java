package com.tripsplit.common.dto;

public record AuthResponse(String token, String userId, String name, String email, String role) {}
