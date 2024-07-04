import {
	BlockTypeSelect,
	BoldItalicUnderlineToggles,
	CodeToggle,
	CreateLink,
	InsertTable,
	InsertThematicBreak,
	ListsToggle,
	MDXEditor,
	MDXEditorMethods,
	UndoRedo,
	codeBlockPlugin,
	headingsPlugin,
	imagePlugin,
	linkDialogPlugin,
	linkPlugin,
	listsPlugin,
	quotePlugin,
	tablePlugin,
	thematicBreakPlugin,
	toolbarPlugin,
} from "@mdxeditor/editor";
import { FC, useEffect, useRef } from "react";
import DiffMatchPatch from "diff-match-patch";
import "@mdxeditor/editor/style.css";
import { Doc } from "../doc";
import { Socket } from "../socket";
import { MessageAction } from "../socket/message-action";

interface TextEditorProps {
	socket: Socket;
	doc?: Doc;
	readOnly?: boolean;
	setDoc: (doc: Doc) => void;
	dmp: DiffMatchPatch;
}

export const TextEditor: FC<TextEditorProps> = ({
	socket,
	doc,
	readOnly = false,
	setDoc,
	dmp,
}) => {
	const ref = useRef<MDXEditorMethods>(null);

	const handleChange = (markdown: string) => {
		if (doc) {
			const { body } = doc;

			const patches = dmp.patch_make(body, markdown);

			setDoc({ ...doc, body: markdown });
			socket.send(MessageAction.EDIT_DOC, { patches });
		}
	};

	const handleEditDoc = (data: any) => {
		if (doc) {
			const { patches } = data;
			const { body } = doc;
			const [patched] = dmp.patch_apply(patches, body);

			setDoc({ ...doc, body: patched });
			ref.current?.setMarkdown(patched);
		}
	};

	const handleFocusDoc = (doc: Doc) => {
		setDoc(doc);
		ref.current?.setMarkdown(doc.body);
	};

	const handleWindowFocus = () => {
		socket.send(MessageAction.FOCUS_DOC, {});
	};

	socket.on(MessageAction.EDIT_DOC, handleEditDoc);

	useEffect(() => {
		ref.current?.focus();

		setTimeout(() => {
			socket.on(MessageAction.FOCUS_DOC, handleFocusDoc);
			window.addEventListener("focus", handleWindowFocus);
		}, 300);

		return () => {
			socket.off(handleEditDoc);
			socket.off(handleFocusDoc);
			window.removeEventListener("focus", handleWindowFocus);
		};
	}, []);

	return (
		<MDXEditor
			ref={ref}
			markdown={doc?.body ? doc.body : ""}
			readOnly={readOnly}
			plugins={[
				headingsPlugin(),
				listsPlugin(),
				quotePlugin(),
				thematicBreakPlugin(),
				codeBlockPlugin(),
				tablePlugin(),
				linkPlugin(),
				linkDialogPlugin(),
				imagePlugin(),
				toolbarPlugin({
					toolbarContents: () => (
						<>
							<UndoRedo />
							<BlockTypeSelect />
							<BoldItalicUnderlineToggles />
							<InsertThematicBreak />
							<ListsToggle options={["bullet", "number"]} />
							<CodeToggle />
							<InsertTable />
							<CreateLink />
						</>
					),
				}),
			]}
			onChange={handleChange}
			contentEditableClassName="prose lg:prose-xl"
		/>
	);
};
