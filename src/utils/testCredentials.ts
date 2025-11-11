/**
 * Credenciales de prueba para testing del sistema de autenticación
 * SOLO PARA DESARROLLO - NO USAR EN PRODUCCIÓN
 */

export const TEST_CREDENTIALS = {
  admin: {
    email: 'admin@universidad.edu',
    password: 'admin123',
  },
  student: {
    email: 'estudiante@universidad.edu',
    password: 'student123',
  },
  organization: {
    email: 'empresa@org.com',
    password: 'org123',
  },
  // Credenciales alternativas
  alternatives: [
    { email: 'admin@admin.com', password: 'admin123' },
    { email: 'test@test.com', password: 'test123' },
    { email: 'user@example.com', password: '12345678' },
  ]
} as const;

export const getTestCredentialsInfo = () => {
  console.log('🔐 Credenciales de prueba disponibles:', TEST_CREDENTIALS);
  return TEST_CREDENTIALS;
};