<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Setting;
use App\Models\Customer;
use App\Models\Product;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create Admin User
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@mantijewelart.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Create initial settings
        Setting::create(['key' => 'gold_rate_24k', 'value' => '6000.00']);
        Setting::create(['key' => 'gold_rate_22k', 'value' => '5500.00']);
        Setting::create(['key' => 'silver_rate', 'value' => '70.00']);

        // Create dummy customers
        Customer::create([
            'name' => 'Walk-in Customer',
            'phone' => '9999999999',
            'email' => 'customer@example.com',
            'address' => 'Mumbai, India',
            'state' => 'Maharashtra',
            'gst_no' => 'URP'
        ]);

        // Create dummy products
        Product::create([
            'name' => 'Gold Ring 22k',
            'hsn_code' => '7113',
            'gst_percent' => 3.00,
            'gross_weight' => 5.500,
            'net_weight' => 5.500,
            'wastage_percent' => 10.00,
            'making_charges' => 500.00,
            'stock_quantity' => 10
        ]);
    }
}
