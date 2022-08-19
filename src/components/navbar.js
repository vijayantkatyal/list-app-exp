import { Fragment, useEffect, useState } from 'react';
import { Link } from "react-router-dom";

export function NavBar() {
	return (
        <>
			<Link to="/" className="-m-2 p-2 block text-gray-500">
				All
			</Link>

			<Link to="/category/1" className="-m-2 p-2 block text-gray-500">
				Page 1
			</Link>
		</>
	)
}