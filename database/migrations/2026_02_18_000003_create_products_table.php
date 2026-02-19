<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('hsn_code')->nullable();
            $table->decimal('gst_percent', 5, 2)->default(3.00); // Standard Gold GST
            $table->decimal('gross_weight', 10, 3); // In grams
            $table->decimal('net_weight', 10, 3); // In grams
            $table->decimal('wastage_percent', 5, 2)->default(0);
            $table->decimal('making_charges', 10, 2)->default(0);
            $table->integer('stock_quantity')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
