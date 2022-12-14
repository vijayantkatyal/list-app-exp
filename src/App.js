import { useEffect, useState } from 'react';
import { Outlet } from "react-router-dom";
import { Container, Header, Sidebar, Sidenav, Content, Navbar, Nav, Button, Uploader, Modal, Input, Form, Checkbox, CheckboxGroup, Schema, SelectPicker } from 'rsuite';
import ListIcon from '@rsuite/icons/List';
import PlusIcon from '@rsuite/icons/Plus';
import TableIcon from '@rsuite/icons/Table';
import PageIcon from '@rsuite/icons/Page';
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';

import { useLoadingContext } from "react-router-loading";

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

	const loadingContext = useLoadingContext();
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
		loadingContext.done();
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

		setNewFile(files[files.length - 1].blobFile);

		Papa.parse(files[files.length - 1].blobFile, {
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

	const columnDataList = newColumnData?.map(item =>({
		label: item,
		value: item
	}));

	async function handleFormSubmit() {

		var _err = "";
		if(formValue.list_name == null || formValue.list_name == "")
		{
			_err = "List name cannot be empty.";
		}

		if(formValue.email_column == null || formValue.email_column == "")
		{
			_err += " Select email column for import";
		}

		setFormErrorMsg(_err);

		if(formValue.list_name != null && formValue.list_name != "" && formValue.email_column != null && formValue.email_column != "")
		{
			// alert("saving to database");
			console.log(formValue);

			
			Papa.parse(newFile, {
				header: true,
				dynamicTyping: true,
				skipEmptyLines: true,
				complete: async function (results) {
					// console.log(results.data);

					var _selected_columns_array = [
						formValue.first_name_column,
						formValue.last_name_column,
						formValue.email_column
					];

					// var _new_array = _.map(results.data, (el => _.pick(el, _selected_columns_array)));
					// console.log(_new_array);

					var _new_array = _.map(results.data, (el) => {
						return {
							first_name: formValue.first_name_column ? el[formValue.first_name_column] : null,
							last_name: formValue.last_name_column ? el[formValue.last_name_column] : null,
							email: el[formValue.email_column]
						}
					});

					// console.log(_new_array);

					var _req = {
						"query": "insert_new_table",
						"table_name": formValue.list_name,
						"columns": ["first_name", "last_name", "email"],
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
							<SimpleBar style={{ maxHeight: 'cal(100vh - 170px)' }}>
							{lists?.map((list, index) => (
								<Nav.Item
									eventKey={list.name}
									key={index}
									className={
										classNames(
											activeKey != null && activeKey == list.id ? 'active' : null,
											'nav-item'
										)
									}
									onClick={() => navigate("/list/" + list.name)}
								>
									# {list.name}
								</Nav.Item>
							))}
							</SimpleBar>
							{lists?.length > 0 ?
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
			</Container>

			<Modal open={openModal} onClose={handleCloseModal} backdrop="static">
				<Modal.Header>
					<Modal.Title>New List</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					
					<Form fluid formValue={formValue} onChange={formValue => setFormValue(formValue)}>

						<Form.Group controlId="list_name">
							<Form.ControlLabel>New List Name</Form.ControlLabel>
							<Form.Control name="list_name" required/>
						</Form.Group>

						<Form.Group controlId="first_name_column">
              				<Form.ControlLabel>Select First Name Column</Form.ControlLabel>
              				<Form.Control name="first_name_column" data={columnDataList} accepter={SelectPicker} />
            			</Form.Group>

						<Form.Group controlId="last_name_column">
              				<Form.ControlLabel>Select Last Name Column</Form.ControlLabel>
              				<Form.Control name="last_name_column" data={columnDataList} accepter={SelectPicker} />
            			</Form.Group>

						<Form.Group controlId="email_column">
              				<Form.ControlLabel>Select Email Column</Form.ControlLabel>
              				<Form.Control name="email_column" data={columnDataList} accepter={SelectPicker} />
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