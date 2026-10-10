package com.tripsplit.settlement;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface SettlementRepository extends MongoRepository<Settlement, String> {
    List<Settlement> findByTripId(String tripId);
    Optional<Settlement> findByTripIdAndFromNameAndToName(String tripId, String fromName, String toName);
    void deleteByTripId(String tripId);
}
