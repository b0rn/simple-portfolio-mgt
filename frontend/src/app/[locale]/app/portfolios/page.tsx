"use client";

import { Button } from "@/components/ui/button"
import { parsePositiveInt } from "@/lib/utils";
import { PortfolioTiles } from "@/components/portfolio-tiles";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { components } from "@/lib/api/types/schema";
import { PlusIcon, Trash2, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { PortfolioForm, PortfolioFormData } from "@/components/portfolio-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/components/api-client-provider";
import { toast } from "sonner";

export default function Page() {
    const t = useTranslations("Portfolios");
    const client = useApiClient();
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const itemsPerPage = parsePositiveInt(searchParams.get("itemsPerPage"), 15);

    const [portfolioFormIsOpen, setPortfolioFormIsOpen] = useState(false);
    const [portfolioToEdit, setPortfolioToEdit] = useState<components["schemas"]["PortfolioResponse"] | null>(null);
    const [deleteConfirmationDialogIsOpen, setDeleteConfirmationDialogIsOpen] = useState(false);
    const [formData, setFormData] = useState<PortfolioFormData | null>(null);

    const portfolioDeleteMutation = useMutation({
        mutationFn: ({ id }: { id: number }) => client.DELETE("/portfolios/{portfolio_id}", {
            params: {
                path: {
                    portfolio_id: id
                }
            }
        }),
        onSuccess: ({ data, response, error }) => {
            if (response.status === 422) {
                toast.error(t("portfolio_delete_failed"))
            } else if (response.status === 500) {
                toast.error(t("portfolio_delete_failed"))
            } else if (response.status === 204) {
                toast.success(t("portfolio_deleted_successfully"));
                queryClient.invalidateQueries({ queryKey: ["portfolios"] });
            }
        },
        onError: () => {
            toast.error(t("portfolio_delete_failed"));
        }
    })

    const handleDeleteTask = () => {
        if (portfolioToEdit) {
            portfolioDeleteMutation.mutate({ id: portfolioToEdit.id });
            setPortfolioFormIsOpen(false);
            setDeleteConfirmationDialogIsOpen(false);
        }
    };

    return (
        <div className="flex flex-col grow mt-4 gap-2">
            <div className="flex flex-row justify-between items-center">
                <h1 className="text-xl">{t("portfolios")}</h1>

                <Dialog open={portfolioFormIsOpen} onOpenChange={(open) => {
                    if (!open) {
                        const windowWithCapture = window as Window & { capturePortfolioFormData?: () => PortfolioFormData };
                        if (windowWithCapture.capturePortfolioFormData) {
                            windowWithCapture.capturePortfolioFormData();
                        }

                        if (portfolioToEdit) {
                            setFormData(null);
                        }
                        setPortfolioToEdit(null);
                    }
                    setPortfolioFormIsOpen(open);
                }}>
                    <DialogTrigger asChild>
                        <Button onClick={() => {
                            setPortfolioToEdit(null);
                            setPortfolioFormIsOpen(true);
                        }}>
                            <PlusIcon className="w-4 h-4" />
                            {t("add")}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="overflow-y-scroll max-h-[90vh]" showCloseButton={false} >
                        <DialogHeader className="flex flex-col">
                            <DialogTitle>{portfolioToEdit ? t("edit_portfolio") : t("create_portfolio")}</DialogTitle>
                            <div className="top-4 right-4 flex flex-row absolute gap-4">
                                {portfolioToEdit && (
                                    <Trash2
                                        className="w-6 h-6 cursor-pointer text-destructive hover:text-destructive/80"
                                        onClick={() => {
                                            setDeleteConfirmationDialogIsOpen(true);
                                        }}
                                    />
                                )}
                                <DialogClose>
                                    <XIcon className="w-6 h-6 cursor-pointer text-muted-foreground" />
                                    <span className="sr-only">{t("close")}</span>
                                </DialogClose>
                            </div>
                            <DialogDescription className="text-muted-foreground">
                                {portfolioToEdit ? t("edit_portfolio_description") : t("create_portfolio_description")}
                            </DialogDescription>
                        </DialogHeader>
                        <Separator />
                        <PortfolioForm
                            mode={portfolioToEdit ? "edit" : "create"}
                            initialFormData={formData}
                            onFormDataChange={setFormData}
                            portfolio={portfolioToEdit}
                            onCreated={() => {
                                queryClient.invalidateQueries({ queryKey: ["portfolios"] });
                                setPortfolioFormIsOpen(false);
                                setFormData(null);
                            }}
                            onUpdated={(portfolio?: components["schemas"]["PortfolioResponse"]) => {
                                queryClient.invalidateQueries({
                                    queryKey: ["portfolios"]
                                });
                                if (portfolio) {
                                    queryClient.invalidateQueries({
                                        queryKey: ["portfolio", portfolio.id]
                                    })
                                }
                                setPortfolioFormIsOpen(false);
                                setFormData(null);
                            }}
                        />
                    </DialogContent>
                </Dialog>

                <Dialog open={deleteConfirmationDialogIsOpen} onOpenChange={setDeleteConfirmationDialogIsOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t("delete_portfolio_confirmation_title")}</DialogTitle>
                            <DialogDescription>
                                {t("delete_portfolio_confirmation_description", { portfolioTitle: portfolioToEdit?.name || "" })}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setDeleteConfirmationDialogIsOpen(false)}>
                                {t("cancel")}
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteTask}>
                                {t("delete")}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            <Separator />
            <div className="flex grow justify-center items-center">
                <PortfolioTiles
                    page={page}
                    itemsPerPage={itemsPerPage}
                    onEditClick={(p) => {
                        setPortfolioToEdit(p);
                        setPortfolioFormIsOpen(true);
                    }}
                />
            </div>
        </div>
    )
}