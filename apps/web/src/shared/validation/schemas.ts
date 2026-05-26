import { z } from "zod";

/**
 * Esquema de validación para el formulario de inicio de sesión.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "El correo electrónico es requerido." })
    .email({ message: "Formato de correo electrónico no válido." }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});

/**
 * Esquema de validación para el formulario de registro.
 */
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, { message: "El correo electrónico es requerido." })
    .email({ message: "Formato de correo electrónico no válido." }),
  password: z
    .string()
    .min(8, { message: "Contraseña muy débil. Mínimo 8 caracteres." })
    .regex(/[A-Z]/, { message: "Contraseña muy débil. Debe incluir una mayúscula." })
    .regex(/[a-z]/, { message: "Contraseña muy débil. Debe incluir una minúscula." })
    .regex(/[0-9]/, { message: "Contraseña muy débil. Debe incluir un número." })
    .regex(/[^A-Za-z0-9]/, { message: "Contraseña muy débil. Debe incluir un carácter especial." }),
  confirmPassword: z
    .string()
    .min(1, { message: "Por favor, repita la contraseña." })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

/**
 * Esquema de validación para el envío de respuestas escritas a preguntas.
 */
export const answerSchema = z.object({
  userAnswer: z
    .string()
    .min(5, { message: "La respuesta debe contener al menos 5 caracteres para ser significativa." })
    .max(5000, { message: "La respuesta es demasiado larga (máximo 5000 caracteres)." }),
});
