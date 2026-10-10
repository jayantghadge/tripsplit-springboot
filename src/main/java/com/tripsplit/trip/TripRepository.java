package com.tripsplit.trip;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface TripRepository extends MongoRepository<Trip, String> {
    List<Trip> findByCreatedByOrderByCreatedAtDesc(String createdBy);
    Optional<Trip> findByViewToken(String viewToken);
}
