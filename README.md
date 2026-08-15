# 🔗 LinkForge

A scalable URL shortening platform built with **React, Node.js, Express.js, PostgreSQL, Redis, BullMQ, Docker, and Nginx**.

LinkForge allows authenticated users to create, manage, and track shortened URLs while using caching, rate limiting, asynchronous analytics processing, and horizontal backend scaling.

---

## 📌 Features

- 🔐 JWT-based authentication
- 👤 User registration and login
- 🔗 Create shortened URLs
- ✏️ Update shortened URLs
- 🗑️ Delete shortened URLs
- ↪️ Short URL redirection
- 📊 Click analytics
- ⚡ Redis caching for faster URL redirection
- 🚦 Redis-based rate limiting
- 📨 BullMQ for asynchronous analytics processing
- 🗄️ PostgreSQL for persistent data storage
- 🐳 Dockerized application
- 🌐 Nginx reverse proxy
- ⚖️ Horizontal backend scaling
- 📈 Multiple backend instances behind Nginx

---

## 🛠️ Tech Stack

### Frontend

- React.js
- Axios
- CSS

### Backend

- Node.js
- Express.js
- JWT
- REST APIs

### Database

- PostgreSQL

### Caching & Rate Limiting

- Redis

### Asynchronous Processing

- BullMQ
- Redis

### Infrastructure

- Docker
- Docker Compose
- Nginx

---

## 🏗️ System Architecture

```text
                         Client
                           |
                           v
                         Nginx
                    Reverse Proxy
                           |
                    Load Balancing
                     /           \
                    v             v
              Backend 1       Backend 2
                    \             /
                     \           /
                      +---------+
                           |
              +------------+------------+
              |            |            |
              v            v            v
         PostgreSQL      Redis       BullMQ
                                      |
                                      v
                               Analytics Worker
                                      |
                                      v
                                 PostgreSQL
```

---

## 🔄 How It Works

### URL Creation

1. User enters an original URL from the React frontend.
2. The request is sent to the Express backend.
3. The backend generates a unique short code.
4. The link is stored in PostgreSQL.
5. The created link is returned to the frontend.

### URL Redirection

1. User visits the short URL.
2. Nginx forwards the request to a backend instance.
3. The backend checks Redis for the short code.
4. If the URL is cached, the user is redirected immediately.
5. If there is a cache miss, PostgreSQL is queried.
6. The URL is stored in Redis.
7. The user is redirected to the original URL.

### Analytics

When a short URL is accessed:

```text
User
 ↓
Backend
 ↓
BullMQ Queue
 ↓
Analytics Worker
 ↓
PostgreSQL
```

Analytics are processed asynchronously so that click tracking does not unnecessarily delay the URL redirection response.

---

## ⚡ Redis Caching

Redis is used for caching shortened URL mappings.

The redirection flow follows a cache-aside approach:

```text
Request
   ↓
Redis
   ↓
 ┌──────────────┐
 │              │
Hit            Miss
 │              │
 ↓              ↓
Redirect     PostgreSQL
                ↓
              Redis
                ↓
             Redirect
```

When a link is updated or deleted, its corresponding Redis cache entry is invalidated so that stale URLs are not served.

---

## 🚦 Rate Limiting

Redis is also used for rate limiting.

The rate limiter stores request information in Redis, allowing rate limiting to work across multiple backend instances.

```text
             Nginx
               |
       +-------+-------+
       |               |
       v               v
   Backend 1       Backend 2
       \               /
        \             /
             Redis
          Rate Limiting
```

This is important when the backend is horizontally scaled because the rate-limit state is shared through Redis instead of being stored inside an individual backend container.

---

## 📨 Asynchronous Analytics with BullMQ

Click analytics are processed asynchronously using BullMQ.

Instead of performing all analytics operations during the redirect request:

```text
Redirect Request
      ↓
Add Job to Queue
      ↓
Return Redirect
```

the analytics worker processes the job separately:

```text
BullMQ
   ↓
Analytics Worker
   ↓
PostgreSQL
```

The worker:

- Finds the link using its short code
- Increments the total click count
- Stores detailed click information

---

## 🗄️ Database

LinkForge uses PostgreSQL as its primary persistent database.

### Links

The `links` table stores:

- `id`
- `original_url`
- `short_code`
- `clicks`
- `user_id`
- `created_at`
- `updated_at`

### Users

The `users` table stores registered user information.

### Clicks

The `clicks` table stores detailed analytics information:

- `link_id`
- `timestamp`
- `ip`
- `user_agent`
- `referrer`

---

## 🌐 Nginx Reverse Proxy

Nginx acts as the entry point for the application.

Instead of clients directly accessing backend containers:

```text
Client
  ↓
Nginx
  ↓
Backend
```

Nginx routes requests to the appropriate service.

