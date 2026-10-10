package com.tripsplit.expense;

import com.tripsplit.common.dto.ApiError;
import com.tripsplit.config.AuthUtils;
import com.tripsplit.member.Member;
import com.tripsplit.member.MemberRepository;
import com.tripsplit.trip.Trip;
import com.tripsplit.trip.TripRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseRepository expenseRepository;
    private final TripRepository tripRepository;
    private final MemberRepository memberRepository;
    private final AuthUtils authUtils;

    public ExpenseController(ExpenseRepository expenseRepository,
                             TripRepository tripRepository,
                             MemberRepository memberRepository,
                             AuthUtils authUtils) {
        this.expenseRepository = expenseRepository;
        this.tripRepository = tripRepository;
        this.memberRepository = memberRepository;
        this.authUtils = authUtils;
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<?> getExpenses(@PathVariable String tripId, @RequestAttribute("userId") String userId) {
        Trip trip = tripRepository.findById(tripId).orElse(null);
        if (trip == null) return ResponseEntity.notFound().build();
        if (!trip.getCreatedBy().equals(userId) && !authUtils.isAdmin(userId))
            return ResponseEntity.status(403).body(new ApiError("Access denied"));
        return ResponseEntity.ok(expenseRepository.findByTripIdOrderByCreatedAtDesc(tripId));
    }

    @PostMapping
    public ResponseEntity<?> addExpense(@RequestBody Expense expense, @RequestAttribute("userId") String userId) {
        Trip trip = tripRepository.findById(expense.getTripId()).orElse(null);
        if (trip == null) return ResponseEntity.badRequest().body(new ApiError("Trip not found"));
        if (!trip.getCreatedBy().equals(userId) && !authUtils.isAdmin(userId))
            return ResponseEntity.status(403).body(new ApiError("Access denied"));
        expense.setId(null);
        expense.setCreatedAt(Instant.now());
        if (expense.getSplits() != null) {
            for (ExpenseSplit split : expense.getSplits()) {
                split.setSettled(false);
            }
        }
        expense = expenseRepository.save(expense);
        return ResponseEntity.ok(expense);
    }

    @GetMapping("/{expenseId}")
    public ResponseEntity<?> getExpense(@PathVariable String expenseId, @RequestAttribute("userId") String userId) {
        Expense expense = expenseRepository.findById(expenseId).orElse(null);
        if (expense == null) return ResponseEntity.notFound().build();
        Trip trip = tripRepository.findById(expense.getTripId()).orElse(null);
        if (trip == null || (!trip.getCreatedBy().equals(userId) && !authUtils.isAdmin(userId)))
            return ResponseEntity.status(403).body(new ApiError("Access denied"));
        return ResponseEntity.ok(expense);
    }

    @PutMapping("/{expenseId}")
    public ResponseEntity<?> updateExpense(@PathVariable String expenseId, @RequestBody Expense updated,
                                           @RequestAttribute("userId") String userId) {
        Expense expense = expenseRepository.findById(expenseId).orElse(null);
        if (expense == null) return ResponseEntity.notFound().build();
        Trip trip = tripRepository.findById(expense.getTripId()).orElse(null);
        if (trip == null || (!trip.getCreatedBy().equals(userId) && !authUtils.isAdmin(userId)))
            return ResponseEntity.status(403).body(new ApiError("Access denied"));
        if (updated.getPaidByName() != null) expense.setPaidByName(updated.getPaidByName());
        if (updated.getAmount() != null) expense.setAmount(updated.getAmount());
        if (updated.getDescription() != null) expense.setDescription(updated.getDescription());
        if (updated.getCategory() != null) expense.setCategory(updated.getCategory());
        if (updated.getDate() != null) expense.setDate(updated.getDate());
        if (updated.getSplits() != null) {
            for (ExpenseSplit split : updated.getSplits()) {
                split.setSettled(false);
            }
            expense.setSplits(updated.getSplits());
        }
        return ResponseEntity.ok(expenseRepository.save(expense));
    }

    @DeleteMapping("/{expenseId}")
    public ResponseEntity<?> deleteExpense(@PathVariable String expenseId, @RequestAttribute("userId") String userId) {
        Expense expense = expenseRepository.findById(expenseId).orElse(null);
        if (expense == null) return ResponseEntity.notFound().build();
        Trip trip = tripRepository.findById(expense.getTripId()).orElse(null);
        if (trip == null || (!trip.getCreatedBy().equals(userId) && !authUtils.isAdmin(userId)))
            return ResponseEntity.status(403).body(new ApiError("Access denied"));
        expenseRepository.deleteById(expenseId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/trip/{tripId}/summary")
    public ResponseEntity<?> getSummary(@PathVariable String tripId, @RequestAttribute("userId") String userId) {
        Trip trip = tripRepository.findById(tripId).orElse(null);
        if (trip == null) return ResponseEntity.notFound().build();
        if (!trip.getCreatedBy().equals(userId) && !authUtils.isAdmin(userId))
            return ResponseEntity.status(403).body(new ApiError("Access denied"));

        List<Expense> expenses = expenseRepository.findByTripIdOrderByCreatedAtDesc(tripId);
        Map<String, BigDecimal> paid = new HashMap<>();
        Map<String, BigDecimal> owes = new HashMap<>();
        List<Member> members = memberRepository.findByTripId(tripId);

        for (Member m : members) {
            paid.put(m.getName(), BigDecimal.ZERO);
            owes.put(m.getName(), BigDecimal.ZERO);
        }

        for (Expense e : expenses) {
            paid.merge(e.getPaidByName(), e.getAmount(), BigDecimal::add);
            if (e.getSplits() != null) {
                for (ExpenseSplit s : e.getSplits()) {
                    owes.merge(s.getMemberName(), s.getAmount(), BigDecimal::add);
                }
            }
        }

        List<Map<String, Object>> balances = members.stream().map(m -> {
            Map<String, Object> b = new LinkedHashMap<>();
            b.put("name", m.getName());
            b.put("paid", paid.getOrDefault(m.getName(), BigDecimal.ZERO));
            b.put("owes", owes.getOrDefault(m.getName(), BigDecimal.ZERO));
            b.put("balance", paid.getOrDefault(m.getName(), BigDecimal.ZERO)
                    .subtract(owes.getOrDefault(m.getName(), BigDecimal.ZERO)));
            return b;
        }).toList();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("balances", balances);
        response.put("totalExpenses", expenses.stream().map(Expense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add));
        response.put("memberCount", members.size());
        return ResponseEntity.ok(response);
    }
}
