export type DetectedDatabase = {
    exists: boolean;
    port?: number;
    label?: string;
    type?: "sql" | "nosql";
};
