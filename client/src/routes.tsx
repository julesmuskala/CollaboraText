import { createBrowserRouter } from "react-router-dom";

import { Home, Login, Error, Document } from "./pages";

export const routes = createBrowserRouter([
	{
		path: "/",
		element: <Home />,
		errorElement: <Error />,
	},
	{
		path: "/login",
		element: <Login />,
		errorElement: <Error />,
	},
	{
		path: "/doc/:id",
		element: <Document />,
		errorElement: <Error />,
	},
]);
