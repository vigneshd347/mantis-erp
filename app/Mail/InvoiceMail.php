<?php

namespace App\Mail;

use App\Models\Sale;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceMail extends Mailable
{
    use Queueable, SerializesModels;

    public $sale;

    public function __construct(Sale $sale)
    {
        $this->sale = $sale;
    }

    public function build()
    {
        $pdf = Pdf::loadView('invoices.template', ['sale' => $this->sale]);

        return $this->subject('Invoice #' . $this->sale->invoice_no . ' from Manti Jewel Art')
                    ->view('emails.invoice') // Need to create this view or use text
                    ->attachData($pdf->output(), 'invoice-' . $this->sale->invoice_no . '.pdf', [
                        'mime' => 'application/pdf',
                    ]);
    }
}
