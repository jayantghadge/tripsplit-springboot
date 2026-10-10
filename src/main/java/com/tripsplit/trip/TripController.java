package com.tripsplit.trip;

import com.tripsplit.common.dto.ApiError;
import com.tripsplit.config.AuthUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    private final TripRepository tripRepository;
    private final AuthUtils authUtils;

    public TripController(TripRepository tripRepository, AuthUtils authUtils) {
        this.tripRepository = tripRepository;
        this.authUtils = authUtils;
    }

    @GetMapping
    public ResponseEntity<List<Trip>> getTrips(@RequestAttribute("userId") String userId) {
        if (authUtils.isAdmin(userId)) {
            return ResponseEntity.ok(tripRepository.findAll());
        }
        return ResponseEntity.ok(tripRepository.findByCreatedByOrderByCreatedAtDesc(userId));
    }

    @PostMapping
    public ResponseEntity<Trip> createTrip(@RequestBody Trip trip, @RequestAttribute("userId") String userId) {
        trip.setId(null);
        trip.setCreatedBy(userId);
        trip.setViewToken(UUID.randomUUID().toString().substring(0, 8));
        trip.setCreatedAt(Instant.now());
        return ResponseEntity.ok(tripRepository.save(trip));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTrip(@PathVariable String id, @RequestAttribute("userId") String userId) {
        Trip trip = tripRepository.findById(id).orElse(null);
        if (trip == null) return ResponseEntity.notFound().build();
        if (!trip.getCreatedBy().equals(userId) && !authUtils.isAdmin(userId))
            return ResponseEntity.status(403).body(new ApiError("Access denied"));
        return ResponseEntity.ok(trip);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTrip(@PathVariable String id, @RequestBody Trip updated, @RequestAttribute("userId") String userId) {
        Trip trip = tripRepository.findById(id).orElse(null);
        if (trip == null) return ResponseEntity.notFound().build();
        if (!trip.getCreatedBy().equals(userId) && !authUtils.isAdmin(userId))
            return ResponseEntity.status(403).body(new ApiError("Access denied"));
        if (updated.getName() != null) trip.setName(updated.getName());
        if (updated.getDescription() != null) trip.setDescription(updated.getDescription());
        if (updated.getDestination() != null) trip.setDestination(updated.getDestination());
        if (updated.getStartDate() != null) trip.setStartDate(updated.getStartDate());
        if (updated.getEndDate() != null) trip.setEndDate(updated.getEndDate());
        return ResponseEntity.ok(tripRepository.save(trip));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTrip(@PathVariable String id, @RequestAttribute("userId") String userId) {
        Trip trip = tripRepository.findById(id).orElse(null);
        if (trip == null) return ResponseEntity.notFound().build();
        if (!trip.getCreatedBy().equals(userId) && !authUtils.isAdmin(userId))
            return ResponseEntity.status(403).body(new ApiError("Access denied"));
        tripRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/view-token")
    public ResponseEntity<?> getViewToken(@PathVariable String id, @RequestAttribute("userId") String userId) {
        Trip trip = tripRepository.findById(id).orElse(null);
        if (trip == null) return ResponseEntity.notFound().build();
        if (!trip.getCreatedBy().equals(userId) && !authUtils.isAdmin(userId))
            return ResponseEntity.status(403).body(new ApiError("Access denied"));
        return ResponseEntity.ok(Map.of("token", trip.getViewToken()));
    }

    @PostMapping("/{id}/regenerate-token")
    public ResponseEntity<?> regenerateToken(@PathVariable String id, @RequestAttribute("userId") String userId) {
        Trip trip = tripRepository.findById(id).orElse(null);
        if (trip == null) return ResponseEntity.notFound().build();
        if (!trip.getCreatedBy().equals(userId) && !authUtils.isAdmin(userId))
            return ResponseEntity.status(403).body(new ApiError("Access denied"));
        trip.setViewToken(UUID.randomUUID().toString().substring(0, 8));
        trip = tripRepository.save(trip);
        return ResponseEntity.ok(Map.of("token", trip.getViewToken()));
    }
}
