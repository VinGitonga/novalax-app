import { NOOP } from "@/helpers";
import { Input, type InputProps } from "@heroui/react";
import { Eye, EyeOff } from "lucide-react";
import { type ReactNode, useState } from "react";
import { type Control, Controller, type FieldError } from "react-hook-form";

interface AppInputProps extends InputProps {
	name?: string;
	setValue?: (value: string) => void;
	isPassword?: boolean;
	isRequired?: boolean;
	error?: FieldError;
	helperText?: string;
	control?: Control<any>;
	isDisabled?: boolean;
	baseInputClassName?: string;
	startContent?: ReactNode;
	endContent?: ReactNode;
	labelClassName?: string;
}

const AppInput = ({
	name,
	label,
	value,
	placeholder,
	onChange,
	isPassword = false,
	isRequired = false,
	setValue = NOOP,
	error,
	helperText,
	type,
	control,
	isDisabled = false,
	baseInputClassName,
	startContent,
	onBlur,
	labelClassName,
	...props
}: AppInputProps) => {
	const [show, setShow] = useState(false);
	const toggleShow = () => setShow(!show);

	const passwordType = isPassword || type === "password";

	return control ? (
		<Controller
			control={control}
			name={name!}
			render={({ field: { onChange: onControlledChange, value: changedValue } }) => (
				<Input
					label={label}
					labelPlacement="outside"
					value={changedValue}
					placeholder={placeholder}
					onChange={onControlledChange}
					onValueChange={setValue}
					startContent={startContent}
					variant="bordered"
					type={type === "password" ? (show ? "text" : "password") : type}
					endContent={
						passwordType ? (
							<button className="focus:outline-none" type="button" onClick={toggleShow}>
								{show ? <EyeOff className="text-lg text-default-400 pointer-events-none" /> : <Eye className="text-lg text-default-400 pointer-events-none" />}
							</button>
						) : null
					}
					description={helperText}
					isInvalid={!!error}
					errorMessage={error?.message}
					size="md"
					isDisabled={isDisabled}
					classNames={{
						base: baseInputClassName,
						label: labelClassName,
					}}
					onBlur={onBlur}
					{...props}
				/>
			)}
		/>
	) : (
		<Input
			label={label}
			labelPlacement="outside"
			value={value}
			placeholder={placeholder}
			onChange={onChange}
			onValueChange={setValue}
			startContent={startContent}
			variant="bordered"
			type={type === "password" ? (show ? "text" : "password") : type}
			endContent={
				passwordType ? (
					<button className="focus:outline-none" type="button" onClick={toggleShow}>
						{show ? <EyeOff className="text-lg text-default-400 pointer-events-none" /> : <Eye className="text-lg text-default-400 pointer-events-none" />}
					</button>
				) : null
			}
			description={helperText}
			isInvalid={control ? !!error : !value && isRequired}
			errorMessage={control ? error?.message : !value && isRequired ? `${label} is required` : undefined}
			size="md"
			isDisabled={isDisabled}
			classNames={{
				base: baseInputClassName,
				label: labelClassName,
			}}
			onBlur={onBlur}
			{...props}
		/>
	);
};

export default AppInput;
