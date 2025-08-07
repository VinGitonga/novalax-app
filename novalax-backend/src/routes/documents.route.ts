import { Router } from "express";
import documentsController from "src/controllers/documents.controller";
import { upload } from "src/services/documents.service";

const documentsRouter = Router();

// Upload route
documentsRouter.post("/upload", upload.single("file"), documentsController.uploadFile);

// Get documents by account
documentsRouter.get("/get/by-account/:accountId", documentsController.getDocumentsByAccount);

documentsRouter.get("/document-item", documentsController.getDocumentData)

// Delete document
documentsRouter.delete("/remove/:documentId/account/:accountId", documentsController.deleteDocument);

export default documentsRouter;
