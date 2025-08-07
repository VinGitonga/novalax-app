import { IPayment, Payment } from "src/models/payment.model";

type TCreatePayment = Omit<IPayment, "createdAt" | "updatedAt">;

async function createPaymentItem(body: TCreatePayment) {
	const payment = new Payment(body);

	return await payment.save();
}

async function getPaymentsByPayTo(payTo: string) {
	return await Payment.find({
		payTo: {
			$regex: `^${payTo}$`,
			$options: "i",
		},
	}).lean();
}

export default { createPaymentItem, getPaymentsByPayTo };
