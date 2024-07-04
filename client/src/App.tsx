import { RouterProvider } from "react-router-dom";
import { initializeApp } from "firebase/app";

import { routes } from "./routes";
import { config } from "./firebase";
import { getAuth } from "firebase/auth";
import { User } from "./user";

export const App = () => {
	const app = initializeApp(config);
	const auth = getAuth(app);

	auth.onAuthStateChanged(async (currentUser) => {
		const user = User.getInstance();

		if (currentUser) {
			user.setFirebaseUser(currentUser);
			user.setToken(await currentUser.getIdToken());
		} else {
			user.clear();
		}
	});

	return <RouterProvider router={routes} />;
};
