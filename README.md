# 🦷 Dental Practice Management System

A comprehensive **Dental Practice Management System** built as a **desktop application** using **Electron, React, and Laravel**.
The goal of this application is to simplify the daily operations of a dental clinic by managing patients, appointments, treatments, and medical documents in one centralized system.

---

# 📌 Purpose

This application helps dental clinics manage their workflow efficiently by providing tools for:

* **Patient Management** – Store and manage patient information and medical history.
* **Appointment Scheduling** – Organize and validate patient appointments.
* **Treatment Records** – Document treatments and procedures performed.
* **Medical Documents Management** – Create and manage clinic documents such as:

  * Prescriptions *(Ordonnances)*
  * Medical Certificates *(Certificats)*
  * Invoices *(Factures)*
  * Quotes *(Devis)*
  * Consultations

---

# ⚙️ Key Features

## 👥 Multi-Role System

The application supports different user roles:

### 🧑‍⚕️ Doctor

Access to all medical features including:

* Dashboard
* Patient management
* Appointment management
* Treatment records
* Medical documents

### 🧑‍💼 Secretary

Handles administrative tasks such as:

* Scheduling appointments
* Managing patient records

---

## 📱 Responsive Interface

* Responsive UI design.
* Works smoothly on different screen sizes.
* Desktop window minimum size: **1400 × 900px**
* Window is **resizable**.

---

## 🔗 Backend Integration

The application communicates with a **RESTful Laravel API** connected to a **MySQL database** to manage:

* Patient records
* Appointments
* Treatments
* Medical documents
* Payment tracking

---

## ⚡ Real-Time Development

The project supports **Hot Module Replacement (HMR)** during development for instant updates without reloading the entire application.

---

# 🛠 Tech Stack

## Frontend

* **React 19**
* **TypeScript**
* **Vite**
* **Tailwind CSS**
* **Shadcn UI**

## Desktop

* **Electron 40.1.0**
* Context Isolation Security

## Backend

* **Laravel 11**
* REST API architecture

## Database

* **MySQL**

## Development Tools

* **pnpm**
* **concurrently** (for running frontend and backend dev servers)

---

# 🚀 Project Structure

```
dental-practice-system
│
├── frontend (React + Vite + Electron)
│
├── backend (Laravel API)
│
└── database
```

---

# 📦 Installation

### 1️⃣ Clone the repository

```
git clone https://github.com/your-username/dental-practice-system.git
```

### 2️⃣ Install dependencies

Frontend:

```
pnpm install
```

Backend:

```
composer install
```

### 3️⃣ Configure environment

Create `.env` file and configure database settings.

### 4️⃣ Run migrations

```
php artisan migrate
```

### 5️⃣ Start development servers

```
pnpm dev
```

---

# 📄 License

This project is developed for **educational purposes and dental clinic management systems**.
