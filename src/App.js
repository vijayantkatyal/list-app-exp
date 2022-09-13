import { useEffect, useState } from 'react';
import { Outlet } from "react-router-dom";
import { Container, Header, Sidebar, Sidenav, Content, Navbar, Nav, Button, Uploader, Modal, Input, Form, Checkbox, CheckboxGroup, Schema } from 'rsuite';
import ListIcon from '@rsuite/icons/List';
import PlusIcon from '@rsuite/icons/Plus';
import TableIcon from '@rsuite/icons/Table';
import PageIcon from '@rsuite/icons/Page';

import { Link, useNavigate } from "react-router-dom";

import * as Papa from "papaparse";

import 'rsuite/dist/rsuite.min.css';
import "./App.css";
import _ from 'lodash';

// import database from './database';

function classNames(...classes) {
	return classes.filter(Boolean).join(' ')
}

function App() {

	const { ipcRenderer } = window;
	const [lists, setLists] = useState([]);
	const [activeKey, setActiveKey] = useState(null);

	const initFormValue = {
		list_name: "",
		checkbox: []
	}

	const [newFile, setNewFile] = useState(null);
	const [formValue, setFormValue] = useState(initFormValue);
	const [newColumnData, setNewColumnData] = useState();
	const [newListData, setNewListData] = useState([]);
	const [formErrorMsg, setFormErrorMsg] = useState();

	const [openModal, setOpenModal] = useState(false);
	const handleOpenModal = () => setOpenModal(true);
	const handleCloseModal = () => setOpenModal(false);

	const navigate = useNavigate();

	async function getAllLists() {
		var _req = {
			"query": "get_all_tables",
			"table_name": null
		};
		var _res = await ipcRenderer.sendSync('message', _req);
		setLists(_res);
	}

	// async function addNewTable() {

	// }

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

		// console.log(files[0].blobFile);

		setNewFile(files[0].blobFile);

		Papa.parse(files[0].blobFile, {
			header: true,
			dynamicTyping: true,
			skipEmptyLines: true,
			complete: function (results) {
				// console.log(results);
				// alert(results.meta.fields);

				var _array = [];
				results.meta.fields?.map((coulmn, index) => {
					_array.push(coulmn);
				});

				setNewColumnData(_array);

				handleOpenModal();

			}
		});
	}

	async function handleFormSubmit() {

		var _err = "";
		if(formValue.list_name == null || formValue.list_name == "")
		{
			_err = "List name cannot be empty.";
		}

		if(formValue.checkbox.length == 0)
		{
			_err += " Select atleast one column for import";
		}

		setFormErrorMsg(_err);

		if(formValue.list_name != null && formValue.list_name != "" && formValue.checkbox.length > 0)
		{
			// alert("saving to database");
			// console.log(formValue.checkbox);

			
			Papa.parse(newFile, {
				header: true,
				dynamicTyping: true,
				skipEmptyLines: true,
				complete: async function (results) {
					// console.log(results.data);

					var _new_array = _.map(results.data, (el => _.pick(el, formValue.checkbox)));
					console.log(_new_array);

					var _req = {
						"query": "insert_new_table",
						"table_name": formValue.list_name,
						"columns": formValue.checkbox,
						"data": _new_array
					};
					var _res = await ipcRenderer.sendSync('message', _req);

					if(_res == "data_created")
					{
						// close modal
						handleCloseModal();

						// open list
						navigate("/list/" + formValue.list_name);
					}
					else
					{
						alert(_res);
					}
				}
			});
		}
	}

	// fetch lists / tables
	useEffect(() => {
		getAllLists();
	}, []);

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
											activeKey == list.id ? 'active' : null,
											'nav-item'
										)
									}
									style={{ paddingLeft: '45px' }}
									onClick={() => navigate("/list/" + list.name)}
								>
									{list.name}
								</Nav.Item>
							))}
							{lists.length > 0 ?
								<Nav.Item divider style={{ borderTop: '1px solid #ddd' }} /> : null}
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
				</div> : null}

				{activeKey != "add_new" ? <Outlet /> : null}

				{activeKey == null ? <div>Welcome</div> : null}
			</Container>

			<Modal open={openModal} onClose={handleCloseModal} backdrop="static">
				<Modal.Header>
					<Modal.Title>New List</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					
					<Form formValue={formValue} onChange={formValue => setFormValue(formValue)}>
						<Form.Group controlId="checkbox">
          					<Form.ControlLabel>Select Columns to Import:</Form.ControlLabel>
          					<Form.Control name="checkbox" accepter={CheckboxGroup} inline>
								{newColumnData?.map((column, index) => (
									<Checkbox value={column} checked>{column}</Checkbox>
								))}
								 </Form.Control>
        				</Form.Group>

						<Form.Group controlId="list_name">
							<Form.ControlLabel>New List Name</Form.ControlLabel>
							<Form.Control name="list_name" required/>
						</Form.Group>
					</Form>

					<br/>

					{formErrorMsg != "" ?
					<div style={{ color: 'red' }}>
						{formErrorMsg}
					</div> : null}

				</Modal.Body>
				<Modal.Footer>
					<Button onClick={handleFormSubmit} appearance="primary">
						Import List
					</Button>
					<Button onClick={handleCloseModal} appearance="subtle">
						Cancel
					</Button>
				</Modal.Footer>
			</Modal>

		</Container>
	)
}

export default App;