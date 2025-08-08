export interface ISubscription {
	_id: string;
	payer: string | `0x${string}`
	provider: string;
	amount: number;
	token: string;
	dueDate: Date;
	isRecurring: boolean;
	interval: number;
	active: boolean;
	createdAt: string;
	updatedAt: string;
	executed: boolean;
	tg_name?: string;
	tg_id?: string;
    tx?: string;
}
