import { getAuth } from "firebase/auth";
import { FC, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";
import newDoc from "../assets/new-doc.svg";
import { Docs } from "../components/Docs";
import { Socket } from "../socket";
import { MessageAction } from "../socket/message-action";
import { BriefDoc, DocSortingValues, SortingOrder } from "../doc";
import { User } from "../user";
import { HeaderButton } from "../components/HeaderButton";

interface HomeProps {}

export const Home: FC<HomeProps> = () => {
	const navigate = useNavigate();
	const auth = getAuth();

	const [isLoading, setIsLoading] = useState(true);
	const [briefDocs, setBriefDocs] = useState<BriefDoc[]>([]);

	const [sortOrder, setSortOrder] = useState(SortingOrder.DESCENDING);
	const [sortBy, setSortBy] = useState(DocSortingValues.UPDATED_AT);
	const [page, setPage] = useState(0);

	const socket = Socket.getInstance();
	const user = User.getInstance();

	const logOut = async () => {
		setIsLoading(true);

		user.clear();
		await auth.signOut();

		navigate("/login");
	};

	const createDoc = async () => {
		socket.send(MessageAction.CREATE_DOC, {});
		setIsLoading(true);
		socket.once(MessageAction.CREATE_DOC, ({ id }) => {
			socket.setDoc(id);
			navigate(`/doc/${id}`);
		});
	};

	const handleDeleteDoc = async (docId: string) => {
		socket.send(MessageAction.DELETE_DOC, { docId });

		setIsLoading(true);

		socket.once(MessageAction.DELETE_DOC, () => {
			setBriefDocs(briefDocs.filter((doc) => doc.id !== docId));
			setIsLoading(false);
		});
	};

	const handleOpenDocs = (briefDocs: BriefDoc[]) => {
		setBriefDocs(briefDocs);
		setIsLoading(false);
	};

	socket.on(MessageAction.OPEN_DOCS, handleOpenDocs);

	useEffect(() => {
		if (!user.getToken()) {
			navigate("/login");

			return;
		}

		if (socket.getDocId()) {
			socket.send(MessageAction.CLOSE_DOC, {});
		}

		setTimeout(() => {
			const openDocsPayload = {
				take: 10,
				skip: page * 10,
				order: sortOrder,
				sortBy: sortBy,
			};

			if (!socket.isOpened()) {
				socket.once(MessageAction.OK, () => {
					socket.authUser();
				});
				socket.once(MessageAction.AUTH_USER, () =>
					socket.send(MessageAction.OPEN_DOCS, openDocsPayload)
				);
			} else {
				if (!user.isAuthenticated()) {
					socket.authUser();
					socket.once(MessageAction.AUTH_USER, () =>
						socket.send(MessageAction.OPEN_DOCS, openDocsPayload)
					);
				} else {
					socket.send(MessageAction.OPEN_DOCS, openDocsPayload);
				}
			}
		}, 2000);

		return () => {
			socket.off(handleOpenDocs);
		};
	}, []);

	return (
		<>
			<div className="flex flex-row items-center justify-between p-3">
				<Link to="/">
					<img src={logo} alt="CollaboraText" className="h-12 w-auto" />
				</Link>
				{user.isAuthenticated() ? (
					<div className="flex h-12 justify-center items-center">
						<HeaderButton onClick={logOut}>Log out</HeaderButton>
						<div className="rounded-full h-12 w-12 bg-indigo-600">
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
				) : null}
			</div>
			<>
				<div className="flex flex-row bg-indigo-500 items-center justify-center p-2 lg:p-4">
					{!isLoading && (
						<>
							<button className="mr-24" onClick={createDoc}>
								<img src={newDoc} alt="New Document" className="h-32" />
							</button>
							<h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl">
								Hello!
							</h1>
						</>
					)}
				</div>
				<Docs
					briefDocs={briefDocs}
					isLoading={isLoading}
					onChangePage={(page) => setPage(page)}
					page={page}
					onChangeSortingOptions={(sortBy, sortOrder) => {
						setIsLoading(true);
						socket.send(MessageAction.OPEN_DOCS, {
							take: 10,
							skip: page * 10,
							order: sortOrder,
							sortBy,
						});
						setSortBy(sortBy);
						setSortOrder(sortOrder);
					}}
					sortBy={sortBy}
					sortOrder={sortOrder}
					onDocDelete={handleDeleteDoc}
				/>
			</>
		</>
	);
};
