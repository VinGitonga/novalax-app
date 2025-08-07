import { Request, Response } from "express";
import { tryCatch } from "src/helpers/try-catch";
import documentsService from "src/services/documents.service";
import { ExpressResponse } from "src/types/Api";

async function uploadFile(req: Request, res: ExpressResponse) {
	if (!req.file) {
		return res.status(400).json({
			status: "error",
			msg: "No file uploaded",
		});
	}

	// Extract accountId and price from request body or query parameters
	const accountId = req.body.accountId || (req.query.accountId as string);
	const price = req.body.price ? parseFloat(req.body.price) : 0;

	const { data, error } = await tryCatch(documentsService.uploadFile(req.file, accountId, price));

	if (error) {
		return res.status(400).json({
			status: "error",
			msg: error.message ?? "An error occurred during file upload",
		});
	}

	res.status(200).json({
		status: "success",
		data: data,
		msg: "File uploaded successfully",
	});
}

async function getDocumentsByAccount(req: Request, res: ExpressResponse) {
	const accountId = req.params.accountId;

	if (!accountId) {
		return res.status(400).json({
			status: "error",
			msg: "Account ID is required",
		});
	}

	const { data, error } = await tryCatch(documentsService.getDocumentsByAccount(accountId));

	if (error) {
		return res.status(400).json({
			status: "error",
			msg: error.message ?? "An error occurred while fetching documents",
		});
	}

	res.status(200).json({
		status: "success",
		data: data,
		msg: "Documents fetched successfully",
	});
}

async function deleteDocument(req: Request, res: ExpressResponse) {
	const { documentId, accountId } = req.params;

	if (!documentId || !accountId) {
		return res.status(400).json({
			status: "error",
			msg: "Document ID and Account ID are required",
		});
	}

	const { data, error } = await tryCatch(documentsService.deleteDocument(documentId, accountId));

	if (error) {
		return res.status(400).json({
			status: "error",
			msg: error.message ?? "An error occurred while deleting document",
		});
	}

	res.status(200).json({
		status: "success",
		data: data,
		msg: "Document deleted successfully",
	});
}

async function getDocumentData(req: Request, res: ExpressResponse) {
	const { data, error } = await tryCatch(documentsService.getDocumentData(req.query.docId as string));

	if (error) {
		res.status(400).json({ status: "error", errors: error });
		return;
	}

	res.status(200).json({ status: "success", data });
}

export default {
	uploadFile,
	getDocumentsByAccount,
	deleteDocument,
	getDocumentData
};
