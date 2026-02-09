import z from "zod/v4";
import { DatabaseName, DatabaseSource, DatabaseType, Module } from "./install-enums.js";

export const InstallStateSchema = z.object({
  acceptedTerms: z.boolean(),
  module: z.enum(Module).optional(),
  cluster: z.boolean().optional(),

  database: z.object({
    exists: z.boolean(),
    source: z.enum(DatabaseSource).optional(),
    type: z.enum(DatabaseType).optional(),
    name: z.enum(DatabaseName).optional(),

    detected: z.object({
      host: z.string(),
      port: z.number(),
      label: z.string(),
    }).optional(),

    credentials: z.object({
      host: z.string().max(255),
      port: z.number().min(1).max(65535),
      username: z.string().max(255),
      password: z.string().max(255),
      database: z.string().max(255),
    }).optional()

  }).optional(),

  autoStart: z.boolean().optional(),
});

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

export const zodValidate =
  <T>(schema: z.ZodType<T>) =>
    (value: unknown) => {
      const result = schema.safeParse(value ?? "");
      return result.success ? undefined : result.error.issues[0]?.message;
    };

export type InstallState = z.infer<typeof InstallStateSchema>;
export type DatabaseState =
    NonNullable<z.infer<typeof InstallStateSchema>["database"]>;
export type DatabaseCredentials =
    NonNullable<DatabaseState["credentials"]>;