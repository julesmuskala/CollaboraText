import { FC, useState } from "react";
import { BriefDoc, DocSortingValues, SortingOrder } from "../doc";
import { Doc } from "./Doc";
import { HeaderButton } from "./HeaderButton";
import { createModal } from "./create-modal";

interface DocsProps {
	isLoading: boolean;
	briefDocs: BriefDoc[];
	page: number;
	onChangePage: (page: number) => void;
	onChangeSortingOptions: (
		sortBy: DocSortingValues,
		sortOrder: SortingOrder
	) => void;
	onDocDelete: (docId: string) => void;
	sortBy: DocSortingValues;
	sortOrder: SortingOrder;
}

export const Docs: FC<DocsProps> = ({
	isLoading,
	briefDocs,
	onChangePage,
	page,
	sortBy,
	sortOrder,
	onChangeSortingOptions,
	onDocDelete,
}) => {
	const [isSortingModalOpen, setSortingIsModalOpen] = useState(false);

	const [isDeleteModalOpen, setDeleteIsModalOpen] = useState(false);

	const [currentSortOrder, setCurrentSortOrder] = useState(sortOrder);
	const [currentSortBy, setCurrentSortBy] = useState(sortBy);

	const [deletedDocName, setDeletedDocName] = useState<string>("document");
	const [deletedDocId, setDeletedDocId] = useState<string>("");

	const canGoBack = page > 0;
	const canGoForward = briefDocs.length >= 10;

	const handlePreviousPage = () => {
		if (canGoBack) return;

		onChangePage(page - 1);
	};

	const handleNextPage = () => {
		if (canGoForward) return;

		onChangePage(page + 1);
	};

	const handleDeleteDoc = (docId: string, name: string) => {
		setDeletedDocName(name);
		setDeletedDocId(docId);
		setDeleteIsModalOpen(true);
	};

	return (
		<>
			<div className="p-4">
				<div className="flex flex-col">
					<div className="flex flex-row mb-4">
						<span className="text-2xl">Recent documents</span>
					</div>
					<div className="flex flex-row justify-between">
						<div className="flex flex-row">
							<HeaderButton onClick={handlePreviousPage} disabled={!canGoBack}>
								{"<<"}
							</HeaderButton>
							<div className="py-2 px-4 mr-4">{page + 1}</div>
							<HeaderButton onClick={handleNextPage} disabled={!canGoForward}>
								{">>"}
							</HeaderButton>
						</div>
						<HeaderButton
							onClick={() => {
								setSortingIsModalOpen(true);
							}}
						>
							Sorting options
						</HeaderButton>
					</div>
				</div>
				{!isLoading ? (
					briefDocs.length ? (
						<div className="flex flex-row flex-wrap">
							{briefDocs.map((briefDoc) => (
								<Doc
									key={briefDoc.id}
									id={briefDoc.id}
									name={briefDoc.name}
									briefBody={briefDoc.briefBody}
									createdAt={briefDoc.createdAt}
									updatedAt={briefDoc.updatedAt}
									onDelete={handleDeleteDoc}
								/>
							))}
						</div>
					) : (
						<div className="flex items-center justify-center w-full h-72">
							<span>Nothing to show.</span>
						</div>
					)
				) : (
					<div className="flex items-center justify-center w-full h-72">
						Loading...
					</div>
				)}
			</div>
			{createModal({
				isOpen: isDeleteModalOpen,
				title: `Delete ${deletedDocName}?`,
				children: <span>Are you sure you want to delete this document?</span>,
				onClose: () => setDeleteIsModalOpen(false),
				onSubmit: () => {
					if (deletedDocId) {
						onDocDelete(deletedDocId);
					}
					setDeleteIsModalOpen(false);
				},
			})}
			{createModal({
				isOpen: isSortingModalOpen,
				title: "Change sorting options",
				children: (
					<div className="flex flex-col">
						<div className="flex flex-col">
							<span>Sorting order:</span>
							<label htmlFor="sort-radio-order-asc">
								<input
									id="sort-radio-order-asc"
									type="radio"
									name="sort-radio-order"
									value={SortingOrder.ASCENDING}
									className="mr-2"
									onChange={(e) =>
										setCurrentSortOrder(e.target.value as SortingOrder)
									}
									checked={currentSortOrder === SortingOrder.ASCENDING}
								/>
								<span>Ascending</span>
							</label>
							<label htmlFor="sort-radio-order-desc">
								<input
									id="sort-radio-order-desc"
									type="radio"
									name="sort-radio-order"
									value={SortingOrder.DESCENDING}
									className="mr-2"
									onChange={(e) =>
										setCurrentSortOrder(e.target.value as SortingOrder)
									}
									checked={currentSortOrder === SortingOrder.DESCENDING}
								/>
								<span>Descending</span>
							</label>
						</div>
						<div className="flex flex-col">
							<span>Sort by:</span>
							<label htmlFor="sort-radio-by-name">
								<input
									id="sort-radio-by-name"
									type="radio"
									name="sort-radio-by"
									value={DocSortingValues.NAME}
									className="mr-2"
									onChange={(e) =>
										setCurrentSortBy(e.target.value as DocSortingValues)
									}
									checked={currentSortBy === DocSortingValues.NAME}
								/>
								<span>Name</span>
							</label>
							<label htmlFor="sort-radio-by-created">
								<input
									id="sort-radio-by-created"
									type="radio"
									name="sort-radio-by"
									value={DocSortingValues.CREATED_AT}
									className="mr-2"
									onChange={(e) =>
										setCurrentSortBy(e.target.value as DocSortingValues)
									}
									checked={currentSortBy === DocSortingValues.CREATED_AT}
								/>
								<span>Created</span>
							</label>
							<label htmlFor="sort-radio-by-updated">
								<input
									id="sort-radio-by-updated"
									type="radio"
									name="sort-radio-by"
									value={DocSortingValues.UPDATED_AT}
									className="mr-2"
									onChange={(e) =>
										setCurrentSortBy(e.target.value as DocSortingValues)
									}
									checked={currentSortBy === DocSortingValues.UPDATED_AT}
								/>
								<span>Last modified</span>
							</label>
						</div>
					</div>
				),
				onClose: () => setSortingIsModalOpen(false),
				onSubmit: () => {
					onChangeSortingOptions(currentSortBy, currentSortOrder);
					setSortingIsModalOpen(false);
				},
			})}
		</>
	);
};
