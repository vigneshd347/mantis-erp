<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice #{{ $sale->invoice_no }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; }
        .header { width: 100%; border-bottom: 1px solid #ddd; padding-bottom: 20px; margin-bottom: 20px; }
        .company-logo { float: left; width: 150px; }
        .company-details { float: right; text-align: right; }
        .invoice-title { font-size: 24px; font-weight: bold; color: #333; clear: both; padding-top: 20px; }
        .invoice-info { margin-bottom: 20px; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .table th { background-color: #f2f2f2; }
        .total-section { float: right; width: 300px; }
        .total-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee; }
        .footer { margin-top: 50px; text-align: center; color: #777; font-size: 10px; border-top: 1px solid #ddd; padding-top: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-details">
            <h2>Manti Jewel Art Private Limited</h2>
            <p>123 Jewel Street, Mumbai, India</p>
            <p>GSTIN: 27AABCU9603R1ZN</p>
            <p>Email: sales@mantijewelart.com | Phone: +91 98765 43210</p>
        </div>
        <div style="clear: both;"></div>
    </div>

    <div class="invoice-info">
        <div style="float: left; width: 50%;">
            <strong>Bill To:</strong><br>
            {{ $sale->customer->name }}<br>
            {{ $sale->customer->address }}<br>
            Phone: {{ $sale->customer->phone }}<br>
            GSTIN: {{ $sale->customer->gst_no }}
        </div>
        <div style="float: right; width: 40%; text-align: right;">
            <strong>Invoice No:</strong> {{ $sale->invoice_no }}<br>
            <strong>Date:</strong> {{ $sale->invoice_date }}<br>
            <strong>Status:</strong> {{ ucfirst($sale->status) }}
        </div>
        <div style="clear: both;"></div>
    </div>

    <table class="table">
        <thead>
            <tr>
                <th>#</th>
                <th>Description</th>
                <th>HSN</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($sale->items as $index => $item)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $item->product_name }}</td>
                <td>{{ $item->hsn_code }}</td>
                <td>{{ $item->quantity }}</td>
                <td>{{ number_format($item->rate, 2) }}</td>
                <td>{{ number_format($item->amount, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="total-section">
        <table style="width: 100%;">
            <tr>
                <td style="border: none;"><strong>Subtotal:</strong></td>
                <td style="border: none; text-align: right;">{{ number_format($sale->subtotal, 2) }}</td>
            </tr>
            <tr>
                <td style="border: none;"><strong>CGST (1.5%):</strong></td>
                <td style="border: none; text-align: right;">{{ number_format($sale->tax_amount / 2, 2) }}</td>
            </tr>
            <tr>
                <td style="border: none;"><strong>SGST (1.5%):</strong></td>
                <td style="border: none; text-align: right;">{{ number_format($sale->tax_amount / 2, 2) }}</td>
            </tr>
            <tr>
                <td style="border: none; font-size: 14px;"><strong>Total:</strong></td>
                <td style="border: none; text-align: right; font-size: 14px;"><strong>{{ number_format($sale->total_amount, 2) }}</strong></td>
            </tr>
        </table>
    </div>
    <div style="clear: both;"></div>

    <div class="footer">
        <p>This is a computer-generated invoice. No signature required.</p>
        <p>Thank you for your business!</p>
    </div>
</body>
</html>
