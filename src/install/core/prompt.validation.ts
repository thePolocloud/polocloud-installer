import z from "zod";

/* ---------- Primitive Schemas ---------- */

export const HostSchema = z
  .string()
  .min(1, "Host is required");

export const PortSchema = z
  .coerce
  .number()
  .int("Port must be an integer")
  .min(1, "Port must be between 1 and 65535")
  .max(65535, "Port must be between 1 and 65535");

export const UsernameSchema = z
  .string()
  .min(1, "Username is required")
  .max(255, "Username is too long");

export const PasswordSchema = z
  .string()
  .min(1, "Password is required")
  .max(255, "Password is too long");

export const DatabaseNameSchema = z
  .string()
  .min(1, "Database name is required")
  .max(255, "Database name is too long");

/* ---------- Prompt Adapter ---------- */

export const zodValidate =
  <T>(schema: z.ZodType<T>) =>
  (value: unknown) => {
    const result = schema.safeParse(value ?? "");
    return result.success
      ? undefined
      : result.error.issues[0]?.message;
  };
