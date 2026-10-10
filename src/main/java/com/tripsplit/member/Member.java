package com.tripsplit.member;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "members")
public class Member {

    @Id
    private String id;
    private String tripId;
    private String name;

    public Member() {}

    public Member(String tripId, String name) {
        this.tripId = tripId;
        this.name = name;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTripId() { return tripId; }
    public void setTripId(String tripId) { this.tripId = tripId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
