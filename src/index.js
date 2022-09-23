import React from 'react';
// import ReactDOM from 'react-dom';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter, Link, useLocation, Navigate } from "react-router-dom";
import { Routes, Route } from "react-router-loading";
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const Overview = React.lazy(() => import('./screens/overview'));
const ListPage = React.lazy(() => import('./screens/list'));

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
	<HashRouter>
    	<Routes>
			<Route exact path="/" element={<App/>}>
				
				<Route index exact path="/list/:id" element={
					<React.Suspense fallback={<>...</>}>
						<ListPage/>
					</React.Suspense>
				} loading/>

				<Route exact path="/info" element={
					<React.Suspense fallback={<>...</>}>
						<Overview/>
					</React.Suspense>
				} loading/>
			</Route>
		</Routes>
	</HashRouter>
  </React.StrictMode>);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
