
import { Router } from 'express';
import { createInvoice } from '../controllers/invoice.controller';

const router = Router();

// Define Invoice Routes
// GET /api/invoices - List invoices (with filters)
router.get('/', (req, res) => { res.send("List Invoices Not Implemented"); });

// GET /api/invoices/:id - Get single invoice
router.get('/:id', (req, res) => { res.send("Get Invoice Not Implemented"); });

// POST /api/invoices - Create new invoice
router.post('/', createInvoice);

// PUT /api/invoices/:id - Update invoice
router.put('/:id', (req, res) => { res.send("Update Invoice Not Implemented"); });

// DELETE /api/invoices/:id - Void invoice
router.delete('/:id', (req, res) => { res.send("Delete Invoice Not Implemented"); });

export default router;
