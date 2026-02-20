/**
 * Notification Service
 * Handles PDF storage in Supabase and notifications via Resend & Twilio
 */
const NotificationService = {
    // API Configurations - To be provided by user or retrieved from env
    RESEND_API_KEY: 're_h5xWhL6Z_GegHgbVSwWnTRc1mXZ4s3xNQ', // User to fill
    TWILIO_ACCOUNT_SID: 'ACa0743f6c0d0feafbc9ecca4692cac7a7', // User to fill
    TWILIO_AUTH_TOKEN: 'b46801371effce56388e6d000adcc95d', // User to fill
    TWILIO_PHONE_NUMBER: '+12186751923', // User to fill

    /**
     * Uploads PDF Blob to Supabase Storage
     * @param {Blob} blob 
     * @param {string} filename 
     * @returns {Promise<string>} Public URL of the uploaded PDF
     */
    async uploadInvoicePDF(blob, filename) {
        if (!supabaseClient) throw new Error('Supabase client not initialized');

        const filePath = `invoices/${filename}`;

        try {
            const { data, error } = await supabaseClient.storage
                .from('invoices')
                .upload(filePath, blob, {
                    contentType: 'application/pdf',
                    upsert: true
                });

            if (error) throw error;

            const { data: { publicUrl } } = supabaseClient.storage
                .from('invoices')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error) {
            console.error('Error uploading PDF:', error);
            if (error.message.includes('bucket_not_found') || error.message.includes('Bucket not found')) {
                throw new Error('Supabase Storage bucket "invoices" NOT FOUND. Please create it in your Supabase dashboard.');
            }
            throw error;
        }
    },

    /**
     * Sends Invoice via Email using Resend
     * @param {string} email 
     * @param {string} pdfUrl 
     * @param {string} invoiceNo 
     */
    async sendInvoiceEmail(email, pdfUrl, invoiceData) {
        if (!email) return;
        const invoiceNo = invoiceData.invNo;
        const isPending = invoiceData.paymentStatus === 'Payment Pending';
        const paymentLink = invoiceData.paymentLink;

        if (!this.RESEND_API_KEY) {
            console.warn('Resend API key missing. Email not sent.');
            return 'skipped';
        }

        const paymentHtml = isPending ? `
            <div style="margin: 20px 0; padding: 15px; border: 2px dashed #ef4444; border-radius: 8px; background: #fffcfc;">
                <h3 style="color: #ef4444; margin-top: 0;">Payment Pending</h3>
                <p>Please complete your payment using the secure UPI link below:</p>
                <a href="${paymentLink}" style="display: inline-block; padding: 10px 20px; background: #22c55e; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Pay via UPI Now</a>
                <p style="font-size: 12px; color: #666; margin-top: 10px;">UPI ID: mantijwewlartpvt@idfcbank</p>
            </div>
        ` : `<p style="color: #16a34a; font-weight: bold;">Status: PAiD (Thank you!)</p>`;

        try {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.RESEND_API_KEY}`
                },
                body: JSON.stringify({
                    from: 'onboarding@resend.dev',
                    to: [email],
                    subject: `Invoice ${invoiceNo} - Manti Jewel Art`,
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; color: #333;">
                            <h2 style="color: #2A2C7A;">Invoice ${invoiceNo} Generated</h2>
                            <p>Dear Customer,</p>
                            <p>Your invoice from <strong>Manti Jewel Art</strong> has been generated successfully.</p>
                            
                            ${paymentHtml}

                            <p>You can view or download your full invoice PDF here:</p>
                            <a href="${pdfUrl}" style="display: inline-block; padding: 10px 20px; background: #2A2C7A; color: white; text-decoration: none; border-radius: 5px;">View Invoice PDF</a>
                            
                            <p style="margin-top: 20px;">Thank you for your business!</p>
                            <hr style="border: 1px solid #eee; margin: 20px 0;">
                            <p><small style="color: #999;">This is an automated message. Please do not reply.</small></p>
                        </div>
                    `
                })
            });

            if (response.ok) {
                console.log('Email sent successfully via Resend');
                return 'sent';
            } else {
                const errorData = await response.json();
                console.error('Resend Email Error:', errorData);
                // Return detailed error message for UI
                return `failed: ${errorData.message || 'Unknown Error'}`;
            }
        } catch (err) {
            console.error('Email send exception:', err);
            return `failed: ${err.message}`;
        }
    },

    /**
     * Sends Invoice Link via SMS using Twilio
     * @param {string} mobile 
     * @param {string} pdfUrl 
     * @param {string} invoiceNo 
     */
    async sendInvoiceSMS(mobile, pdfUrl, invoiceData) {
        if (!mobile) return;
        const invoiceNo = invoiceData.invNo;
        const isPending = invoiceData.paymentStatus === 'Payment Pending';
        const paymentLink = invoiceData.paymentLink;

        if (!this.TWILIO_ACCOUNT_SID || !this.TWILIO_AUTH_TOKEN) {
            console.warn('Twilio credentials missing. SMS not sent.');
            return 'skipped';
        }

        const message = isPending
            ? `Manti Jewel Art: Invoice ${invoiceNo} is Generated (Pending). Pay here: ${paymentLink} | View PDF: ${pdfUrl}`
            : `Manti Jewel Art: Invoice ${invoiceNo} Generated (PAID). Thank you! View PDF: ${pdfUrl}`;

        const cleanMobile = mobile.replace(/\s+/g, '').replace(/^\+/, '');
        const formattedMobile = cleanMobile.startsWith('91') ? `+${cleanMobile}` : `+91${cleanMobile}`;

        try {
            const params = new URLSearchParams();
            params.append('To', formattedMobile);
            params.append('From', this.TWILIO_PHONE_NUMBER);
            params.append('Body', message);

            const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.TWILIO_ACCOUNT_SID}/Messages.json`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Basic ' + btoa(this.TWILIO_ACCOUNT_SID + ':' + this.TWILIO_AUTH_TOKEN),
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params
            });

            if (response.ok) {
                console.log('SMS sent successfully via Twilio');
                return 'sent';
            } else {
                const errorData = await response.json();
                console.error('Twilio SMS Error:', errorData);
                // Return detailed error message for UI
                return `failed: ${errorData.message || 'Unknown Twilio Error'}`;
            }
        } catch (err) {
            console.error('SMS send exception:', err);
            return `failed: ${err.message}`;
        }
    }
};
