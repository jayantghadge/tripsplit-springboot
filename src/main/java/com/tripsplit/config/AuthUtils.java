package com.tripsplit.config;

import com.tripsplit.user.UserRepository;
import org.springframework.stereotype.Component;

@Component
public class AuthUtils {

    private final UserRepository userRepository;

    public AuthUtils(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public boolean isAdmin(String userId) {
        return userRepository.findById(userId)
                .map(u -> "ROLE_ADMIN".equals(u.getRole()))
                .orElse(false);
    }
}
