package com.tripsplit.user;

import com.tripsplit.common.dto.*;
import com.tripsplit.config.JwtConfig;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtConfig jwtConfig;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtConfig jwtConfig) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtConfig = jwtConfig;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (req.name() == null || req.name().isBlank() ||
            req.email() == null || req.email().isBlank() ||
            req.password() == null || req.password().isBlank()) {
            return ResponseEntity.badRequest().body(new ApiError("Name, email, and password are required"));
        }
        if (userRepository.existsByEmail(req.email())) {
            return ResponseEntity.badRequest().body(new ApiError("Email already registered"));
        }

        User user = new User(req, passwordEncoder);
        boolean firstUser = userRepository.count() == 0;
        user.setRole(firstUser ? "ROLE_ADMIN" : "ROLE_USER");
        user = userRepository.save(user);

        String token = jwtConfig.generateToken(user.getId(), user.getEmail(), user.getRole());
        return ResponseEntity.ok(new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        User user = userRepository.findByEmail(req.email()).orElse(null);
        if (user == null || !passwordEncoder.matches(req.password(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiError("Invalid email or password"));
        }
        String token = jwtConfig.generateToken(user.getId(), user.getEmail(), user.getRole());
        return ResponseEntity.ok(new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole()));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestAttribute(value = "userId", required = false) String userId) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiError("Not authenticated"));
        }
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiError("User not found"));
        }
        return ResponseEntity.ok(new AuthResponse(null, user.getId(), user.getName(), user.getEmail(), user.getRole()));
    }
}
