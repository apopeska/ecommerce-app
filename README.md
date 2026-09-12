# E-commerce App

A full-stack e-commerce application built with React, Node.js, Express, and PostgreSQL. The project is containerized with Docker and includes a GitHub Actions CI/CD pipeline for building and publishing Docker images.

## Features

* Product listing
* Shopping cart
* Add products to cart
* Increase/decrease product quantity
* Remove products from cart
* Checkout form
* Order creation
* PostgreSQL order storage
* REST API
* Dockerized frontend, backend, and database
* GitHub Actions CI/CD
* Docker Hub image publishing

## Tech Stack

### Frontend

* React
* Vite
* JavaScript
* CSS

### Backend

* Node.js
* Express
* PostgreSQL
* `pg`
* CORS
* dotenv

### Infrastructure

* Docker
* Docker Compose
* PostgreSQL 16
* GitHub Actions
* Docker Hub

## Project Architecture

```text
ecommerce-app/
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── Dockerfile
│   └── package.json
│
├── backend/
│   ├── src/
│   │   └── server.js
│   ├── Dockerfile
│   ├── .env
│   └── package.json
│
├── database/
│   └── init.sql
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Application Architecture

```text
                 ┌─────────────────┐
                 │     Browser     │
                 │ React Frontend  │
                 │    :5173        │
                 └────────┬────────┘
                          │
                          │ HTTP
                          ▼
                 ┌─────────────────┐
                 │    Express      │
                 │     Backend     │
                 │      :3000      │
                 └────────┬────────┘
                          │
                          │ PostgreSQL
                          ▼
                 ┌─────────────────┐
                 │   PostgreSQL    │
                 │      :5433      │
                 └─────────────────┘
```

## Database

The application uses PostgreSQL.

Main tables include:

* `users`
* `products`
* `orders`
* `order_items`

Example products are loaded through `database/init.sql`.

Orders contain information such as:

* user
* total price
* status
* creation time

Order items contain:

* order ID
* product ID
* quantity
* price

## API Endpoints

### Health Check

```http
GET /
```

Returns:

```json
{
  "message": "E-commerce API is running"
}
```

### Get Products

```http
GET /api/products
```

Returns the available products.

### Create Order

```http
POST /api/orders
```

Example request:

```json
{
  "userId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ]
}
```

The backend calculates the order total using prices stored in PostgreSQL and creates the order inside a database transaction.

## Running the Project with Docker

Make sure Docker Desktop is running.

From the project root:

```bash
docker compose up --build -d
```

Check the running containers:

```bash
docker compose ps
```

The application uses:

```text
Frontend:  http://localhost:5173
Backend:   http://localhost:3000
PostgreSQL: localhost:5433
```

Open the frontend:

```text
http://localhost:5173
```

## Stopping the Project

To stop the containers:

```bash
docker compose down
```

The PostgreSQL data is stored in a Docker volume.

## CI/CD

The project includes a GitHub Actions workflow:

```text
.github/workflows/ci-cd.yml
```

The workflow runs when changes are pushed to the `main` branch.

Pipeline:

```text
Git Push
   ↓
GitHub Actions
   ↓
Checkout Repository
   ↓
Login to Docker Hub
   ↓
Build Backend Image
   ↓
Push Backend Image
   ↓
Build Frontend Image
   ↓
Push Frontend Image
```

Docker Hub credentials are stored as GitHub repository secrets.

Required secrets:

```text
DOCKERHUB_USERNAME
DOCKERHUB_TOKEN
```

## Docker Images

The CI/CD pipeline publishes:

```text
<DOCKERHUB_USERNAME>/ecommerce-backend:latest
<DOCKERHUB_USERNAME>/ecommerce-frontend:latest
```

## Kubernetes

Kubernetes was investigated during development, but the local Docker Desktop Kubernetes cluster was not used in the final setup because the local cluster remained stuck in the `Starting` state.

The final application runs successfully using Docker Compose.

## Development

The project was developed as a full-stack containerized e-commerce application with a focus on:

* REST API development
* Database integration
* Docker containerization
* Service orchestration
* CI/CD automation
* Git version control

## License

This project is intended for educational and portfolio purposes.
