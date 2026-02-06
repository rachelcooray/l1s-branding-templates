# layer1.studio Branding Templates

A collection of professional business document templates for **layer1.studio**.

## Templates Included

- **Appointment**: `appointment.html`
- **Invoice**: `invoice.html`
- **Letter**: `letter.html`
- **NDA (Non-Disclosure Agreement)**: `nda.html`
- **Quote**: `quote.html`
- **Receipt**: `receipt.html`
- **Service Letter**: `service_letter.html`
- **SOW (Statement of Work)**: `sow.html`

## Features

- **Responsive Design**: Clean and professional layout across all devices.
- **Brand Consistency**: Unified styling for all business documents.
- **Ease of Use**: Simple HTML/CSS structure for easy customization.

## Automated PDF Generation

This repository includes a document engine to generate branded PDFs from JSON data.

### 1. Requirements

- [Node.js](https://nodejs.org/) installed.
- Install dependencies:
  ```bash
  npm install
  ```

### 2. How to Generate a Document

1.  **Prepare your data**: Edit or create a JSON file in the `data/` folder (e.g., `data/invoice.json`).
2.  **Run the generator**:
    ```bash
    node generate.js [type]
    ```
    Replace `[type]` with one of the following: `appointment`, `invoice`, `letter`, `nda`, `quote`, `receipt`, `service_letter`, `sow`.

3.  **Find your PDF**: The generated file will be in the `/output` folder.

### Example

To generate an invoice:
```bash
node generate.js invoice
```

---
© 2026 layer1.studio
