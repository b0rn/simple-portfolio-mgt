import { LoginForm } from "@/components/login-form";
import { getTranslations } from "next-intl/server";

export default async function Page({ searchParams } : { searchParams : Promise<{[key: string] : string | string[] | undefined}> }) {
    const t = await getTranslations("LoginForm");
    
    const invalidCreds = (await searchParams).invalidCreds;
    let errorTitle : string | undefined, errorDescription : string | undefined;
    if(invalidCreds) {
        errorTitle = t("failed_login")
        errorDescription = t("invalid_credentials")
    }
    return (
        <div className="flex flex-col items-center justify-center p-6 md:p-10 grow">
            <div className="w-full max-w-sm md:max-w-3xl">
                <LoginForm errorTitle={errorTitle} errorDescription={errorDescription} />
            </div>
        </div>
    )
}