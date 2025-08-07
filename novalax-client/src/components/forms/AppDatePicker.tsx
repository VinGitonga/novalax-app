import { type DateValue, getLocalTimeZone, now } from "@internationalized/date";
import { DatePicker } from "@heroui/react";
import { type Dispatch, type SetStateAction } from "react";
import { type Control, Controller, type FieldError, type FieldErrorsImpl, type Merge } from "react-hook-form";

interface IProps {
	name?: string;
	label: string;
	value?: DateValue;
	setValue?: Dispatch<SetStateAction<DateValue>>;
	onChange?: (val: DateValue) => void;
	error?: FieldError | Merge<FieldError, FieldErrorsImpl<any>> | Merge<FieldError, FieldError[]>;
	control?: Control<any>;
	minDate?: DateValue;
	maxDate?: DateValue;
}

const AppDatePicker = ({ name, label, value, setValue, onChange, error, control, minDate, maxDate }: IProps) => {
	return control ? (
		<Controller
			name={name!}
			control={control}
			render={({ field: { onChange: onControlledChange, value: changedValue } }) => (
				<DatePicker
					onChange={(val) => {
						onControlledChange(val);
					}}
					value={changedValue}
					classNames={{ popoverContent: "font-nunito" }}
					label={label}
					variant="bordered"
					hideTimeZone
					showMonthAndYearPickers
					defaultValue={now(getLocalTimeZone()) as any}
					isInvalid={!!error}
					errorMessage={error?.message as any}
					minValue={minDate as any}
					maxValue={maxDate as any}
				/>
			)}
		/>
	) : (
		<DatePicker
			classNames={{ popoverContent: "font-nunito" }}
			label={label}
			variant="bordered"
			hideTimeZone
			showMonthAndYearPickers
			defaultValue={now(getLocalTimeZone()) as any}
			value={value}
			onChange={(val) => {
				onChange && onChange?.(val as any);
				setValue && setValue?.(val as any);
			}}
			minValue={minDate as any}
			maxValue={maxDate as any}
		/>
	);
};

export default AppDatePicker;
