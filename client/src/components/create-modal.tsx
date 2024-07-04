import { ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
	children?: ReactNode;
	isOpen: boolean;
	isLoading?: boolean;
	title: string;
	submitText?: string;
	closeText?: string;
	onClose: () => void;
	onSubmit: () => void;
}

export const createModal = ({
	children,
	title,
	isOpen,
	isLoading = false,
	submitText = "OK",
	closeText = "Cancel",
	onClose,
	onSubmit,
}: ModalProps) =>
	createPortal(
		isOpen ? (
			<div className="absolute w-screen h-screen top-0 left-0 backdrop-blur-sm flex justify-center items-center transition-all duration-1000">
				<div className="bg-white rounded-lg drop-shadow px-4 py-6 flex flex-col justify-between items-center gap-6 transition-all duration-1000">
					{!isLoading ? (
						<>
							<h2 className="text-xl">{title}</h2>
							{children && <div>{children}</div>}
							<div className="w-full flex gap-4 justify-center items-center">
								<button
									className="w-28 text-gray-400 py-2 rounded-full transition-all duration-1000 hover:bg-red-100"
									onClick={onClose}
								>
									{closeText}
								</button>
								<button
									className="w-28 bg-indigo-500 text-white py-2 rounded-full transition-all duration-1000 hover:bg-purple-500"
									onClick={onSubmit}
								>
									{submitText}
								</button>
							</div>
						</>
					) : (
						<span>Loading...</span>
					)}
				</div>
			</div>
		) : null,
		document.body
	);
