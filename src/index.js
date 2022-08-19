import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const Overview = React.lazy(() => import('./screens/overview'));
const CategoryPage = React.lazy(() => import('./screens/category'));

ReactDOM.render(
  <React.StrictMode>
	<BrowserRouter>
    	<Routes>
			<Route path="/" element={<App/>}>
				<Route index element={
					<React.Suspense fallback={<>...</>}>
						<Overview/>
					</React.Suspense>
				}/>
				<Route path="category/:id" element={
					<React.Suspense fallback={<>...</>}>
						<CategoryPage/>
					</React.Suspense>
				} />
			</Route>
		</Routes>
	</BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
