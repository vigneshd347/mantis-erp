<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_no')->unique();
            $table->date('invoice_date');
            $table->foreignId('customer_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('subtotal', 15, 2);
            $table->decimal('tax_amount', 15, 2);
            $table->decimal('discount', 15, 2)->default(0);
            $table->decimal('round_off', 5, 2)->default(0);
            $table->decimal('total_amount', 15, 2);
            $table->enum('status', ['paid', 'unpaid', 'partially_paid'])->default('unpaid');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('sale_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete(); // nullable if product is deleted or custom item
            $table->string('product_name'); // Store name in case product is deleted
            $table->string('hsn_code')->nullable();
            $table->integer('quantity');
            $table->decimal('gst_percent', 5, 2);
            $table->decimal('gross_weight', 10, 3)->nullable();
            $table->decimal('net_weight', 10, 3)->nullable();
            $table->decimal('gold_rate', 10, 2)->nullable(); // Rate at time of sale
            $table->decimal('making_charges', 10, 2)->nullable();
            $table->decimal('rate', 15, 2); // Final rate per unit
            $table->decimal('amount', 15, 2); // quantity * rate
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sale_items');
        Schema::dropIfExists('sales');
    }
};
