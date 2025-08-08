import { Router } from "express";
import paymentController from "src/controllers/payment.controller";
const paymentRouter = Router();

paymentRouter.get("/get/by-pay-to/:pay_to", paymentController.getPaymentsByPayTo);
paymentRouter.get("/get/payment-reqs", paymentController.getPlanPaymentRequirements);
paymentRouter.get("/pay-plan", paymentController.makePlanPayments);
paymentRouter.get("/get/instant/payment-reqs", paymentController.getInstantPaymentsRequirements);
paymentRouter.get("/pay-instant", paymentController.payInstantPayment);
paymentRouter.get("/pay-document", paymentController.payPremiumDocument);
paymentRouter.get("/pay-axios", paymentController.axiosTestRun);

export default paymentRouter;
