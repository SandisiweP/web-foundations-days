# SnapShare - Photo App Scaling Plan

## 1. Assumptions & Calculations
* **Registered Users:** 10,000,000[cite: 4]
* **Daily Active Users (DAU):** 1,000,000 (10% of registered users)[cite: 4]
* **Upload Rate:** 1 photo per active user/day = 1,000,000 uploads/day[cite: 4]
* **Feed View Rate:** 50 feed pages per active user/day = 50,000,000 feed views/day[cite: 4]
* **File Sizes:** Original photo = 2 MB; Thumbnail = 50 KB (0.05 MB)[cite: 4]

### Traffic & Storage Estimates
* **Uploads per Second (Average):** 1,000,000 / 86,400 seconds = **~11.57 uploads/sec**[cite: 4]
* **Feed Views per Second (Average):** 50,000,000 / 86,400 seconds = **~578.7 views/sec**[cite: 4]
* **Feed Views per Second (Peak at 5x):** 578.7 * 5 = **~2,893.5 views/sec**[cite: 4]
* **Annual Storage (Originals):** 1,000,000 * 365 * 2 MB = **730 TB/year**[cite: 4]
* **Annual Storage (Thumbnails):** 1,000,000 * 365 * 0.05 MB = **18.25 TB/year**[cite: 4]
* **Total Storage Required:** **~748.25 TB/year**[cite: 4]

---

## 2. System Workload Profile
* **Read-Heavy vs. Write-Heavy:** The system is heavily **read-heavy**[cite: 4]. Users scroll and read feeds far more frequently (~578+ reads/sec) than they upload new content (~11 writes/sec)[cite: 4]. 
* **Design Implications:** We must prioritize caching mechanisms, content delivery networks (CDNs), and database read replicas to handle high concurrent read traffic efficiently without starving write operations.

---

## 3. Database vs. Object Storage Rationale
Photos must **not** be stored inside the primary database because relational databases are optimized for structured text and transactional integrity; storing large binary blobs degrades query speeds, bloats storage, and complicates scaling. Instead, binary image files are stored in scalable **Object Storage**, while the database stores only lightweight metadata pointers (such as image file paths, user IDs, and timestamps)[cite: 4].

---

## 4. Architecture Diagram

    [Client / Mobile App]
             │
             ▼
         [  CDN  ] ── (Cached Static Assets / Images)[cite: 4]
             │
             ▼
      [ Load Balancer ][cite: 4]
             │
             ├──► [ App Server 1 ][cite: 4] ◄──► [ In-Memory Cache (Redis) ][cite: 4]
             │         │
             │         ├──► [ Database Primary (Writes) ][cite: 4]
             │         └──► [ Database Read Replica (Reads) ][cite: 4]
             │         │
             │         └──► [ Object Storage (S3 - Original Photos) ][cite: 4]
             │
             └──► [ Message Queue (RabbitMQ / SQS) ][cite: 4]
                            │
                            ▼
                     [ Worker Service ] ──► (Generates Thumbnails & Saves to Object Storage)[cite: 4]

---

## 5. Component Explanations
* **CDN:** Caches and serves static media content (photos and thumbnails) globally from edge locations closest to the user to minimize latency[cite: 4].
* **Load Balancer:** Distributes incoming user traffic evenly across multiple application servers to ensure high availability and prevent single-point overload[cite: 4].
* **App Servers:** Stateless servers that handle incoming client API requests, business logic, authentication, and coordinate reads/writes[cite: 4].
* **Cache:** Stores frequently accessed data (such as user feeds and user profiles) in-memory to drastically reduce database query load[cite: 4].
* **Database (with Read Replica):** Handles persistent structured metadata (users, follows, post records) utilizing a primary node for writes and replicas for fast reads[cite: 4].
* **Object Storage:** Scalable, durable cloud storage designed to securely hold large binary files like original user photos and generated thumbnails[cite: 4].
* **Queue & Worker:** Asynchronously offloads heavy background processing tasks (like thumbnail generation and image compression) so API response times remain fast[cite: 4].

---

## 6. Step-by-Step Upload Flow
1. **Initiate Upload:** The user selects a photo on their device and submits an upload request to the application server via the Load Balancer[cite: 4].
2. **Store Original Binary:** The app server saves the raw, high-resolution 2 MB photo file directly into **Object Storage**[cite: 4].
3. **Persist Metadata:** The app server writes post metadata (user ID, timestamp, caption, and object storage URL reference) to the primary relational **Database**[cite: 4].
4. **Queue Processing:** The app server pushes an asynchronous job message containing the photo reference into the **Message Queue**[cite: 4].
5. **Worker Processing:** A background **Worker** service picks up the queue message, retrieves the original image, resizes it down to a 50 KB **Thumbnail**, and saves the thumbnail back into **Object Storage**[cite: 4].
6. **Completion:** The post becomes available in followers' feeds, ready to be served via the CDN[cite: 4].

---

## 7. Trade-offs
* **Trade-off 1 (Eventual Consistency vs. Immediate Visibility for Feeds):** Utilizing a queue and worker for asynchronous thumbnail generation and feed updates means a post might appear slightly delayed or lack its thumbnail for a fraction of a second, but it drastically improves API upload response times and system scalability.
* **Trade-off 2 (Cost vs. Performance of Storage & Caching):** Maintaining high-performance caching layers and global CDN distribution incurs higher infrastructure financial costs, but it is necessary to guarantee low latency and handle peak read loads of nearly 3,000 requests per second.