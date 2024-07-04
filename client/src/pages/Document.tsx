import { FC, useEffect, useState } from "react";
import { saveAs } from "file-saver";
import { Socket } from "../socket";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MessageAction } from "../socket/message-action";
import logo from "../assets/logo.svg";
import copy from "copy-to-clipboard";
import DiffMatchPatch from "diff-match-patch";
import { TextEditor } from "../components/TextEditor";
import { User } from "../user";
import { HeaderButton } from "../components/HeaderButton";
import { createModal } from "../components/create-modal";
import { Doc, formatAccessLevel } from "../doc";

interface DocumentProps {}

export const Document: FC<DocumentProps> = () => {
	const navigate = useNavigate();

	const { id: docId } = useParams();

	const [isLoading, setIsLoading] = useState(true);
	const [notFound, setNotFound] = useState(false);

	const [doc, setDoc] = useState<Doc>();

	const [isChangeNameOpen, setIsChangeNameOpen] = useState(false);
	const [isChangeNameLoading, setIsChangeNameLoading] = useState(false);
	const [isChangeAccessOpen, setIsChangeAccessOpen] = useState(false);
	const [isChangeAccessLoading, setIsChangeAccessLoading] = useState(false);

	const [currentDocName, setCurrentDocName] = useState("");
	const [currentAccessLevel, setCurrentAccessLevel] = useState("");

	const socket = Socket.getInstance();
	const user = User.getInstance();

	const dmp = new DiffMatchPatch();

	const handleUpdateDocName = (data: any) => {
		if (doc) {
			setDoc({ ...doc, name: data.name });
		}
	};

	const handleUpdateDocAccess = (data: any) => {
		if (doc) {
			setDoc({ ...doc, accessLevel: data.accessLevel });
		}
	};

	const handleCloseDoc = () => {
		setNotFound(true);
	};

	socket.on(MessageAction.UPDATE_DOC_NAME, handleUpdateDocName);
	socket.on(MessageAction.UPDATE_DOC_ACCESS, handleUpdateDocAccess);
	socket.on(MessageAction.CLOSE_DOC, handleCloseDoc);

	useEffect(() => {
		if (!docId) {
			navigate("/");

			return;
		}

		setTimeout(() => {
			if (!socket.getDocId()) {
				socket.setDoc(docId);
			}

			socket.once(MessageAction.OPEN_DOC, (doc) => {
				setIsLoading(false);
				setNotFound(false);
				setDoc(doc);
			});

			socket.once(MessageAction.ERR_NO_DOC, () => {
				setNotFound(true);
			});

			socket.once(MessageAction.ERR_SOCKET_DOC_OPEN, () => {
				setNotFound(true);
			});

			if (!socket.isOpened()) {
				if (user.getToken()) {
					socket.once(MessageAction.OK, () => socket.authUser());
					socket.once(MessageAction.AUTH_USER, () =>
						socket.send(MessageAction.OPEN_DOC, { docId })
					);
				} else {
					socket.once(MessageAction.OK, () =>
						socket.send(MessageAction.OPEN_DOC, { docId })
					);
				}
			} else {
				if (user.isAuthenticated()) {
					socket.send(MessageAction.OPEN_DOC, { docId });
				} else {
					if (user.getToken()) {
						socket.authUser();
						socket.once(MessageAction.AUTH_USER, () =>
							socket.send(MessageAction.OPEN_DOC, { docId })
						);
					} else {
						socket.send(MessageAction.OPEN_DOC, { docId });
					}
				}
			}
		}, 1500);

		return () => {
			socket.off(handleUpdateDocName);
			socket.off(handleUpdateDocAccess);
			socket.off(handleCloseDoc);
		};
	}, []);

	const handleCopyLink = () => {
		copy(window.location.href);
	};

	const handleExport = () => {
		if (doc) {
			const blob = new Blob([doc.body], {
				type: "text/plain;charset=utf-8",
			});

			saveAs(blob, `${doc.name}.md`);
		}
	};

	const openChangeName = () => {
		if (doc?.name) {
			setCurrentDocName(doc.name);
		}

		setIsChangeNameOpen(true);
	};

	const openChangeAccess = () => {
		if (doc?.accessLevel) {
			setCurrentAccessLevel(doc.accessLevel);
		}

		setIsChangeAccessOpen(true);
	};

	const handleChangeName = () => {
		setIsChangeNameLoading(true);

		socket.once(MessageAction.UPDATE_DOC_NAME, () => {
			setIsChangeNameLoading(false);
			setIsChangeNameOpen(false);
		});

		socket.once(MessageAction.ERR_NO_DOC, () => {
			setIsChangeNameLoading(false);
			setIsChangeNameOpen(false);
		});

		socket.send(MessageAction.UPDATE_DOC_NAME, {
			docId: docId,
			name: currentDocName,
		});
	};

	const handleChangeAccessLevel = () => {
		setIsChangeAccessLoading(true);

		socket.once(MessageAction.UPDATE_DOC_ACCESS, () => {
			setIsChangeAccessLoading(false);
			setIsChangeAccessOpen(false);
		});

		socket.once(MessageAction.ERR_NO_DOC, () => {
			setIsChangeAccessLoading(false);
			setIsChangeAccessOpen(false);
		});

		socket.send(MessageAction.UPDATE_DOC_ACCESS, {
			docId: docId,
			accessLevel: currentAccessLevel,
		});
	};

	return (
		<>
			<div className="flex flex-col justify-center items-center">
				<div className="text-sm w-full px-4 py-2 flex justify-between items-center bg-indigo-500 text-white mb-6">
					<Link to="/">
						<img src={logo} alt="CollaboraText" className="h-12 w-auto" />
					</Link>
					{!isLoading && !notFound && doc && (
						<div className="flex">
							<HeaderButton onClick={openChangeName} disabled={!doc.isOwned}>
								Name: {doc.name}
							</HeaderButton>
							<HeaderButton onClick={openChangeAccess} disabled={!doc.isOwned}>
								{formatAccessLevel(doc.accessLevel)}
							</HeaderButton>
						</div>
					)}
					<div className="flex">
						<div className="flex justify-center items-center">
							<HeaderButton onClick={handleExport}>Export</HeaderButton>
							<HeaderButton onClick={handleCopyLink}>Copy link</HeaderButton>
						</div>
						<div className="rounded-full h-12 w-12 bg-white">
							{user.getFirebaseUser()?.photoURL && (
								<img
									onClick={() => {}}
									className="rounded-full w-12"
									src={user.getFirebaseUser()?.photoURL!}
									alt=""
								/>
							)}
						</div>
					</div>
				</div>
				{notFound ? (
					<div className="flex items-center justify-center w-full h-72">
						Document not found!
					</div>
				) : !isLoading ? (
					<TextEditor
						doc={doc}
						setDoc={setDoc}
						socket={socket}
						dmp={dmp}
						readOnly={doc?.accessLevel === "READONLY" && !doc.isOwned}
					/>
				) : (
					<div className="flex items-center justify-center w-full h-72">
						Loading...
					</div>
				)}
			</div>
			{createModal({
				title: "Change access level",
				isOpen: isChangeAccessOpen,
				isLoading: isChangeAccessLoading,
				onClose: () => setIsChangeAccessOpen(false),
				onSubmit: handleChangeAccessLevel,
				children: (
					<div className="flex flex-col">
						<label htmlFor="name-radio-only-owner">
							<input
								id="name-radio-only-owner"
								type="radio"
								name="access"
								value="ONLY_OWNER"
								className="mr-2"
								onChange={(e) => setCurrentAccessLevel(e.target.value)}
								checked={currentAccessLevel === "ONLY_OWNER"}
							/>
							<span>Only you can access</span>
						</label>
						<label htmlFor="name-radio-only-readonly">
							<input
								id="name-radio-only-readonly"
								type="radio"
								name="access"
								value="READONLY"
								className="mr-2"
								onChange={(e) => setCurrentAccessLevel(e.target.value)}
								checked={currentAccessLevel === "READONLY"}
							/>
							<span>Only you can edit</span>
						</label>
						<label htmlFor="name-radio-anyone">
							<input
								id="name-radio-anyone"
								type="radio"
								name="access"
								value="ANYONE"
								className="mr-2"
								onChange={(e) => setCurrentAccessLevel(e.target.value)}
								checked={currentAccessLevel === "ANYONE"}
							/>
							<span>Anyone can access</span>
						</label>
					</div>
				),
			})}
			{createModal({
				title: "Rename document",
				isOpen: isChangeNameOpen,
				isLoading: isChangeNameLoading,
				onClose: () => setIsChangeNameOpen(false),
				onSubmit: handleChangeName,
				children: (
					<div>
						<input
							type="text"
							className="border-b-2"
							value={currentDocName}
							onChange={(e) => setCurrentDocName(e.target.value)}
						/>
					</div>
				),
			})}
		</>
	);
};
