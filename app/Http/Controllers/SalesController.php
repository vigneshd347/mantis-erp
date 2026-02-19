<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Sale;
use App\Models\Product;
use App\Models\Customer;
use App\Models\SaleItem;
use App\Models\Setting;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Mail;
use App\Mail\InvoiceMail;
use Illuminate\Support\Facades\Http;

class SalesController extends Controller
{
    public function index()
    {
        $sales = Sale::with('customer')->latest()->paginate(10);
        return view('sales.index', compact('sales'));
    }

    public function create()
    {
        $customers = Customer::all();
        $products = Product::where('stock_quantity', '>', 0)->get();
        // Fallback or fetch from settings
        $gold_rate = Setting::where('key', 'gold_rate_22k')->value('value') ?? 5500;
        
        $lastSale = Sale::latest()->first();
        // Assuming ID auto-increments, next ID might be higher if last was deleted, generally max(id)+1
        $nextId = Sale::max('id') + 1;
        $invoice_no = 'INV-' . str_pad($nextId, 6, '0', STR_PAD_LEFT);

        return view('sales.create', compact('customers', 'products', 'gold_rate', 'invoice_no'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'invoice_date' => 'required|date',
            'items' => 'required|array|min:1',
        ]);

        DB::beginTransaction();
        try {
            $sale = Sale::create([
                'invoice_no' => $request->invoice_no,
                'invoice_date' => $request->invoice_date,
                'customer_id' => $request->customer_id,
                'user_id' => auth()->id() ?? 1,
                'subtotal' => $request->subtotal,
                'tax_amount' => $request->tax_amount,
                'total_amount' => $request->grand_total,
                'status' => 'unpaid'
            ]);

            foreach ($request->items as $item) {
                if(!isset($item['product_id']) || !$item['product_id']) continue;

                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $item['product_id'],
                    'product_name' => $item['product_name'],
                    'quantity' => $item['quantity'],
                    'rate' => $item['rate'],
                    'amount' => $item['amount'],
                    'gst_percent' => $item['gst'] ?? 3,
                ]);
                
                $product = Product::find($item['product_id']);
                if ($product) {
                    $product->decrement('stock_quantity', $item['quantity']);
                }
            }
            
            DB::commit();

            // Auto Send Logic
            if ($request->has('auto_send')) {
                $this->sendInvoiceEmail($sale);
                // $this->sendWhatsApp($sale);
            }

            return redirect()->route('sales.index')->with('success', 'Invoice generated successfully!');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->with('error', 'Error generating invoice: ' . $e->getMessage());
        }
    }

    public function show($id)
    {
        $sale = Sale::with(['items', 'customer'])->findOrFail($id);
        return view('sales.show', compact('sale')); // You need create show.blade.php similarly to create/index
    }

    public function downloadPdf($id)
    {
        $sale = Sale::with(['items', 'customer'])->findOrFail($id);
        $pdf = Pdf::loadView('invoices.template', compact('sale'));
        return $pdf->download('invoice-'.$sale->invoice_no.'.pdf');
    }

    public function sendInvoiceEmail($sale)
    {
        if ($sale->customer && $sale->customer->email) {
            Mail::to($sale->customer->email)->send(new InvoiceMail($sale));
        }
    }

    // Placeholder for WhatsApp Integration
    public function sendWhatsApp($sale)
    {
        // Use Meta Business API or Twilio
        /*
        $response = Http::post('https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages', [
            'messaging_product' => 'whatsapp',
            'to' => $sale->customer->phone,
            'type' => 'template',
            'template' => [
                'name' => 'invoice_generated',
                'language' => ['code' => 'en_US'],
                'components' => [
                    [
                        'type' => 'body',
                        'parameters' => [
                            ['type' => 'text', 'text' => $sale->customer->name],
                            ['type' => 'text', 'text' => $sale->invoice_no],
                            ['type' => 'text', 'text' => '₹' . $sale->total_amount],
                            ['type' => 'text', 'text' => route('sales.pdf', $sale->id)], 
                        ]
                    ]
                ]
            ]
        ]);
        */
    }
}
