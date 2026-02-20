/**
 * PDF Service
 * Handles generation of invoice PDF using jsPDF and autoTable
 */
const PDFService = {
    /**
     * Generates a PDF blob for the given invoice data
     * @param {Object} invoiceData 
     * @returns {Promise<Blob>}
     */
    async generateInvoicePDF(invoiceData) {
        return new Promise((resolve, reject) => {
            try {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF('p', 'mm', 'a4');

                // --- Configuration ---
                const blue = [42, 44, 122]; // --manti-blue: #2A2C7A
                const orange = [223, 39, 38]; // --manti-orange: #df2726
                const dark = [65, 65, 66]; // --manti-dark: #414142

                // --- Header ---
                // Title: TAX INVOICE (Top Right)
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(28);
                doc.setTextColor(...blue);
                doc.text('TAX INVOICE', 200, 20, { align: 'right' });

                // Company Name Bar (Blue)
                doc.setFillColor(...blue);
                doc.rect(0, 45, 120, 15, 'F');
                doc.setFontSize(14);
                doc.setTextColor(255, 255, 255);
                doc.text('MANTI JEWEL ART PRIVATE LIMITED', 10, 55);

                // Address Bar (Orange) - Right Side
                doc.setFillColor(...orange);
                doc.rect(100, 30, 110, 20, 'F');
                doc.setFontSize(8);
                doc.setTextColor(255, 255, 255);
                doc.text('No. 12/189, Prv Complex, Vannan Kovil Junction,', 205, 38, { align: 'right' });
                doc.text('Mettupalayam Rd, Coimbatore, Tamil Nadu - 641047.', 205, 43, { align: 'right' });
                doc.text('Phone: +91 90927 27655', 205, 48, { align: 'right' });

                // GSTIN Strip
                doc.setFillColor(...orange);
                doc.rect(0, 62, 80, 8, 'F');
                doc.setFontSize(9);
                doc.setTextColor(255, 255, 255);
                doc.text('GSTIN : 33AAUCM3607L1Z3', 10, 68);

                // --- Invoice & Customer Details ---
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(10);

                // Bill To
                doc.setFont('helvetica', 'bold');
                doc.text('Bill To:', 15, 85);
                doc.setDrawColor(...orange);
                doc.line(15, 87, 100, 87);

                doc.setFont('helvetica', 'normal');
                let y = 93;
                doc.text(`Name: ${invoiceData.billTo.name}`, 15, y); y += 6;
                doc.text(`Address: ${invoiceData.billTo.address}`, 15, y, { maxWidth: 80 });
                y += (invoiceData.billTo.address.length > 40 ? 12 : 6);
                doc.text(`State: ${invoiceData.billTo.state}`, 15, y); y += 6;
                doc.text(`GSTIN: ${invoiceData.billTo.gstin}`, 15, y); y += 6;
                doc.text(`Mobile: ${invoiceData.billTo.mobile}`, 15, y);

                // Invoice Details (Right Side)
                let ry = 85;
                doc.setFont('helvetica', 'bold');
                // doc.text(`Inv No: ${invoiceData.invNo}`, 115, ry); // Removed as per request
                doc.text(`Inv Date: ${invoiceData.invDate}`, 115, ry); ry += 6;
                doc.text(`Payment: ${invoiceData.paymentMode}`, 115, ry); ry += 8;

                doc.setFont('helvetica', 'normal');
                doc.text('Ship To:', 115, ry);
                doc.line(115, ry + 2, 200, ry + 2);
                ry += 8;
                doc.text(`${invoiceData.shipTo.name}`, 115, ry); ry += 6;
                doc.text(`${invoiceData.shipTo.address}`, 115, ry, { maxWidth: 80 });

                // --- Table ---
                const tableData = invoiceData.items.map(item => [
                    item.sr,
                    item.description,
                    item.hsn,
                    item.metalType,
                    item.weight,
                    // item.rate, // Removed as per request
                    item.mc,
                    item.total
                ]);

                doc.autoTable({
                    startY: 140,
                    head: [['Sr', 'Description', 'HSN', 'Metal', 'Weight', 'MC%', 'Total']],
                    body: tableData,
                    theme: 'grid',
                    headStyles: { fillColor: dark, textColor: [255, 255, 255], fontStyle: 'bold' },
                    columnStyles: {
                        0: { cellWidth: 10, halign: 'center' },
                        1: { cellWidth: 'auto' },
                        2: { cellWidth: 20, halign: 'center' },
                        3: { cellWidth: 30, halign: 'center' },
                        4: { cellWidth: 25, halign: 'right' },
                        5: { cellWidth: 15, halign: 'center' },
                        6: { cellWidth: 30, halign: 'right' }
                    }
                });

                // --- Footer ---
                const finalY = doc.lastAutoTable.finalY + 10;

                // Bank Details
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(...blue);
                doc.text('Our Bank Details:', 15, finalY);
                doc.setFontSize(8);
                doc.setTextColor(0, 0, 0);
                doc.setFont('helvetica', 'normal');
                let by = finalY + 6;
                doc.text('Bank: IDFC FIRST - POLLACHI BRANCH', 15, by); by += 4;
                doc.text('Account No: 70008000727', 15, by); by += 4;
                doc.text('IFSC: IDFB0080538', 15, by); by += 4;
                doc.text('UPI: mantijwewlartpvt@idfcbank', 15, by);

                // Summary (Right)
                doc.setFontSize(10);
                let sy = finalY;
                doc.text('Summary:', 140, sy);
                sy += 6;
                doc.text(`Sub Total: ${invoiceData.totals.subTotal}`, 140, sy); sy += 5;
                doc.text(`CGST: ${invoiceData.totals.cgst}`, 140, sy); sy += 5;
                doc.text(`SGST: ${invoiceData.totals.sgst}`, 140, sy); sy += 5;
                doc.line(140, sy + 1, 200, sy + 1); sy += 6;
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(...blue);
                doc.text(`Grand Total: ${invoiceData.totals.grandTotal}`, 140, sy);

                // Payment Status (Emblem or QR)
                if (invoiceData.paymentStatus === 'Paid') {
                    doc.setDrawColor(239, 68, 68); // Red
                    doc.setLineWidth(1);
                    doc.roundedRect(60, finalY + 2, 30, 15, 2, 2, 'D');
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(239, 68, 68);
                    doc.setFontSize(14);
                    doc.text('PAID', 75, finalY + 12, { align: 'center', angle: 15 });
                    doc.setTextColor(0, 0, 0);
                } else if (invoiceData.qrDataUri) {
                    // Embed QR Code if available
                    doc.addImage(invoiceData.qrDataUri, 'PNG', 65, finalY, 20, 20);
                    doc.setFontSize(7);
                    doc.text('Scan to Pay', 75, finalY + 22, { align: 'center' });
                }

                // Amount in Words
                doc.setFontSize(8);
                doc.setTextColor(0, 0, 0);
                doc.setFont('helvetica', 'italic');
                doc.text(invoiceData.amountInWords, 15, by + 10);

                // Footer Bar
                doc.setFillColor(...orange);
                doc.rect(0, 285, 210, 12, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(10);
                doc.text('THANK YOU FOR BUSINESS WITH US!', 105, 292, { align: 'center' });

                const blob = doc.output('blob');
                resolve(blob);
            } catch (error) {
                reject(error);
            }
        });
    }
};
