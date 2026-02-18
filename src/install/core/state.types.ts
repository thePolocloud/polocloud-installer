import type z from "zod/v4";
import type { InstallStateSchema } from "./state.schema.js";

export type InstallState = z.infer<typeof InstallStateSchema>;

export type DatabaseState = NonNullable<z.infer<typeof InstallStateSchema>["database"]>;
export type DatabaseCredentials = NonNullable<DatabaseState["credentials"]>;

export type SqlCredentials = {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
};

export type MongodbCredentials = {
  host: string;
  port: number;
  username: string;
  password: string;
};

export type RedisState = NonNullable<z.infer<typeof InstallStateSchema>["redis"]>;
export type RedisCredentials = NonNullable<RedisState["credentials"]>;