import AppInput from "@/components/forms/AppInput";
import AppSelect from "@/components/forms/AppSelect";
import AppTextArea from "@/components/forms/AppTextArea";
import { SiteHeader } from "@/components/layouts/site-header";
import { tryCatch } from "@/helpers/try-catch";
import { useAccountStore } from "@/hooks/store/useAccountStore";
import usePlanUtils from "@/hooks/usePlansUtils";
import type { IOption } from "@/types/Option";
import { Button, Card, CardBody, CardHeader, Chip, cn, Code, Divider, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner, useDisclosure } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon, TrashIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import useSWR from "swr";
import type { IPlan } from "@/types/Plan";
import { IApiEndpoint } from "@/types/Api";
import { swrFetcher } from "@/lib/api-client";
import AppRadioGroup from "@/components/forms/AppRadioGroup";
import { generatePaymentLink, truncateLink } from "@/lib/utils";
import AppIconCopyBtn from "@/components/AppIconCopyBtn";

interface PlanCardProps {
	title: string;
	chipText?: string;
	price: string;
	text: string;
	subText?: string;
	cardBgColor?: string;
	features: string[];
	planData: IPlan;
}

const planFeatsSchema = z.object({
	text: z.string().min(1, "Type something on feature"),
});

const planFormSchema = z.object({
	title: z.string().min(1, "Title is required"),
	tag: z.string(),
	description: z.string().min(1, "Plan description is required"),
	text: z.string(),
	price: z.coerce.number().min(0, "Price must be positive"),
	paymentPlan: z.string().min(1, "Choose payment plan"),
	features: z.array(planFeatsSchema).min(1, "Have atleast one feature for the plan"),
});

const paymentOptions = [
	{ label: "Weekly", value: "week" },
	{ label: "Monthly", value: "month" },
	{ label: "Annually", value: "year" },
] satisfies IOption[];

const PlansPage = () => {
	const { account } = useAccountStore();
	const { data: plans, isLoading, mutate } = useSWR<IPlan[]>(!account ? undefined : [`${IApiEndpoint.GET_PLANS_BY_ACCOUNT}/${account?._id}`], swrFetcher);
	return (
		<>
			<SiteHeader title="Plans" />
			<div className="pt-3 px-3 space-y-1 pb-6">
				<div className="flex items-center justify-between">
					<h1 className="font-semibold text-xl">Manage your payment plans here</h1>
					<NewPlanModal refetch={mutate} />
				</div>
				<p className="text-gray-600 text-sm">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Molestias, ea?</p>
			</div>
			<div className="mt-6 px-3 space-y-4 mb-4">
				{isLoading && (
					<div className="flex items-center justify-center">
						<Spinner color="secondary" size="lg" />
					</div>
				)}
				{plans &&
					plans.map((plan) => (
						<PlanCard
							key={plan._id}
							title={plan.title}
							chipText={plan?.tag}
							text={plan?.description}
							subText={plan?.text}
							price={`$${plan?.price}/${plan.paymentPlan}`}
							features={plan?.features}
							planData={plan}
						/>
					))}
			</div>
		</>
	);
};

