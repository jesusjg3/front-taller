import axios from 'axios';

const api = axios.create({
    baseURL: 'http://192.168.10.96:8000/api/v1', // Ajusta el puerto si tu Laravel corre en otro (ej: 8000)
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export default api;
