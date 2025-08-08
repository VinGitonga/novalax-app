import { useState, useRef } from "react";
import { Plus, File, FileText, Image, Trash2, Upload, Calendar, Eye, Copy, Check, X, DollarSign } from "lucide-react";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure, Input } from "@heroui/react";
import { useAccountStore } from "@/hooks/store/useAccountStore";
import { API_URL } from "@/constants";
import { IApiEndpoint } from "@/types/Api";
import useSWR from "swr";
import type { IDocumentItem } from "@/types/DocumentItem";
import { swrFetcher } from "@/lib/api-client";

const formatFileSize = (bytes: number) => {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const formatPrice = (price: number) => {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
	}).format(price);
};

const PremiumFiles = () => {
	const [copiedId, setCopiedId] = useState<string | null>(null);
	const { account } = useAccountStore();

	const { data: documents, isLoading, mutate } = useSWR<IDocumentItem[]>(
		!account ? null : [`${IApiEndpoint.GET_DOCUMENTS_BY_ACCOUNT}/${account._id}`], 
		swrFetcher
	);

	const getFileIcon = (type: string) => {
		if (type.startsWith("image/")) return <Image className="w-8 h-8 text-blue-500" />;
		if (type.includes("pdf")) return <File className="w-8 h-8 text-red-500" />;
		if (type.includes("word") || type.includes("document")) return <FileText className="w-8 h-8 text-blue-600" />;
		if (type.includes("spreadsheet") || type.includes("excel")) return <FileText className="w-8 h-8 text-green-600" />;
		if (type.includes("presentation") || type.includes("powerpoint")) return <FileText className="w-8 h-8 text-orange-600" />;
		return <File className="w-8 h-8 text-gray-500" />;
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const copyDownloadLink = async (document: IDocumentItem) => {
		const downloadLink = `${API_URL}/${IApiEndpoint.PAY_PREMIUM_DOCUMENT}?docId=${document.uniqueId}`;
		try {
			await navigator.clipboard.writeText(downloadLink);
			setCopiedId(document._id);
			setTimeout(() => setCopiedId(null), 2000);
		} catch (error) {
			console.error("Failed to copy link:", error);
		}
	};

	const handleDeleteDocument = async (documentId: string) => {
		// TODO: Implement delete logic as needed
		console.log("Delete document:", documentId);
	};

	const openDocument = (document: IDocumentItem) => {
		const url = `https://gateway.pinata.cloud/ipfs/${document.cid}`;
		window.open(url, '_blank');
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-50 p-6">
				<div className="max-w-7xl mx-auto">
					<div className="flex justify-between items-center mb-8">
						<div>
							<h1 className="text-3xl font-bold text-gray-900">Premium Files</h1>
							<p className="text-gray-600 mt-2">Manage and access your premium content</p>
						</div>
						<UploadFileModal onUploadSuccess={mutate} />
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{Array.from({ length: 8 }).map((_, index) => (
							<div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
								<div className="flex items-start justify-between mb-4">
									<div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
									<div className="flex gap-1">
										<div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
										<div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
										<div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
									</div>
								</div>
								<div className="mb-4">
									<div className="h-4 bg-gray-200 rounded mb-2"></div>
									<div className="h-3 bg-gray-200 rounded w-1/2"></div>
								</div>
								<div className="h-3 bg-gray-200 rounded w-1/3"></div>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 p-6">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="flex justify-between items-center mb-8">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Premium Files</h1>
						<p className="text-gray-600 mt-2">Manage and access your premium content</p>
					</div>
					<UploadFileModal onUploadSuccess={mutate} />
				</div>

				{/* Files Grid */}
				{documents && documents.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{documents.map((document) => (
							<div key={document._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 group">
								{/* File Icon and Actions */}
								<div className="flex items-start justify-between mb-4">
									<div className="p-2 bg-gray-50 rounded-lg">{getFileIcon(document.type)}</div>
									<div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
										<button 
											onClick={() => openDocument(document)}
											className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
										>
											<Eye className="w-4 h-4" />
										</button>
										<button 
											onClick={() => copyDownloadLink(document)} 
											className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
										>
											{copiedId === document._id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
										</button>
										<button 
											onClick={() => handleDeleteDocument(document._id)}
											className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
										>
											<Trash2 className="w-4 h-4" />
										</button>
									</div>
								</div>

								{/* File Info */}
								<div className="mb-4">
									<h3 className="font-semibold text-gray-900 mb-1 line-clamp-2" title={document.name}>
										{document.name}
									</h3>
									<p className="text-sm text-gray-500">{formatFileSize(document.size)}</p>
								</div>

								{/* Price */}
								<div className="flex items-center gap-2 text-sm font-medium text-green-600 mb-3">
									<DollarSign className="w-4 h-4" />
									{formatPrice(document.price)}
								</div>

								{/* Upload Date */}
								<div className="flex items-center gap-2 text-xs text-gray-400">
									<Calendar className="w-3 h-3" />
									{formatDate(document.createdAt)}
								</div>
							</div>
						))}
					</div>
				) : (
					/* Empty State */
					<div className="text-center py-16">
						<File className="w-16 h-16 text-gray-300 mx-auto mb-4" />
						<h3 className="text-xl font-semibold text-gray-600 mb-2">No files uploaded yet</h3>
						<p className="text-gray-500 mb-6">Start by uploading your first premium file</p>
						<UploadFileModal onUploadSuccess={mutate} />
					</div>
				)}
			</div>
		</div>
	);
};

const UploadFileModal = ({ onUploadSuccess }: { onUploadSuccess: () => void }) => {
	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [price, setPrice] = useState<string>("0");
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { account } = useAccountStore();

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setSelectedFile(file);
		}
	};

	const handleUpload = async () => {
		if (!selectedFile || !account) return;

		setIsUploading(true);
		setUploadProgress(0);

		const formData = new FormData();
		formData.append("file", selectedFile);
		formData.append("accountId", account._id);
		formData.append("price", price);

		try {
			// Simulate upload progress
			const progressInterval = setInterval(() => {
				setUploadProgress((prev) => {
					if (prev >= 90) {
						clearInterval(progressInterval);
						return 90;
					}
					return prev + 10;
				});
			}, 200);

			const response = await fetch(`${API_URL}/${IApiEndpoint.UPLOAD_DOCUMENT}`, {
				method: "POST",
				body: formData,
			});

			clearInterval(progressInterval);
			setUploadProgress(100);

			if (!response.ok) {
				throw new Error("Upload failed");
			}

			const result = await response.json();
			console.log("Upload successful:", result);

			// Reset form and close modal
			setSelectedFile(null);
			setPrice("0");
			onClose();

			// Refresh the documents list
			onUploadSuccess();

			// Reset progress after a delay
			setTimeout(() => setUploadProgress(0), 1000);
		} catch (error) {
			console.error("Upload error:", error);
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<>
			<Button startContent={<Plus className="w-5 h-5" />} color="secondary" onPress={onOpen}>
				Upload File
			</Button>

			<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
				<ModalContent className="font-nunito">
					{(onClose) => (
						<>
							<ModalHeader className="flex flex-col gap-1">Upload Premium File</ModalHeader>
							<ModalBody>
								{/* File Selection */}
								<div className="mb-6">
									<div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors">
										{selectedFile ? (
											<div>
												<Check className="w-12 h-12 text-green-500 mx-auto mb-3" />
												<p className="font-medium text-gray-900">{selectedFile.name}</p>
												<p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
											</div>
										) : (
											<div>
												<Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
												<p className="font-medium text-gray-900">Click to select file</p>
												<p className="text-sm text-gray-500">or drag and drop</p>
											</div>
										)}
									</div>
									<input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.json,.csv,.xls,.xlsx" />
								</div>

								{/* Price Input */}
								<div className="mb-6">
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Price (USD)
									</label>
									<Input
										type="number"
										placeholder="0.00"
										value={price}
										onChange={(e) => setPrice(e.target.value)}
										startContent={<DollarSign className="w-4 h-4 text-gray-400" />}
										min="0"
										step="0.01"
										className="w-full"
									/>
									<p className="text-xs text-gray-500 mt-1">
										Set the price for this premium document
									</p>
								</div>

								{/* Upload Progress */}
								{isUploading && (
									<div className="mb-6">
										<div className="flex justify-between text-sm text-gray-600 mb-2">
											<span>Uploading...</span>
											<span>{uploadProgress}%</span>
										</div>
										<div className="w-full bg-gray-200 rounded-full h-2">
											<div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
										</div>
									</div>
								)}
							</ModalBody>
							<ModalFooter>
								<Button color="danger" variant="flat" type="button" onPress={onClose} disabled={isUploading}>
									Cancel
								</Button>
								<Button color="secondary" type="button" onPress={handleUpload} disabled={!selectedFile || isUploading}>
									{isUploading ? "Uploading..." : "Upload"}
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</>
	);
};

export default PremiumFiles;
