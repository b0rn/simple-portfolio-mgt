import { useQuery } from "@tanstack/react-query";
import { Client } from "openapi-fetch";
import { paths } from "./types/schema";

export function useMe(client : Client<paths>) {
    return useQuery({
        queryKey : ["me"],
        queryFn : () => client.GET("/auth/me"),
        staleTime : 5 * 60 * 1000
    });
}