import { useEffect, useState } from 'react';
import { Outlet } from "react-router-dom";
import { Container, Header, Sidebar, Sidenav, Content, Navbar, Nav, Button, Uploader } from 'rsuite';
import ListIcon from '@rsuite/icons/List';
import PlusIcon from '@rsuite/icons/Plus';
import TableIcon from '@rsuite/icons/Table';
import PageIcon from '@rsuite/icons/Page';

import { Link, useNavigate } from "react-router-dom";

import * as Papa from "papaparse";

import 'rsuite/dist/rsuite.min.css';
import "./App.css";

// import database from './database';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

function App() {

	const { ipcRenderer } = window;
	const [lists, setLists] = useState([]);
	const [activeKey, setActiveKey] = useState(null);

	const [fileData, setFileData] = useState();
	
	const navigate = useNavigate();

	async function getAllLists() {
		var _req = {
			"query": "get_all_tables",
			"table_name": null
		};
		var _res = await ipcRenderer.sendSync('message',_req);
		setLists(_res);
	}

	function uploadFile(files) {
		// console.log(files);

		// // csv files
		// // get columns

		// let reader = new FileReader();
			
		// reader.onloadend = () => {
		// 	// this.setState({ loading: false, thumb: reader.result });
		// 	console.log(reader.result);
		// };

		// reader.readAsText(files[0].blobFile);

		// alert(files[0].blobFile);

		// alert("hello");

		Papa.parse(files[0].blobFile, {
			header: true,
			dynamicTyping: true,
			skipEmptyLines: true,
			complete: function(results) {
				// console.log(results);
				// alert(results.meta.fields);
				setFileData(results.meta.fields);

			}
		});
	}

	// fetch lists / tables
	useEffect(() => {
		getAllLists();
	},[]);

	// async function test_one() {
	// 	var _req = {
	// 		"query": "get_table_data",
	// 		"table_name": "books"
	// 	};
	// 	var _res = await ipcRenderer.sendSync('message',_req);
	// 	setBooks(_res);
	// }

	return (
		<Container style={{ height: '100vh' }}>
			<Sidebar
				style={{ background: '#f7f7fa', display: 'flex', flexDirection: 'column' }}
				width={260}
				className="sidebarContainer"
			>
				<Sidenav expanded={true} defaultOpenKeys={['3']} appearance="subtle">
					<Sidenav.Body>
						<Nav activeKey={activeKey} onSelect={setActiveKey}>
							{lists.map((list, index) => (
								<Nav.Item
									eventKey={list.name} icon={<TableIcon />}
									key={index}
									className={
										classNames(
											activeKey == list.id ? 'active': null,
											'nav-item'
										)
									}
									style={{ paddingLeft: '45px' }}
									onClick={() => navigate("/list/"+list.name)}
								>									
										{list.name}
								</Nav.Item>
							))}
							{lists.length > 0 ?
							<Nav.Item divider style={{ borderTop: '1px solid #ddd' }} /> : null }
							<Nav.Item eventKey="add_new" icon={<PlusIcon />}>
								Add
							</Nav.Item>
						</Nav>
					</Sidenav.Body>
				</Sidenav>
			</Sidebar>

			<Container className="mainContainer">
				{activeKey == "add_new" ? <div>
				<Uploader action="https://test.com" onChange={(files) => uploadFile(files)} draggable accept=".csv">
					<div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
						<span>Click or Drag files to this area to upload</span>
					</div>
				</Uploader>
				</div>: null}
				
				{activeKey != "add_new" ? <Outlet /> : null }

				{activeKey == null ? <div>Welcome</div>: null}

				{fileData}
			</Container>

		</Container>
	)
}

export default App;