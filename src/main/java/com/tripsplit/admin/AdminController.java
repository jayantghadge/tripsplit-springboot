package com.tripsplit.admin;

import com.tripsplit.common.dto.ApiError;
import com.tripsplit.config.AuthUtils;
import com.tripsplit.expense.ExpenseRepository;
import com.tripsplit.settlement.SettlementRepository;
import com.tripsplit.trip.Trip;
import com.tripsplit.trip.TripRepository;
import com.tripsplit.user.User;
import com.tripsplit.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AuthUtils authUtils;
    private final UserRepository userRepository;
    private final TripRepository tripRepository;
    private final ExpenseRepository expenseRepository;
    private final SettlementRepository settlementRepository;

    public AdminController(AuthUtils authUtils, UserRepository userRepository,
                           TripRepository tripRepository, ExpenseRepository expenseRepository,
                           SettlementRepository settlementRepository) {
        this.authUtils = authUtils;
        this.userRepository = userRepository;
        this.tripRepository = tripRepository;
        this.expenseRepository = expenseRepository;
        this.settlementRepository = settlementRepository;
    }

    @GetMapping("/users")
    public ResponseEntity<?> listUsers(@RequestAttribute("userId") String userId) {
        if (!authUtils.isAdmin(userId)) return ResponseEntity.status(403).body(new ApiError("Access denied"));
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> result = users.stream().map(u -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", u.getId());
            m.put("name", u.getName());
            m.put("email", u.getEmail());
            m.put("role", u.getRole());
            m.put("createdAt", u.getCreatedAt());
            return m;
        }).toList();
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable String userId, @RequestAttribute("userId") String adminId) {
        if (!authUtils.isAdmin(adminId)) return ResponseEntity.status(403).body(new ApiError("Access denied"));
        if (userId.equals(adminId)) return ResponseEntity.badRequest().body(new ApiError("Cannot delete yourself"));
        userRepository.deleteById(userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<?> stats(@RequestAttribute("userId") String userId) {
        if (!authUtils.isAdmin(userId)) return ResponseEntity.status(403).body(new ApiError("Access denied"));
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalTrips", tripRepository.count());
        stats.put("totalExpenses", expenseRepository.count());
        stats.put("totalSettlements", settlementRepository.count());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/trips")
    public ResponseEntity<?> allTrips(@RequestAttribute("userId") String userId) {
        if (!authUtils.isAdmin(userId)) return ResponseEntity.status(403).body(new ApiError("Access denied"));
        List<Trip> trips = tripRepository.findAll();
        List<Map<String, Object>> result = trips.stream().map(t -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", t.getId());
            m.put("name", t.getName());
            m.put("destination", t.getDestination());
            m.put("createdBy", t.getCreatedBy());
            m.put("createdAt", t.getCreatedAt());
            return m;
        }).toList();
        return ResponseEntity.ok(result);
    }
}
