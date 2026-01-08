# Water CRM - Public Products API Plugin

**Version:** 1.0.0
**Purpose:** Display Water CRM products on external websites
**Authentication:** API Key
**Language:** English & Spanish

---

## Table of Contents

- [English Documentation](#english-documentation)
  - [Overview](#overview)
  - [Authentication](#authentication)
  - [Endpoints](#endpoints)
  - [Integration Examples](#integration-examples)
  - [Error Handling](#error-handling)
- [Documentación en Español](#documentación-en-español)
  - [Descripción General](#descripción-general)
  - [Autenticación](#autenticación)
  - [Endpoints](#endpoints-es)
  - [Ejemplos de Integración](#ejemplos-de-integración)
  - [Manejo de Errores](#manejo-de-errores)

---

# ENGLISH DOCUMENTATION

## Overview

The Public Products API allows external websites to display products from Water CRM without requiring user authentication. This is useful for:

- **Public e-commerce websites**: Show your product catalog
- **Marketing landing pages**: Display specific products
- **Partner websites**: Allow partners to show your products
- **Mobile apps**: Access product data for mobile applications

### Key Features

- **No authentication required** for read-only access
- **API Key protection** to prevent abuse
- **Company-specific data** - only shows products from your company
- **Cached responses** for better performance
- **Detailed product information** including images, prices, and datasheets

### Base URL

```
https://your-domain.com/api/public/products
```

---

## Authentication

### API Key Setup

1. **Generate API Key** (Admin only):
   - Login to Water CRM as Admin
   - Go to Settings → API Keys
   - Click "Generate New Key"
   - Name it (e.g., "Website Integration")
   - Copy the generated key (shown only once)

2. **Use API Key in Requests**:
   ```
   X-API-Key: your_api_key_here
   ```

### Security Notes

- **Never expose your API key** in client-side JavaScript
- **Use server-side proxy** for website integrations
- **Rotate keys regularly** for security
- **Deactivate compromised keys** immediately

---

## Endpoints

### 1. List All Products

**Endpoint:** `GET /api/public/products`

**Description:** Retrieves a paginated list of active products.

**Headers:**
```http
X-API-Key: your_api_key_here
Content-Type: application/json
```

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number for pagination |
| `limit` | integer | No | 20 | Items per page (max 100) |
| `category` | string | No | - | Filter by category ID |
| `search` | string | No | - | Search in product name/description |
| `status` | string | No | ACTIVE | Filter by status (ACTIVE, INACTIVE, DISCONTINUED) |

**Request Example:**

```http
GET /api/public/products?page=1&limit=10&category=cat_123
X-API-Key: pk_live_abc123def456
```

**Response Example (200 OK):**

```json
{
  "products": [
    {
      "id": "prod_abc123",
      "name": "Osmosis Inversa Doméstica 5 Etapas",
      "description": "Sistema de osmosis inversa con 5 etapas de filtración...",
      "internalReference": "OSM-DOM-5E",
      "manufacturerReference": "RO-500-5S",
      "basePrice": "599.99",
      "status": "ACTIVE",
      "category": {
        "id": "cat_123",
        "name": "Osmosis Doméstica"
      },
      "images": [
        {
          "url": "https://cdn.example.com/product1-main.jpg",
          "isPrimary": true,
          "order": 0
        },
        {
          "url": "https://cdn.example.com/product1-detail.jpg",
          "isPrimary": false,
          "order": 1
        }
      ],
      "prices": {
        "salePrice1": "599.99",
        "salePrice12": "650.00",
        "salePrice24": "700.00",
        "salePrice36": "750.00",
        "salePrice48": "800.00",
        "salePrice60": "850.00",
        "rentalPrice12": "45.00",
        "rentalPrice24": "40.00",
        "rentalPrice36": "38.00",
        "rentalPrice48": "35.00",
        "rentalPrice60": "32.00"
      },
      "attributes": [
        {
          "name": "Capacidad",
          "value": "190 litros/día",
          "type": "TEXT"
        },
        {
          "name": "Presión Mínima",
          "value": "2.5 bar",
          "type": "TEXT"
        }
      ],
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-06-20T14:22:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique product identifier |
| `name` | string | Product name |
| `description` | string | Product description (HTML safe) |
| `internalReference` | string | Internal SKU/reference |
| `manufacturerReference` | string | Manufacturer's SKU |
| `basePrice` | string | Base price in euros (decimal string) |
| `status` | string | Product status (ACTIVE, INACTIVE, DISCONTINUED) |
| `category` | object | Product category information |
| `images` | array | Product images (ordered) |
| `prices` | object | Pricing tiers for sale and rental |
| `attributes` | array | Custom product attributes |
| `createdAt` | string | ISO 8601 timestamp |
| `updatedAt` | string | ISO 8601 timestamp |

---

### 2. Get Single Product

**Endpoint:** `GET /api/public/products/:id`

**Description:** Retrieves detailed information for a specific product.

**Headers:**
```http
X-API-Key: your_api_key_here
Content-Type: application/json
```

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Product ID |

**Request Example:**

```http
GET /api/public/products/prod_abc123
X-API-Key: pk_live_abc123def456
```

**Response Example (200 OK):**

```json
{
  "product": {
    "id": "prod_abc123",
    "name": "Osmosis Inversa Doméstica 5 Etapas",
    "description": "<p>Sistema de osmosis inversa con 5 etapas de filtración...</p>",
    "internalReference": "OSM-DOM-5E",
    "manufacturerReference": "RO-500-5S",
    "basePrice": "599.99",
    "status": "ACTIVE",
    "category": {
      "id": "cat_123",
      "name": "Osmosis Doméstica",
      "parentId": null
    },
    "images": [
      {
        "id": "img_001",
        "url": "https://cdn.example.com/product1-main.jpg",
        "isPrimary": true,
        "order": 0
      },
      {
        "id": "img_002",
        "url": "https://cdn.example.com/product1-detail1.jpg",
        "isPrimary": false,
        "order": 1
      },
      {
        "id": "img_003",
        "url": "https://cdn.example.com/product1-detail2.jpg",
        "isPrimary": false,
        "order": 2
      }
    ],
    "prices": {
      "salePrice1": "599.99",
      "salePrice12": "650.00",
      "salePrice24": "700.00",
      "salePrice36": "750.00",
      "salePrice48": "800.00",
      "salePrice60": "850.00",
      "rentalPrice12": "45.00",
      "rentalPrice24": "40.00",
      "rentalPrice36": "38.00",
      "rentalPrice48": "35.00",
      "rentalPrice60": "32.00",
      "minPriceThreshold": "500.00"
    },
    "attributes": [
      {
        "id": "attr_001",
        "name": "Capacidad",
        "value": "190 litros/día",
        "type": "TEXT"
      },
      {
        "id": "attr_002",
        "name": "Presión Mínima",
        "value": "2.5 bar",
        "type": "TEXT"
      },
      {
        "id": "attr_003",
        "name": "Dimensiones",
        "value": "35 x 40 x 15 cm",
        "type": "TEXT"
      },
      {
        "id": "attr_004",
        "name": "Peso",
        "value": "8.5 kg",
        "type": "NUMBER"
      },
      {
        "id": "attr_005",
        "name": "Incluye Instalación",
        "value": "true",
        "type": "BOOLEAN"
      }
    ],
    "datasheets": [
      {
        "id": "ds_001",
        "language": "ES",
        "pdfUrl": "https://cdn.example.com/datasheets/osm-dom-5e-es.pdf"
      },
      {
        "id": "ds_002",
        "language": "EN",
        "pdfUrl": "https://cdn.example.com/datasheets/osm-dom-5e-en.pdf"
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-06-20T14:22:00Z"
  }
}
```

**Additional Fields (vs List):**

| Field | Type | Description |
|-------|------|-------------|
| `datasheets` | array | Available PDF datasheets by language |
| `category.parentId` | string | Parent category ID if exists |

---

## Integration Examples

### Example 1: JavaScript/Fetch (Server-side Node.js)

```javascript
// server.js (Node.js/Express)
const express = require('express');
const fetch = require('node-fetch');

const app = express();
const API_KEY = process.env.WATER_CRM_API_KEY; // Store securely

// Proxy endpoint
app.get('/api/products', async (req, res) => {
  try {
    const { page = 1, limit = 12, search = '', category = '' } = req.query;

    const params = new URLSearchParams({
      page,
      limit,
      ...(search && { search }),
      ...(category && { category })
    });

    const response = await fetch(
      `https://your-crm-domain.com/api/public/products?${params}`,
      {
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const response = await fetch(
      `https://your-crm-domain.com/api/public/products/${id}`,
      {
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: 'Product not found' });
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Example 2: PHP (WordPress Integration)

```php
<?php
/**
 * Water CRM Products Integration for WordPress
 */

define('WATER_CRM_API_URL', 'https://your-crm-domain.com/api/public/products');
define('WATER_CRM_API_KEY', 'your_api_key_here'); // Store in wp-config.php

/**
 * Fetch products from Water CRM
 */
function watercrm_get_products($page = 1, $limit = 12, $category = null) {
    $cache_key = 'watercrm_products_' . md5($page . $limit . $category);

    // Check cache (12 hours)
    $cached = get_transient($cache_key);
    if ($cached !== false) {
        return $cached;
    }

    $url = WATER_CRM_API_URL . '?' . http_build_query([
        'page' => $page,
        'limit' => $limit,
        'category' => $category
    ]);

    $response = wp_remote_get($url, [
        'headers' => [
            'X-API-Key' => WATER_CRM_API_KEY,
            'Content-Type' => 'application/json'
        ],
        'timeout' => 15
    ]);

    if (is_wp_error($response)) {
        error_log('Water CRM API Error: ' . $response->get_error_message());
        return null;
    }

    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log('Water CRM JSON Error: ' . json_last_error_msg());
        return null;
    }

    // Cache for 12 hours
    set_transient($cache_key, $data, 12 * HOUR_IN_SECONDS);

    return $data;
}

/**
 * Get single product
 */
function watercrm_get_product($product_id) {
    $cache_key = 'watercrm_product_' . $product_id;

    $cached = get_transient($cache_key);
    if ($cached !== false) {
        return $cached;
    }

    $url = WATER_CRM_API_URL . '/' . $product_id;

    $response = wp_remote_get($url, [
        'headers' => [
            'X-API-Key' => WATER_CRM_API_KEY,
            'Content-Type' => 'application/json'
        ],
        'timeout' => 15
    ]);

    if (is_wp_error($response)) {
        error_log('Water CRM API Error: ' . $response->get_error_message());
        return null;
    }

    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log('Water CRM JSON Error: ' . json_last_error_msg());
        return null;
    }

    // Cache for 12 hours
    set_transient($cache_key, $data, 12 * HOUR_IN_SECONDS);

    return $data;
}

/**
 * Shortcode for displaying products
 * Usage: [watercrm_products limit="6" category="cat_123"]
 */
function watercrm_products_shortcode($atts) {
    $atts = shortcode_atts([
        'limit' => 12,
        'category' => null,
        'page' => 1
    ], $atts);

    $data = watercrm_get_products(
        intval($atts['page']),
        intval($atts['limit']),
        $atts['category']
    );

    if (!$data || empty($data['products'])) {
        return '<p>No products found.</p>';
    }

    ob_start();
    ?>
    <div class="watercrm-products-grid">
        <?php foreach ($data['products'] as $product): ?>
            <div class="watercrm-product-card">
                <?php if (!empty($product['images'])): ?>
                    <img
                        src="<?php echo esc_url($product['images'][0]['url']); ?>"
                        alt="<?php echo esc_attr($product['name']); ?>"
                        class="product-image"
                    >
                <?php endif; ?>

                <h3><?php echo esc_html($product['name']); ?></h3>

                <div class="product-price">
                    <?php echo number_format($product['basePrice'], 2); ?> €
                </div>

                <a
                    href="/product/<?php echo esc_attr($product['id']); ?>"
                    class="btn-view-product"
                >
                    Ver Detalles
                </a>
            </div>
        <?php endforeach; ?>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode('watercrm_products', 'watercrm_products_shortcode');
```

### Example 3: Python (Django/Flask)

```python
# config.py
WATER_CRM_API_URL = 'https://your-crm-domain.com/api/public/products'
WATER_CRM_API_KEY = 'your_api_key_here'

# services/watercrm.py
import requests
from django.core.cache import cache
from typing import Optional, Dict, Any

class WaterCRMClient:
    """Client for Water CRM Public Products API"""

    def __init__(self, api_url: str, api_key: str):
        self.api_url = api_url
        self.api_key = api_key
        self.headers = {
            'X-API-Key': api_key,
            'Content-Type': 'application/json'
        }

    def get_products(
        self,
        page: int = 1,
        limit: int = 20,
        category: Optional[str] = None,
        search: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Fetch products list"""

        # Check cache
        cache_key = f'watercrm_products_{page}_{limit}_{category}_{search}'
        cached = cache.get(cache_key)
        if cached:
            return cached

        # Build query params
        params = {
            'page': page,
            'limit': limit
        }
        if category:
            params['category'] = category
        if search:
            params['search'] = search

        try:
            response = requests.get(
                self.api_url,
                headers=self.headers,
                params=params,
                timeout=15
            )
            response.raise_for_status()

            data = response.json()

            # Cache for 12 hours
            cache.set(cache_key, data, 60 * 60 * 12)

            return data

        except requests.exceptions.RequestException as e:
            print(f'Water CRM API Error: {e}')
            return None

    def get_product(self, product_id: str) -> Optional[Dict[str, Any]]:
        """Fetch single product"""

        cache_key = f'watercrm_product_{product_id}'
        cached = cache.get(cache_key)
        if cached:
            return cached

        try:
            response = requests.get(
                f'{self.api_url}/{product_id}',
                headers=self.headers,
                timeout=15
            )
            response.raise_for_status()

            data = response.json()

            # Cache for 12 hours
            cache.set(cache_key, data, 60 * 60 * 12)

            return data

        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 404:
                return None
            print(f'Water CRM API Error: {e}')
            return None
        except requests.exceptions.RequestException as e:
            print(f'Water CRM API Error: {e}')
            return None

# views.py
from django.shortcuts import render
from .services.watercrm import WaterCRMClient
from django.conf import settings

watercrm = WaterCRMClient(
    settings.WATER_CRM_API_URL,
    settings.WATER_CRM_API_KEY
)

def products_list(request):
    """Display products list"""
    page = int(request.GET.get('page', 1))
    category = request.GET.get('category')
    search = request.GET.get('search')

    data = watercrm.get_products(
        page=page,
        limit=12,
        category=category,
        search=search
    )

    if not data:
        return render(request, 'products/error.html', {
            'error': 'Could not load products'
        })

    return render(request, 'products/list.html', {
        'products': data.get('products', []),
        'pagination': data.get('pagination', {})
    })

def product_detail(request, product_id):
    """Display single product"""
    data = watercrm.get_product(product_id)

    if not data:
        return render(request, 'products/not_found.html', status=404)

    return render(request, 'products/detail.html', {
        'product': data.get('product')
    })
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Missing or invalid API key |
| 403 | Forbidden | API key deactivated |
| 404 | Not Found | Product not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Error Response Format

```json
{
  "error": "Error message here",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error details"
  }
}
```

### Common Errors

**1. Invalid API Key**
```json
{
  "error": "Invalid or missing API key",
  "code": "INVALID_API_KEY"
}
```

**2. Product Not Found**
```json
{
  "error": "Product not found",
  "code": "PRODUCT_NOT_FOUND"
}
```

**3. Rate Limit Exceeded**
```json
{
  "error": "Rate limit exceeded. Try again later.",
  "code": "RATE_LIMIT_EXCEEDED",
  "details": {
    "retryAfter": 60
  }
}
```

### Best Practices

1. **Always check HTTP status code** before parsing response
2. **Implement retry logic** with exponential backoff for 5xx errors
3. **Cache responses** to reduce API calls (recommended 12 hours)
4. **Handle errors gracefully** - show user-friendly messages
5. **Log errors** for debugging but don't expose API keys
6. **Set timeouts** (recommended 15 seconds)

---

# DOCUMENTACIÓN EN ESPAÑOL

## Descripción General

La API Pública de Productos permite que sitios web externos muestren productos de Water CRM sin requerir autenticación de usuario. Esto es útil para:

- **Sitios web de e-commerce público**: Mostrar tu catálogo de productos
- **Páginas de destino de marketing**: Mostrar productos específicos
- **Sitios web de socios**: Permitir a socios mostrar tus productos
- **Aplicaciones móviles**: Acceder a datos de productos para aplicaciones móviles

### Características Principales

- **No requiere autenticación** para acceso de solo lectura
- **Protección por API Key** para prevenir abuso
- **Datos específicos por empresa** - solo muestra productos de tu empresa
- **Respuestas cacheadas** para mejor rendimiento
- **Información detallada de productos** incluyendo imágenes, precios y fichas técnicas

### URL Base

```
https://tu-dominio.com/api/public/products
```

---

## Autenticación

### Configuración de API Key

1. **Generar API Key** (Solo Admin):
   - Inicia sesión en Water CRM como Admin
   - Ve a Configuración → Claves API
   - Haz clic en "Generar Nueva Clave"
   - Ponle un nombre (ej: "Integración Web")
   - Copia la clave generada (se muestra solo una vez)

2. **Usar API Key en Peticiones**:
   ```
   X-API-Key: tu_api_key_aqui
   ```

### Notas de Seguridad

- **Nunca expongas tu API key** en JavaScript del lado del cliente
- **Usa un proxy del lado del servidor** para integraciones web
- **Rota las claves regularmente** por seguridad
- **Desactiva claves comprometidas** inmediatamente

---

## Endpoints (ES)

### 1. Listar Todos los Productos

**Endpoint:** `GET /api/public/products`

**Descripción:** Obtiene una lista paginada de productos activos.

**Cabeceras:**
```http
X-API-Key: tu_api_key_aqui
Content-Type: application/json
```

**Parámetros de Consulta:**

| Parámetro | Tipo | Requerido | Por Defecto | Descripción |
|-----------|------|-----------|-------------|-------------|
| `page` | entero | No | 1 | Número de página para paginación |
| `limit` | entero | No | 20 | Elementos por página (máx 100) |
| `category` | string | No | - | Filtrar por ID de categoría |
| `search` | string | No | - | Buscar en nombre/descripción |
| `status` | string | No | ACTIVE | Filtrar por estado (ACTIVE, INACTIVE, DISCONTINUED) |

**Ejemplo de Petición:**

```http
GET /api/public/products?page=1&limit=10&category=cat_123
X-API-Key: pk_live_abc123def456
```

**Ejemplo de Respuesta (200 OK):**

```json
{
  "products": [
    {
      "id": "prod_abc123",
      "name": "Osmosis Inversa Doméstica 5 Etapas",
      "description": "Sistema de osmosis inversa con 5 etapas de filtración...",
      "internalReference": "OSM-DOM-5E",
      "manufacturerReference": "RO-500-5S",
      "basePrice": "599.99",
      "status": "ACTIVE",
      "category": {
        "id": "cat_123",
        "name": "Osmosis Doméstica"
      },
      "images": [
        {
          "url": "https://cdn.example.com/producto1-principal.jpg",
          "isPrimary": true,
          "order": 0
        }
      ],
      "prices": {
        "salePrice1": "599.99",
        "salePrice12": "650.00",
        "salePrice24": "700.00",
        "rentalPrice12": "45.00",
        "rentalPrice24": "40.00"
      },
      "attributes": [
        {
          "name": "Capacidad",
          "value": "190 litros/día",
          "type": "TEXT"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Ejemplos de Integración

### Ejemplo 1: JavaScript/React

```javascript
// ProductsPage.jsx
import React, { useState, useEffect } from 'react';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Llamar a tu backend proxy (NUNCA exponer API key en frontend)
      const response = await fetch('/api/products?page=1&limit=12');

      if (!response.ok) {
        throw new Error('Error al cargar productos');
      }

      const data = await response.json();
      setProducts(data.products);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando productos...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="products-grid">
      {products.map(product => (
        <div key={product.id} className="product-card">
          {product.images[0] && (
            <img
              src={product.images[0].url}
              alt={product.name}
            />
          )}
          <h3>{product.name}</h3>
          <p className="price">{product.basePrice} €</p>
          <button onClick={() => window.location.href = `/producto/${product.id}`}>
            Ver Detalles
          </button>
        </div>
      ))}
    </div>
  );
}

export default ProductsPage;
```

---

## Manejo de Errores

### Códigos de Estado HTTP

| Código | Significado | Descripción |
|--------|-------------|-------------|
| 200 | OK | Petición exitosa |
| 400 | Bad Request | Parámetros inválidos |
| 401 | Unauthorized | API key faltante o inválida |
| 403 | Forbidden | API key desactivada |
| 404 | Not Found | Producto no encontrado |
| 429 | Too Many Requests | Límite de tasa excedido |
| 500 | Internal Server Error | Error del servidor |

### Mejores Prácticas

1. **Siempre verifica el código de estado HTTP** antes de parsear la respuesta
2. **Implementa lógica de reintentos** con backoff exponencial para errores 5xx
3. **Cachea las respuestas** para reducir llamadas a la API (recomendado 12 horas)
4. **Maneja errores con gracia** - muestra mensajes amigables al usuario
5. **Registra errores** para debugging pero no expongas API keys
6. **Establece timeouts** (recomendado 15 segundos)

---

**END OF PLUGIN DOCUMENTATION**
