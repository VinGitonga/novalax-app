import { useState, useEffect } from "react";
import type { FieldConfig } from "../utils/methodConfigs";

export interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (params: Record<string, string>) => void;
	title: string;
	fields: FieldConfig[];
	isLoading?: boolean;
}

export const Web3Modal = ({ isOpen, onClose, onSubmit, title, fields, isLoading = false }: ModalProps) => {
	const [formValues, setFormValues] = useState<Record<string, string>>({});

	useEffect(() => {
		if (!isOpen) return;
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [isOpen, onClose]);

	// Initialize form values with defaults or localStorage values
	useEffect(() => {
		if (isOpen) {
			const initialValues: Record<string, string> = {};

			fields.forEach((field) => {
				const storedValue = localStorage.getItem(`param_${field.name}`);
				initialValues[field.name] = storedValue || field.defaultValue || "";
			});

			setFormValues(initialValues);
		}
	}, [isOpen, fields]);

	const handleChange = (name: string, value: string) => {
		setFormValues((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Save values to localStorage
		Object.entries(formValues).forEach(([key, value]) => {
			if (typeof value === "string") {
				localStorage.setItem(`param_${key}`, value);
			}
		});

		onSubmit(formValues);
	};

	const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === e.currentTarget) onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="modal-overlay" onClick={handleOverlayClick}>
			<div className="modal-content">
				<h2>{title}</h2>
				<form onSubmit={handleSubmit}>
					{fields.map((field) => (
						<div className="form-group" key={field.name}>
							<label htmlFor={field.name}>{field.label}</label>
							<input
								id={field.name}
								type={field.type === "number" ? "number" : "text"}
								value={formValues[field.name] || ""}
								onChange={(e) => handleChange(field.name, e.target.value)}
								placeholder={field.placeholder}
								required={field.required}
								disabled={isLoading}
							/>
						</div>
					))}
					<div className="modal-buttons">
						<button type="button" onClick={onClose} disabled={isLoading}>
							Cancel
						</button>
						<button type="submit" disabled={isLoading}>
							{isLoading ? "Loading..." : "Submit"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};
