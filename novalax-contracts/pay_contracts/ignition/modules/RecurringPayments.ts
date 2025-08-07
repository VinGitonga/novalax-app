import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const RecurringPaymentsModule = buildModule("RecurringPaymetsModule", (m) => {
	const recurringPaymentsContract = m.contract("RecurringPayments", []);

  return { recurringPaymentsContract };
});

export default RecurringPaymentsModule;
