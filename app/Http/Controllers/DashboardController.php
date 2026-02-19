<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Sale;
use App\Models\Customer;
use App\Models\Product;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();
        
        $todaySales = Sale::whereDate('created_at', $today)->sum('total_amount');
        $monthlySales = Sale::whereMonth('created_at', $today->month)->sum('total_amount');
        $outstanding = Sale::where('status', 'unpaid')->sum('total_amount');
        $lowStock = Product::where('stock_quantity', '<', 5)->count();
        $recentSales = Sale::with('customer')->latest()->take(5)->get();

        return view('dashboard', compact('todaySales', 'monthlySales', 'outstanding', 'lowStock', 'recentSales'));
    }
}
