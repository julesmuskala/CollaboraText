import { FC, useEffect, useState } from "react";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";
import { User } from "../user";

interface LoginProps {}

export const Login: FC<LoginProps> = () => {
	const navigate = useNavigate();
	const auth = getAuth();

	const [isLoading, setIsLoading] = useState(true);

	const signIn = async () => {
		setIsLoading(true);

		const provider = new GoogleAuthProvider();
		const res = await signInWithPopup(auth, provider);

		const user = User.getInstance();
		user.setFirebaseUser(res.user);
		user.setToken(await res.user.getIdToken());

		navigate("/");
	};

	useEffect(() => {
		const user = User.getInstance();

		setTimeout(() => {
			if (user.getToken()) {
				navigate("/");
			}

			setIsLoading(false);
		}, 2000);
	}, []);

	return (
		<div className="min-h-screen w-full flex flex-col align-center justify-center items-center p-4">
			{!isLoading ? (
				<>
					<h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
						We need you in our docs
					</h1>
					<div className="scale-[0.3] sm:scale-[0.4] md:scale-[0.5] lg:scale-[0.55] xl:scale-[0.6] max-md:h-[13rem] block">
						<img src={logo} alt="CollaboraText" />
					</div>
					<button
						onClick={signIn}
						className="text-slate-100 bg-indigo-600 py-4 px-6 rounded-full transition-all duration-1000 hover:bg-purple-600"
					>
						Sign in with Google
					</button>
				</>
			) : (
				<span>Loading...</span>
			)}
		</div>
	);
};
