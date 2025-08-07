export interface IAccount {
	_id: string;
	username?: string;
	isProvider: boolean;
	tg_username?: string;
	wallet_address: string;
	createdAt: string;
	updatedAt: string;
	slug: string;
}
