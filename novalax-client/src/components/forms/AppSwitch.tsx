import { Switch, type SwitchProps } from "@heroui/react";
import { type Control, Controller, type FieldError } from "react-hook-form";

interface CommonProps extends SwitchProps {
	label?: string;
}

interface ControlledProps extends CommonProps {
	name: string;
	control: Control<any>;
	error: FieldError;
}

interface UnControlledProps extends CommonProps {
	isSelected?: boolean;
	setIsSelected?: (val: boolean) => void;
}

type AppSwitchProps = ControlledProps | UnControlledProps;

const AppSwitch = (props: AppSwitchProps) => {
	const { label } = props;

	const isControlled = "control" in props;

	if (isControlled) {
		const { name, control, error, ...rest } = props;
		return (
			<div className="space-y-2">
				<Controller
					name={name}
					control={control}
					render={({ field: { onChange, value: changedVal } }) => (
						<Switch color="primary" isSelected={changedVal} classNames={{ label: "text-sm" }} onValueChange={(val) => onChange(val)} {...rest}>
							{label}
						</Switch>
					)}
				/>
				{error && <p className="text-xs text-danger-600">{error.message}</p>}
			</div>
		);
	}

	const { isSelected, setIsSelected, ...rest } = props;

	return (
		<Switch color="primary" isSelected={isSelected} classNames={{ label: "text-sm" }} onValueChange={setIsSelected} {...rest}>
			{label}
		</Switch>
	);
};

export default AppSwitch;
