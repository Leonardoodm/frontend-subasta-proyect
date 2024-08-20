import { API_URL } from '../config/url.js';

export async function getProductsSeller() {
    try {
        const token = localStorage.getItem('token'); // Obtén el token del localStorage
        const response = await fetch(`${API_URL}/productos/revendedor`, {
            method: 'GET',
            headers: {
                'x-token': token // Incluye el token en los encabezados
            }
        });
        const data = await response.json();
        // console.log('Response from API:', data); // Añadir esta línea para depurar la respuesta
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching productos:', error);
        return { success: false, message: error.message };
    }
}

export async function getProductById(id) {
    try {
        const token = localStorage.getItem('token'); // Obtén el token del localStorage
        const response = await fetch(`${API_URL}/productos/${id}`, {
            method: 'GET',
            headers: {
                'x-token': token // Incluye el token en los encabezados
            }
        });
        const data = await response.json();
        console.log('Response from API:', data); // Añadir esta línea para depurar la respuesta
        return { success: true, data: data.producto }; // Asegúrate de que data.producto contiene los datos del producto
    } catch (error) {
        console.error('Error fetching producto:', error);
        return { success: false, message: error.message };
    }
}

export async function updateProduct(id, updatedProduct) {
    try {
        const token = localStorage.getItem('token');
        console.log('Token:', token); // Depuración del token
        const response = await fetch(`${API_URL}/productos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-token': token
            },
            body: JSON.stringify(updatedProduct)
        });
        const data = await response.json();
        console.log('Response from API:', data);
        if (response.ok) {
            return { success: true, data };
        } else {
            return { success: false, message: data.message || 'Error desconocido' };
        }
    } catch (error) {
        console.error('Error updating producto:', error);
        return { success: false, message: error.message };
    }
}

export async function createProduct(newProduct) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/productos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-token': token
            },
            body: JSON.stringify(newProduct)
        });
        const data = await response.json();
        console.log('Response from API (createProduct):', data);
        if (response.ok) {
            return { success: true, data };
        } else {
            return { success: false, message: data.message || 'Error desconocido' };
        }
    } catch (error) {
        console.error('Error creating product:', error);
        return { success: false, message: error.message };
    }
}
