import { API_URL } from '../config/url.js';

export async function loginUser(email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (data.token) {
            console.log(data); // Este log debería mostrarse en la consola del navegador
            localStorage.setItem('token', data.token);
            localStorage.setItem('rol', data.usuario.rol);
            localStorage.setItem('isAuthenticated', 'true'); // Indicador de autenticación
            return { success: true, data };
        } else {
            return { success: false, message: data.message || 'Login failed' };
        }
    } catch (error) {
        console.error('Error logging in:', error); // Este log debería mostrarse en la consola del navegador
        return { success: false, message: error.message };
    }
}