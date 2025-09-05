export interface User {
  name: string;
  email: string;
  role: string;
  id?: string; // Opcional, útil para cuando se actualiza un usuario existente
}
