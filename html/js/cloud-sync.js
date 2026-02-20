/**
 * CloudSync Utility
 * Handles synchronization between localStorage and Supabase
 */
const CloudSync = {
    /**
     * Tests connection to Supabase and reports status
     */
    async testConnection() {
        console.log("CloudSync: Testing connection...");
        if (!supabaseClient) {
            console.error("CloudSync: Supabase client is NOT initialized.");
            return { success: false, message: "Supabase client not initialized" };
        }

        try {
            // Try to fetch a single record from invoices just to test access
            const { data, error, status } = await supabaseClient
                .from('invoices')
                .select('id')
                .limit(1);

            if (error) {
                console.error("CloudSync: Connection test failed.", error);
                return { success: false, message: error.message, details: error };
            }

            console.log("CloudSync: Connection test successful. Status:", status);
            return { success: true, message: "Connected successfully", status };
        } catch (err) {
            console.error("CloudSync: Unexpected error during connection test.", err);
            return { success: false, message: err.message };
        }
    },

    /**
     * Syncs metal rates to cloud
     * @param {Object} rates 
     */
    async saveRates(rates) {
        localStorage.setItem('metalRates', JSON.stringify(rates));

        if (supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('metal_rates')
                    .insert([{ ...rates, user_id: 'default_user' }]);
                if (error) throw error;
                console.log('Rates synced to cloud');
            } catch (err) {
                console.error('Cloud sync failed:', err.message);
            }
        }
    },

    /**
     * Syncs a new invoice to cloud
     * @param {Object} invoice 
     */
    async saveInvoice(invoice) {
        let invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
        invoices.push(invoice);
        localStorage.setItem('invoices', JSON.stringify(invoices));

        if (supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('invoices')
                    .insert([invoice]);
                if (error) {
                    console.error('Supabase Insertion Error Details:', {
                        message: error.message,
                        details: error.details,
                        hint: error.hint,
                        code: error.code
                    });
                    throw error;
                }
                console.log('Invoice synced to cloud successfully.');
                return data;
            } catch (err) {
                console.error('CloudSync: saveInvoice failed.', err);
                throw err;
            }
        } else {
            console.warn("CloudSync: Supabase client not available. Data saved only to localStorage.");
        }
        return Promise.resolve();
    },

    /**
     * Syncs a new product to cloud
     * @param {Object} product 
     */
    async saveProduct(product) {
        let products = JSON.parse(localStorage.getItem('products') || '[]');
        products.push(product);
        localStorage.setItem('products', JSON.stringify(products));

        if (supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('products')
                    .insert([product]);
                if (error) throw error;
                console.log('Product synced to cloud');
            } catch (err) {
                console.error('Cloud sync failed:', err.message);
            }
        }
    },

    /**
     * Fetches all invoices
     * @returns {Promise<Array>}
     */
    async fetchInvoices() {
        try {
            if (supabaseClient) {
                const { data, error } = await supabaseClient
                    .from('invoices')
                    .select('*')
                    .order('invDate', { ascending: false });
                if (error) throw error;
                if (data && data.length > 0) {
                    localStorage.setItem('invoices', JSON.stringify(data));
                    return data;
                }
            }
        } catch (err) {
            console.warn('Cloud fetch invoices failed, using local storage:', err.message);
        }
        return JSON.parse(localStorage.getItem('invoices') || '[]');
    },

    /**
     * Fetches all products
     * @returns {Promise<Array>}
     */
    async fetchProducts() {
        try {
            if (supabaseClient) {
                const { data, error } = await supabaseClient
                    .from('products')
                    .select('*');
                if (error) throw error;
                if (data && data.length > 0) {
                    localStorage.setItem('products', JSON.stringify(data));
                    return data;
                }
            }
        } catch (err) {
            console.warn('Cloud fetch products failed, using local storage:', err.message);
        }
        return JSON.parse(localStorage.getItem('products') || '[]');
    }
};
