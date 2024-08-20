import { API_URL } from '../config/url.js';

export async function getUsers() {
    try {
        const response = await fetch(`${API_URL}/usuarios`);
        const data = await response.json();
        
        if (data && Array.isArray(data.users)) {
            return { success: true, data: data.users };
        } else {
            return { success: false, message: 'Unexpected response format' };
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        return { success: false, message: error.message };
    }
}



export async function deleteUser(id) {
    const token = localStorage.getItem('token'); // Obtén el token del localStorage
    try {
        const response = await fetch(`${API_URL}/usuarios/${id}`, {
            method: 'DELETE',
            headers: {
                'x-token': token // Incluye el token en los encabezados
            }
        });
        const result = await response.json();
        return { success: response.ok, ...result };
    } catch (error) {
        console.error('Error deleting user:', error);
        return { success: false, message: error.message };
    }
}

export async function updateUser(id, userData) {
    const token = localStorage.getItem('token'); // Obtén el token del localStorage
    try {
        const response = await fetch(`${API_URL}/usuarios/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-token': token // Incluye el token en los encabezados
            },
            body: JSON.stringify(userData)
        });
        const result = await response.json();
        return { success: response.ok, ...result };
    } catch (error) {
        console.error('Error updating user:', error);
        return { success: false, message: error.message };
    }
}