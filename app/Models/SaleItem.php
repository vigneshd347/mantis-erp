<?php



namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SaleItem extends Model
{
    protected $fillable = [
        'sale_id', 'product_id', 'product_name', 'hsn_code', 'quantity', 
        'gst_percent', 'gross_weight', 'net_weight', 'gold_rate', 'making_charges', 
        'rate', 'amount'
    ];
}
