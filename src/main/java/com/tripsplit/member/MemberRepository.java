package com.tripsplit.member;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MemberRepository extends MongoRepository<Member, String> {
    List<Member> findByTripId(String tripId);
    void deleteByTripId(String tripId);
}
