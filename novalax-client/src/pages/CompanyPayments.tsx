import { SiteHeader } from "@/components/layouts/site-header";
import type { IAppTableColumn } from "@/components/table/AppTable";
import AppTable from "@/components/table/AppTable";
import { useAccountStore } from "@/hooks/store/useAccountStore";
import { swrFetcher } from "@/lib/api-client";
import { formatAmount } from "@/lib/utils";
import { IApiEndpoint } from "@/types/Api";
import type { AppKey } from "@/types/Global";
import type { IPayment } from "@/types/Payment";
import { Button } from "@heroui/react";
import { format } from "date-fns";
import { ExternalLinkIcon } from "lucide-react";
import { useCallback } from "react";
import useSWR from "swr";

function sliceAddress(address: string) {
	return `${address.slice(0, 10)}...${address.slice(-8)}`;
}

const columns = [
	{
		name: "Payer",
		uid: "payer",
	},
	{
		name: "Amount",
		uid: "amount",
	},
	{
		name: "Transaction",
		uid: "transaction",
	},
	{
		name: "Done On",
		uid: "createdAt",
	},
] satisfies IAppTableColumn[];

const CompanyPayments = () => {
	const { account } = useAccountStore();
	const { data: payments, isLoading } = useSWR<IPayment[]>(!account ? null : [`${IApiEndpoint.GET_PAYMENTS_BY_PAY_TO}/${account.wallet_address}`], swrFetcher);

	const renderCell = useCallback((item: IPayment, columnKey: AppKey) => {
		switch (columnKey) {
			case "payer":
				return <span>{sliceAddress(item.payer)}</span>;
			case "amount":
				return <span>{formatAmount(String(item.amount))}</span>;
			case "transaction":
				return (
					<div className="flex items-center gap-3">
						<p>{sliceAddress(item.transaction)}</p>
						<Button isIconOnly size="sm" color="secondary" variant="bordered" onPress={() => window.open(`https://hashscan.io/testnet/transaction/${item.transaction}`)}>
							<ExternalLinkIcon className="w-4 h-4" />
						</Button>
					</div>
				);
			case "createdAt":
				return <span>{format(new Date(item.createdAt), "PPPp")}</span>;
			default:
				return null;
		}
	}, []);
	return (
		<>
			<SiteHeader title="Payments" />
			<div className="pt-3 px-3 space-y-1 pb-6">
				<div className="flex items-center justify-between">
					<h1 className="font-semibold text-xl">View all payments made to you business</h1>
					{/* <NewPlanModal refetch={mutate} /> */}
				</div>
				<p className="text-gray-600 text-sm">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Molestias, ea?</p>
			</div>
			<div className="mt-6 px-3 space-y-4 mb-4">
				<AppTable<IPayment> title={"Payments"} data={payments ?? []} headerColumns={columns} count={payments?.length ?? 0} isLoading={isLoading} renderCell={renderCell} />
			</div>
		</>
	);
};

export default CompanyPayments;
