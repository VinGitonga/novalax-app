"use client"
import type { IOption } from "@/types/Option";
import { Checkbox, CheckboxGroup } from "@heroui/react";
import { type Control, Controller, type FieldError, type Merge } from "react-hook-form";

interface IAppCheckboxGroupProps {
	label: string;
	options: (IOption | string)[];
	name?: string;
	value?: string[];
	onValueChange?: (vals: string[]) => void;
	control?: Control<any>;
	error?: FieldError | Merge<FieldError, FieldError[]>;
	orientation?: "horizontal" | "vertical";
	defaultValues?: string[];
}

const AppCheckboxGroup = ({ label, options, name, value, onValueChange, control, error, orientation = "vertical", defaultValues }: IAppCheckboxGroupProps) => {
	const getOptionItem = (item: (typeof options)[0]) => {
		const isValue = typeof item === "string";

		const v = isValue ? item : item?.value;
		const l = isValue ? item : item?.label ?? item?.value;

		return { value: v, label: l };
	};
	return control ? (
		<Controller
			name={name!}
			control={control}
			render={({ field }) => (
				<CheckboxGroup
					classNames={{ label: "text-sm text-gray-900 font-medium" }}
					label={label}
					orientation={orientation}
					value={field.value}
					onValueChange={field.onChange}
					color="primary"
					defaultValue={defaultValues}
					errorMessage={error?.message}
					isInvalid={!!error}>
					{options.map((opt) => {
						const optItem = getOptionItem(opt);
						return (
							<Checkbox classNames={{ label: "text-sm" }} value={optItem.value}>
								{optItem.label}
							</Checkbox>
						);
					})}
				</CheckboxGroup>
			)}
		/>
	) : (
		<CheckboxGroup classNames={{ label: "text-sm" }} label={label} orientation={orientation} value={value} onValueChange={onValueChange} color="primary" defaultValue={defaultValues}>
			{options.map((opt) => {
				const optItem = getOptionItem(opt);
				return (
					<Checkbox classNames={{ label: "text-sm" }} value={optItem.value}>
						{optItem.label}
					</Checkbox>
				);
			})}
		</CheckboxGroup>
	);
};

export default AppCheckboxGroup;
