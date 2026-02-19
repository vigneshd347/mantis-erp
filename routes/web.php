<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SalesController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CustomerController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application.
| These routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Sales Routes
    Route::resource('sales', SalesController::class);
    Route::get('sales/{id}/pdf', [SalesController::class, 'downloadPdf'])->name('sales.pdf');
    
    // Product Routes
    Route::resource('products', ProductController::class);
    
    // Customer Routes
    Route::resource('customers', CustomerController::class);
});

// Authentication Routes (Simplified)
Route::get('login', function () {
    return view('auth.login');
})->name('login');

Route::post('login', function () {
    // Demo login logic
    $credentials = request()->only('email', 'password');
    if (auth()->attempt($credentials)) {
        return redirect()->intended('dashboard');
    }
    return back()->withErrors(['email' => 'Invalid credentials']);
});

Route::post('logout', function () {
    auth()->logout();
    return redirect('/login');
})->name('logout');
