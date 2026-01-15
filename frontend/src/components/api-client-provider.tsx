"use client";

import React, { createContext, useContext, useMemo } from "react";
import type { Client } from "openapi-fetch";
import type { paths } from "@/lib/api/types/schema";
import { getClient } from "@/lib/api/client";

const ApiClientContext = createContext<Client<paths> | null>(null);

export function ApiClientProvider({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => getClient(), []);
  return (
    <ApiClientContext.Provider value={client}>
      {children}
    </ApiClientContext.Provider>
  );
}

export function useApiClient(): Client<paths> {
  const client = useContext(ApiClientContext);
  if (!client) {
    throw new Error("useApiClient must be used within an ApiClientProvider");
  }
  return client;
}
