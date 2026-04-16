# GEMINI.md

## Project Overview

Build a **mini full stack Expense Tracker App** using:

* **Frontend:** React + Tailwind CSS
* **Backend:** Django + Django REST Framework
* **API Style:** Function Based Views only
* **Data Access in Views:** Prefer `request.data.get()`
* **Authentication:** Not required
* **Theme:** Support both **Light Mode** and **Dark Mode**
* **Responsive Priority:** **Mobile-first**
* **Currency:** Use **Indian Rupee symbol (₹)** everywhere instead of any other currency

The app should follow the layout and visual direction from the provided reference images:

* Left sidebar navigation
* Dashboard summary cards
* Expenses listing page with search, category filter, date filters, edit/delete actions
* Clean white/light cards with soft shadows and rounded corners
* Purple primary accent color
* Colored category badges
* Donut/pie chart for category spending

Do **not** copy the images exactly. Use them as a design reference and recreate a clean, modern UI with the same general structure and feel.

* Do not create any separate root-level test.py file
* Instead, write proper backend test cases inside Django app test files like tests.py
* After installing all dependencies, generate requirements.txt using:
* pip freeze > requirements.txt

---

## Core Features

### 1. Dashboard

Create a dashboard page that shows:

* Total spending
* Current month spending
* Top spending category
* Spending by category chart
* Recent expenses list

### 2. Expenses Page

Create an expenses page with:

* Add Expense button
* Search input
* Category filter dropdown
* Start date filter
* End date filter
* Expense list/table
* Edit expense action
* Delete expense action

### 3. Expense CRUD

Support full CRUD operations:

* Create expense
* Read/list expenses
* Update expense
* Delete expense

### 4. Expense Fields

Each expense should include:

* `title`
* `description`
* `amount`
* `category`
* `date`
* `created_at`
* `updated_at`

### 5. Categories

Do **not** keep categories fixed in the backend.

Category should be **user-defined at the time of creating an expense**.
This means:

* the user can enter any category name
* category values should come from saved expense data
* the category filter dropdown should be generated dynamically from existing categories in the database
* no hardcoded category list like Food, Transport, Utilities, etc.

Example behavior:

* when user adds an expense, they can type categories like `Food`, `Travel`, `Rent`, `Bills`, `Shopping`, or anything else
* dashboard analytics should group data based on whatever categories the user has actually used
* categories endpoint should return distinct categories from saved expenses

### 6. Theme Support

Add:

* Light mode
* Dark mode
* Theme toggle button
* Persist theme in localStorage

### 7. Responsive Design

Must be fully mobile responsive:

* Sidebar should become a top bar or drawer on small screens
* Filters should stack properly on mobile
* Cards should collapse gracefully
* Tables should remain readable on small screens

---

## UI / Design Instructions

### Design Style

Use a clean and modern dashboard design with:

* Primary color: purple/violet
* Neutral background colors
* Rounded cards and inputs
* Soft borders and subtle shadows
* Spacious layout
* Easy-to-read typography
* Colored category pills/badges

### Layout Guidance

#### Sidebar

Include sidebar navigation with:

* App logo/title: `TrackExpenses`
* Menu items:

  * Dashboard
  * Expenses

#### Dashboard Cards

Cards should include:

* title
* value with **₹** symbol
* small supporting text
* optional icon

#### Expenses Table/List

Columns:

* Date
* Title
* Category
* Amount
* Actions

On mobile, convert the table into stacked cards if needed.

### Currency Rule

Always display amounts like:

* `₹476`
* `₹391`
* `₹239`

Do not use `$` or `₦`.

### Dark Mode

Dark mode should:

* Keep strong contrast
* Maintain the purple accent color
* Use darker cards and backgrounds
* Keep charts and badges readable

---

## Frontend Stack Requirements

Use:

* React
* Tailwind CSS
* Axios
* React Router DOM
* Recharts (for charts)
* React Icons or Lucide React for icons

### Frontend Pages

Create these pages:

* `Dashboard.jsx`
* `Expenses.jsx`
* `NotFound.jsx`

### Frontend Components

Create reusable components such as:

* `Sidebar.jsx`
* `Topbar.jsx`
* `SummaryCard.jsx`
* `ExpenseFormModal.jsx`
* `ExpenseTable.jsx`
* `ExpenseFilters.jsx`
* `CategoryBadge.jsx`
* `ThemeToggle.jsx`
* `RecentExpenses.jsx`
* `SpendingChart.jsx`
* `Loader.jsx`
* `EmptyState.jsx`

### Frontend State

Handle:

* expenses list
* loading state
* error state
* filter state
* theme state
* dashboard summary state

Use clean React hooks and reusable API utilities.

---

## Backend Stack Requirements

Use:

* Django
* Django REST Framework
* django-cors-headers
* SQLite for development

### Backend Rules

* Use **Function Based Views only**
* Use `request.data.get()` for POST/PUT/PATCH data access
* Return proper JSON responses
* No authentication system needed
* Create clean REST-style endpoints

### Suggested API Endpoints

* `GET /api/expenses/` → list expenses
* `POST /api/expenses/` → create expense
* `GET /api/expenses/<id>/` → get single expense
* `PUT /api/expenses/<id>/` → update expense
* `DELETE /api/expenses/<id>/` → delete expense
* `GET /api/dashboard-summary/` → dashboard totals and analytics
* `GET /api/categories/` → return distinct categories from existing expenses

