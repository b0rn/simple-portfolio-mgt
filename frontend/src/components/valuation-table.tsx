import { components } from "@/lib/api/types/schema";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { useTranslations } from "next-intl";
import { Separator } from "./ui/separator";
import { CircleEqual, DollarSign, X } from "lucide-react";

export type ValuationTableProps = {
    valuation?: components["schemas"]["PortfolioValuationResponse"];
}

export function ValuationTable({ valuation }: ValuationTableProps) {
    const t = useTranslations("ValuationTable");
    return (
        <div className="flex flex-col gap-2">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-center">{t("symbol")}</TableHead>
                        <TableHead className="text-center">{t("price")}</TableHead>
                        <TableHead className="text-center">{t("quantity")}</TableHead>
                        <TableHead className="text-center">{t("valuation")}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        valuation ?
                            valuation.lines.map((l, i) => (
                                <TableRow key={i}>
                                    <TableCell>
                                        <p className="font-extrabold bg-accent text-accent-foreground p-2 rounded-md flex flex-row justify-center">
                                            {l.symbol}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-row items-center justify-center">
                                            <DollarSign size={18} />
                                            <p className="font-bold">
                                                {l.price.toFixed(2)}
                                            </p>
                                        </div>

                                    </TableCell>
                                    <TableCell className="text-center">{l.quantity}</TableCell>
                                    <TableCell>
                                        <div className="font-extrabold bg-primary text-primary-foreground p-2 rounded-md flex flex-row justify-center items-center">
                                            <DollarSign size={18} />
                                            <p>
                                                {l.value.toFixed(2)} USD
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                            : <TableRow><TableCell colSpan={4} className="text-center">{t("no_data")}</TableCell></TableRow>
                    }
                </TableBody>
            </Table>
            {
                valuation?.unknown_symbols.length !== undefined && valuation.unknown_symbols.length > 0 && (
                    <div className="flex grow items-center justify-center">
                        <p className="font-bold">{t("unknown_symbols")}</p><p> : {valuation.unknown_symbols.join(',')}</p>
                    </div>
                )
            }
        </div>

    );
}