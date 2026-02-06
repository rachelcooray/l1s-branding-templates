import invoiceHtml from '../templates/invoice.html?raw';
import quoteHtml from '../templates/quote.html?raw';
import letterHtml from '../templates/letter.html?raw';
import ndaHtml from '../templates/nda.html?raw';
import receiptHtml from '../templates/receipt.html?raw';
import serviceLetterHtml from '../templates/service_letter.html?raw';
import sowHtml from '../templates/sow.html?raw';
import appointmentHtml from '../templates/appointment.html?raw';
import stylesCss from '../templates/styles.css?raw';

export const TEMPLATES_CONFIG = {
    invoice: {
        html: invoiceHtml,
        css: stylesCss,
        fields: [
            { id: 'invoice_number', label: 'Invoice #', type: 'text', section: 'meta' },
            { id: 'date', label: 'Date', type: 'text', section: 'meta' },
            { id: 'client.name', label: 'Client Name', type: 'text', section: 'client' },
            { id: 'client.address', label: 'Client Address', type: 'textarea', section: 'client' },
            {
                id: 'items', label: 'Service Items', type: 'list', section: 'content', fields: [
                    { id: 'description', label: 'Description', type: 'text' },
                    { id: 'amount', label: 'Amount', type: 'text' }
                ]
            },
            { id: 'total', label: 'Total Amount', type: 'text', section: 'content' },
        ],
        initialData: {
            invoice_number: 'L1-INV-2026-001',
            date: 'February 6, 2026',
            client: { name: 'Acme Corp', address: '123 Business Way,\nTech City, UK' },
            items: [
                { description: 'Web Application Design & Dev', amount: '$4,500' },
                { description: 'Brand Identity System', amount: '$1,200' }
            ],
            total: '$5,700'
        }
    },
    letter: {
        html: letterHtml,
        css: stylesCss,
        fields: [
            { id: 'recipient_name', label: 'Recipient Name', type: 'text' },
            { id: 'date', label: 'Date', type: 'text' },
            { id: 'subject', label: 'Subject', type: 'text' },
            { id: 'body', label: 'Letter Body', type: 'textarea' },
        ],
        initialData: {
            recipient_name: 'John Doe',
            date: 'February 6, 2026',
            subject: 'Project Commencement Notice',
            body: 'We are pleased to inform you that we are ready to begin the phase 1 of your project. Our team has finalized the initial research and is moving into the design stage.'
        }
    },
    quote: {
        html: quoteHtml,
        css: stylesCss,
        fields: [
            { id: 'quote_number', label: 'Quote #', type: 'text' },
            { id: 'date', label: 'Date', type: 'text' },
            { id: 'client.name', label: 'Client Name', type: 'text' },
            { id: 'project.name', label: 'Project Name', type: 'text' },
            { id: 'valid_until', label: 'Valid Until', type: 'text' },
            { id: 'total', label: 'Total Estimate', type: 'text' },
        ],
        initialData: {
            quote_number: 'L1-QT-2026-042',
            date: 'February 6, 2026',
            client: { name: 'Vanguard Systems' },
            project: { name: 'E-commerce Redesign' },
            valid_until: 'March 6, 2026',
            total: '$12,800'
        }
    },
    nda: {
        html: ndaHtml,
        css: stylesCss,
        fields: [
            { id: 'disclosing_party', label: 'Disclosing Party', type: 'text' },
            { id: 'receiving_party', label: 'Receiving Party', type: 'text' },
            { id: 'date', label: 'Effective Date', type: 'text' },
            { id: 'purpose', label: 'Purpose of Disclosure', type: 'textarea' },
        ],
        initialData: {
            disclosing_party: 'layer1.studio',
            receiving_party: 'Acme Corp',
            date: 'February 6, 2026',
            purpose: 'Evaluation of a potential business relationship related to software development services.'
        }
    },
    receipt: {
        html: receiptHtml,
        css: stylesCss,
        fields: [
            { id: 'receipt_number', label: 'Receipt #', type: 'text' },
            { id: 'date', label: 'Date', type: 'text' },
            { id: 'paid_by', label: 'Paid By', type: 'text' },
            { id: 'amount_paid', label: 'Amount Paid', type: 'text' },
            { id: 'payment_method', label: 'Payment Method', type: 'text' },
            { id: 'description', label: 'Description', type: 'text' },
        ],
        initialData: {
            receipt_number: 'L1-RCP-2026-003',
            date: 'February 6, 2026',
            paid_by: 'Rachel Cooray',
            amount_paid: '$500.00',
            payment_method: 'Bank Transfer',
            description: 'Consultation Fee - Q1 strategy session'
        }
    },
    service_letter: {
        html: serviceLetterHtml,
        css: stylesCss,
        fields: [
            { id: 'employee_name', label: 'Employee Name', type: 'text' },
            { id: 'designation', label: 'Designation', type: 'text' },
            { id: 'start_date', label: 'Start Date', type: 'text' },
            { id: 'end_date', label: 'End Date', type: 'text' },
            { id: 'contributions', label: 'Major Contributions', type: 'textarea' },
            { id: 'current_date', label: 'Issue Date', type: 'text' },
        ],
        initialData: {
            employee_name: 'Alex Rivera',
            designation: 'Lead UI/UX Designer',
            start_date: 'January 10, 2024',
            end_date: 'February 1, 2026',
            contributions: 'the successful delivery of our core mobile application and the establishment of our cross-platform design tokens',
            current_date: 'February 6, 2026'
        }
    },
    sow: {
        html: sowHtml,
        css: stylesCss,
        fields: [
            { id: 'project_name', label: 'Project Name', type: 'text' },
            { id: 'client.name', label: 'Client Name', type: 'text' },
            { id: 'sow_reference', label: 'Reference #', type: 'text' },
            { id: 'date', label: 'Date', type: 'text' },
            { id: 'overview', label: 'Project Overview', type: 'textarea' },
            { id: 'out_of_scope', label: 'Out of Scope', type: 'textarea' },
        ],
        initialData: {
            project_name: 'Stellar App Development',
            client: { name: 'Stellar Tech' },
            sow_reference: 'L1-SOW-2026-08',
            date: 'February 6, 2026',
            overview: 'This project involves the full design and development of the Stellar SaaS platform.',
            out_of_scope: 'Content marketing, print logistics, and third-party API licensing fees.'
        }
    },
    appointment: {
        html: appointmentHtml,
        css: stylesCss,
        fields: [
            { id: 'candidate.name', label: 'Candidate Name', type: 'text' },
            { id: 'candidate.email', label: 'Email', type: 'text' },
            { id: 'date', label: 'Offer Date', type: 'text' },
            { id: 'position', label: 'Job Title', type: 'text' },
            { id: 'reference', label: 'Ref #', type: 'text' },
            { id: 'start_date', label: 'Start Date', type: 'text' },
            { id: 'reporting_to', label: 'Reports To', type: 'text' },
            { id: 'remuneration', label: 'Salary/Package', type: 'text' },
            { id: 'location', label: 'Location', type: 'text' },
            { id: 'responsibilities', label: 'Job Summary', type: 'textarea' },
        ],
        initialData: {
            candidate: { name: 'Sarah Parker', email: 'sarah.p@example.com' },
            date: 'February 6, 2026',
            position: 'Senior AI Engineer',
            reference: 'L1-HR-2026-15',
            start_date: 'March 15, 2026',
            reporting_to: 'Chief Technology Officer',
            remuneration: '£85,000',
            location: 'London / Remote',
            responsibilities: 'You will lead our AI research initiatives and oversee the integration of LLMs into our core client dashboards.'
        }
    },
};

export const getTemplateData = (id) => TEMPLATES_CONFIG[id] || TEMPLATES_CONFIG.invoice;
