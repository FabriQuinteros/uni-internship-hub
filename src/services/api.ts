import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.example.com', // Cambia esto a la URL de tu API
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

// Función para manejar errores de la API
const handleError = (error: any) => {
  if (error.response) {
    // La solicitud se realizó y el servidor respondió con un código de estado
    console.error('Error en la respuesta:', error.response.data);
  } else if (error.request) {
    // La solicitud se realizó pero no se recibió respuesta
    console.error('No se recibió respuesta:', error.request);
  } else {
    // Algo sucedió al configurar la solicitud
    console.error('Error al configurar la solicitud:', error.message);
  }
};

// Función para obtener datos de la API
export const getData = async (endpoint: string) => {
  try {
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// Función para enviar datos a la API
export const postData = async (endpoint: string, data: any) => {
  try {
    const response = await api.post(endpoint, data);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// Otras funciones para PUT, DELETE, etc. pueden ser añadidas aquí