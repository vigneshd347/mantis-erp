# Manti Jewel Art ERP - Source Code

I have generated the core business logic, database structure, and UI for your ERP system.
Since I could not run the full Laravel installer in this environment, **some framework files (like config/ and artisan) are missing.**

## 🚀 How to Complete Installation

### Option 1: The "Clean Install" Method (Recommended)

1.  **Open your terminal** and go to the parent directory (Desktop).
2.  Create a **fresh** Laravel project:
    ```bash
    composer create-project laravel/laravel manti-full
    ```
3.  **Copy my code** into the new project:
    - Copy `app/` from here to `manti-full/app/` (Merge/Replace)
    - Copy `database/` from here to `manti-full/database/` (Merge/Replace)
    - Copy `resources/` from here to `manti-full/resources/` (Merge/Replace)
    - Copy `routes/web.php` to `manti-full/routes/web.php`
    - Copy `composer.json` entries (add `barryvdh/laravel-dompdf`)
4.  **Go into the new folder**:
    ```bash
    cd manti-full
    ```
5.  **Install the PDF library**:
    ```bash
    composer require barryvdh/laravel-dompdf
    ```
6.  **Set up Database**:
    - Update `.env` with your MySQL credentials.
    - Run migrations and seed:
      ```bash
      php artisan migrate --seed
      ```
7.  **Run the Server**:
    ```bash
    php artisan serve
    ```

### Key Modules Implemented
- **User Roles**: Admin, Accountant, Sales.
- **Jewellery Products**: Gold rate calculation, Making charges, HSN.
- **Sales & Invoicing**: professional GST Invoice PDF.
- **Dashboard**: Real-time sales stats.

### Default Login
- **Email**: `admin@mantijewelart.com`
- **Password**: `password`
