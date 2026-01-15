"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { useApiClient } from "./api-client-provider";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Pencil } from "lucide-react";
import { components } from "@/lib/api/types/schema";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Separator } from "./ui/separator";
import { Link } from "@/i18n/navigation";
import { Spinner } from "./ui/spinner";
import { ValuationTable } from "./valuation-table";

export type PorfolioTilesProps = {
    page: number;
    itemsPerPage: number;
    className?: string;
    onEditClick?: (portfolio: components["schemas"]["PortfolioResponse"]) => void;
}

export function PortfolioTiles({ page, itemsPerPage, className, onEditClick }: PorfolioTilesProps) {
    const t = useTranslations("PortfolioTiles");
    const client = useApiClient();
    const locale = useLocale();

    const portfoliosQuery = useQuery({
        queryKey: ["portfolios", page, itemsPerPage],
        queryFn: () => client.GET('/portfolios', {
            params: {
                query: {
                    page: page,
                    items_per_page: itemsPerPage
                }
            }
        })
    });

    const valuationQueries = useQueries({
        queries: portfoliosQuery.data?.data?.items.map(p => {
            return {
                queryKey: ["valuation", p.id],
                queryFn: () => client.GET("/portfolios/{portfolio_id}/valuation", {
                    params: {
                        path: {
                            portfolio_id: p.id
                        }
                    }
                })
            }
        }) || [],
    });

    if (portfoliosQuery.isLoading) {
        return (
            <div className={cn("flex grow items-center justify-center", className)}>
                <Spinner className="size-8" />
            </div>
        )
    }

    if (portfoliosQuery.data?.data?.items.length === 0) {
        return (
            <div className={cn("flex grow items-center justify-center", className)}>
                <p>{t("no_results")}</p>;
            </div>
        );
    }

    return (
        <div className={cn("flex flex-row flex-wrap gap-4", className)}>
            {portfoliosQuery.data?.data?.items.map((p, i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row justify-between items-center">
                        <CardTitle className="text-3xl">{p.name}</CardTitle>
                        <Button
                            variant="secondary"
                            className="cursor-pointer rounded-md text-3xl"
                            onClick={() => {
                                if (onEditClick)
                                    onEditClick(p);
                            }}
                        >
                            <Pencil />
                        </Button>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex flex-row gap-2 items-center justify-center self-center">
                            <Dialog>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <DialogTrigger>
                                            <Badge className="text-2xl p-4 self-center bg-accent text-accent-foreground cursor-pointer">
                                                ${valuationQueries.find(q => q.data?.data?.portfolio_id === p.id)?.data?.data?.total_value.toFixed(2)} USD
                                            </Badge>
                                        </DialogTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{t("list_valuation_lines")}</p>
                                    </TooltipContent>
                                </Tooltip>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{t("valuation_lines")}</DialogTitle>
                                        <DialogDescription>
                                            {t("valuation_lines_description")}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <Separator />
                                    <ValuationTable valuation={valuationQueries.find(q => q.data?.data?.portfolio_id === p.id)?.data?.data} />
                                </DialogContent>
                            </Dialog>

                        </div>
                        <Button className="cursor-pointer" asChild>
                            <Link href={`/app/portfolios/${p.id}`}>
                                {t("assets")}
                            </Link>
                        </Button>

                        <p className="text-muted-foreground">
                            {t("created_at")} : {new Date(p.created_at).toLocaleString(locale)}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export function PortfolioTile() {

}