"use client";

import { useApiClient } from "@/src/components/api-client-provider";
import { useMe } from "@/lib/api/helper";
import { useRouter } from "@/i18n/navigation";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const client = useApiClient();
    const meQuery = useMe(client);

    if(meQuery.data?.response.status === 200){
        router.replace("/app/portfolios");
    }

    return <>{children}</>
}