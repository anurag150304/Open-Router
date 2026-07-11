import type { App } from "primary/app";
import { treaty } from "@elysia/eden";

export const service = treaty<App>("localhost:3001");