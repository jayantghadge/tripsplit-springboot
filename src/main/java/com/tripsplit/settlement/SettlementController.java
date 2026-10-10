package com.tripsplit.settlement;

import com.tripsplit.common.dto.ApiError;
import com.tripsplit.config.AuthUtils;
import com.tripsplit.expense.Expense;
import com.tripsplit.expense.ExpenseRepository;
import com.tripsplit.expense.ExpenseSplit;
import com.tripsplit.trip.Trip;
import com.tripsplit.trip.TripRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/settlements")
public class SettlementController {

    private final SettlementRepository settlementRepository;
    private final TripRepository tripRepository;
    private final ExpenseRepository expenseRepository;
    private final AuthUtils authUtils;

    public SettlementController(SettlementRepository settlementRepository,
                                TripRepository tripRepository,
                                ExpenseRepository expenseRepository,
                                AuthUtils authUtils) {
        this.settlementRepository = settlementRepository;
        this.tripRepository = tripRepository;
        this.expenseRepository = expenseRepository;
        this.authUtils = authUtils;
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<?> getSettlements(@PathVariable String tripId, @RequestAttribute("userId") String userId) {
        Trip trip = tripRepository.findById(tripId).orElse(null);
        if (trip == null) return ResponseEntity.notFound().build();
        if (!trip.getCreatedBy().equals(userId) && !authUtils.isAdmin(userId))
            return ResponseEntity.status(403).body(new ApiError("Access denied"));
        return ResponseEntity.ok(settlementRepository.findByTripId(tripId));
    }

    @PostMapping("/trip/{tripId}/calculate")
    public ResponseEntity<?> calculateSettlements(@PathVariable String tripId, @RequestAttribute("userId") String userId) {
        Trip trip = tripRepository.findById(tripId).orElse(null);
        if (trip == null) return ResponseEntity.notFound().build();
        if (!trip.getCreatedBy().equals(userId) && !authUtils.isAdmin(userId))
            return ResponseEntity.status(403).body(new ApiError("Access denied"));

        List<Expense> expenses = expenseRepository.findByTripIdOrderByCreatedAtDesc(tripId);
        Map<String, BigDecimal> netBalance = new HashMap<>();

        for (Expense e : expenses) {
            netBalance.merge(e.getPaidByName(), e.getAmount(), BigDecimal::add);
            if (e.getSplits() != null) {
                for (ExpenseSplit s : e.getSplits()) {
                    netBalance.merge(s.getMemberName(), s.getAmount().negate(), BigDecimal::add);
                }
            }
        }

        List<Map.Entry<String, BigDecimal>> creditors = new ArrayList<>();
        List<Map.Entry<String, BigDecimal>> debtors = new ArrayList<>();
        for (var entry : netBalance.entrySet()) {
            if (entry.getValue().compareTo(BigDecimal.ZERO) > 0) {
                creditors.add(entry);
            } else if (entry.getValue().compareTo(BigDecimal.ZERO) < 0) {
                debtors.add(entry);
            }
        }

        creditors.sort((a, b) -> b.getValue().compareTo(a.getValue()));
        debtors.sort((a, b) -> a.getValue().compareTo(b.getValue()));

        List<Settlement> settlements = new ArrayList<>();
        int ci = 0, di = 0;
        while (ci < creditors.size() && di < debtors.size()) {
            BigDecimal credit = creditors.get(ci).getValue();
            BigDecimal debit = debtors.get(di).getValue().negate();
            BigDecimal settleAmount = credit.min(debit);

            Settlement s = new Settlement();
            s.setTripId(tripId);
            s.setFromName(debtors.get(di).getKey());
            s.setToName(creditors.get(ci).getKey());
            s.setAmount(settleAmount);
            s.setSettled(false);
            s.setCreatedAt(Instant.now());
            settlements.add(s);

            creditors.get(ci).setValue(credit.subtract(settleAmount));
            debtors.get(di).setValue(debtors.get(di).getValue().add(settleAmount));

            if (creditors.get(ci).getValue().compareTo(BigDecimal.ZERO) == 0) ci++;
            if (debtors.get(di).getValue().compareTo(BigDecimal.ZERO) == 0) di++;
        }

        settlementRepository.deleteByTripId(tripId);
        List<Settlement> saved = settlementRepository.saveAll(settlements);
        return ResponseEntity.ok(saved);
    }
}
