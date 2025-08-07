import type { ChangeEvent, ReactNode } from "react";
import { type Control, Controller, type FieldError } from "react-hook-form";
import { Chip, Select as NextSelect, SelectItem as NextSelectItem, type SelectedItems, type SharedSelection } from "@heroui/react";
import type { IOption } from "@/types/Option";

interface AppSelectProps {
	name?: string;
	label?: string;
	value?: string;
	setValue?: (value: string) => void;
	isRequired?: boolean;
	error?: FieldError;
	helperText?: string;
	options: (IOption | string)[];
	control?: Control<any>;
	placeholder?: string;
	onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
	customRender?: (items: SelectedItems<IOption | string>) => ReactNode;
	baseClassName?: string;
	onSelectAction?: (val?: any) => void;
}

const AppSelect = ({
	name,
	label,
	value,
	setValue,
	isRequired = false,
	error,
	helperText,
	options,
	control,
	placeholder = "Select an Option",
	onChange,
	customRender = undefined,
	baseClassName,
	onSelectAction,
}: AppSelectProps) => {
	const getOptionItem = (item: (typeof options)[0]) => {
		const isValue = typeof item === "string";

		const v = isValue ? item : item?.value;
		const l = isValue ? item : item?.label ?? item?.value;

		return { value: v, label: l };
	};

	return control ? (
		<Controller
			control={control}
			name={name!}
			render={({ field: { onChange: onControlledChange, value: controlledValue } }) => {
				return (
					<NextSelect
						label={label}
						// value={controlledValue}
						// onChange={(val) => {
						// 	console.log(val);
						// 	onControlledChange(val);
						// 	onSelectAction && onSelectAction();
						// }}
						description={helperText}
						isInvalid={!!error}
						errorMessage={error?.message}
						size="md"
						variant="bordered"
						labelPlacement="inside"
						placeholder={placeholder}
						items={options as Iterable<IOption>}
						classNames={{
							label: "text-sm font-medium text-secondary",
							base: baseClassName,
							listboxWrapper: "font-nunito",
						}}
						selectedKeys={[controlledValue ?? ""]}
						onSelectionChange={(val: SharedSelection) => {
							const selectedItem = Array.from(val)?.[0];
							onControlledChange(selectedItem);
							onSelectAction && onSelectAction(val);
						}}
						renderValue={(items) =>
							customRender ? (
								customRender(items)
							) : (
								<div className="flex flex-wrap gap-2">
									{items.map((item) => {
										return (
											<Chip color="secondary" key={item.key} className="text-[12px]" size="sm">
												{item.data?.label as string}
											</Chip>
										);
									})}
								</div>
							)
						}>
						{(item) => {
							const opt = getOptionItem(item);

							return (
								<NextSelectItem key={opt?.value ?? "new-key"} textValue={opt?.value}>
									{opt.label}
								</NextSelectItem>
							);
						}}
					</NextSelect>
				);
			}}
		/>
	) : (
		<NextSelect
			label={label}
			value={value}
			onSelectionChange={(val) => {
				setValue && setValue(val as any);
				onSelectAction && onSelectAction();
			}}
			onChange={(val) => {
				onChange && onChange(val);
				onSelectAction && onSelectAction();
			}}
			description={helperText}
			isInvalid={!value && isRequired}
			errorMessage={!value && isRequired ? `${label} is required` : undefined}
			size="md"
			variant="bordered"
			labelPlacement="inside"
			placeholder={placeholder}
			classNames={{
				label: "text-sm font-medium text-secondary",
				base: baseClassName,
				listboxWrapper: "font-nunito",
			}}
			items={options as Iterable<IOption>}
			renderValue={(items) =>
				customRender ? (
					customRender(items)
				) : (
					<div className="flex flex-wrap gap-2">
						{items.map((item) => (
							<Chip color="primary" key={item?.key ?? "new-key"} className="text-[12px]" size="sm">
								{item?.data?.label as string}
							</Chip>
						))}
					</div>
				)
			}>
			{(item) => {
				const opt = getOptionItem(item);
				return <NextSelectItem key={opt.value}>{opt.label}</NextSelectItem>;
			}}
		</NextSelect>
	);
};

export default AppSelect;
