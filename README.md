# TripSplit

Split expenses with friends during trips. Spring Boot backend + React frontend.

## Quick Start

### Prerequisites
- Java 21+
- MongoDB (local or Atlas)

### Run

```bash
# Start backend (make sure MongoDB is running on localhost:27017)
./gradlew bootRun

# Start frontend dev server (separate terminal)
cd frontend && npm install && npm run dev

# Open http://localhost:5173
```

### Deploy

```bash
cd frontend && ./deploy.sh
java -jar build/libs/tripsplit-0.0.1-SNAPSHOT.jar
```

## Architecture

Monolith with clean domain packages ready to split into microservices:

```
com.tripsplit
├── config/       # Security, JWT, Web
├── common/       # Shared DTOs, exceptions
├── user/         # Auth, users
├── trip/         # Trips, members
├── expense/      # Expenses, splits
└── settlement/   # Balance calculation, settlements
```
