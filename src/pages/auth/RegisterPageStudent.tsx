import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const RegisterPageStudent = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  // Validaciones en tiempo real
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setErrors((prev) => ({
      ...prev,
      email: !value
        ? "El correo es requerido"
        : !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)
        ? "Correo inválido"
        : undefined,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setErrors((prev) => ({
      ...prev,
      password: !value
        ? "La contraseña es requerida"
        : value.length < 8
        ? "La contraseña debe tener al menos 8 caracteres"
        : undefined,
      confirmPassword:
        confirmPassword && value !== confirmPassword
          ? "Las contraseñas no coinciden"
          : undefined,
    }));
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setErrors((prev) => ({
      ...prev,
      confirmPassword: !value
        ? "Confirma tu contraseña"
        : password !== value
        ? "Las contraseñas no coinciden"
        : undefined,
    }));
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email) {
      newErrors.email = "El correo es requerido";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      newErrors.email = "Correo inválido";
    }
    if (!password) {
      newErrors.password = "La contraseña es requerida";
    } else if (password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }
    return newErrors;
  };

  // Llamada real al backend para registrar usuario
  const registerStudent = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: "student" }),
      });
      if (response.status === 409) {
        // 409 Conflict: correo ya registrado
        return { success: false, error: "El correo ya está registrado" };
      }
      if (!response.ok) {
        const data = await response.json();
        return { success: false, error: data.message || "Error al registrar" };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: "Error de conexión" };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    setIsSubmitting(true);

    // Llamada real al backend
    const result = await registerStudent(email, password);
    if (!result.success) {
      setErrors({ email: result.error });
      setIsSubmitting(false);
      return;
    }
    // Registro exitoso
    setIsSubmitting(false);
    navigate("/auth/login");
  };

  const isFormValid =
    email &&
    password &&
    confirmPassword &&
    Object.keys(validate()).length === 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <Card className="max-w-md w-full bg-white shadow-hero">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Registro Estudiante</CardTitle>
          <CardDescription className="text-center">
            Completa tus datos para crear tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="estudiante@universidad.edu"
                required
                className="bg-background"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                required
                className="bg-background"
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder="••••••••"
                required
                className="bg-background"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>
            <Button
              type="submit"
              variant="default"
              className="w-full"
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? "Registrando..." : "Registrarse"}
            </Button>
            {errors.general && (
              <p className="text-sm text-red-500 text-center">{errors.general}</p>
            )}
          </form>
          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <a
                href="/auth/login"
                className="text-primary hover:underline font-medium"
              >
                Inicia sesión aquí
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPageStudent;