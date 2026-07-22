# 🏥 MediCare Pharmacy Management System

A full‑stack enterprise web application designed to digitalise and automate pharmacy operations. The system supports multi‑branch management, role‑based access control, medication inventory with batch tracking, point of sale (POS), prescriptions, patient records, purchasing, alerts, reporting, and more.

![Java](https://img.shields.io/badge/Java-17-ED8B00?logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-6DB33F?logo=springboot)
![Angular](https://img.shields.io/badge/Angular-19-DD0031?logo=angular)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-✓-2496ED?logo=docker)
![License](https://img.shields.io/badge/license-Proprietary-red)

---

## ✨ Features

- **🔐 Secure Authentication** – JWT‑based login with four roles: Admin, Manager, Pharmacist, Cashier
- **👥 User Management** – Full CRUD for users with role and branch assignment
- **📦 Inventory & Batch Tracking** – Medications with barcodes, batches with expiry, purchase/selling prices
- **🛒 Point of Sale (POS)** – Search medications, camera barcode scanning (ZXing), FEFO batch selection, cart, patient & prescription linking, discount, payment methods
- **💊 Prescriptions & Patients** – Digital prescriptions with multiple medications, dosage, duration; patient records
- **📊 Dashboard & Analytics** – Live stats cards, interactive sales trend (line) and top medications (bar) charts (ECharts), recent sales, active alerts
- **📄 Invoices & Reports** – PDF invoice generation, CSV export for medications / patients / sales
- **🔔 Alerts** – Automatic low‑stock and expiry alerts with email notifications to admins/managers
- **📝 Audit Logs** – Track every create / update / delete with user, timestamp, and details
- **🌙 Modern UI** – Responsive design, dark/light mode toggle, skeleton loaders, toast notifications, animated sidebar
- **🐳 Dockerised** – One‑command startup with Docker Compose (backend + frontend + database)
- **🔍 Barcode Scanning** – Camera scanner (ZXing) and manual input for USB scanners
- **📧 Email Notifications** – Low‑stock / expiry alerts sent via Spring Boot Mail
- **🔄 Soft‑delete** – Batch removal via quantity set to zero (preserves data integrity)
- **🎨 Charts** – Dark‑mode‑aware ECharts integration

---

## 🛠️ Technology Stack

| Layer                | Technology |
|-----------------------|------------|
| **Backend**           | Java 17, Spring Boot 3.2, Spring Security, Spring Data JPA (Hibernate) |
| **Frontend**          | Angular 19 (standalone components), TypeScript, Bootstrap 5, Font Awesome |
| **Database**          | PostgreSQL 16 |
| **Authentication**    | JWT (JSON Web Tokens), BCrypt |
| **PDF**                | iText 8 |
| **Charts**             | ECharts (via ngx-echarts) |
| **Barcode**            | ZXing (@zxing/ngx-scanner, @zxing/library) |
| **Email**              | Spring Boot Mail (JavaMailSender) |
| **Build**              | Maven (backend), Angular CLI (frontend) |
| **Containerisation**   | Docker, Docker Compose |
| **Testing**            | JUnit 5, Mockito (backend) |

---

## 📐 Architecture

**Layered architecture** with clear separation of concerns:

```
Angular Frontend ↔ REST API (JSON) ↔ Spring Boot Backend ↔ PostgreSQL
```

- **Frontend:** Standalone components → Services → HTTP Interceptor (JWT) → Backend
- **Backend:** Controllers → Services → Repositories → Entities
- **Security:** Stateless JWT filter chain with method‑level `@PreAuthorize`
- **Exception handling:** Global `@RestControllerAdvice` for clean JSON errors

---

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 18+ & npm
- Docker Desktop
- Angular CLI (`npm install -g @angular/cli`)

### 1. Start the full stack with Docker (recommended)

```bash
docker compose up -d --build
```

Access the application at **http://localhost**
Login: `admin@pharmacy.com` / `admin123`

### 2. Development mode (run services separately)

```bash
# Start only the database
docker compose up -d postgres

# Backend
cd backend
./mvnw spring-boot:run

# Frontend
cd frontend
npm install
ng serve
```

Frontend: **http://localhost:4200**

---

## 📖 User Roles

| Role           | Access |
|-----------------|--------|
| **Admin**       | Full system access – branches, users, suppliers, medications, inventory, POS, prescriptions, patients, reports, alerts, audit logs |
| **Manager**     | Inventory, purchases, suppliers, medications, POS, patients, reports, alerts |
| **Pharmacist**  | POS, prescriptions, patients, medications, alerts |
| **Cashier**     | Dashboard, POS |

---

## 📸 Screenshots

![Login Page](screenshots/loginPage.png)
![Dashboard](screenshots/dashboardPage.png)
![POS](screenshots/PointOfSale.png) 
![Reports](screenshots/reports.png)
![Alerts](screenshots/alerts.png)
![Inventory](screenshots/inventory&purchase.png)
![Prescriptions](screenshots/prescriptions.png)
![Medications](screenshots/medications.png)
![Audit Logs](screenshots/auditlogs.png)
![Dark Mode View](screenshots/darkmode.png)



---

## 📖 Documentation

- **Swagger UI:** http://localhost:8080/swagger-ui/index.html (after backend starts)
- **UML Diagrams & ERD:** located in `docs/diagrams.md`
- **Presentation outline:** `docs/presentation.md`

---

## 📦 Deployment

The system is fully containerised. For production:

- Set environment variables for database credentials and JWT secret.
- Use a reverse proxy (Nginx / Traefik) with HTTPS.
- Optionally deploy to cloud platforms (AWS ECS, Azure, etc.).
- Contact the developer for a detailed deployment guide.

---

## 🧪 Running Tests

```bash
cd backend
./mvnw test
```

---

## 📝 License

This project is proprietary software. All rights reserved. Contact the developer for licensing options.

---

## 👨‍💻 Developer

**Rahmouni Oussema**
[GitHub](https://github.com/)

---

## 📂 Project Structure

```
pharmacy-management-system/
├── backend/                          (Spring Boot)
│   ├── src/main/java/com/pharmacy/
│   │   ├── config/                   (DataInitializer)
│   │   ├── model/                    (Entities: User, Branch, Medication, Batch, …)
│   │   ├── repository/               (Spring Data JPA interfaces)
│   │   ├── dto/                      (Data Transfer Objects)
│   │   ├── service/                  (Business logic)
│   │   ├── controller/               (REST endpoints)
│   │   ├── security/                 (JWT filter, config)
│   │   ├── scheduler/                (AlertScheduler)
│   │   └── exception/                (GlobalExceptionHandler)
│   └── pom.xml
├── frontend/                         (Angular)
│   ├── src/app/
│   │   ├── core/                     (auth, models, services, interceptors)
│   │   ├── login/                    (login page)
│   │   ├── dashboard/                (dashboard with charts)
│   │   ├── layout/                   (sidebar, main layout)
│   │   ├── branches/                 (branch CRUD)
│   │   ├── users/                    (user CRUD)
│   │   ├── suppliers/                (supplier CRUD)
│   │   ├── medications/              (medication CRUD)
│   │   ├── inventory/                (stock & purchases)
│   │   ├── pos/                      (point of sale)
│   │   ├── patients/                 (patient CRUD)
│   │   ├── prescriptions/            (prescription CRUD)
│   │   ├── reports/                  (sales reports & CSV export)
│   │   ├── alerts/                   (low‑stock / expiry alerts)
│   │   ├── audit-logs/               (audit trail)
│   │   ├── profile/                  (user profile)
│   │   └── shared/                   (toast container)
│   ├── angular.json
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
├── README.md
└── docs/                             (UML diagrams, presentation)
```