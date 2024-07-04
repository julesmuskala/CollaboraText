import { useNavigate } from "react-router-dom";
import { formatDate } from "../doc";

export interface DocProps {
	id: string;
	name: string;
	briefBody: string;
	createdAt: string;
	updatedAt: string;
	onDelete: (id: string, name: string) => void;
}

export const Doc = ({
	id,
	name,
	briefBody,
	createdAt,
	updatedAt,
	onDelete,
}: DocProps) => {
	const navigate = useNavigate();

	const openDoc = () => {
		navigate(`/doc/${id}`);
	};

	return (
		<div className="flex flex-col justify-center items-center">
			<button
				onClick={openDoc}
				className="h-64 w-44 p-4 pb-20 flex flex-col justify-between align-top m-8 border-indigo-600 border-2 rounded-2xl transition-all duration-1000 hover:border-purple-600 hover:bg-purple-200"
			>
				<div className="w-full text-left">
					<span className="text-xs">{briefBody}</span>
				</div>
				<div className="flex flex-col justify-between align-top">
					<h3 className="text-lg font-semibold">{name}</h3>
					<span className="text-xs text-gray-400">
						Modified: {formatDate(updatedAt)}
					</span>
					<span className="text-xs text-gray-400">
						Created: {formatDate(createdAt)}
					</span>
				</div>
			</button>
			<button
				className="relative -mt-24 w-24 py-2 hover text-gray-400 rounded-full transition-all duration-1000 hover:bg-red-100"
				onClick={() => onDelete(id, name)}
			>
				Delete
			</button>
		</div>
	);
};
