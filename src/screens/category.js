import { Fragment, useEffect, useState } from 'react';
import { useParams, Link } from "react-router-dom";

export default function CategoryPage() {
	let { id } = useParams();

	return (
		<h1>{id}</h1>
	);
}