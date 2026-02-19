<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name', 'hsn_code', 'gst_percent', 'gross_weight', 'net_weight', 
        'wastage_percent', 'making_charges', 'stock_quantity'
    ];

    // Helper to calculate price based on current gold rate
    public function calculatePrice($goldRate)
    {
        // Price = (Net Weight * Gold Rate) + Making Charges + Wastage?
        // Usually Wastage is added to Net Weight or charged separately.
        // Assuming Wastage % is added to weight: 
        // Effective Weight = Net Weight + (Net Weight * Wastage / 100)
        // Price = (Effective Weight * Gold Rate) + Making Charges
        
        $effectiveWeight = $this->net_weight + ($this->net_weight * ($this->wastage_percent / 100));
        return ($effectiveWeight * $goldRate) + $this->making_charges;
    }
}
