package com.tripsplit.member;

import com.tripsplit.common.dto.ApiError;
import com.tripsplit.config.AuthUtils;
import com.tripsplit.trip.Trip;
import com.tripsplit.trip.TripRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips/{tripId}/members")
public class MemberController {

    private final MemberRepository memberRepository;
    private final TripRepository tripRepository;
    private final AuthUtils authUtils;

    public MemberController(MemberRepository memberRepository, TripRepository tripRepository, AuthUtils authUtils) {
        this.memberRepository = memberRepository;
        this.tripRepository = tripRepository;
        this.authUtils = authUtils;
    }

    @GetMapping
    public ResponseEntity<?> getMembers(@PathVariable String tripId, @RequestAttribute("userId") String userId) {
        Trip trip = tripRepository.findById(tripId).orElse(null);
        if (trip == null) return ResponseEntity.notFound().build();
        if (!trip.getCreatedBy().equals(userId) && !authUtils.isAdmin(userId))
            return ResponseEntity.status(403).body(new ApiError("Access denied"));
        return ResponseEntity.ok(memberRepository.findByTripId(tripId));
    }

    @PostMapping
    public ResponseEntity<?> addMember(@PathVariable String tripId, @RequestBody Member member, @RequestAttribute("userId") String userId) {
        Trip trip = tripRepository.findById(tripId).orElse(null);
        if (trip == null) return ResponseEntity.notFound().build();
        if (!trip.getCreatedBy().equals(userId) && !authUtils.isAdmin(userId))
            return ResponseEntity.status(403).body(new ApiError("Access denied"));
        member.setId(null);
        member.setTripId(tripId);
        return ResponseEntity.ok(memberRepository.save(member));
    }

    @DeleteMapping("/{memberId}")
    public ResponseEntity<?> removeMember(@PathVariable String tripId, @PathVariable String memberId, @RequestAttribute("userId") String userId) {
        Trip trip = tripRepository.findById(tripId).orElse(null);
        if (trip == null) return ResponseEntity.notFound().build();
        if (!trip.getCreatedBy().equals(userId) && !authUtils.isAdmin(userId))
            return ResponseEntity.status(403).body(new ApiError("Access denied"));
        memberRepository.deleteById(memberId);
        return ResponseEntity.noContent().build();
    }
}
