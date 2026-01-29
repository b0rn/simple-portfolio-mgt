"use client";

import { useLocale, useTranslations } from "next-intl";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { PaginationItem, Pagination, PaginationContent, PaginationNext, PaginationPrevious, generatePaginationLinks, PaginationLinks } from "@/components/ui/pagination";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "./api-client-provider";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export type AssetTableProps = {
    portfolioId: number;
    page: number;
    itemsPerPage: number;
    childIfNoResults?: React.ReactNode;
}

export function AssetTable({ portfolioId, page, itemsPerPage, childIfNoResults }: AssetTableProps) {
    const t = useTranslations("AssetTable");
    const client = useApiClient();
    const queryClient = useQueryClient();
    const locale = useLocale();
    const assetsQuery = useQuery({
        queryKey: ["assets", portfolioId, page, itemsPerPage],
        queryFn: () => client.GET("/portfolios/{portfolio_id}/assets", {
            params: {
                path: {
                    portfolio_id: portfolioId
                },
                query: {
                    page: page,
                    items_per_page: itemsPerPage
                }
            }
        })
    });
    const assetDeleteMutation = useMutation({
        mutationFn: ({ id }: { id: number }) => client.DELETE("/portfolios/{portfolio_id}/assets/{asset_id}", {
            params: {
                path: {
                    portfolio_id: portfolioId,
                    asset_id: id
                }
            }
        }),
        onSuccess: ({ data, response, error }) => {
            if (response.status === 500) {
                toast.error(t("error_500"));
            } else if (response.status === 204) {
                toast.success(t("delete_success"));
                queryClient.invalidateQueries({
                    queryKey: ["assets", portfolioId]
                });
                queryClient.invalidateQueries({ queryKey: ["valuation", portfolioId], refetchType: "all" });
            }
        },
        onError: () => {
            toast.error(t("error_500"));
        }
    });

    return (
        <div className="flex flex-col gap-4">
            <Table>
                <TableCaption>{t("title")}</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-center">{t("symbol")}</TableHead>
                        <TableHead className="text-center">{t("quantity")}</TableHead>
                        <TableHead className="text-center">{t("created_at")}</TableHead>
                        <TableHead className="text-center">{t("actions")}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        assetsQuery.data?.data?.items.map(asset => (
                            <TableRow key={asset.id}>
                                <TableCell className="text-center">
                                    {asset.symbol}
                                </TableCell>
                                <TableCell className="text-center">
                                    {asset.quantity}
                                </TableCell>
                                <TableCell className="text-center">
                                    {new Date(asset.created_at).toLocaleString(locale)}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-row justify-center">
                                        <Button variant="destructive"
                                            onClick={() => {
                                                assetDeleteMutation.mutate({ id: asset.id });
                                            }}
                                            disabled={assetDeleteMutation.isPending}
                                        >
                                            <Trash2 />
                                        </Button>
                                    </div>

                                </TableCell>
                            </TableRow>
                        ))
                    }
                    {
                        !assetsQuery.data?.data?.items.length ?
                            <TableRow>
                                <TableCell colSpan={4}>{childIfNoResults}</TableCell>
                            </TableRow>
                            : null
                    }
                </TableBody>
            </Table>
            <PaginationLinks
                currentPage={page}
                totalPages={assetsQuery.data?.data?.pagination_response.total_pages ?? 1}
                queryParams={[{ label: "itemsPerPage", value: itemsPerPage.toString() }]}
                showPreviousNext={true}
            />
        </div>
    )
}