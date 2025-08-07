import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@heroui/react";
import { FormProvider, useForm } from "react-hook-form";
import AppInput from "../forms/AppInput";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import AppSwitch from "../forms/AppSwitch";
import { useState } from "react";
import useAccountUtils from "@/hooks/useAccountUtils";
import { tryCatch } from "@/helpers/try-catch";
import { toast } from "sonner";
import { useAccountStore } from "@/hooks/store/useAccountStore";
import { useAccount } from "wagmi";

const formObject = z.object({
	username: z.string().min(1, "Your preffered username"),
	tg_username: z.string(),
	isProvider: z.boolean(),
});

const GetStartedModal = () => {
	const { isOpen, onClose, onOpenChange, onOpen } = useDisclosure();
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const { createAccount } = useAccountUtils();
	const account = useAccount();
	const { setAccount } = useAccountStore();

	const formMethods = useForm<z.infer<typeof formObject>>({
		resolver: zodResolver(formObject),
		defaultValues: {
			username: "",
			tg_username: "",
			isProvider: false,
		},
	});

	const {
		handleSubmit,
		formState: { errors: formErrors },
		control,
	} = formMethods;

	const onSubmit = handleSubmit(async (data) => {
		const info = {
			...data,
			wallet_address: account?.address!,
		};
		setIsLoading(true);
		const { data: resp, error } = await tryCatch(createAccount(info));

		if (error) {
			toast.error("Unable to create an account");
			setIsLoading(false);
			return;
		}

		if (resp?.status === "success") {
			toast.success("Account created successfully");
			onClose();
			setAccount(resp.data!);
			setIsLoading(false);
		} else {
			toast.error("Unable to create an account");
			setIsLoading(false);
		}
	});
	return (
		<>
			<Button onPress={onOpen}>Get Started</Button>
			<Modal isOpen={isOpen} onOpenChange={onOpenChange} >
				<ModalContent className="font-nunito">
					{(onClose) => (
						<FormProvider {...formMethods}>
							<form onSubmit={onSubmit}>
								<ModalHeader className="flex flex-col gap-1">Get Started</ModalHeader>
								<ModalBody>
									<AppInput label={"Username"} control={control} error={formErrors.username} name="username" placeholder="drsean" labelPlacement="inside" />
									<AppInput label={"Telegram Username"} control={control} error={formErrors.tg_username} name="tg_username" placeholder="drsean" labelPlacement="inside" />
									<AppSwitch label="Are your a provider" name="isProvider" control={control} error={formErrors.isProvider} />
								</ModalBody>
								<ModalFooter>
									<Button color="danger" variant="flat" type="button" onPress={onClose}>
										Close
									</Button>
									<Button color="secondary" type="submit" isLoading={isLoading} isDisabled={isLoading}>
										Submit
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

export default GetStartedModal;
