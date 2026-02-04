"use client";

import { useApiClient } from "@/components/api-client-provider";
import { Spinner } from "@/components/ui/spinner";
import { parsePositiveInt } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { use, useState } from "react";
import { CircleQuestionMark, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PortfolioForm, PortfolioFormData } from "@/components/portfolio-form";
import { components } from "@/lib/api/types/schema";
import { useRouter } from "@/i18n/navigation";
import { AssetForm } from "@/components/asset-form";
import { AssetTable } from "@/components/asset-table";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { ValuationTable } from "@/components/valuation-table";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const t = useTranslations("Portfolio");
    const client = useApiClient();
    const queryClient = useQueryClient();
    const router = useRouter();
    const locale = useLocale();
    const searchParams = useSearchParams();
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const itemsPerPage = parsePositiveInt(searchParams.get("itemsPerPage"), 5);
    const { id } = use(params);
    const idNumber = Number(id);
    if (!Number.isInteger(idNumber)) {
        return (
            <div className="flex grow justify-center items-center">
                <h1 className="text-2xl">{t("not_found")}</h1>
            </div>
        )
    }

    const [editPortfolioFormData, setEditPortfolioFormData] = useState<PortfolioFormData | null>(null);
    const [editPortfolioFormIsOpen, setEditPortfolioFormIsOpen] = useState(false);
    const [deleteConfirmationDialogIsOpen, setDeleteConfirmationDialogIsOpen] = useState(false);
    const [createAssetDialogIsOpen, setCreateAssetDialogIsOpen] = useState(false);

    const portfolioQuery = useQuery({
        queryKey: ["portfolio", idNumber],
        queryFn: () => client.GET("/portfolios/{portfolio_id}", {
            params: {
                path: {
                    portfolio_id: idNumber
                }
            }
        })
    });
    const portfolioDeleteMutation = useMutation({
        mutationFn: ({ id }: { id: number }) => client.DELETE("/portfolios/{portfolio_id}", {
            params: {
                path: {
                    portfolio_id: id
                }
            }
        }),
        onSuccess: ({ data, response, error }) => {
            if (response.status === 500) {
                toast.error(t("error_500"));
            } else if (response.status === 204) {
                setDeleteConfirmationDialogIsOpen(false);
                router.push("/app/portfolios", { locale });
            }
        }
    })
    const valuationQuery = useQuery({
        queryKey: ["valuation", idNumber],
        queryFn: () => client.GET("/portfolios/{portfolio_id}/valuation", {
            params: {
                path: {
                    portfolio_id: idNumber
                }
            }
        })
    });

    const handleDeleteTask = () => {
        if (!portfolioQuery.data?.data) return;
        portfolioDeleteMutation.mutate({ id: portfolioQuery.data.data.id });
    }

    if (portfolioQuery.isLoading) {
        return (
            <div className="flex grow justify-center items-center">
                <Spinner className="size-8" />
            </div>
        )
    }

    return (
        <div className="flex flex-col grow gap-2">
            <div className="flex flex-col md:flex-row gap-2 items-center justify-between">
                <div className="flex flex-col md:flex-row gap-2 items-center">
                    <h1 className="text-2xl font-extrabold">{portfolioQuery.data?.data?.name}</h1>
                    <Dialog>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <DialogTrigger>
                                    <Badge className="text-2xl bg-accent text-accent-foreground p-4 cursor-pointer">
                                        ${valuationQuery.data?.data?.total_value.toFixed(2) || 0} USD
                                    </Badge>
                                </DialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t("list_valuation_lines")}</p>
                            </TooltipContent>
                        </Tooltip>
                        <DialogContent className="overflow-y-scroll max-h-[90vh] w-full">
                            <DialogHeader>
                                <DialogTitle>{t("valuation_lines")}</DialogTitle>
                                <DialogDescription>
                                    {t("valuation_lines_description")}
                                </DialogDescription>
                            </DialogHeader>
                            <Separator />
                            <ValuationTable valuation={valuationQuery.data?.data} />
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="flex flex-row items-center gap-2">
                    <Dialog open={editPortfolioFormIsOpen} onOpenChange={(open) => {
                        if (!open) {
                            const windowWithCapture = window as Window & { captureEditPortfolioFormData?: () => PortfolioFormData };
                            if (windowWithCapture.captureEditPortfolioFormData)
                                windowWithCapture.captureEditPortfolioFormData();
                        }
                        setEditPortfolioFormIsOpen(open);
                    }}>
                        <DialogTrigger asChild>
                            <Button className="cursor-pointer">
                                <Pencil size={30} />
                                <span className="hidden md:inline">{t("edit")}</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="overflow-y-scroll max-h-[90vh]">
                            <DialogHeader>
                                <DialogTitle>{t("edit_portfolio")}</DialogTitle>
                                <DialogDescription>{t("edit_portfolio_description")}</DialogDescription>
                            </DialogHeader>
                            <PortfolioForm
                                mode="edit"
                                initialFormData={editPortfolioFormData}
                                onFormDataChange={setEditPortfolioFormData}
                                portfolio={portfolioQuery.data?.data}
                                onUpdated={(portfolio?: components["schemas"]["PortfolioResponse"]) => {
                                    queryClient.invalidateQueries({
                                        queryKey: ["portfolios"]
                                    });
                                    if (portfolio) {
                                        queryClient.invalidateQueries({
                                            queryKey: ["portfolio", portfolio.id]
                                        });
                                    }
                                    setEditPortfolioFormData(null);
                                    setEditPortfolioFormIsOpen(false);
                                }}
                            />
                        </DialogContent>
                    </Dialog>
                    <Dialog open={deleteConfirmationDialogIsOpen} onOpenChange={setDeleteConfirmationDialogIsOpen}>
                        <DialogTrigger asChild>
                            <Button variant="destructive" className="cursor-pointer">
                                <Trash2 size={30} />
                                <span className="hidden md:inline">{t("delete")}</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{t("delete_portfolio_confirmation_title")}</DialogTitle>
                                <DialogDescription>
                                    {t("delete_portfolio_confirmation_description", { portfolioTitle: portfolioQuery.data?.data?.name || "" })}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" className="cursor-pointer" onClick={() =>
                                    setDeleteConfirmationDialogIsOpen(false)
                                }>
                                    {t("cancel")}
                                </Button>
                                <Button variant="destructive" onClick={handleDeleteTask} disabled={portfolioDeleteMutation.isPending} className="cursor-pointer flex-row items-center">
                                    {portfolioDeleteMutation.isPending ? <Spinner className="mr-2" /> : null}
                                    {t("delete")}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <div>
                <div className="flex flex-row items-center justify-between">
                    <h2 className="text-xl font-bold">{t("assets")}</h2>
                    <Dialog open={createAssetDialogIsOpen} onOpenChange={setCreateAssetDialogIsOpen}>
                        <DialogTrigger asChild>
                            <Button className="cursor-pointer">
                                <Plus size={30} />
                                <span className="hidden md:inline">{t("add_asset")}</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="overflow-y-scroll max-h-[90vh]">
                            <DialogTitle>{t("add_asset")}</DialogTitle>
                            <DialogDescription>{t("add_asset_description")}</DialogDescription>
                            <AssetForm
                                portfolioId={idNumber}
                                onCreated={() => {
                                    setCreateAssetDialogIsOpen(false);
                                }}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
                <AssetTable
                    portfolioId={idNumber}
                    page={page}
                    itemsPerPage={itemsPerPage}
                    childIfNoResults={
                        <div className="flex grow items-center justify-center">
                            <Button className="text-xl p-4 cursor-pointer" onClick={() => setCreateAssetDialogIsOpen(true)}>
                                {t("add_asset")}
                            </Button>
                        </div>
                    }
                />
            </div>
        </div>
    );
}