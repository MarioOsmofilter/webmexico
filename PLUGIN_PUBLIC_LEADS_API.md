# 🔌 Water CRM - Public Leads Capture API Plugin

**Version:** 1.0
**Last Updated:** January 2026
**Language:** English | [Español](#plugin-de-captura-pública-de-leads---español)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Integration Examples](#integration-examples)
5. [Error Handling](#error-handling)
6. [Best Practices](#best-practices)
7. [Spanish Documentation](#plugin-de-captura-pública-de-leads---español)

---

## Overview

The **Public Leads Capture API** allows external websites, landing pages, and third-party applications to submit leads directly into Water CRM. This plugin is designed for:

- **Marketing Campaigns**: Capture leads from landing pages
- **Website Contact Forms**: Integrate your company website with CRM
- **Third-party Platforms**: Connect external tools (WordPress, HubSpot, etc.)
- **Mobile Applications**: Submit leads from mobile apps
- **Chatbots**: Integrate chatbot conversations into lead pipeline

### Key Features

✅ **Authenticated Access**: Secure API key-based authentication
✅ **Automatic Lead Creation**: Leads created with proper status and assignment
✅ **Duplicate Detection**: Email-based duplicate prevention
✅ **Flexible Fields**: Support for individual and company contacts
✅ **Source Tracking**: Automatic tracking of lead origin
✅ **Timeline Creation**: Automatic activity timeline entry
✅ **Validation**: Comprehensive input validation
✅ **Multi-tenant**: Automatically scoped to your company

---

## Authentication

### API Key Setup

Before using the API, you need to create an API Key from the Water CRM admin panel:

1. Login to Water CRM
2. Navigate to **Settings → API Keys**
3. Click **"Create New API Key"**
4. Set a name (e.g., "Website Contact Form")
5. Grant permissions: `leads: ["create", "read"]`
6. Copy the generated API key (it won't be shown again)

### Using the API Key

Include the API key in the `Authorization` header of all requests:

```
Authorization: Bearer YOUR_API_KEY_HERE
```

**Example:**
```
Authorization: Bearer wc_live_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

---

## API Endpoints

### 1. Create Lead (POST /api/public/leads)

Submit a new lead to Water CRM.

#### Endpoint

```
POST https://your-domain.com/api/public/leads
```

#### Headers

```
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY
```

#### Request Body

```json
{
  "source": "WEBSITE",
  "contactType": "INDIVIDUAL",
  "contactName": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+34666123456",
  "address": "123 Main Street",
  "city": "Madrid",
  "state": "Madrid",
  "postalCode": "28001",
  "country": "Spain",
  "companyName": "Doe Industries",
  "taxId": "B12345678",
  "notes": "Interested in water purification systems for office",
  "metadata": {
    "campaign": "summer-2026",
    "utm_source": "google",
    "utm_medium": "cpc",
    "referrer": "https://google.com"
  }
}
```

#### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `source` | string | Yes | Lead source. Options: `WEBSITE`, `PHONE`, `EMAIL`, `REFERRAL`, `SOCIAL_MEDIA`, `ADVERTISING`, `TRADE_SHOW`, `MANUAL` |
| `contactType` | string | Yes | Contact type. Options: `INDIVIDUAL`, `COMPANY` |
| `contactName` | string | Yes | Full name of the contact person |
| `email` | string | No* | Email address (required if no phone) |
| `phone` | string | No* | Phone number (required if no email) |
| `address` | string | No | Street address |
| `city` | string | No | City |
| `state` | string | No | State/Province |
| `postalCode` | string | No | Postal/ZIP code |
| `country` | string | No | Country |
| `companyName` | string | No | Company name (for COMPANY type) |
| `taxId` | string | No | Tax ID / CIF / NIF |
| `notes` | string | No | Additional notes or comments |
| `metadata` | object | No | Custom data (UTM params, campaign info, etc.) |

**Note:** At least one of `email` or `phone` is required.

#### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Lead created successfully",
  "data": {
    "id": "cm4x8y9z0001abc123def456",
    "contactName": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+34666123456",
    "status": "NEW",
    "source": "WEBSITE",
    "createdAt": "2026-01-08T10:30:00.000Z"
  }
}
```

#### Error Responses

**400 Bad Request** - Validation Error
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "email": "Invalid email format",
    "contactName": "Contact name is required"
  }
}
```

**401 Unauthorized** - Invalid or Missing API Key
```json
{
  "success": false,
  "error": "Unauthorized - Invalid API key"
}
```

**409 Conflict** - Duplicate Lead
```json
{
  "success": false,
  "error": "A lead with this email already exists",
  "existingLeadId": "cm4x8y9z0001abc123def456"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

---

## Integration Examples

### JavaScript / Node.js

#### Simple Fetch Example

```javascript
async function submitLead(leadData) {
  const response = await fetch('https://your-domain.com/api/public/leads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer wc_live_your_api_key_here'
    },
    body: JSON.stringify(leadData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create lead');
  }

  return await response.json();
}

// Usage
const leadData = {
  source: 'WEBSITE',
  contactType: 'INDIVIDUAL',
  contactName: 'Jane Smith',
  email: 'jane.smith@example.com',
  phone: '+34666987654',
  notes: 'Contacted via website form'
};

submitLead(leadData)
  .then(result => console.log('Lead created:', result.data))
  .catch(error => console.error('Error:', error.message));
```

#### HTML Contact Form Integration

```html
<!DOCTYPE html>
<html>
<head>
  <title>Contact Us - Water CRM</title>
</head>
<body>
  <form id="contactForm">
    <input type="text" name="contactName" placeholder="Full Name" required>
    <input type="email" name="email" placeholder="Email" required>
    <input type="tel" name="phone" placeholder="Phone">
    <textarea name="notes" placeholder="Your message"></textarea>
    <button type="submit">Send</button>
  </form>

  <script>
    document.getElementById('contactForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(e.target);
      const leadData = {
        source: 'WEBSITE',
        contactType: 'INDIVIDUAL',
        contactName: formData.get('contactName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        notes: formData.get('notes')
      };

      try {
        const response = await fetch('https://your-domain.com/api/public/leads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer wc_live_your_api_key_here'
          },
          body: JSON.stringify(leadData)
        });

        if (response.ok) {
          alert('Thank you! We will contact you soon.');
          e.target.reset();
        } else {
          const error = await response.json();
          alert('Error: ' + error.error);
        }
      } catch (error) {
        alert('Network error. Please try again.');
      }
    });
  </script>
</body>
</html>
```

---

### PHP / WordPress

#### Simple PHP Example

```php
<?php
function createWaterCRMLead($leadData) {
    $apiUrl = 'https://your-domain.com/api/public/leads';
    $apiKey = 'wc_live_your_api_key_here';

    $options = [
        'http' => [
            'header' => [
                "Content-Type: application/json",
                "Authorization: Bearer $apiKey"
            ],
            'method' => 'POST',
            'content' => json_encode($leadData)
        ]
    ];

    $context = stream_context_create($options);
    $response = file_get_contents($apiUrl, false, $context);

    if ($response === false) {
        throw new Exception('Failed to create lead');
    }

    return json_decode($response, true);
}

// Usage
$leadData = [
    'source' => 'WEBSITE',
    'contactType' => 'INDIVIDUAL',
    'contactName' => 'Carlos García',
    'email' => 'carlos@example.com',
    'phone' => '+34666111222',
    'notes' => 'Interested in home water filtration'
];

try {
    $result = createWaterCRMLead($leadData);
    echo "Lead created: " . $result['data']['id'];
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
```

#### WordPress Contact Form 7 Integration

```php
<?php
/**
 * Add to your theme's functions.php
 */
add_action('wpcf7_mail_sent', 'send_to_water_crm');

function send_to_water_crm($contact_form) {
    $submission = WPCF7_Submission::get_instance();
    $posted_data = $submission->get_posted_data();

    $leadData = [
        'source' => 'WEBSITE',
        'contactType' => 'INDIVIDUAL',
        'contactName' => $posted_data['your-name'],
        'email' => $posted_data['your-email'],
        'phone' => $posted_data['your-phone'] ?? null,
        'notes' => $posted_data['your-message'] ?? '',
        'metadata' => [
            'form_id' => $contact_form->id(),
            'form_title' => $contact_form->title(),
            'wordpress_site' => get_bloginfo('url')
        ]
    ];

    $apiUrl = 'https://your-domain.com/api/public/leads';
    $apiKey = 'wc_live_your_api_key_here';

    wp_remote_post($apiUrl, [
        'headers' => [
            'Content-Type' => 'application/json',
            'Authorization' => 'Bearer ' . $apiKey
        ],
        'body' => json_encode($leadData),
        'timeout' => 30
    ]);
}
?>
```

---

### Python / Django

#### Simple Python Example

```python
import requests
import json

def create_water_crm_lead(lead_data):
    """
    Submit a lead to Water CRM
    """
    api_url = 'https://your-domain.com/api/public/leads'
    api_key = 'wc_live_your_api_key_here'

    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}'
    }

    response = requests.post(api_url, headers=headers, json=lead_data)

    if response.status_code == 201:
        return response.json()
    else:
        raise Exception(f"Error {response.status_code}: {response.json().get('error')}")

# Usage
lead_data = {
    'source': 'WEBSITE',
    'contactType': 'INDIVIDUAL',
    'contactName': 'María López',
    'email': 'maria.lopez@example.com',
    'phone': '+34666333444',
    'notes': 'Interested in commercial water treatment'
}

try:
    result = create_water_crm_lead(lead_data)
    print(f"Lead created: {result['data']['id']}")
except Exception as e:
    print(f"Error: {e}")
```

#### Django Form Integration

```python
# forms.py
from django import forms
import requests

class ContactForm(forms.Form):
    contact_name = forms.CharField(max_length=200, label='Name')
    email = forms.EmailField(label='Email')
    phone = forms.CharField(max_length=20, required=False, label='Phone')
    message = forms.CharField(widget=forms.Textarea, required=False, label='Message')

    def submit_to_crm(self):
        """Submit form data to Water CRM"""
        lead_data = {
            'source': 'WEBSITE',
            'contactType': 'INDIVIDUAL',
            'contactName': self.cleaned_data['contact_name'],
            'email': self.cleaned_data['email'],
            'phone': self.cleaned_data.get('phone'),
            'notes': self.cleaned_data.get('message', ''),
            'metadata': {
                'django_site': 'example.com',
                'form_type': 'contact'
            }
        }

        api_url = 'https://your-domain.com/api/public/leads'
        api_key = 'wc_live_your_api_key_here'

        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}'
        }

        response = requests.post(api_url, headers=headers, json=lead_data)
        return response.status_code == 201

# views.py
from django.shortcuts import render, redirect
from django.contrib import messages
from .forms import ContactForm

def contact_view(request):
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            if form.submit_to_crm():
                messages.success(request, 'Thank you! We will contact you soon.')
                return redirect('contact')
            else:
                messages.error(request, 'Error submitting form. Please try again.')
    else:
        form = ContactForm()

    return render(request, 'contact.html', {'form': form})
```

---

### React / Next.js

```typescript
// lib/crm-api.ts
export async function submitLeadToCRM(leadData: {
  contactName: string;
  email: string;
  phone?: string;
  notes?: string;
}) {
  const response = await fetch('https://your-domain.com/api/public/leads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_WATER_CRM_API_KEY}`
    },
    body: JSON.stringify({
      source: 'WEBSITE',
      contactType: 'INDIVIDUAL',
      ...leadData
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to submit lead');
  }

  return await response.json();
}

// components/ContactForm.tsx
'use client';

import { useState } from 'react';
import { submitLeadToCRM } from '@/lib/crm-api';

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const formData = new FormData(e.currentTarget);

    try {
      await submitLeadToCRM({
        contactName: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        notes: formData.get('message') as string
      });

      setMessage('Thank you! We will contact you soon.');
      e.currentTarget.reset();
    } catch (error) {
      setMessage('Error submitting form. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Your Name" required />
      <input name="email" type="email" placeholder="Your Email" required />
      <input name="phone" type="tel" placeholder="Your Phone" />
      <textarea name="message" placeholder="Your Message" />
      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send'}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}
```

---

## Error Handling

### Common Errors and Solutions

| Error Code | Error Message | Solution |
|------------|---------------|----------|
| 400 | "Contact name is required" | Provide `contactName` in request body |
| 400 | "Either email or phone is required" | Provide at least one contact method |
| 400 | "Invalid email format" | Check email format is valid |
| 400 | "Invalid contact type" | Use `INDIVIDUAL` or `COMPANY` |
| 400 | "Invalid source" | Use valid source: `WEBSITE`, `PHONE`, `EMAIL`, etc. |
| 401 | "Unauthorized - Invalid API key" | Check API key is correct and active |
| 401 | "API key does not have required permissions" | Grant `leads: ["create"]` permission to API key |
| 409 | "A lead with this email already exists" | Lead already exists with this email |
| 500 | "Internal server error" | Contact Water CRM support |

### Error Handling Best Practices

```javascript
async function submitLeadWithErrorHandling(leadData) {
  try {
    const response = await fetch('https://your-domain.com/api/public/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer wc_live_your_api_key_here'
      },
      body: JSON.stringify(leadData)
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle specific error codes
      switch (response.status) {
        case 400:
          console.error('Validation error:', data.details);
          alert('Please check your form data');
          break;
        case 401:
          console.error('Authentication error:', data.error);
          alert('Configuration error. Please contact support.');
          break;
        case 409:
          console.log('Duplicate lead:', data.existingLeadId);
          alert('You have already submitted this form');
          break;
        case 500:
          console.error('Server error:', data.error);
          alert('Server error. Please try again later.');
          break;
        default:
          console.error('Unknown error:', data);
          alert('An error occurred. Please try again.');
      }
      return null;
    }

    return data;
  } catch (error) {
    // Network error
    console.error('Network error:', error);
    alert('Network error. Please check your connection.');
    return null;
  }
}
```

---

## Best Practices

### 1. Security

✅ **NEVER expose API keys in client-side code**
- Use environment variables
- Make requests from server-side code when possible
- For client-side, use a proxy endpoint on your server

✅ **Use HTTPS only**
- Never send API keys over HTTP
- Ensure your website uses SSL certificate

✅ **Rotate API keys regularly**
- Change API keys every 3-6 months
- Immediately rotate if compromised

❌ **Don't do this:**
```javascript
// BAD - API key visible in browser
const apiKey = 'wc_live_abc123...'; // Exposed to users!
```

✅ **Do this instead:**
```javascript
// GOOD - API key on server
// In Next.js API route (server-side)
export async function POST(request) {
  const leadData = await request.json();
  const apiKey = process.env.WATER_CRM_API_KEY; // Server-side only

  const response = await fetch('https://crm.com/api/public/leads', {
    headers: { 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify(leadData)
  });

  return response;
}
```

### 2. Data Validation

Always validate data before sending to API:

```javascript
function validateLeadData(data) {
  const errors = {};

  // Required fields
  if (!data.contactName || data.contactName.trim() === '') {
    errors.contactName = 'Name is required';
  }

  if (!data.email && !data.phone) {
    errors.contact = 'Either email or phone is required';
  }

  // Email format
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email format';
  }

  // Phone format (basic)
  if (data.phone && !/^[\d\s\+\-\(\)]+$/.test(data.phone)) {
    errors.phone = 'Invalid phone format';
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

// Usage
const errors = validateLeadData(formData);
if (errors) {
  console.error('Validation errors:', errors);
  return;
}

submitLead(formData);
```

### 3. UTM Tracking

Track marketing campaign performance by including UTM parameters:

```javascript
function getUTMParameters() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_term: params.get('utm_term'),
    utm_content: params.get('utm_content')
  };
}

// Include in metadata
const leadData = {
  contactName: 'John Doe',
  email: 'john@example.com',
  source: 'WEBSITE',
  contactType: 'INDIVIDUAL',
  metadata: {
    ...getUTMParameters(),
    referrer: document.referrer,
    page_url: window.location.href
  }
};
```

### 4. Duplicate Prevention

Check for duplicates before showing success message:

```javascript
async function submitLead(leadData) {
  try {
    const response = await fetch('/api/public/leads', {
      method: 'POST',
      headers: { /* ... */ },
      body: JSON.stringify(leadData)
    });

    const data = await response.json();

    if (response.status === 409) {
      // Lead already exists
      alert('You have already contacted us. We will get back to you soon!');
      return { duplicate: true, leadId: data.existingLeadId };
    }

    if (response.ok) {
      alert('Thank you! We will contact you shortly.');
      return { success: true, leadId: data.data.id };
    }

    throw new Error(data.error);
  } catch (error) {
    alert('Error submitting form. Please try again.');
    return { success: false, error };
  }
}
```

### 5. Rate Limiting

Implement client-side rate limiting to prevent spam:

```javascript
class LeadSubmissionHandler {
  constructor() {
    this.lastSubmission = 0;
    this.minInterval = 60000; // 1 minute
  }

  canSubmit() {
    const now = Date.now();
    if (now - this.lastSubmission < this.minInterval) {
      return false;
    }
    return true;
  }

  async submit(leadData) {
    if (!this.canSubmit()) {
      alert('Please wait before submitting another form');
      return;
    }

    this.lastSubmission = Date.now();
    return await submitLead(leadData);
  }
}

const handler = new LeadSubmissionHandler();

// Usage in form
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  await handler.submit(formData);
});
```

### 6. Logging and Monitoring

Log all API interactions for debugging:

```javascript
async function submitLeadWithLogging(leadData) {
  const requestId = Math.random().toString(36).substring(7);

  console.log(`[${requestId}] Submitting lead:`, {
    contactName: leadData.contactName,
    email: leadData.email,
    timestamp: new Date().toISOString()
  });

  try {
    const response = await fetch('/api/public/leads', {
      method: 'POST',
      headers: { /* ... */ },
      body: JSON.stringify(leadData)
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`[${requestId}] Lead created:`, data.data.id);
    } else {
      console.error(`[${requestId}] Error:`, data.error);
    }

    return data;
  } catch (error) {
    console.error(`[${requestId}] Network error:`, error);
    throw error;
  }
}
```

---

## Testing

### Test API Key

For development/testing, create a separate API key with limited permissions:

1. Create API key named "Development"
2. Grant only: `leads: ["create"]`
3. Use in development environment
4. Delete or deactivate before production

### Testing Checklist

✅ Valid lead submission
✅ Missing required fields (contactName)
✅ Missing email AND phone
✅ Invalid email format
✅ Duplicate email submission
✅ Invalid API key
✅ Network timeout
✅ UTM parameter capture
✅ Metadata storage

---

# Plugin de Captura Pública de Leads - Español

## 📋 Índice

1. [Descripción General](#descripción-general)
2. [Autenticación](#autenticación-es)
3. [Endpoints de API](#endpoints-de-api-es)
4. [Ejemplos de Integración](#ejemplos-de-integración-es)
5. [Manejo de Errores](#manejo-de-errores-es)
6. [Buenas Prácticas](#buenas-prácticas-es)

---

## Descripción General

El **Plugin de Captura Pública de Leads** permite que sitios web externos, landing pages y aplicaciones de terceros envíen leads directamente a Water CRM. Este plugin está diseñado para:

- **Campañas de Marketing**: Capturar leads desde landing pages
- **Formularios Web**: Integrar el sitio web de tu empresa con el CRM
- **Plataformas de Terceros**: Conectar herramientas externas (WordPress, HubSpot, etc.)
- **Aplicaciones Móviles**: Enviar leads desde apps móviles
- **Chatbots**: Integrar conversaciones de chatbot al pipeline de leads

### Características Principales

✅ **Acceso Autenticado**: Autenticación segura basada en API key
✅ **Creación Automática de Leads**: Leads creados con estado y asignación correctos
✅ **Detección de Duplicados**: Prevención de duplicados basada en email
✅ **Campos Flexibles**: Soporte para contactos individuales y empresas
✅ **Seguimiento de Origen**: Seguimiento automático del origen del lead
✅ **Creación de Timeline**: Entrada automática en timeline de actividad
✅ **Validación**: Validación completa de datos de entrada
✅ **Multi-tenant**: Automáticamente limitado a tu empresa

---

## Autenticación {#autenticación-es}

### Configuración de API Key

Antes de usar la API, necesitas crear una API Key desde el panel de administración de Water CRM:

1. Inicia sesión en Water CRM
2. Ve a **Configuración → API Keys**
3. Haz clic en **"Crear Nueva API Key"**
4. Establece un nombre (ej: "Formulario de Contacto Web")
5. Otorga permisos: `leads: ["create", "read"]`
6. Copia la API key generada (no se mostrará de nuevo)

### Usando la API Key

Incluye la API key en el encabezado `Authorization` de todas las peticiones:

```
Authorization: Bearer TU_API_KEY_AQUI
```

**Ejemplo:**
```
Authorization: Bearer wc_live_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

---

## Endpoints de API {#endpoints-de-api-es}

### 1. Crear Lead (POST /api/public/leads)

Envía un nuevo lead a Water CRM.

#### Endpoint

```
POST https://tu-dominio.com/api/public/leads
```

#### Encabezados

```
Content-Type: application/json
Authorization: Bearer TU_API_KEY
```

#### Cuerpo de la Petición

```json
{
  "source": "WEBSITE",
  "contactType": "INDIVIDUAL",
  "contactName": "Juan Pérez",
  "email": "juan.perez@example.com",
  "phone": "+34666123456",
  "address": "Calle Principal 123",
  "city": "Madrid",
  "state": "Madrid",
  "postalCode": "28001",
  "country": "España",
  "companyName": "Industrias Pérez",
  "taxId": "B12345678",
  "notes": "Interesado en sistemas de purificación de agua para oficina",
  "metadata": {
    "campaign": "verano-2026",
    "utm_source": "google",
    "utm_medium": "cpc",
    "referrer": "https://google.com"
  }
}
```

#### Descripción de Campos

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `source` | string | Sí | Origen del lead. Opciones: `WEBSITE`, `PHONE`, `EMAIL`, `REFERRAL`, `SOCIAL_MEDIA`, `ADVERTISING`, `TRADE_SHOW`, `MANUAL` |
| `contactType` | string | Sí | Tipo de contacto. Opciones: `INDIVIDUAL`, `COMPANY` |
| `contactName` | string | Sí | Nombre completo de la persona de contacto |
| `email` | string | No* | Dirección de email (requerido si no hay teléfono) |
| `phone` | string | No* | Número de teléfono (requerido si no hay email) |
| `address` | string | No | Dirección |
| `city` | string | No | Ciudad |
| `state` | string | No | Provincia/Estado |
| `postalCode` | string | No | Código postal |
| `country` | string | No | País |
| `companyName` | string | No | Nombre de la empresa (para tipo COMPANY) |
| `taxId` | string | No | CIF / NIF |
| `notes` | string | No | Notas o comentarios adicionales |
| `metadata` | object | No | Datos personalizados (parámetros UTM, info de campaña, etc.) |

**Nota:** Al menos uno de `email` o `phone` es requerido.

#### Respuesta Exitosa (201 Created)

```json
{
  "success": true,
  "message": "Lead creado exitosamente",
  "data": {
    "id": "cm4x8y9z0001abc123def456",
    "contactName": "Juan Pérez",
    "email": "juan.perez@example.com",
    "phone": "+34666123456",
    "status": "NEW",
    "source": "WEBSITE",
    "createdAt": "2026-01-08T10:30:00.000Z"
  }
}
```

#### Respuestas de Error

**400 Bad Request** - Error de Validación
```json
{
  "success": false,
  "error": "Validación fallida",
  "details": {
    "email": "Formato de email inválido",
    "contactName": "El nombre de contacto es requerido"
  }
}
```

**401 Unauthorized** - API Key Inválida o Faltante
```json
{
  "success": false,
  "error": "No autorizado - API key inválida"
}
```

**409 Conflict** - Lead Duplicado
```json
{
  "success": false,
  "error": "Ya existe un lead con este email",
  "existingLeadId": "cm4x8y9z0001abc123def456"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Error interno del servidor",
  "message": "Ocurrió un error inesperado"
}
```

---

## Ejemplos de Integración {#ejemplos-de-integración-es}

### JavaScript / Node.js

#### Ejemplo Simple con Fetch

```javascript
async function enviarLead(datosLead) {
  const respuesta = await fetch('https://tu-dominio.com/api/public/leads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer wc_live_tu_api_key_aqui'
    },
    body: JSON.stringify(datosLead)
  });

  if (!respuesta.ok) {
    const error = await respuesta.json();
    throw new Error(error.error || 'Error al crear lead');
  }

  return await respuesta.json();
}

// Uso
const datosLead = {
  source: 'WEBSITE',
  contactType: 'INDIVIDUAL',
  contactName: 'María García',
  email: 'maria.garcia@example.com',
  phone: '+34666987654',
  notes: 'Contactó vía formulario web'
};

enviarLead(datosLead)
  .then(resultado => console.log('Lead creado:', resultado.data))
  .catch(error => console.error('Error:', error.message));
```

#### Integración con Formulario HTML

```html
<!DOCTYPE html>
<html>
<head>
  <title>Contacto - Water CRM</title>
</head>
<body>
  <form id="formularioContacto">
    <input type="text" name="contactName" placeholder="Nombre completo" required>
    <input type="email" name="email" placeholder="Email" required>
    <input type="tel" name="phone" placeholder="Teléfono">
    <textarea name="notes" placeholder="Tu mensaje"></textarea>
    <button type="submit">Enviar</button>
  </form>

  <script>
    document.getElementById('formularioContacto').addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(e.target);
      const datosLead = {
        source: 'WEBSITE',
        contactType: 'INDIVIDUAL',
        contactName: formData.get('contactName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        notes: formData.get('notes')
      };

      try {
        const respuesta = await fetch('https://tu-dominio.com/api/public/leads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer wc_live_tu_api_key_aqui'
          },
          body: JSON.stringify(datosLead)
        });

        if (respuesta.ok) {
          alert('¡Gracias! Te contactaremos pronto.');
          e.target.reset();
        } else {
          const error = await respuesta.json();
          alert('Error: ' + error.error);
        }
      } catch (error) {
        alert('Error de red. Por favor intenta de nuevo.');
      }
    });
  </script>
</body>
</html>
```

---

### PHP / WordPress

#### Ejemplo Simple en PHP

```php
<?php
function crearLeadWaterCRM($datosLead) {
    $apiUrl = 'https://tu-dominio.com/api/public/leads';
    $apiKey = 'wc_live_tu_api_key_aqui';

    $options = [
        'http' => [
            'header' => [
                "Content-Type: application/json",
                "Authorization: Bearer $apiKey"
            ],
            'method' => 'POST',
            'content' => json_encode($datosLead)
        ]
    ];

    $context = stream_context_create($options);
    $respuesta = file_get_contents($apiUrl, false, $context);

    if ($respuesta === false) {
        throw new Exception('Error al crear lead');
    }

    return json_decode($respuesta, true);
}

// Uso
$datosLead = [
    'source' => 'WEBSITE',
    'contactType' => 'INDIVIDUAL',
    'contactName' => 'Carlos Martínez',
    'email' => 'carlos@example.com',
    'phone' => '+34666111222',
    'notes' => 'Interesado en filtración de agua para hogar'
];

try {
    $resultado = crearLeadWaterCRM($datosLead);
    echo "Lead creado: " . $resultado['data']['id'];
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
```

---

### Python / Django

#### Ejemplo Simple en Python

```python
import requests

def crear_lead_water_crm(datos_lead):
    """
    Enviar un lead a Water CRM
    """
    api_url = 'https://tu-dominio.com/api/public/leads'
    api_key = 'wc_live_tu_api_key_aqui'

    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}'
    }

    response = requests.post(api_url, headers=headers, json=datos_lead)

    if response.status_code == 201:
        return response.json()
    else:
        raise Exception(f"Error {response.status_code}: {response.json().get('error')}")

# Uso
datos_lead = {
    'source': 'WEBSITE',
    'contactType': 'INDIVIDUAL',
    'contactName': 'Ana López',
    'email': 'ana.lopez@example.com',
    'phone': '+34666333444',
    'notes': 'Interesada en tratamiento de agua comercial'
}

try:
    resultado = crear_lead_water_crm(datos_lead)
    print(f"Lead creado: {resultado['data']['id']}")
except Exception as e:
    print(f"Error: {e}")
```

---

## Manejo de Errores {#manejo-de-errores-es}

### Errores Comunes y Soluciones

| Código | Mensaje de Error | Solución |
|--------|------------------|----------|
| 400 | "El nombre de contacto es requerido" | Proporciona `contactName` en el cuerpo de la petición |
| 400 | "Se requiere email o teléfono" | Proporciona al menos un método de contacto |
| 400 | "Formato de email inválido" | Verifica que el formato del email sea válido |
| 400 | "Tipo de contacto inválido" | Usa `INDIVIDUAL` o `COMPANY` |
| 400 | "Origen inválido" | Usa un origen válido: `WEBSITE`, `PHONE`, `EMAIL`, etc. |
| 401 | "No autorizado - API key inválida" | Verifica que la API key sea correcta y esté activa |
| 401 | "La API key no tiene los permisos requeridos" | Otorga permiso `leads: ["create"]` a la API key |
| 409 | "Ya existe un lead con este email" | El lead ya existe con este email |
| 500 | "Error interno del servidor" | Contacta con soporte de Water CRM |

---

## Buenas Prácticas {#buenas-prácticas-es}

### 1. Seguridad

✅ **NUNCA expongas las API keys en código del lado del cliente**
- Usa variables de entorno
- Realiza peticiones desde código del lado del servidor cuando sea posible
- Para cliente, usa un endpoint proxy en tu servidor

✅ **Usa solo HTTPS**
- Nunca envíes API keys sobre HTTP
- Asegura que tu sitio web usa certificado SSL

✅ **Rota las API keys regularmente**
- Cambia las API keys cada 3-6 meses
- Rota inmediatamente si están comprometidas

### 2. Validación de Datos

Siempre valida los datos antes de enviar a la API:

```javascript
function validarDatosLead(datos) {
  const errores = {};

  // Campos requeridos
  if (!datos.contactName || datos.contactName.trim() === '') {
    errores.contactName = 'El nombre es requerido';
  }

  if (!datos.email && !datos.phone) {
    errores.contacto = 'Se requiere email o teléfono';
  }

  // Formato de email
  if (datos.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
    errores.email = 'Formato de email inválido';
  }

  return Object.keys(errores).length > 0 ? errores : null;
}
```

### 3. Seguimiento UTM

Rastrea el rendimiento de campañas de marketing incluyendo parámetros UTM:

```javascript
function obtenerParametrosUTM() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_term: params.get('utm_term'),
    utm_content: params.get('utm_content')
  };
}

// Incluir en metadata
const datosLead = {
  contactName: 'Juan Pérez',
  email: 'juan@example.com',
  source: 'WEBSITE',
  contactType: 'INDIVIDUAL',
  metadata: {
    ...obtenerParametrosUTM(),
    referrer: document.referrer,
    page_url: window.location.href
  }
};
```

---

## Soporte

Para soporte técnico o preguntas sobre la API:

- **Email**: support@watercrm.com
- **Documentación**: https://docs.watercrm.com
- **Estado del Sistema**: https://status.watercrm.com

---

**Versión del Plugin:** 1.0
**Última Actualización:** Enero 2026
**Compatibilidad:** Water CRM v1.0+
