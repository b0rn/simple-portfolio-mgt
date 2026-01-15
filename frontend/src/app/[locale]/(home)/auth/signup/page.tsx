import { SignupForm } from "@/components/signup-form";
import { getTranslations } from "next-intl/server";

export default async function Page({ searchParams }: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const t = await getTranslations('SignupForm');
    const queryParams = await searchParams;
    let errorTitle: string | undefined, errorDescription: string | undefined = undefined;
    if (queryParams["weakPassword"] !== undefined) {
        errorTitle = t("signup_failed");
        errorDescription = t("weak_password");
    }

    return (
        <div className="flex flex-col items-center justify-center grow p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-3xl">
                <SignupForm />
            </div>
        </div>
    )
}