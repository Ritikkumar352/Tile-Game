# GridWar — Real-Time Shared Tile Capture Game

GridWar is a fast-paced, real-time multiplayer experiment where users compete to dominate a shared grid. Built to explore the challenges of synchronization and high-concurrency state management, it offers a seamless experience where every click is instantly visible to everyone else.

---

## 🚀 Live Demo
👉 **[Play GridWar Live](https://game.campusdock.live)**

---

## 📌 What is GridWar?

GridWar isn't just a game; it's a demonstration of real-time web capabilities. Multiple users can:
- **Interact on a global stage**: Every player sees the same grid, updated in milliseconds.
- **Claim Territory**: Capture tiles by clicking, instantly claiming ownership.
- **Real-Time Synergy**: Watch the map evolve as others interact, with zero-refresh synchronization.

The system is engineered to handle high concurrency, ensuring that even with many simultaneous "clicks," the state remains consistent and the experience feels snappy.

---

## 🧠 Key Features

- ⚡ Real-time tile updates using WebSockets  
- 👥 Multi-user interaction with instant synchronization  
- 🎯 Tile ownership system (each tile belongs to a user)  
- 🔄 Conflict handling via backend validation  
- 🌐 Fully deployed on AWS with HTTPS  
- 🐳 Dockerized architecture for easy deployment  

---

## 🛠️ Tech Stack

### Backend
- **Java**
- **Spring Boot**
- **Spring WebSocket (STOMP)**
- **Redis** (for fast state handling)

### Frontend
- **React**
- **JavaScript**
- **Vite**

### Database
- **PostgreSQL**

### Infrastructure & DevOps
- **Docker & Docker Compose**
- **AWS EC2**
- **Caddy (HTTPS & reverse proxy)**
- **Nginx (frontend serving)**
- **Linux**

---

## ⚙️ Architecture Overview

```text
Client (React UI)
       ↓
WebSocket / REST API
       ↓
Spring Boot Backend
       ↓
PostgreSQL + Redis
```

- WebSocket is used for real-time updates  
- REST APIs handle core operations  
- Backend ensures consistency and resolves conflicts  

---

## 🔄 Real-Time Implementation

The core of GridWar is its instantaneous feedback loop. To achieve this, I implemented a robust WebSocket-based pipeline:

- **Persistent Connections**: Using the **STOMP protocol over WebSockets**, the client and server maintain a bi-directional communication pipe, completely eliminating the overhead and latency of traditional HTTP polling.
- **Validation & Broadcast**: 
  1. When a player interacts, the **client sends a capture request** to the backend.
  2. The **Spring Boot backend** validates the move (handling concurrency and ownership logic).
  3. Once validated, the new state is **broadcast to all active users** in milliseconds.
- **Low Latency Sync**: By utilizing **Redis** for state storage, the application handles concurrent interactions with ease, ensuring that the grid is always a "source of truth" for every player.

---

## ⚖️ Trade-offs & Design Decisions

Building a real-time system involves constant balancing. Here are some of the key decisions made during development:

- **Consistency over Complexity**: I chose a **centralized backend control** model. While distributed synchronization is powerful, a central authority ensures 100% data integrity for tile ownership with significantly less synchronization overhead.
- **Data Integrity via Redis**: Instead of a heavy-duty message queue (like Kafka), I utilized **Redis** for fast, in-memory state handling. This provides the sub-millisecond latency needed for a game while keeping the architecture maintainable.
- **Responsiveness over Flash**: The UI focuses on **minimal latency and clear visual feedback**. I prioritized snappy tile updates and instant state changes over heavy animations to ensure the grid feels "alive" even on slower connections.
- **Production-Ready Foundation**: Rather than over-engineering for millions of users from day one, I focused on a **Dockerized, production-ready setup** that is easy to deploy, monitor, and scale as the player base grows.

---

## 🎯 Bonus Features

- Unique session-based user identification  
- Real-time synchronization across all users  
- Production deployment with domain + HTTPS  
- Docker-based reproducible setup  

---

## 🧪 Running Locally

### 1. Clone the repo
```bash
git clone https://github.com/Ritikkumar352/Tile-Game
cd Tile-Game
```

### 2. Setup environment

```bash
cp .env.example .env
```

Update required values:

* `POSTGRES_PASSWORD`
* `SESSION_SECRET`
* `CORS_ALLOWED_ORIGIN`

---

### 3. Run with Docker

```bash
docker compose up -d --build
```

---

### 4. Access app

```
http://localhost:3000
```

---

## 🌍 Deployment & Infrastructure

The application is built with a production-first mindset, ensuring reliability and security:

- **AWS EC2 Deployment**: The entire stack is containerized using Docker and orchestrated with Docker Compose for seamless deployment on AWS.
- **Cloudflare DNS**: Domain management and routing are handled via Cloudflare for high availability and performance.
- **Automated HTTPS**: Secured with **TLS** using **Caddy**, which automatically manages Let's Encrypt certificates and provides a robust reverse proxy.
- **Reverse Proxy Architecture**: Caddy routes traffic from the public domain directly to the appropriate application containers, handling SSL termination.
- **Environment Management**: Production-ready configuration using environment variables to separate secrets from code.

---

## 📈 Future Improvements

* Leaderboard system
* Tile cooldown / game rules
* Zoom & pan for larger maps
* Distributed scaling (Kafka / message queues)
* Authentication system

---

## 👨‍💻 Author

**Ritik Kumar**  
*Full Stack Developer specializing in Java & Spring Boot*

I love building real-time applications and exploring the intersection of backend performance and frontend usability. GridWar was a fun challenge to see how far I could push real-time synchronization in a web environment.

👉 **[My GitHub Profile](https://github.com/Ritikkumar352)**

---

## 📸 Screenshots



<p align="center">
  <img src="https://via.placeholder.com/800x450?text=GridWar+Gameplay+Screenshot" alt="GridWar Gameplay" width="800">
</p>

---

## ⭐ Notes

This project focuses on:

* Real-time system design
* Backend consistency under concurrent users
* End-to-end deployment

---
