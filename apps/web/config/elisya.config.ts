import type { App } from "primary/app";
import { treaty } from "@elysia/eden";

export const service = treaty<App>("http://localhost:3001", {
  fetch: {
    credentials: "include",
  },
});
