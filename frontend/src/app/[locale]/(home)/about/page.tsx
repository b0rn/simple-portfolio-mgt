import { getTranslations } from "next-intl/server";

export default async function Page() {
    const t = await getTranslations("About");

    return (
        <div className="flex flex-col gap-4 grow justify-center items-center">
            <h1 className="text-2xl font-extrabold">{t("title")}</h1>
            <p className="w-full md:w-xl text-justify">
                {t.rich("description", {
                    bold: (chunks) => <span className="font-bold">{chunks}</span>
                })}
            </p>
        </div>
    )
}