import { Request } from "express";
import multer from "multer";
import { nanoid } from "nanoid";
import { PINATA_GATEWAY, PINATA_JWT } from "src/constants";
import { DocumentItem } from "src/models/document.model";
import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
	pinataJwt: PINATA_JWT!,
	pinataGateway: PINATA_GATEWAY,
});

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
	const allowedMimeTypes = [
		"application/pdf",
		"application/msword",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		"text/plain",
		"image/jpeg",
		"image/png",
		"image/gif",
		"application/json",
		"text/csv",
		"application/vnd.ms-excel",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	];

	if (allowedMimeTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error("Invalid file type. Only documents, images, and common file types are allowed."));
	}
};

export const upload = multer({
	storage: storage,
	fileFilter: fileFilter,
	limits: {
		fileSize: 10 * 1024 * 1024,
		files: 1,
	},
});

const uploadFile = async (file: Express.Multer.File, accountId?: string, price?: number) => {
	try {
		const formData = new FormData();

		// Create a File object from the buffer
		const fileBlob = new Blob([file.buffer as any], { type: file.mimetype });
		const fileObject = new File([fileBlob], file.originalname, { type: file.mimetype });

		formData.append("file", fileObject);
		formData.append("network", "public");

		const request = await fetch("https://uploads.pinata.cloud/v3/files", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${PINATA_JWT}`,
			},
			body: formData,
		});

		if (!request.ok) {
			throw new Error(`Upload failed: ${request.status} ${request.statusText}`);
		}

		const response = await request.json();

		console.log(response);

		const uploadResult = {
			originalname: file.originalname,
			mimetype: file.mimetype,
			size: file.size,
			pinataHash: response.data.ipfs_hash,
			pinataUrl: `https://gateway.pinata.cloud/ipfs/${response.data.ipfs_hash}`,
		};

		// Save document details to database
		if (accountId) {
			await saveDocumentToDatabase({
				name: file.originalname,
				size: file.size,
				type: file.mimetype,
				cid: response.data.cid,
				account: accountId,
				price: price || 1,
			});
		}

		return uploadResult;
	} catch (error) {
		console.error("Pinata upload error:", error);
		throw new Error("Failed to upload file to IPFS");
	}
};

const saveDocumentToDatabase = async (documentData: { name: string; size: number; type: string; cid: string; account: string; price: number }) => {
	try {
		const uniqueId = nanoid(8);

		const document = new DocumentItem({
			name: documentData.name,
			size: documentData.size,
			type: documentData.type,
			cid: documentData.cid,
			account: documentData.account,
			price: documentData.price,
			uniqueId: uniqueId,
		});

		await document.save();
		console.log("Document saved to database:", document._id);
		return document;
	} catch (error) {
		console.error("Error saving document to database:", error);
		throw new Error("Failed to save document to database");
	}
};

const getDocumentsByAccount = async (accountId: string) => {
	try {
		const documents = await DocumentItem.find({ account: accountId }).sort({ createdAt: -1 }).populate("account", "wallet_address");

		return documents;
	} catch (error) {
		console.error("Error fetching documents:", error);
		throw new Error("Failed to fetch documents");
	}
};

const deleteDocument = async (documentId: string, accountId: string) => {
	try {
		const document = await DocumentItem.findOneAndDelete({
			_id: documentId,
			account: accountId,
		});

		if (!document) {
			throw new Error("Document not found or access denied");
		}

		return document;
	} catch (error) {
		console.error("Error deleting document:", error);
		throw new Error("Failed to delete document");
	}
};

const getDocumentById = async (docId: string) => {
	return await DocumentItem.findById(docId).lean();
};

const getDocumentByUniqueId = async (docId: string) => {
	return await DocumentItem.findOne({ uniqueId: docId }).populate("account").lean();
};

const getDocumentData = async (docId: string) => {
	const document = await getDocumentByUniqueId(docId);

	// const { data, contentType } = await pinata.gateways.public.get(document.cid);

	const url = await pinata.gateways.public.convert(document.cid);

	return url;
};

export default {
	upload,
	uploadFile,
	saveDocumentToDatabase,
	getDocumentsByAccount,
	deleteDocument,
	getDocumentById,
	getDocumentByUniqueId,
	getDocumentData,
};
