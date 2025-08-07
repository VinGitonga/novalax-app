export function safeClone<T>(obj: T): T {
	if (obj === null || typeof obj !== "object") {
		return obj;
	}

	if (obj instanceof Date) {
		return new Date(obj.getTime()) as T;
	}

	if (Array.isArray(obj)) {
		return obj.map((item) => safeClone(item)) as T;
	}

	const cloned: Record<string, unknown> = {};
	for (const key in obj as Record<string, unknown>) {
		// Skip __proto__ and other dangerous properties
		if (key === "__proto__" || key === "constructor" || key === "prototype") {
			continue;
		}
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			cloned[key] = safeClone((obj as Record<string, unknown>)[key]);
		}
	}
	return cloned as T;
}

export const generatePaymentLink = (slug: string, uniqueId: string, paymentType: "one-time" | "recurring" = "one-time"): string => {
	const appDomain = `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ""}`;
	const baseUrl = `${appDomain}/make-payments/${slug}/${uniqueId}`;
	return paymentType === "recurring" ? `${baseUrl}?type=recurring` : `${baseUrl}?type=one-time`
};

export const truncateLink = (link: string, maxLength: number = 50): string => {
	if (link.length <= maxLength) return link;

	const start = Math.floor((maxLength - 3) / 2);
	const end = link.length - Math.floor((maxLength - 3) / 2);

	return `${link.slice(0, start)}...${link.slice(end)}`;
};

export const formatAmount = (amount: string) => {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
	}).format(parseFloat(amount));
};