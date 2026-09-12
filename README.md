# DigitalVendor

A full-stack digital storefront platform for local vendors.

## Stack
- Frontend: React + Vite + Bootstrap
- Backend: Node.js + Express
- Database: MySQL
- Authentication: JWT
- Uploads: Multer
- QR: qrcode
- Charts: Chart.js + react-chartjs-2

## Features
1. Vendor registration/login
2. Easy shop creation/editing
3. Product catalog with image, price, category, description and stock
4. Unique public shop link
5. QR code generation/download
6. Customer browsing/search/category filter
7. Guest cart + checkout (no customer registration)
8. Order management: New -> Accepted -> Preparing -> Ready -> Delivered
9. Payment option: UPI demo or Cash on Delivery
10. Vendor dashboard: sales, orders, products, pending orders, weekly/monthly sales and best sellers
11. Shop location + WhatsApp sharing
12. Low-stock indicator
13. Responsive UI

## Project structure
digitalvendor/
  frontend/
  backend/
  database/schema.sql

## Setup

### 1. Database
Create/import the database:
mysql -u root -p < database/schema.sql

Or open `database/schema.sql` in MySQL Workbench and run it.

### 2. Backend
cd backend
npm install
copy .env.example .env

Edit `.env`:
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=digitalvendor
JWT_SECRET=change_this_secret

Start:
npm run dev

Backend runs on http://localhost:5000

### 3. Frontend
Open a SECOND PowerShell terminal:
cd frontend
npm install
copy .env.example .env

Start:
npm run dev

Frontend runs on the Vite URL, normally http://localhost:5173

IMPORTANT: Run frontend and backend in separate terminals. They cannot both be run with `npm run dev` in the same terminal at the same time.

## Public shop URL
After creating a shop, the vendor gets:
http://localhost:5173/shop/<shop-slug>

The dashboard also displays a QR code and sharing buttons.

## Uploads
Shop logos and product images are uploaded to backend/uploads and served by the Express backend.
