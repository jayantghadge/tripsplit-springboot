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
        String cleanName = member.getName() != null ? member.getName().trim() : "";
        if (cleanName.isEmpty()) return ResponseEntity.badRequest().body(new ApiError("Member name is required"));
        boolean duplicate = memberRepository.findByTripId(tripId).stream()
                .anyMatch(m -> m.getName().trim().equalsIgnoreCase(cleanName));
        if (duplicate) return ResponseEntity.badRequest().body(new ApiError("Member already exists in this trip"));
        member.setId(null);
        member.setTripId(tripId);
        member.setName(cleanName);
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
