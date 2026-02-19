<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->date('purchase_date');
            $table->decimal('purchase_value', 15, 2);
            $table->decimal('depreciation_percent', 5, 2);
            $table->decimal('current_value', 15, 2)->nullable(); // Can be recalculated
            $table->timestamps();
        });
        
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assets');
        Schema::dropIfExists('settings');
    }
};
