// Subastas.js
import { API_URL } from '../config/url.js';

export async function getSubastas(status) {
    try {
        const token = localStorage.getItem('token'); // Obtén el token del localStorage
        const response = await fetch(`${API_URL}/subastaVenta?status=${status}`, {
            method: 'GET',
            headers: {
                'x-token': token // Incluye el token en los encabezados
            }
        });
        const data = await response.json();
        console.log('Response from API (getSubastas):', data);
        return { success: response.ok, data };
    } catch (error) {
        console.error('Error fetching subastas:', error);
        return { success: false, message: error.message };
    }
}

export async function getSubastaId(id) {
    try {
        const token = localStorage.getItem('token'); // Obtén el token del localStorage
        const response = await fetch(`${API_URL}/subastaVenta/${id}`, {
            method: 'GET',
            headers: {
                'x-token': token // Incluye el token en los encabezados
            }
        });
        const data = await response.json();
        // console.log('Response from API:', data); // Añadir esta línea para depurar la respuesta
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching subasta:', error);
        return { success: false, message: error.message };
    }
}

export async function getSubastasAdmAceptar(status) {
    try {
        const token = localStorage.getItem('token'); // Obtén el token del localStorage
        const response = await fetch(`${API_URL}/subastaVenta?status=${status}`, {
            method: 'GET',
            headers: {
                'x-token': token // Incluye el token en los encabezados
            }
        });
        const data = await response.json();
        // console.log('Response from API:', data); // Añadir esta línea para depurar la respuesta
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching subastas:', error);
        return { success: false, message: error.message };
    }
}


export async function updateAdmSubasta(id, estadoPedido) {
    const token = localStorage.getItem('token'); // Obtén el token del localStorage
    try {
        const response = await fetch(`${API_URL}/subastaVenta/checkAdm/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-token': token // Incluye el token en los encabezados
            },
            body: JSON.stringify({ estadoPedido }) // Asegúrate de que el payload esté en el formato correcto
        });
        const result = await response.json();
        return { success: response.ok, ...result };
    } catch (error) {
        console.error('Error updating status:', error);
        return { success: false, message: error.message };
    }
}

export async function createAuction(auctionData) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/subastaVenta`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-token': token
            },
            body: JSON.stringify(auctionData)
        });
        const data = await response.json();
        console.log('Response from API:', data);
        if (response.ok) {
            return { success: true, data };
        } else {
            return { success: false, message: data.message || 'Error desconocido' };
        }
    } catch (error) {
        console.error('Error creating auction:', error);
        return { success: false, message: error.message };
    }
}


export async function updateDeleteSubasta(id, body) {
    try {
        const token = localStorage.getItem('token'); // Obtén el token del localStorage
        const response = await fetch(`${API_URL}/subastaVenta/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-token': token // Incluye el token en los encabezados
            },
            body: JSON.stringify(body)
        });
        const data = await response.json();
        console.log('Response from API (updateSubasta):', data);
        return { success: response.ok, data };
    } catch (error) {
        console.error('Error updating subasta:', error);
        return { success: false, message: error.message };
    }
}