For the scaled backend:

```text
                  Nginx
                    |
             backend service
                /       \
               /         \
              v           v
         Backend 1     Backend 2
```

Nginx communicates with the Docker service name `backend` rather than hard-coded container IP addresses.

This allows backend containers to be recreated or scaled without manually changing the Nginx configuration.

---

## ⚖️ Horizontal Scaling

The backend can be scaled horizontally using Docker Compose.

```bash
docker compose up -d --build --scale backend=2
```

This creates multiple instances of the backend service:

```text
linkforge-backend-1
linkforge-backend-2
```

Docker's internal DNS allows Nginx to resolve the `backend` service and communicate with the available backend instances.

This allows additional backend instances to be added without manually changing the Nginx configuration.

---

## 🐳 Docker Services

The application consists of the following services:

```text
frontend
backend
postgres
redis
nginx
```

The backend can be independently scaled:

```bash
docker compose up -d --build --scale backend=2
```

Docker Compose handles the creation and networking of the application containers.

---

## 📂 Project Structure

```text
LinkForge/
│
├── client/
│   ├── public/
│   ├── src/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── package-lock.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── queues/
│   ├── routes/
│   ├── utils/
│   ├── workers/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── app.js
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── nginx/
│   └── nginx.conf
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 🚀 Running Locally

### Prerequisites

Make sure you have the following installed:

- Git
- Docker
- Docker Compose

### Clone the Repository

```bash
git clone https://github.com/ChaitanyaSinghal97/LinkForge.git
cd LinkForge
```

### Environment Variables

Create the required environment variables.

Example:

```env
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
JWT_SECRET=your_jwt_secret
REDIS_URL=redis://redis:6379
```

Use your own values for database credentials and secrets.

**Do not commit `.env` files to GitHub.**

### Start the Application

To start the application normally:

```bash
docker compose up -d --build
```

To start the application with two backend instances:

```bash
docker compose up -d --build --scale backend=2
```

The application will be available at:

```text
http://localhost
```

### Stop the Application

```bash
docker compose down
```

> `docker compose down` removes the containers but preserves the PostgreSQL named volume.

Avoid using:

```bash
docker compose down -v
```

unless you intentionally want to remove the PostgreSQL volume and its stored data.

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/signup` | Register a new user |
| POST | `/auth/login` | Login |

### Links

| Method | Endpoint | Description |
|---|---|---|
| POST | `/links` | Create a shortened URL |
| GET | `/links` | Get the authenticated user's links |
| GET | `/links/:id` | Get a specific link |
| PUT | `/links/:id` | Update a link |
| DELETE | `/links/:id` | Delete a link |
| GET | `/:shortCode` | Redirect to the original URL |
| GET | `/links/:id/analytics` | Get link analytics |

---

## 📊 Analytics

The dashboard provides:

- Total clicks
- Clicks today
- Clicks in the last 7 days

Detailed click information is processed asynchronously by the BullMQ worker and stored in PostgreSQL.

---

## 🔐 Authentication

LinkForge uses JWT-based authentication.

After login, the client uses the JWT when accessing protected API endpoints.

Protected requests include the token in the authorization header:

```text
Authorization: Bearer <token>
```

The backend verifies the token before allowing access to protected resources.

---

## 🔄 PostgreSQL Migration

LinkForge originally used MongoDB with Mongoose.

The project was migrated to PostgreSQL.

### Before

```text
Node.js
   ↓
Mongoose
   ↓
MongoDB
```

### Current

```text
Node.js
   ↓
pg
   ↓
PostgreSQL
```

MongoDB and Mongoose have been completely removed from the current implementation.

---

## 🔄 Caching Strategy

The URL redirection path uses a cache-aside strategy.

```text
Request Short URL
       ↓
     Redis
       |
   +---+---+
   |       |
  Hit     Miss
   |       |
   ↓       ↓
Redirect PostgreSQL
           ↓
         Redis
           ↓
        Redirect
```

Cached URLs are stored with an expiration time.

When a link is updated or deleted, the corresponding Redis cache entry is invalidated.

---

## 🔒 Security

The application includes several security-related mechanisms:

- JWT authentication for protected resources
- Redis-based rate limiting
- Environment variables for sensitive configuration
- PostgreSQL user-specific access checks
- Nginx as the public entry point
- Internal Docker networking for application services

Sensitive environment files such as `.env` are excluded from Git using `.gitignore`.

---

## 🔮 Future Improvements

- Production deployment
- Custom domain
- HTTPS / SSL
- Production monitoring
- Centralized logging
- Improved observability
- Further infrastructure scaling

---

## 👨‍💻 Author

**Chaitanya Singhal**

Built as a full-stack URL shortening project with a focus on backend architecture, databases, caching, asynchronous processing, containerization, reverse proxying, and horizontal scaling.