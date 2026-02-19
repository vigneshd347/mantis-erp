@extends('layouts.app')

@section('header', 'Create Invoice')

@section('content')
<div class="bg-white shadow rounded-lg p-6">
    <form action="{{ route('sales.store') }}" method="POST">
        @csrf
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
                <label for="invoice_no" class="block text-sm font-medium text-gray-700">Invoice No</label>
                <input type="text" name="invoice_no" id="invoice_no" value="{{ $invoice_no }}" readonly class="mt-1 block w-full bg-gray-100 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border">
            </div>
            <div>
                <label for="invoice_date" class="block text-sm font-medium text-gray-700">Date</label>
                <input type="date" name="invoice_date" id="invoice_date" value="{{ date('Y-m-d') }}" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border">
            </div>
            <div>
                <label for="customer_id" class="block text-sm font-medium text-gray-700">Customer</label>
                <select name="customer_id" id="customer_id" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border">
                    <option value="">Select Customer</option>
                    @foreach($customers as $customer)
                        <option value="{{ $customer->id }}">{{ $customer->name }} ({{ $customer->phone }})</option>
                    @endforeach
                </select>
            </div>
        </div>

        <div class="mb-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Items</h3>
            <table class="min-w-full divide-y divide-gray-200 border" id="itemsTable">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Weight (g)</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th class="px-4 py-2"></th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr class="item-row">
                        <td class="px-4 py-2">
                            <select name="items[0][product_id]" class="product-select block w-full border-gray-300 rounded-md shadow-sm sm:text-sm border p-1" onchange="updateRow(this)">
                                <option value="">Select Product</option>
                                @foreach($products as $product)
                                    <option value="{{ $product->id }}" data-price="{{ $product->calculatePrice($gold_rate) }}" data-name="{{ $product->name }}">{{ $product->name }}</option>
                                @endforeach
                            </select>
                            <input type="hidden" name="items[0][product_name]" class="product-name">
                        </td>
                        <td class="px-4 py-2">
                            <input type="number" step="0.001" name="items[0][net_weight]" class="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm border p-1" placeholder="0.000">
                        </td>
                        <td class="px-4 py-2">
                            <input type="number" step="0.01" name="items[0][rate]" class="rate-input block w-full border-gray-300 rounded-md shadow-sm sm:text-sm border p-1" oninput="calculateTotal(this)" placeholder="0.00">
                        </td>
                        <td class="px-4 py-2">
                            <input type="number" name="items[0][quantity]" class="qty-input block w-full border-gray-300 rounded-md shadow-sm sm:text-sm border p-1" value="1" oninput="calculateTotal(this)">
                        </td>
                        <td class="px-4 py-2">
                            <input type="number" step="0.01" name="items[0][amount]" class="amount-input block w-full bg-gray-100 border-gray-300 rounded-md shadow-sm sm:text-sm border p-1" readonly>
                        </td>
                        <td class="px-4 py-2 text-center">
                            <button type="button" class="text-red-600 hover:text-red-900" onclick="removeRow(this)">Remove</button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <button type="button" class="mt-2 text-sm text-indigo-600 hover:text-indigo-900 font-medium" onclick="addRow()">+ Add Item</button>
        </div>

        <div class="flex justify-end">
            <div class="w-full md:w-1/3">
                <div class="flex justify-between py-2 border-b">
                    <span class="text-gray-600">Subtotal:</span>
                    <span class="font-medium" id="subtotal">0.00</span>
                    <input type="hidden" name="subtotal" id="subtotal_input">
                </div>
                <div class="flex justify-between py-2 border-b">
                    <span class="text-gray-600">Tax (GST 3%):</span>
                    <span class="font-medium" id="tax_amount">0.00</span>
                    <input type="hidden" name="tax_amount" id="tax_amount_input">
                </div>
                <div class="flex justify-between py-2 text-lg font-bold">
                    <span>Total Amount:</span>
                    <span id="grand_total">0.00</span>
                    <input type="hidden" name="grand_total" id="grand_total_input">
                </div>
            </div>
        </div>

        <div class="mt-6 flex justify-end space-x-3">
            <button type="button" class="bg-gray-200 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-300">Cancel</button>
            <button type="submit" class="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Save & Generate Invoice</button>
        </div>
    </form>
</div>

<script>
    function updateRow(select) {
        const row = select.closest('tr');
        const option = select.options[select.selectedIndex];
        const price = option.getAttribute('data-price');
        const name = option.getAttribute('data-name');
        
        row.querySelector('.rate-input').value = price;
        row.querySelector('.product-name').value = name;
        calculateTotal(select);
    }

    function calculateTotal(element) {
        const row = element.closest('tr');
        const rate = parseFloat(row.querySelector('.rate-input').value) || 0;
        const qty = parseFloat(row.querySelector('.qty-input').value) || 0;
        const amount = rate * qty;
        
        row.querySelector('.amount-input').value = amount.toFixed(2);
        calculateGrandTotal();
    }

    function calculateGrandTotal() {
        let subtotal = 0;
        document.querySelectorAll('.amount-input').forEach(input => {
            subtotal += parseFloat(input.value) || 0;
        });
        
        const tax = subtotal * 0.03;
        const total = subtotal + tax;
        
        document.getElementById('subtotal').textContent = subtotal.toFixed(2);
        document.getElementById('subtotal_input').value = subtotal.toFixed(2);
        
        document.getElementById('tax_amount').textContent = tax.toFixed(2);
        document.getElementById('tax_amount_input').value = tax.toFixed(2);
        
        document.getElementById('grand_total').textContent = total.toFixed(2);
        document.getElementById('grand_total_input').value = total.toFixed(2);
    }

    function addRow() {
        const table = document.getElementById('itemsTable').getElementsByTagName('tbody')[0];
        const newRow = table.rows[0].cloneNode(true);
        
        // Reset values
        newRow.querySelectorAll('input').forEach(input => input.value = '');
        newRow.querySelector('select').selectedIndex = 0;
        newRow.querySelector('.qty-input').value = 1;

        // Update name attributes for array indexing (simple version)
        const rowCount = table.rows.length;
        newRow.querySelectorAll('[name^="items[0]"]').forEach(element => {
            element.name = element.name.replace('[0]', '[' + rowCount + ']');
        });
        
        table.appendChild(newRow);
    }

    function removeRow(btn) {
        const row = btn.closest('tr');
        if (document.querySelectorAll('.item-row').length > 1) {
            row.remove();
            calculateGrandTotal();
        }
    }
</script>
@endsection
