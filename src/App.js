import { useEffect, useState } from 'react';
import { Outlet } from "react-router-dom";
import { Container, Header, Sidebar, Sidenav, Content, Navbar, Nav, Button, Uploader, Modal, Input, Form, Checkbox, CheckboxGroup, Schema, SelectPicker, Grid, Row, Col } from 'rsuite';
import ListIcon from '@rsuite/icons/List';
import PlusIcon from '@rsuite/icons/Plus';
import ReloadIcon from '@rsuite/icons/Reload';
import TableIcon from '@rsuite/icons/Table';
import PageIcon from '@rsuite/icons/Page';
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';
import TrashIcon from '@rsuite/icons/Trash';
import CheckIcon from '@rsuite/icons/Check';

import { Notification, useToaster, Placeholder } from 'rsuite';

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

	function message(type, text) {
		return (
			<Notification type={type} header={type} closable>
			<p>{text}</p>
			</Notification>
		);
	};

	const loadingContext = useLoadingContext();
	const { ipcRenderer } = window;
	const [lists, setLists] = useState([]);
	const [activeKey, setActiveKey] = useState(null);

	const [selectedLists, setSelectedLists] = useState([]);

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

	const toaster = useToaster();

	async function getAllLists() {
		var _req = {
			"query": "get_all_tables",
			"table_name": null
		};
		var _res = await ipcRenderer.sendSync('message', _req);
		setLists(_res);
		loadingContext.done();

		// alert("fetching all Lists");
		toaster.push(message("info", "all lists fetched"), {
			placement: 'bottomEnd'
		});
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
		
		// check if list name contains space or number
		if(formValue.list_name != null && formValue.list_name != "")
		{
			if(formValue.list_name.includes(' '))
			{
				_err = "Space not allowed in list name";
			}

			if(/\d/.test(formValue.list_name))
			{
				_err = "no number allowed in list name";
			}

			if(/[!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?]+/.test(formValue.list_name))
			{
				_err ="no special characters allowed";
			}
		}

		if(formValue.email_column == null || formValue.email_column == "")
		{
			_err += " Select email column for import";
		}

		setFormErrorMsg(_err);

		if(
			formValue.list_name != null && formValue.list_name != "" && 
			formValue.list_name.includes(' ') == false && 
			/\d/.test(formValue.list_name) == false &&
			/[!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?]+/.test(formValue.list_name) == false &&
			formValue.email_column != null && formValue.email_column != "")
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

					// var _list_name = formValue.list_name;

					// _list_name.replace(" ", "_");
					// _list_name.replace(".", "_");
					// _list_name.replace("+", "_");
					// _list_name.replace("@", "_");
					// _list_name.replace("!", "_");

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
						toaster.push(message("info", "opening list: " + formValue.list_name), {
							placement: 'bottomEnd'
						});
						navigate("/list/" + formValue.list_name);

						// remove null data

						var _null_req = {
							"query": "remove_missing_email_from_table",
							"table_name": formValue.list_name
						};
						var _null_res = await ipcRenderer.sendSync('message', _null_req);
						console.log(_null_res);
				
						toaster.push(message("info", "removed missing emails from list"), {
							placement: 'bottomEnd'
						});

						// validate
						toaster.push(message("info", "list data ops: validate emails"), {
							placement: 'bottomEnd'
						});

						// remove duplicates
						// var _dup_req = {
						// 	"query": "remove_duplicate_table",
						// 	"table_name": formValue.list_name
						// };
						// var _dup_res = await ipcRenderer.sendSync('message', _dup_req);
						// console.log(_dup_res);
						// // alert(_res);
				
						// toaster.push(message("info", "list duplicated removed"), {
						// 	placement: 'bottomEnd'
						// });

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

	async function listItemChecked(value, checked) {
		if(checked)
		{
			// add
			setSelectedLists([...selectedLists, value]);
		}
		else
		{
			// remove
			const tempList = [...selectedLists];
			tempList.splice(value, 1);
			setSelectedLists(tempList);
		}

		// console.log(selectedLists);
	}

	async function deleteSelectedLists() {
		console.log(selectedLists);

		var result = window.confirm("Sure, Want to delete selected list?");
		if (result) {
			// Logic to delete

			selectedLists.forEach(async (list_name, index) => {
				console.log(list_name);
				
				var _req = {
					"query": "delete_table",
					"table_name": list_name
				};
				var _res = await ipcRenderer.sendSync('message', _req);
				// alert(_res);

				toaster.push(message("info", "list removed"), {
					placement: 'bottomEnd'
				});
			});
			
			setSelectedLists([]);
			getAllLists();
			navigate("/info");
		}
	}

	return (
		<Container>
			<Sidebar
				style={{ background: '#f7f7fa', display: 'flex', flexDirection: 'column' }}
				width={300}
				className="sidebarContainer"
			>
				<Sidenav expanded={true} defaultOpenKeys={['3']} appearance="subtle">
					<Sidenav.Body>
						<Nav activeKey={activeKey} onSelect={setActiveKey}>
							<SimpleBar style={{ maxHeight: '75vh' }}>
							{lists?.map((list, index) => (
								<div>
									<Checkbox inline={true} value={list.name} onChange={(value, checked) => listItemChecked(value, checked)}/>
									<Nav.Item
										eventKey={list.name}
										key={index}
										className={
											classNames(
												activeKey != null && activeKey == list.id ? 'active' : null,
												'nav-item'
											)
										}
										style={{
											display: 'inline',
											paddingLeft: '5px'
										}}
										onClick={() => navigate("/list/" + list.name)}
									>
										# {list.name}
									</Nav.Item>
								</div>
							))}
							</SimpleBar>
							<Nav.Item divider style={{ borderTop: '1px solid #ddd' }} />
							<div>
							<Grid fluid>
								<Row className="show-grid">
									{selectedLists.length > 0 ?
									<Col>
										<Nav.Item icon={<TrashIcon />} onClick={deleteSelectedLists} style={{ color: 'red' }}>
											&nbsp;&nbsp;Delete
										</Nav.Item>
									</Col>
									: null }
									{/* <Col>
										<Nav.Item icon={<TrashIcon />} onClick={getAllLists}>
											&nbsp;&nbsp;Delete All
										</Nav.Item>		
									</Col> */}
								</Row>
							</Grid>
							</div>
							<Nav.Item divider style={{ borderTop: '1px solid #ddd' }} />
							<Nav.Item icon={<ReloadIcon />} onClick={getAllLists}>
								Refresh
							</Nav.Item>
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