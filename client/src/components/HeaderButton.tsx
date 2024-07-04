import { FC, ReactNode } from "react";

interface HeaderButtonProps {
	onClick: () => void;
	children: ReactNode;
	disabled?: boolean;
}

export const HeaderButton: FC<HeaderButtonProps> = ({
	onClick,
	children,
	disabled = false,
}) => (
	<button
		onClick={onClick}
		disabled={disabled}
		className={`text-slate-100 py-2 px-4 rounded-full transition-all duration-1000 mr-4 ${
			!disabled
				? "bg-indigo-600 hover:bg-purple-600"
				: "cursor-default bg-indigo-500"
		}`}
	>
		{children}
	</button>
);
