import { Outlet } from "react-router-dom";
import { NavBar } from './components/navbar';
import "./App.css";

function App() {
	return (
		<div id="container" className="bg-white">
			<NavBar/>

			<main className="mt-24">
			 	<Outlet/>
			</main>
		</div>
	)
}

export default App;