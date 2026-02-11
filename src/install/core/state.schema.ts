import z from "zod";
import { DatabaseName, DatabaseSource, DatabaseType, Module, RedisSource } from "./enum.js";

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
    }).optional(),
  }).optional(),

  redis: z.object({
    enabled: z.boolean(),
    source: z.enum(RedisSource).optional(),

    detected: z.object({
      host: z.string(),
      port: z.number(),
    }).optional(),

    credentials: z.object({
      host: z.string().max(255),
      port: z.number().min(1).max(65535),
      password: z.string().max(255),
    }).optional(),
  }).optional(),

  autoStart: z.boolean(),
});
