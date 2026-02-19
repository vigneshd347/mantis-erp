<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::paginate(10);
        return view('products.index', compact('products'));
    }

    public function create()
    {
        return view('products.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'gross_weight' => 'required|numeric',
            'net_weight' => 'required|numeric',
            'stock_quantity' => 'required|integer'
        ]);

        Product::create($request->all());
        return redirect()->route('products.index');
    }
}
