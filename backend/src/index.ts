
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import invoiceRoutes from './routes/invoice.routes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Routes
app.get('/', (req: Request, res: Response) => {
    res.send('SaaS ERP Backend is Running');
});

// Accounting Module Routes
app.use('/api/invoices', invoiceRoutes);

// Start Server
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
