"use client";

import { useApiClient } from "@/src/components/api-client-provider";
import { useMe } from "@/lib/api/helper";
import { redirect } from "@/i18n/navigation";
import { useLocale } from "next-intl";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const locale = useLocale();
    const client = useApiClient();
    const meQuery = useMe(client);

    if(meQuery.data?.response.status === 200){
        redirect({href : "/app/portfolios", locale : locale})
    }

    return <>{children}</>
}