const PlanCard = ({ title, chipText, price, text, subText, cardBgColor = "bg-[#EED2AD]", features, planData }: PlanCardProps) => {
	return (
		<Card className={cn("px-5 py-4", cardBgColor)}>
			<CardHeader className="gap-5">
				<h1 className="text-sm">{title}</h1>
				{chipText && (
					<Chip variant="bordered" size="sm" classNames={{ content: "text-sm" }}>
						<p className="text-sm">{chipText}</p>
					</Chip>
				)}
			</CardHeader>
			<CardBody>
				<div className="grid grid-cols-1 md:grid-cols-8 gap-5">
					<div className="col-auto md:col-span-3">
						<div className="space-y-5">
							<h1 className="text-xl text-saastain-green font-bold">{price}</h1>
							<p className="text-gray-700 text-sm w-4/5">{text}</p>
							{subText && <p className="text-sm font-extralight italic">{subText}</p>}
							<CreatePaymentLinkModal plan={planData} />
						</div>
					</div>
					<div className="col-auto md:col-span-5">
						<div className="grid grid-cols-2 gap-3">
							{features.map((feat, idx) => (
								<div key={idx} className="flex gap-2 items-center">
									<div className="size-7 border border-black flex items-center justify-center rounded-full">
										<CheckIcon className="w-4 h-4" />
									</div>
									<p className="text-sm">{feat}</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</CardBody>
		</Card>
	);
};

const NewPlanModal = ({ refetch }: { refetch?: VoidFunction }) => {
	const { account } = useAccountStore();
	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
	const [loading, setLoading] = useState<boolean>(false);

	const formMethods = useForm<z.input<typeof planFormSchema>>({
		resolver: zodResolver(planFormSchema),
		defaultValues: {
			title: "",
			description: "",
			text: "",
			features: [{ text: "" }],
			tag: "",
			price: 1,
			paymentPlan: "month",
		},
	});

	const {
		handleSubmit,
		formState: { errors: formErrors },
		control,
		reset,
	} = formMethods;

	const { fields, append, remove } = useFieldArray({ control, name: "features" });

	const { createPlan } = usePlanUtils();

	const onSubmit = handleSubmit(async (data) => {
		const info = {
			...data,
			features: data.features.map((feat) => feat.text),
			account: account?._id!,
			price: Number(data.price),
		};

		const { data: resp, error } = await tryCatch(createPlan(info));

		if (error) {
			toast.error("Unable to create the plan");
			setLoading(false);
			return;
		}

		if (resp?.status === "success") {
			toast.error("Plan created successfully");
			reset();
			setLoading(false);
			refetch?.();
			onClose();
		} else {
			toast.error("Unable to create the plan");
			setLoading(false);
		}
	});

	return (
		<>
			<Button color="secondary" onPress={onOpen}>
				New Plan
			</Button>
			<Modal size="2xl" isOpen={isOpen} onOpenChange={onOpenChange}>
				<ModalContent className="font-nunito">
					{(onClose) => (
						<FormProvider {...formMethods}>
							<form onSubmit={onSubmit}>
								<ModalHeader className="">Setup New Plan</ModalHeader>
								<ModalBody>
									<div className="grid grid-cols-2 gap-3">
										<AppInput label={"Title"} placeholder="Starter plan" labelPlacement="inside" name="title" control={control} error={formErrors.title} />
										<AppInput label={"Tag (optional)"} placeholder="Best Plan" labelPlacement="inside" name="tag" control={control} error={formErrors.tag} />
										<AppTextArea label="Description" placeholder="Type something ..." labelPlacement="inside" name="description" control={control} error={formErrors.description} />
										<AppTextArea label="Plan ideal text (optional)" placeholder="e.g. Ideal for small businesses" labelPlacement="inside" name="text" control={control} error={formErrors.text} />
										<AppInput label={"Price"} placeholder="e.g. 1" labelPlacement="inside" name="price" control={control} error={formErrors.price as any} type="number" />
										<AppSelect label="Payment Plan" placeholder="Choose ..." options={paymentOptions} name="paymentPlan" control={control} error={formErrors.paymentPlan} />
									</div>
									<Divider />
									<p>Features</p>
									{fields.map((feat, idx) => (
										<div key={feat.id} className="flex items-baseline gap-2">
											<AppInput
												label={`Feature ${idx + 1}`}
												placeholder={"Type something"}
												labelPlacement="inside"
												name={`features.${idx}.text`}
												control={control}
												error={formErrors?.features?.[idx]?.text}
											/>
											{fields.length > 1 && (
												<Button type="button" size="sm" isIconOnly color="danger" onPress={() => remove(idx)}>
													<TrashIcon className="w-5 h-5" />
												</Button>
											)}
										</div>
									))}
									<div className="">
										<Button onPress={() => append({ text: "" })} color="secondary" size="sm">
											Add another feature
										</Button>
									</div>
								</ModalBody>
								<ModalFooter>
									<Button type="button" onPress={onClose}>
										Close
									</Button>
									<Button color="secondary" type="submit" isLoading={loading} isDisabled={loading}>
										Save
									</Button>
								</ModalFooter>
							</form>
						</FormProvider>
					)}
				</ModalContent>
			</Modal>
		</>
	);
};

const CreatePaymentLinkModal = ({ plan }: { plan: IPlan }) => {
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const { account } = useAccountStore();
	const [paymentType, setPaymentType] = useState<string>("one-time");

	const options = [
		{ label: "One time payment", value: "one-time" },
		{ label: "Recurring Payment", value: "recurring" },
	] satisfies IOption[];

	const paymentLink = useMemo(() => {
		if (paymentType) {
			return generatePaymentLink(account?.slug!, plan?.uniqueId, paymentType as any);
		}
		return "";
	}, [paymentType]);

	return (
		<>
			<Button color="secondary" onPress={onOpen}>
				Create Payment Link
			</Button>
			<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
				<ModalContent className="font-nunito">
					{(onClose) => (
						<>
							<ModalHeader>Generate a payment link for {plan.title}</ModalHeader>
							<ModalBody>
								<AppRadioGroup label="Choose type of payment" options={options} value={paymentType} setValue={setPaymentType} />
								<div className="w-full space-y-2">
									{paymentLink && (
										<Code className="w-full text-xs break-all" size="sm">
											{truncateLink(paymentLink, 53)}
										</Code>
									)}
									{paymentLink && <AppIconCopyBtn link={paymentLink} />}
								</div>
							</ModalBody>
							<ModalFooter>
								<Button onPress={onClose}>Close</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</>
	);
};

export default PlansPage;