### Backend Logic

Dashboard summary endpoint should calculate:

* total spending
* current month spending
* top category
* category-wise totals
* recent expenses

### Model Suggestion

Create an `Expense` model.

Suggested fields:

* `title = models.CharField(max_length=255)`
* `description = models.TextField(blank=True, null=True)`
* `amount = models.DecimalField(max_digits=10, decimal_places=2)`
* `category = models.CharField(max_length=100)`
* `date = models.DateField()`
* `created_at = models.DateTimeField(auto_now_add=True)`
* `updated_at = models.DateTimeField(auto_now=True)`

---

## Folder Structure Requirements

Create a professional folder structure for both frontend and backend.

### Root Structure

```bash
expense_tracker/
│── backend/
│── frontend/
│── .env
│── .gitignore
│── requirements.txt
│── README.md
```

### Backend Structure

```bash
backend/
│── manage.py
│── core/
│   │── __init__.py
│   │── settings.py
│   │── urls.py
│   │── wsgi.py
│   │── asgi.py
│── expenses/
│   │── migrations/
│   │── __init__.py
│   │── admin.py
│   │── apps.py
│   │── models.py
│   │── serializers.py
│   │── urls.py
│   │── views.py
│   │── tests.py
│
```

### Frontend Structure

```bash
frontend/
│── public/
│── src/
│   │── assets/
│   │── components/
│   │   │── layout/
│   │   │── dashboard/
│   │   │── expenses/
│   │   │── common/
│   │── pages/
│   │── services/
│   │── hooks/
│   │── utils/
│   │── context/
│   │── App.jsx
│   │── main.jsx
│   │── index.css
│── package.json
│── vite.config.js
```

---

## Environment File Requirements

Create a `.env` file.

### Root `.env`

Store values like:

```env
DEBUG=True
SECRET_KEY=your-django-secret-key
ALLOWED_HOSTS=127.0.0.1,localhost
CORS_ALLOWED_ORIGINS=http://localhost:5173
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Use `python-dotenv` or environment variable loading in Django.

---

## .gitignore Requirements

Create a proper `.gitignore` including:

```gitignore
# Python
__pycache__/
*.py[cod]
*.sqlite3
.env
venv/
env/

# Django
media/
staticfiles/

# Node
node_modules/
dist/

# VS Code
.vscode/

# OS
.DS_Store
Thumbs.db
```

---

## requirements.txt Requirements

Create a `requirements.txt` containing at least:

```txt
Django
 djangorestframework
 django-cors-headers
 python-dotenv
```

Make sure the final file is clean and properly formatted without extra leading spaces.

Expected packages:

* Django
* djangorestframework
* django-cors-headers
* python-dotenv

---

## Testing Requirement

- Do not create any separate root-level test.py file
- Write proper Django test cases inside the app using tests.py

Test coverage should include:
- Create expense
- List expenses
- Update expense
- Delete expense
- Dashboard summary API
- Categories API
- Validation errors

---

## API and Coding Style Rules

### Django Views

Use function based views like:

* `@api_view(['GET'])`
* `@api_view(['POST'])`
* `@api_view(['PUT'])`
* `@api_view(['DELETE'])`

For incoming data use:

* `request.data.get('title')`
* `request.data.get('amount')`
* `request.data.get('category')`
* `request.data.get('date')`

### Response Style

Return clean JSON responses with:

* success messages
* data objects
* validation errors where needed
* proper HTTP status codes

### Validation

Add basic validation for:

* title required
* amount required and greater than zero
* category required
* date required
* category should be stored as clean text input from the user

---

## Frontend Functional Expectations

### Expenses Page Behaviors

* Search expenses by title or description
* Filter by category using dynamically fetched categories
* Allow user to type and save their own category while creating or editing an expense
* Filter by date range
* Add new expense in modal or form section
* Edit existing expense
* Delete with confirmation
* Show empty state when no expenses exist
* Show loading states during API calls

### Dashboard Behaviors

* Fetch summary data from backend
* Show recent expenses
* Show top category
* Render chart using category totals

### UX Expectations

* Smooth hover states
* Clear form validation
* Reusable buttons and inputs
* Good spacing and alignment
* Mobile-first responsiveness
* Dark/light mode should affect all screens consistently

---

## Output Expectations

When generating code for this project:

* Keep code modular and production-friendly
* Do not add authentication
* Keep UI aligned with the reference images
* Use **₹ Indian Rupee symbol** everywhere
* Use React + Tailwind for frontend
* Use Django + DRF for backend
* Use function based views only
* Use `request.data.get()` in backend views
* Include dark mode + light mode
* Include best folder structure
* Include `.env`, `.gitignore`, `requirements.txt`
* Do not create any separate root-level test.py file
* Instead, write proper backend test cases inside Django app test files like tests.py
* Write clean, readable, beginner-friendly code
* Keep the project easy to run locally

---

## Nice-to-Have Enhancements

If time allows, also include:

* reusable modal component
* toast notifications
* dashboard refresh after CRUD
* category color mapping helper
* utility functions for formatting currency and date
* simple reusable API service layer

---

## Final Note

This is a **mini project**, so keep it clean, practical, and easy to understand. Focus on:

* clean full stack structure
* responsive UI
* readable backend code
* smooth CRUD flow
* dashboard analytics
* theme support
* reference-inspired design

Use the screenshots only as visual guidance, not as exact assets or direct copies.
