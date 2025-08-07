"use client";
import { Textarea } from "@heroui/react";
import type { ReactNode } from "react";
import { type Control, Controller, type FieldError } from "react-hook-form";

interface AppTextAreaProps {
	name?: string;
	label: string;
	value?: string;
	setValue?: (value: string) => void;
	onChange?: (value: string) => void;
	error?: FieldError;
	helperText?: string;
	control?: Control<any>;
	placeholder?: string;
	startContent?: ReactNode;
	labelPlacement?: "inside" | "outside" | "outside-left";
}

const AppTextArea = ({ name, label, placeholder, value, setValue, onChange, error, helperText, control, startContent, labelPlacement = "outside" }: AppTextAreaProps) => {
	return control ? (
		<Controller
			name={name!}
			control={control}
			render={({ field: { onChange: onControlledChange, value: changedValue } }) => (
				<Textarea
					label={label}
					labelPlacement={labelPlacement}
					variant="bordered"
					value={changedValue}
					placeholder={placeholder}
					onChange={onControlledChange}
					onValueChange={setValue}
					description={helperText}
					isInvalid={!!error}
					errorMessage={error?.message}
					size="md"
					minRows={3}
					startContent={startContent}
				/>
			)}
		/>
	) : (
		<Textarea
			label={label}
			labelPlacement={labelPlacement}
			variant="bordered"
			value={value}
			placeholder={placeholder}
			onValueChange={(val) => {
				setValue && setValue(val);
				onChange && onChange(val);
			}}
			description={helperText}
			isInvalid={!!error}
			errorMessage={error?.message}
			size="md"
			minRows={3}
			startContent={startContent}
		/>
	);
};

export default AppTextArea;
