import { Button, Input, Listbox, ListboxItem, Pagination, type Selection, type SortDescriptor, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import { BsFillFilterCircleFill, BsCheckAll, BsCheck2Circle } from "react-icons/bs";
import { GrSort } from "react-icons/gr";
import { SearchIcon } from "lucide-react";
import { useMediaQuery } from "react-responsive";
import type { AppKey } from "@/types/Global";

export interface IAppTableColumn {
	uid: string;
	name: string;
	sortable?: boolean;
	dateField?: boolean;
}

type IProps<T extends object & { _id?: string }> = {
	title: string;
	data: T[];
	count: number;
	isLoading: boolean;
	headerColumns: IAppTableColumn[];
	searchValue?: string;
	onSearch?: (value: string) => void;
	children?: ReactNode;
	rowsPerPage?: number;
	onRowsPerPageChange?: (rows: number) => void;
	currentPage?: number;
	onCurrentPageChange?: (page: number) => void;
	renderCell: (item: T, columnKey: AppKey) => ReactNode;
	onClearSearch?: () => void;
	emptyContent?: string;
	searchPlaceholder?: string;
	selectedKeys?: Selection;
	selectionMode?: "multiple" | "single" | "none";
	onSelectionChange?: (keys: Selection) => void;
	customTextForRowsPerPage?: string;
	customHeaderItems?: ReactNode | ReactNode[];
	columnsToShowOnMobile?: string[];
	showBottomContent?: boolean;
	showTopContent?: boolean;
	hideSearch?: boolean;
};

const AppTable = <T extends object & { _id?: string }>({
	title,
	data,
	count,
	isLoading,
	headerColumns,
	searchValue,
	onSearch,
	children,
	rowsPerPage = 10,
	currentPage = 1,
	onCurrentPageChange,
	onRowsPerPageChange,
	onClearSearch,
	renderCell,
	emptyContent = "No data found",
	searchPlaceholder = "Search ...",
	selectedKeys,
	selectionMode = "none",
	onSelectionChange,
	customTextForRowsPerPage = "Rows per page:",
	customHeaderItems,
	columnsToShowOnMobile = [],
	showBottomContent = true,
	showTopContent = true,
	hideSearch = false,
}: IProps<T>) => {
	const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
		column: "_id",
		direction: "descending",
	});

	const loadingState = isLoading ? "loading" : "idle";
	const isMobile = useMediaQuery({ maxWidth: "768px" });

	const noOfPages = useMemo(() => Math.ceil(count / rowsPerPage), [count, rowsPerPage]);

	const hasSearchFilter = useMemo(() => searchValue!?.length > 0, [searchValue]);

	const columns = useMemo(() => {
		if (isMobile) {
			if (columnsToShowOnMobile.length > 0) {
				const filteredColumns = headerColumns?.filter((column) => columnsToShowOnMobile.includes(column.uid));
				return filteredColumns;
			}
			return headerColumns;
		}

		return headerColumns;
	}, [isMobile, columnsToShowOnMobile, headerColumns]);

	const items = [...data];

	const sortedItems = useMemo(() => {
		const { column, direction } = sortDescriptor;
		const sorted = [...items].sort((a, b) => {
			// Check if the current column should be treated as a date field
			const isDateField = headerColumns.find(col => col.uid === column)?.dateField;
			
			if (isDateField) {
				const rawValueA = a[column as keyof T];
				const rawValueB = b[column as keyof T];
				
				// Only try to create Date objects if the values are strings, numbers, or Date objects
				if (rawValueA && rawValueB && (typeof rawValueA === 'string' || typeof rawValueA === 'number' || rawValueA instanceof Date) && 
					(typeof rawValueB === 'string' || typeof rawValueB === 'number' || rawValueB instanceof Date)) {
					
					const valueA = new Date(rawValueA);
					const valueB = new Date(rawValueB);

					if (!isNaN(valueA.getTime()) && !isNaN(valueB.getTime())) {
						// Compare dates
						return direction === "ascending" ? valueA.getTime() - valueB.getTime() : valueB.getTime() - valueA.getTime();
					}
				}
			}
			
			// Default string/number comparison
			const valueA = a[column as keyof T];
			const valueB = b[column as keyof T];
			
			if (valueA < valueB) {
				return direction === "ascending" ? -1 : 1;
			}
			if (valueA > valueB) {
				return direction === "ascending" ? 1 : -1;
			}
			return 0;
		});
		return sorted;
	}, [items, sortDescriptor, headerColumns]);

	const onNextPage = useCallback(() => {
		if (currentPage < noOfPages) {
			onCurrentPageChange && onCurrentPageChange(currentPage + 1);
		}
	}, [currentPage, noOfPages, onCurrentPageChange]);

	const onPrevPage = useCallback(() => {
		if (currentPage > 1) {
			onCurrentPageChange && onCurrentPageChange(currentPage - 1);
		}
	}, [currentPage, onCurrentPageChange]);

	const onClear = useCallback(() => {
		onClearSearch && onClearSearch();
		onSearch && onSearch("");
		onCurrentPageChange && onCurrentPageChange(1);
	}, [onClearSearch, onCurrentPageChange, onSearch]);

	const topContent = useMemo(() => {
		return (
			<>
				<div className="flex flex-col gap-4">
					<div className="flex justify-between gap-3 items-end w-full">
						{!hideSearch && (
							<Input
								classNames={{
									base: "max-w-full sm:max-w-[44%] h-10",
									mainWrapper: "h-full",
									input: "text-small",
									inputWrapper: "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
								}}
								placeholder={searchPlaceholder}
								size="sm"
								startContent={<SearchIcon size={18} />}
								type="search"
								isClearable
								value={searchValue}
								onValueChange={onSearch}
								onClear={() => onClear()}
							/>
						)}

						{children}
					</div>
					<div className="flex justify-between items-center">
						<span className="text-default-400 text-small">
							Total {count} <span className="text-gray-500 lowercase">{title}</span>
						</span>
						<label className="flex items-center text-default-400 text-small">
							{customTextForRowsPerPage}
							<select className="bg-transparent outline-none text-default-400 text-small" value={rowsPerPage} onChange={(e) => onRowsPerPageChange?.(Number(e?.target?.value))}>
								<option value="5">5</option>
								<option value="10">10</option>
								<option value="20">20</option>
								<option value="30">30</option>
								<option value="40">40</option>
								<option value="50">50</option>
								<option value="100">100</option>
							</select>
						</label>
					</div>
					{customHeaderItems}
				</div>
				{selectionMode !== "none" && (
					<>
						<Listbox variant="faded" aria-label="Instructions">
							<ListboxItem key="first" startContent={<BsFillFilterCircleFill className="text-primary" />}>
								<p className="text-xs">In order to select properly, please apply a filter or search first</p>
							</ListboxItem>
							<ListboxItem key="copy" startContent={<BsCheckAll className={"text-primary"} />}>
								<p className="text-xs">To select all items, click the "Select All" button on the top right corner of the table.</p>
							</ListboxItem>
							<ListboxItem key="paste" startContent={<BsCheck2Circle className={"text-primary"} />}>
								<p className="text-xs">To select a single item, click the checkbox on the left side of the table row.</p>
							</ListboxItem>
							<ListboxItem key="paste" startContent={<GrSort className={"text-primary"} />}>
								<p className="text-xs">To sort a column, click the column header.</p>
							</ListboxItem>
						</Listbox>
					</>
				)}
			</>
		);
	}, [searchValue, onRowsPerPageChange, data, onSearch, hasSearchFilter, customHeaderItems]);

	const bottomContent = useMemo(() => {
		return (
			<div className="py-2 px-2 flex justify-between items-center">
				{selectionMode !== "none" && (
					<span className="w-[30%] text-small text-default-400">{selectedKeys === "all" ? `All items selected (${data?.length})` : `${selectedKeys?.size ?? 0} of ${sortedItems.length} selected`}</span>
				)}
				<Pagination isCompact showControls showShadow color="primary" page={currentPage} total={noOfPages} onChange={onCurrentPageChange} />
				<div className="hidden sm:flex w-[30%] justify-end gap-2">
					<Button isDisabled={noOfPages === 1} size="sm" variant="flat" onPress={onPrevPage} color="primary">
						Previous
					</Button>
					<Button isDisabled={noOfPages === 1} size="sm" variant="flat" onPress={onNextPage} color="primary">
						Next
					</Button>
				</div>
			</div>
		);
	}, [selectedKeys, data?.length, currentPage, noOfPages, hasSearchFilter]);

	return (
		<>
			<Table
				aria-label="SaaStain Table"
				isHeaderSticky
				isStriped
				bottomContent={showBottomContent ? bottomContent : undefined}
				bottomContentPlacement="outside"
				classNames={{
					wrapper: "max-h-[90vh]",
				}}
				checkboxesProps={{
					classNames: {
						wrapper: "after:bg-primary after:text-background text-background",
					},
				}}
				selectedKeys={selectedKeys}
				selectionMode={selectionMode}
				sortDescriptor={sortDescriptor}
				topContent={showTopContent ? topContent : undefined}
				topContentPlacement="outside"
				onSelectionChange={onSelectionChange}
				onSortChange={setSortDescriptor}>
				<TableHeader columns={columns} className="uppercase">
					{(column) => (
						<TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"} allowsSorting={column.sortable} className="uppercase">
							{column.name}
						</TableColumn>
					)}
				</TableHeader>
				<TableBody emptyContent={emptyContent} items={sortedItems} loadingState={loadingState} loadingContent={<Spinner color="primary" />}>
					{(item) => (
						<TableRow key={item._id}>
							{(columnKey) => (
								<TableCell>
									<div className="text-xs">{renderCell(item, columnKey)}</div>
								</TableCell>
							)}
						</TableRow>
					)}
				</TableBody>
			</Table>
		</>
	);
};

export default AppTable;
