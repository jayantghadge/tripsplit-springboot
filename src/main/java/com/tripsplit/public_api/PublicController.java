package com.tripsplit.public_api;

import com.tripsplit.expense.Expense;
import com.tripsplit.expense.ExpenseRepository;
import com.tripsplit.member.Member;
import com.tripsplit.member.MemberRepository;
import com.tripsplit.settlement.Settlement;
import com.tripsplit.settlement.SettlementRepository;
import com.tripsplit.trip.Trip;
import com.tripsplit.trip.TripRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final TripRepository tripRepository;
    private final MemberRepository memberRepository;
    private final ExpenseRepository expenseRepository;
    private final SettlementRepository settlementRepository;

    public PublicController(TripRepository tripRepository, MemberRepository memberRepository,
                            ExpenseRepository expenseRepository,
                            SettlementRepository settlementRepository) {
        this.tripRepository = tripRepository;
        this.memberRepository = memberRepository;
        this.expenseRepository = expenseRepository;
        this.settlementRepository = settlementRepository;
    }

    @GetMapping("/trips/{viewToken}")
    public ResponseEntity<?> getTripByViewToken(@PathVariable String viewToken) {
        Trip trip = tripRepository.findByViewToken(viewToken).orElse(null);
        if (trip == null) return ResponseEntity.notFound().build();

        List<Member> members = memberRepository.findByTripId(trip.getId());
        List<Expense> expenses = expenseRepository.findByTripIdOrderByCreatedAtDesc(trip.getId());
        List<Settlement> settlements = settlementRepository.findByTripId(trip.getId());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("trip", trip);
        response.put("members", members);
        response.put("expenses", expenses);
        response.put("settlements", settlements);

        return ResponseEntity.ok(response);
    }
}
