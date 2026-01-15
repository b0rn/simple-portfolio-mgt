import createClient, { Client } from "openapi-fetch";
import type { paths } from "./types/schema";
import { emitUnauthorized } from "@/lib/auth/events";

export function getClient(): Client<paths> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
  }

  const client =  createClient<paths>({ baseUrl, credentials : "include" });

  client.use({
    async onResponse({ response }) {
      if(response.status === 401) {
        emitUnauthorized();
      }
    },
  })

  return client;
}
