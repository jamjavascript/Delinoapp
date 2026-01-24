# Products - Full Stack Application

A modern full-stack web application built with FastAPI (backend), Next.js (frontend), and PostgreSQL (database).

## 🌟 Features

- **Category Filtering**: Filter products by categories (Electronics, Books, Home & Kitchen, etc.)
- **Automated Data Refresh**: Background scheduler updates product data every 6 hours
- **Responsive UI**: Modern, mobile-friendly interface built with Tailwind CSS
- **RESTful API**: Clean, documented API endpoints with FastAPI
- **Database Caching**: PostgreSQL database to cache API responses and reduce costs

## 📋 Table of Contents

- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Database Setup](#database-setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Features Breakdown](#features-breakdown)
- [Troubleshooting](#troubleshooting)

## 🏗️ Architecture

```
┌─────────────────┐
│   Next.js UI    │
│  (Port 3000)    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐      ┌──────────────┐
│  FastAPI Server │─────→│  PostgreSQL  │
│   (Port 8000)   │      │   Database   │
└────────┬────────┘      └──────────────┘
         │
         ↓

## 🔧 Prerequisites

- **Python**: 3.9 or higher
- **Node.js**: 18.x or higher
- **PostgreSQL**: 14.x or higher (or Docker)

## 📦 Installation

### Backend Setup

1. **Create and activate a virtual environment**:
```bash
python -m venv venv

# On macOS/Linux
source venv/bin/activate

# On Windows
venv\Scripts\activate
```


2. **Install Python dependencies**:
```bash
pip install -r requirements.txt
```

3. **Set up environment variables**:
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```env
# Database
DATABASE_URL=postgresql+psycopg://delinoapp:delinoapp@localhost:5432/delinoapp
```

### Frontend Setup

1. **Navigate to the frontend directory**:
```bash
cd frontend
```

2. **Install Node dependencies**:
```bash
npm install
```

3. **Create frontend env file**:
```bash
touch .env.local
```

Add:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Database Setup

1. **Start the database with Docker**:
```bash
docker-compose up -d
```

2. **Run database migrations**:
```bash
# From the project root
alembic upgrade head
```

Or create initial migration:
```bash
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

## ⚙️ Configuration

### Database Configuration

Default connection string:
```
postgresql+psycopg://delinoapp:delinoapp@localhost:5432/delinoapp
```

Modify in `.env` if your PostgreSQL setup is different.

Scheduler settings:
```
PRODUCT_REFRESH_HOURS=6
SCHEDULER_ENABLED=true
```

## 🚀 Running the Application

### Start Backend Server

```bash
# From project root, with venv activated
uvicorn app.main:app --reload
```

Backend will be available at: `http://localhost:8000`

### Start Frontend Server

```bash
# From frontend directory
npm run dev
```

Frontend will be available at: `http://localhost:3000`

## 📚 API Documentation

Once the backend is running, access interactive API docs:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Available Endpoints

#### Products
- `GET /api/v1/products/trending` - Get products (optional `category` query)
- `GET /api/v1/products/{id}` - Get product details
- `GET /api/v1/products/{id}/price-history` - Get price history
- `POST /api/v1/products/refresh` - Manually refresh data
- `POST /api/v1/products/sample-data` - Seed sample data

#### Categories
- `GET /api/v1/products/categories/list` - Get all categories

#### Health
- `GET /api/v1/health` - Health check

## 📁 Project Structure

```
Delinoapp/
├── app/
│   ├── main.py                      # FastAPI application
│   ├── api/
│   │   └── routes/
│   │       ├── health.py            # Health check
│   │       ├── items.py             # Sample endpoints
│   │       └── products.py          # Product endpoints
│   ├── core/
│   │   └── config.py                # Configuration
│   ├── models/
│   │   ├── base.py                  # Database base
│   │   ├── category.py              # Category model
│   │   ├── product.py               # Product model
│   │   └── price_history.py         # Price history model
│   ├── schemas/
│   │   ├── product.py               # Pydantic schemas
│   │   └── item.py                  # Sample schemas
│   └── services/
│       └── scheduler.py             # Background scheduler
├── alembic/                         # Database migrations
├── frontend/
│   ├── app/
│   │   ├── page.tsx                 # Home page
│   │   └── product/[id]/
│   │       └── page.tsx             # Product detail page
│   ├── components/
│   │   ├── ProductCard.tsx          # Product card component
│   │   ├── ProductGrid.tsx          # Product grid layout
│   │   ├── CategoryFilter.tsx       # Category filter
│   │   └── PriceChart.tsx           # Price history chart
│   ├── lib/
│   │   └── api.ts                   # API client
│   └── types/
│       └── product.ts               # TypeScript types
├── .env.example                     # Environment template
├── requirements.txt                 # Python dependencies
└── README.md
```

## 🎯 Features Breakdown

### 1. Product Display
- Grid layout showing products
- Product images, titles, and prices
- Click to view detailed product information

### 2. Category Filtering
- Filter products by category
- Categories are automatically managed
- "All Categories" view for all products

### 3. Price History Charts
- Interactive line charts using Recharts
- Time-based x-axis with formatted dates

### 4. Auto-Refresh Scheduler
- Background task runs every 6 hours (configurable)
- Updates product data automatically
- Tracks price changes in database

### 5. Database Caching
- Products cached in PostgreSQL
- Price history stored for trend analysis

## 🔍 Troubleshooting

### Backend Issues

**Port already in use**:
```bash
uvicorn app.main:app --reload --port 8001
```

**Database connection error**:
- Verify PostgreSQL is running: `pg_isready`
- Check credentials in `.env`
- Ensure database exists

### Frontend Issues

**API connection failed**:
- Ensure backend is running on port 8000
- Check `.env.local` has correct API URL
- Verify CORS settings in backend

**Build errors**:
```bash
# Clear Next.js cache
rm -rf frontend/.next
npm run dev
```

### Database Migrations

**Reset migrations**:
```bash
alembic downgrade base
alembic upgrade head
```

**Create new migration**:
```bash
alembic revision --autogenerate -m "Description"
alembic upgrade head
```

## 🔐 Security Notes

- Never commit `.env` file
- Use environment variables for all sensitive data
- In production, use proper database authentication

## 📈 Scalability

To scale this application:

1. **Database**: Use connection pooling, read replicas
2. **Caching**: Add Redis for faster response times
3. **API**: Implement rate limiting, pagination
4. **Frontend**: Deploy to Vercel/Netlify with CDN
5. **Backend**: Deploy to cloud (AWS, GCP, Heroku)

## 🤝 Contributing

This is a project template. Feel free to:
- Add more features
- Improve error handling
- Add tests (pytest for backend, Jest for frontend)
- Enhance UI/UX

## 📝 License

MIT

## 🙏 Acknowledgments

- **FastAPI**: Modern Python web framework
- **Next.js**: React framework for production
- **Recharts**: Charting library for React

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation at `/docs`

---

**Built with ❤️ using FastAPI, Next.js, and PostgreSQL**
