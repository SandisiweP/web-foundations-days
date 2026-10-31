# TicketHub - Ticketing System Architecture & Design

## 1. Requirements

### Functional Requirements
* **Browse Events:** Users can search and view upcoming concerts, events, available dates, and ticket pricing.
* **View Seats:** Users can view real-time seating maps and seat availability for specific venues.
* **Hold Seats:** Users can temporarily lock/hold a selected seat during the checkout window (e.g., 10-minute temporary lock) to prevent others from buying it while paying.
* **Process Payment:** Users can securely complete payment transactions to finalize ticket purchases.
* **View Purchased Tickets:** Users can view their order history and access confirmed tickets/QR codes.

### Non-Functional Requirements
* **Speed:** The checkout and seat reservation flow must respond in under 500ms to ensure a smooth user experience during high-demand rushes.
* **Correctness (Zero Double-Booking):** Under no circumstances can two distinct users successfully purchase or hold the exact same seat.
* **Fairness:** A first-come, first-served queue mechanism must be enforced when traffic surges so requests are processed in order without race conditions.

---

## 2. Traffic Estimates & Comparison

### Given Facts & Assumptions
* **Registered Users:** 2,000,000[cite: 6]
* **Normal Day Traffic:** 50,000 visitors/day, viewing 10 pages each = 500,000 page views/day[cite: 6].
* **Normal Day Sales:** 5,000 tickets sold/day[cite: 6].
* **Big Sale Peak:** 200,000 people attempt to buy 20,000 seats within the first 10 minutes (600 seconds)[cite: 6].

### Calculations
* **Normal Read Throughput (Average):** 500,000 / 86,400 seconds = **~5.79 reads/sec**[cite: 6]
* **Normal Write Throughput (Average):** 5,000 / 86,400 seconds = **~0.058 writes/sec**[cite: 6]
* **Big Sale Peak Write Throughput:** 200,000 users / 600 seconds = **~333.33 requests/sec** (plus concurrent browsing read traffic spikes of several thousand reads/sec).

### Comparison
Normal operations require negligible server capacity (~6 requests/sec). However, the **Big Sale Peak** spikes traffic by over **5,000x**, demanding a robust queuing layer, database connection pooling, and aggressive caching to prevent server crashes.

---

## 3. REST API Design (At least 5 Endpoints)

| Method | Path | Description | Success Status |
| :--- | :--- | :--- | :--- |
| GET | `/api/v1/events` | List or search upcoming concerts and events | `200 OK` |
| GET | `/api/v1/events/:id/seats` | View real-time seating availability map | `200 OK` |
| POST | `/api/v1/seats/hold` | Temporarily lock a seat for checkout | `201 Created` |
| POST | `/api/v1/orders/pay` | Process payment and finalize ticket purchase | `200 OK` |
| GET | `/api/v1/user/tickets` | View purchased tickets for the authenticated user | `200 OK` |

---

## 4. Data Model (4 Tables & Relationships)

### Entities & Columns
1. **`users`**: `id` (PK), `username`, `email`, `created_at`
2. **`events`**: `id` (PK), `title`, `date`, `venue`, `total_seats`
3. **`seats`**: `id` (PK), `event_id` (FK), `seat_number`, `status` (`available`, `held`, `booked`)
4. **`orders`**: `id` (PK), `user_id` (FK), `seat_id` (FK), `status` (`pending`, `completed`, `cancelled`), `created_at`

### Relationships
* **`events` to `seats` (One-to-Many):** One event has many seats.
* **`users` to `orders` (One-to-Many):** One user can place many orders/purchases.
* **`seats` to `orders` (One-to-One / Many-to-One):** Each ticket order corresponds to a specific seat for an event.

---

## 5. Preventing Double-Booking (Transactions & Constraints)
To ensure two people never buy the same seat, TicketHub uses a combination of **Database Transactions**, **Row-Level Locking (`SELECT ... FOR UPDATE`)**, and **Unique Database Constraints**:
1. When a user requests a seat, the server opens an isolated database transaction.
2. The server queries the seat status using a pessimistic lock: `SELECT * FROM seats WHERE id = ? FOR UPDATE;`. This locks the specific seat row so concurrent requests from other users must wait.
3. The application checks if the seat status is `'available'`. If not, the transaction rolls back immediately.
4. If available, the status is updated to `'held'` or `'booked'`, and a unique constraint on `(event_id, seat_number)` guarantees that even if a race condition slips through application logic, the database engine rejects duplicate inserts.

---

## 6. Architecture Diagram & Components

    [Client / Mobile App]
             │
             ▼
         [  CDN  ] (Static UI Assets)
             │
             ▼
      [ Load Balancer ]
             │
             ├──► [ API Gateway / Rate Limiter ]
                       │
                       ├──► [ App Servers (Stateless Cluster) ]
                       │         │
                       │         ├──► [ Redis In-Memory Cache (Seat Lock State) ]
                       │         │
                       │         └──► [ Primary Database (Master - ACID Transactions) ]
                       │                   │
                       │                   └──► [ Read Replicas (Event Browsing) ]
                       │
                       └──► [ Message Queue / Virtual Waiting Room (RabbitMQ / SQS) ]

### Component Explanations
* **CDN:** Serves static frontend content globally to reduce latency.
* **Load Balancer:** Distributes massive incoming traffic evenly across cluster nodes.
* **API Gateway / Rate Limiter:** Throttles incoming bot traffic and regulates requests during big ticket sales.
* **App Servers:** Stateless backend workers handling business logic and checkout validation.
* **Redis Cache:** Manages lightning-fast temporary seat locks and session states.
* **Primary Database & Read Replicas:** Handles ACID-compliant checkout transactions on the master node while routing read-heavy event browsing queries to replicas.
* **Message Queue / Waiting Room:** Queues users sequentially during high-demand sales to protect servers from crashing under the 333+ write requests/sec surge.

---

## 7. Trade-offs
* **Trade-off 1 (Pessimistic Locking vs. System Performance):** Using row-level database locks guarantees 100% correctness and prevents double-booking, but can introduce transaction queuing delays and minor latency during extreme traffic peaks.
* **Trade-off 2 (Virtual Waiting Room vs. User Experience):** Implementing a strict queue/waiting room during big sales frustrates users waiting to enter the site, but it is necessary to protect database integrity and ensure fair access without crashing infrastructure.