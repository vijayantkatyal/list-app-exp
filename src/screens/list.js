import { Fragment, useEffect, useState, useRef } from 'react';
import { Table, Pagination, FlexboxGrid, Input, SelectPicker, Dropdown, IconButton, Modal, Placeholder, Button, CheckPicker, Checkbox, TagInput } from 'rsuite';
import { useParams, Link, useNavigate } from "react-router-dom";
import { filter } from 'lodash';
import GearIcon from '@rsuite/icons/Gear';
import * as Papa from "papaparse";
import { HotKeys } from "react-hotkeys";
import TrashIcon from '@rsuite/icons/Trash';

const { Column, HeaderCell, Cell } = Table;

const CheckCell = ({ rowData, onChange, checkedKeys, dataKey, ...props }) => (
	<Cell {...props} style={{ padding: 0 }}>
		<div style={{ lineHeight: '46px' }}>
		<Checkbox
			value={rowData[dataKey]}
			inline
			onChange={onChange}
			checked={checkedKeys.some(item => item === rowData[dataKey])}
		/>
		</div>
	</Cell>
);

const EditableCell = ({ rowData, dataKey, onChange, ...props }) => {
	const editing = rowData.status === 'EDIT';
	return (
		<Cell {...props} className={editing ? 'table-content-editing' : ''}>
		{editing ? (
			<input
			className="rs-input"
			defaultValue={rowData[dataKey]}
			onChange={event => {
				onChange && onChange(rowData.id, dataKey, event.target.value);
			}}
			/>
		) : (
			<span className="table-content-edit-span">{rowData[dataKey]}</span>
		)}
		</Cell>
	);
};

const ActionCell = ({ rowData, dataKey, onClick, ...props }) => {
	return (
		<Cell {...props} style={{ padding: '6px' }}>
		<Button
			appearance="link"
			onClick={() => {
			onClick(rowData.id);
			}}
		>
			{rowData.status === 'EDIT' ? 'Save' : 'Edit'}
		</Button>
		</Cell>
	);
};

const DeleteCell = ({ rowData, dataKey, onClick, ...props }) => {
	return (
		<Cell {...props} style={{ padding: '6px' }}>
			<IconButton
				icon={<TrashIcon/>}
				appearance="link"
				color="red"
				onClick={() => {
					onClick(rowData.id);
				}}
			/>
		</Cell>
	);
};

export default function CategoryPage() {
	let { id } = useParams();
	const navigate = useNavigate();

	const [checkedKeys, setCheckedKeys] = useState([]);

	const { ipcRenderer } = window;

	const [filterColumn, setFilterColumn] = useState('email');
	const [filterText, setFilterText] = useState(null);

	const [sortColumn, setSortColumn] = useState();
	const [sortType, setSortType] = useState();
	const [loading, setLoading] = useState(true);

	const [columns, setColumns] = useState([]);
	const [data, setData] = useState([]);

	const [limit, setLimit] = useState(100);
	const [page, setPage] = useState(1);
	const [totalLength, setTotalLength] = useState(0);

	const [rmInput, setRmInput] = useState(null);
	const [openRM, setOpenRM] = useState(false);
  	const handleOpenRM = () => setOpenRM(true);
  	const handleCloseRM = () => setOpenRM(false);

	const [rdeInput, setRdeInput] = useState(null);
	const [openRDE, setOpenRDE] = useState(false);
	const handleOpenRDE = () => setOpenRDE(true);
	const handleCloseRDE = () => setOpenRDE(false);

	const [openSBE, setOpenSBE] = useState(false);
  	const handleOpenSBE = () => setOpenSBE(true);
  	const handleCloseSBE = () => setOpenSBE(false);

	const search_containerRef = useRef();
	
	const picker = useRef();
	const [value, setValue] = useState([]);

	const picker_TWO = useRef();
	const [valueTWO, setValueTWO] = useState([]);

	const picker_THREE = useRef();
	const [valueTHREE, setValueTHREE] = useState([]);

	const picker_FOUR = useRef();
	const [valueFOUR, setValueFOUR] = useState(null);

	let checked = false;
	let indeterminate = false;

	if (checkedKeys.length === data?.length) {
		checked = true;
	} else if (checkedKeys.length === 0) {
		checked = false;
	} else if (checkedKeys.length > 0 && checkedKeys.length < data?.length) {
		indeterminate = true;
	}

	const handleCheckAllRows = (value, checked) => {
	const keys = checked ? data?.map(item => item.id) : [];
		setCheckedKeys(keys);
	};
	const handleCheck = (value, checked) => {
	const keys = checked ? [...checkedKeys, value] : checkedKeys.filter(item => item !== value);
		setCheckedKeys(keys);
	};

	const handleChange = value => {
		setValue(value);
	};

	const handleChangeTWO = value => {
		setValueTWO(value);
	};

	const handleChangeTHREE = value => {
		setValueTHREE(value);
	};

	const handleCheckAll = (value, checked) => {
		setValue(checked ? lists : []);
	};

	const handleCheckAllTWO = (value, checked) => {
		setValueTWO(checked ? lists_TWO : []);
	};

	const handleCheckAllTHREE = (value, checked) => {
		setValueTHREE(checked ? lists_THREE : []);
	};

	const [lists, setLists] = useState([]);
	const [lists_TWO, setLists_TWO] = useState([]);
	const [lists_THREE, setLists_THREE] = useState([]);

	const listsData = lists?.filter(i => i[0] != "id").map(
		item => ({ label: item, value: item })
	);

	const listsData_TWO = lists_TWO?.filter(i => i[0] != "id").map(
		item => ({ label: item, value: item })
	);

	const listsData_THREE = lists_THREE?.filter(i => i[0] != "id").map(
		item => ({ label: item, value: item })
	);

	const footerStyles = {
		padding: '10px 2px',
		borderTop: '1px solid #e5e5e5'
	};

	const footerButtonStyle = {
		float: 'right',
		marginRight: 10,
		marginTop: 2
	};

	const [listMName, setListMName] = useState(null);
	const [openML, setOpenML] = useState(false);
	const handleOpenML = () => setOpenML(true);
	const handleCloseML = () => setOpenML(false);

	const handleChangeLimit = dataKey => {
		setPage(1);
		setLimit(dataKey);
	};

	const handleSortColumn = (sortColumn, sortType) => {
		setLoading(true);
		setTimeout(() => {
			setLoading(false);
			setSortColumn(sortColumn);
			setSortType(sortType);
		}, 500);
	};

	const columnsData = columns?.filter(i => i[0] != "id").map(
		item => ({ label: item[0], value: item[0] })
	);

	const [listSName, setListSName] = useState(null);
	const [openSL, setOpenSL] = useState(false);
	const handleOpenSL = () => setOpenSL(true);
	const handleCloseSL = () => setOpenSL(false);

	const [listUName, setListUName] = useState(null);
	const [openUL, setOpenUL] = useState(false);
	const handleOpenUL = () => setOpenUL(true);
	const handleCloseUL = () => setOpenUL(false);


	// const data = defaultData.filter((v, i) => {
	// 	const start = limit * (page - 1);
	// 	const end = start + limit;
	// 	return i >= start && i < end;
	// });

	async function getColumns() {
		console.log("loading columns");
		var _req = {
			"query": "get_table_schema",
			"table_name": id
		};
		var _res = await ipcRenderer.sendSync('message', _req);
		var _res_array = Object.entries(_res);
		setColumns(_res_array);
	}

	async function fetchData() {
		console.log("loading data");
		var _req = {
			"query": "get_table_data",
			"table_name": id
		};
		var _res = await ipcRenderer.sendSync('message', _req);
		// var _res_array = Object.entries(_res);
		// setColumns(_res_array);
		console.log(_res);
		setData(_res);
		setTotalLength(_res.length);
		setLoading(false);
	}

	const getData = () => {
		var _dd = data;

		if (sortColumn && sortType) {
			_dd = data.sort((a, b) => {
				let x = a[sortColumn];
				let y = b[sortColumn];
				if (typeof x === 'string') {
					x = x.charCodeAt();
				}
				if (typeof y === 'string') {
					y = y.charCodeAt();
				}
				if (sortType === 'asc') {
					return x - y;
				} else {
					return y - x;
				}
			});
		}

		if(filterText != null && filterColumn != null)
		{
			if(_dd.length > 0)
			{
				var _dd = _dd.filter(function(item){
					if(item && item[filterColumn])
					{
						return item[filterColumn].includes(filterText);
					}
				});
			}
		}

		return _dd.filter((v, i) => {
			const start = limit * (page - 1);
			const end = start + limit;
			return i >= start && i < end;
		});
	};

	useEffect(() => {
		if(filterText != null && filterColumn != null)
		{
			if(data.length > 0)
			{
				var _dd = data;
				var _dd = _dd.filter(function(item){
					if(item && item[filterColumn])
					{
						return item[filterColumn].includes(filterText);
					}
				});

				setTotalLength(_dd.length);
			}
		}
	}, [filterText]);

	useEffect(() => {

		setLimit(100);
		setPage(1);
		setFilterText(null);
		setFilterColumn('email');

		getColumns();
		fetchData();

		setCheckedKeys([]);

		search_containerRef.current.focus();
	}, [id]);

	function renameList() {
		handleOpenRM();
	}

	async function handleSubmitRM() {

		if(rmInput != null && rmInput != "")
		{
			// //Logic to delete
			var _req = {
				"query": "rename_table",
				"table_name": id,
				"table_name_new": rmInput
			};
			var _res = await ipcRenderer.sendSync('message', _req);
			// navigate to welcome / add list
			handleCloseRM();
			navigate("/list/"+rmInput);
			setRmInput(null);
		}
		else
		{
			alert("enter a list name");
		}
	}

	async function deleteList() {
		var result = window.confirm("Sure, Want to delete this list?");
		if (result) {
			// //Logic to delete
			var _req = {
				"query": "delete_table",
				"table_name": id
			};
			var _res = await ipcRenderer.sendSync('message', _req);
			alert(_res);
			// navigate to welcome / add list
			navigate("/info");
		}
	}

	function exportList() {

		// console.log(columnsData);

		let csv = Papa.unparse({
			data: data
		});

		// console.log(csv);

		if (csv == null) return;

		var blob = new Blob([csv]);
		if (window.navigator.msSaveOrOpenBlob)  // IE hack; see http://msdn.microsoft.com/en-us/library/ie/hh779016.aspx
			window.navigator.msSaveBlob(blob, id + ".csv");
		else
		{
			var a = window.document.createElement("a");
			a.href = window.URL.createObjectURL(blob, {type: "text/plain"});
			a.download = id + ".csv";
			document.body.appendChild(a);
			a.click();  // IE: "Access is denied"; see: https://connect.microsoft.com/IE/feedback/details/797361/ie-10-treats-blob-url-as-cross-origin-and-denies-access
			document.body.removeChild(a);
		}
	}

	async function removeDuplicates() {

		var _req = {
			"query": "remove_duplicate_table",
			"table_name": id
		};
		var _res = await ipcRenderer.sendSync('message', _req);
		console.log(_res);
		// alert(_res);
	}

	function removeEmailsFilter() {
		handleOpenRDE();
	}

	async function handleSubmitRDE() {
		
		if(rdeInput != null && rdeInput != "")
		{
			var _req = {
				"query": "filter_email_from_table",
				"table_name": id,
				"words": rdeInput
			};
			var _res = await ipcRenderer.sendSync('message', _req);
			console.log(_res);

			setRdeInput(null);
		}
		else
		{
			alert("please enter words");
		}
	}

	async function removeMissingEmail() {
		var _req = {
			"query": "remove_missing_email_from_table",
			"table_name": id
		};
		var _res = await ipcRenderer.sendSync('message', _req);
		console.log(_res);
	}

	async function mergeLists() {

		// get lists names
		var _req = {
			"query": "get_all_tables",
			"table_name": null
		};
		var _res = await ipcRenderer.sendSync('message', _req);
		
		var _dd = _res.map((item, index) => {
			return item.name
		});
		
		setLists(_dd);

		// console.log(_dd);
		// console.log(listsData);

		// show in checkboxes
		// with select all option

		handleOpenML();
	}

	async function handleSubmitML() {

		if(listMName != null && listMName != "" && value.length > 1)
		{
			// send all list names
			// get lists names
			var _req = {
				"query": "merge_tables",
				"table_name": listMName,
				"tables": value
			};
			var _res = await ipcRenderer.sendSync('message', _req);
			console.log(_res);

			handleCloseML();
		}
		else
		{
			alert("select atleast 2 lists and list name")
		}
	}

	const renderIconButton = (props, ref) => {
		return (
		  <IconButton {...props} ref={ref} icon={<GearIcon />} circle color="red" appearance="ghost" style={{ marginLeft: '10px' }}/>
		);
	};

	async function subtractList() {
		// get lists names
		var _req = {
			"query": "get_all_tables",
			"table_name": null
		};
		var _res = await ipcRenderer.sendSync('message', _req);
		
		var _dd = _res.filter((i) => i.name != id).map((item, index) => {
			return item.name
		});
		
		setLists_TWO(_dd);

		handleOpenSL();
	}

	async function handleSubmitSL() {

		if(listSName != null && listSName != "" && valueTWO.length > 0)
		{
			// send all list names
			// get lists names
			var _req = {
				"query": "subtract_tables",
				"table_name": listSName,
				"main_table": id,
				"tables": valueTWO
			};
			var _res = await ipcRenderer.sendSync('message', _req);
			console.log(_res);

			handleCloseSL();
		}
		else
		{
			alert("select atleast one list(s) and list name")
		}
	}

	async function uniqueList() {
		var _req = {
			"query": "get_all_tables",
			"table_name": null
		};
		var _res = await ipcRenderer.sendSync('message', _req);
		
		var _dd = _res.filter((i) => i.name != id).map((item, index) => {
			return item.name
		});
		
		setLists_THREE(_dd);

		handleOpenUL();
	}

	async function handleSubmitUL() {

		if(listUName != null && listUName != "" && valueTHREE.length > 0)
		{
			// send all list names
			// get lists names
			var _req = {
				"query": "unique_tables",
				"table_name": listUName,
				"main_table": id,
				"tables": valueTHREE
			};
			var _res = await ipcRenderer.sendSync('message', _req);
			console.log(_res);

			handleCloseUL();
		}
		else
		{
			alert("select atleast one list(s) and list name")
		}
	}

	function splitListByDomain() {
		handleOpenSBE();
	}

	async function handleSubmitSBE() {
		if(valueFOUR != "" && valueFOUR != null)
		{
			// send all list names
			// get lists names
			var _req = {
				"query": "split_email_tables",
				"main_table": id,
				"domains": valueFOUR
			};
			var _res = await ipcRenderer.sendSync('message', _req);
			console.log(_res);

			handleCloseSBE();
		}
		else
		{
			alert("select atleast one domain")
		}
	}

	const keyMap = {
		SEARCH: "ctrl+f"
	};

	const handlers = {
		SEARCH: () => {
			search_containerRef.current.focus();
		}
	};

	const handleChangeRow = (id, key, value) => {
		const nextData = Object.assign([], data);
		nextData.find(item => item.id === id)[key] = value;
		setData(nextData);
	};

	async function handleEditState(rid) {
		const nextData = Object.assign([], data);
		const activeItem = nextData.find(item => item.id === rid);

		if(activeItem.status)
		{
			var _new_data = activeItem;
			
			// save to database
			var _req = {
				"query": "edit_row",
				"table_name": id,
				"row_id": rid,
				"first_name": _new_data.first_name,
				"last_name": _new_data.last_name,
				"email": _new_data.email
			};
			var _res = await ipcRenderer.sendSync('message', _req);
		}

		activeItem.status = activeItem.status ? null : 'EDIT';
		setData(nextData);
	};

	async function deleteRow(rid) {
		var result = window.confirm("Sure, Want to delete this row?");
		if (result) {
			console.log(rid);

			var _req = {
				"query": "delete_row",
				"table_name": id,
				"row_id": rid
			};
			var _res = await ipcRenderer.sendSync('message', _req);

			const nextData = Object.assign([], data);
			// nextData.find(item => item.id === id)[key] = value;
			nextData.splice(nextData.findIndex(function(i){
				return i.id == rid;
			}), 1);
			setData(nextData);
		}
	};

	async function deleteSelectedRows() {
		var result = window.confirm("Sure, Want to delete these rows?");
		if(result)
		{
			var _ids = checkedKeys;

			var _req = {
				"query": "delete_rows",
				"table_name": id,
				"row_ids": _ids
			};

			var _res = await ipcRenderer.sendSync('message', _req);

			const nextData = Object.assign([], data);
			
			_ids.forEach(function(rid, index){
				nextData.splice(nextData.findIndex(function(i){
					return i.id == rid;
				}), 1);
			});

			setData(nextData);
			
		}
	}

	return (
		<HotKeys keyMap={keyMap} handlers={handlers}>
		<div>
			<div className="show-grid">
				<FlexboxGrid justify="space-between">
					<FlexboxGrid.Item colspan={12}>
						<h3>
							{id}
							<Dropdown renderToggle={renderIconButton}>
								<Dropdown.Item onSelect={renameList}>Rename</Dropdown.Item>
								<Dropdown.Item onSelect={exportList}>Export (CSV)</Dropdown.Item>
								<Dropdown.Item divider />
								<Dropdown.Menu title="Repair">
									<Dropdown.Item>Emails (Domain)</Dropdown.Item>
									<Dropdown.Item onSelect={removeDuplicates}>Remove Duplicates</Dropdown.Item>
									<Dropdown.Item onSelect={removeEmailsFilter}>Remove Emails (Filter)</Dropdown.Item>
									<Dropdown.Item onSelect={removeMissingEmail}>Remove Null Data</Dropdown.Item>
								</Dropdown.Menu>
								<Dropdown.Menu title="Actions">
									<Dropdown.Item onSelect={mergeLists}>Merge</Dropdown.Item>
									<Dropdown.Item onSelect={subtractList}>Subtract</Dropdown.Item>
									<Dropdown.Item onSelect={uniqueList}>Unique</Dropdown.Item>
								</Dropdown.Menu>
								<Dropdown.Menu title="Split">
									<Dropdown.Item disabled>By Count (1000)</Dropdown.Item>
									<Dropdown.Item onSelect={splitListByDomain}>Domain</Dropdown.Item>
								</Dropdown.Menu>
								<Dropdown.Item divider />
								<Dropdown.Item onSelect={deleteList} style={{ color: 'red' }}>Delete</Dropdown.Item>
							</Dropdown>

							{checkedKeys.length > 0 ? <Button appearance="ghost" color="red" style={{ marginLeft: '5px' }} onClick={deleteSelectedRows}>Delete Selected</Button>: null}
						</h3>
					</FlexboxGrid.Item>
					<FlexboxGrid.Item colspan={12} style={{ textAlign: 'end' }}>
						<SelectPicker data={columnsData} style={{ width: 150, display: 'inline-block' }} value={filterColumn} onChange={setFilterColumn} />
						<Input value={filterText} onChange={setFilterText} style={{ width: 200, display: 'inline-block' }} ref={search_containerRef} placeholder="search here"/>
					</FlexboxGrid.Item>
				</FlexboxGrid>
			</div>
			<hr />
			<div style={{ height: "calc(100vh - 170px)" }}>
				<Table data={getData()} autoHeight={false} fillHeight={true} virtualized loading={loading} sortColumn={sortColumn} sortType={sortType} onSortColumn={handleSortColumn}>
					<Column width={50} align="center">
						<HeaderCell style={{ padding: 0 }}>
							<div style={{ lineHeight: '40px' }}>
							<Checkbox
								inline
								checked={checked}
								indeterminate={indeterminate}
								onChange={handleCheckAllRows}
							/>
							</div>
						</HeaderCell>
						<CheckCell dataKey="id" checkedKeys={checkedKeys} onChange={handleCheck} />
					</Column>
					{columns?.map((column, index) => (
						<Column width={column[0] == "email" || column[0] == "Email" ? 350 : 100} flexGrow={column[0] == "email" || column[0] == "Email" ? 2 : 1} sortable>
							<HeaderCell>{column[0]}</HeaderCell>
							{column[0] != "id" ? <EditableCell dataKey={column[0]} onChange={handleChangeRow} /> : <Cell dataKey={column[0]} />}
						</Column>
					))}
					<Column flexGrow={1}>
						<HeaderCell></HeaderCell>
						<ActionCell dataKey="id" onClick={handleEditState} />
					</Column>
					<Column flexGrow={1}>
						<HeaderCell></HeaderCell>
						<DeleteCell dataKey="id" onClick={deleteRow} />
					</Column>
				</Table>
			</div>
			<div style={{ padding: 20 }}>
				<Pagination
					prev
					next
					first
					last
					ellipsis
					boundaryLinks
					maxButtons={5}
					size="xs"
					layout={['total', '-', 'limit', '|', 'pager', 'skip']}
					total={totalLength}
					limitOptions={[100, 500, 1000, 5000]}
					limit={limit}
					activePage={page}
					onChangePage={setPage}
					onChangeLimit={handleChangeLimit}
				/>
			</div>

			<Modal open={openRM} onClose={handleCloseRM} backdrop="static">
				<Modal.Header>
					<Modal.Title>Rename List</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Input placeholder="List Name" value={rmInput} onChange={setRmInput} />
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={handleSubmitRM} appearance="primary">
						Ok
					</Button>
					<Button onClick={handleCloseRM} appearance="subtle">
						Cancel
					</Button>
				</Modal.Footer>
			</Modal>

			<Modal open={openRDE} onClose={handleCloseRDE} backdrop="static">
				<Modal.Header>
					<Modal.Title>Filter Emails</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Input placeholder="junk, demo" value={rdeInput} onChange={setRdeInput} />
					list of words to filter
					<br/>
					<br/>
					will also remove emails missing @
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={handleSubmitRDE} appearance="primary">
						Ok
					</Button>
					<Button onClick={handleCloseRDE} appearance="subtle">
						Cancel
					</Button>
				</Modal.Footer>
			</Modal>

			<Modal open={openML} onClose={handleCloseML} backdrop="static">
				<Modal.Header>
					<Modal.Title>Merge Lists</Modal.Title>
				</Modal.Header>
				<Modal.Body>

					<Input placeholder="New List Name" value={listMName} onChange={setListMName}/>
					<br/>
					<CheckPicker
						block={true}
						data={listsData}
						placeholder="Select Lists to Merge"
						ref={picker}
						value={value}
						onChange={handleChange}
						renderExtraFooter={() => (
						<div style={footerStyles}>
							<Checkbox
								inline
								indeterminate={value.length > 0 && value.length < lists.length}
								checked={value.length === lists.length}
								onChange={handleCheckAll}
							>
								Check all
							</Checkbox>

							<Button
								style={footerButtonStyle}
								appearance="primary"
								size="sm"
								onClick={() => {
									picker.current.close();
								}}
							>
							Ok
							</Button>
						</div>
						)}
					/>
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={handleSubmitML} appearance="primary">
						Ok
					</Button>
					<Button onClick={handleCloseML} appearance="subtle">
						Cancel
					</Button>
				</Modal.Footer>
			</Modal>

			<Modal open={openSL} onClose={handleCloseSL} backdrop="static">
				<Modal.Header>
					<Modal.Title>Subtract Lists</Modal.Title>
				</Modal.Header>
				<Modal.Body>

					Main List Name
					<br/>
					<b>{id}</b>
					<br/>
					<br/>
					<Input placeholder="New List Name" value={listSName} onChange={setListSName}/>
					<br/>
					<CheckPicker
						block={true}
						data={listsData_TWO}
						placeholder="Select Lists to Subtract"
						ref={picker_TWO}
						value={valueTWO}
						onChange={handleChangeTWO}
						renderExtraFooter={() => (
						<div style={footerStyles}>
							<Checkbox
								inline
								indeterminate={valueTWO.length > 0 && valueTWO.length < lists_TWO.length}
								checked={valueTWO.length === lists_TWO.length}
								onChange={handleCheckAllTWO}
							>
								Check all
							</Checkbox>

							<Button
								style={footerButtonStyle}
								appearance="primary"
								size="sm"
								onClick={() => {
									picker_TWO.current.close();
								}}
							>
							Ok
							</Button>
						</div>
						)}
					/>
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={handleSubmitSL} appearance="primary">
						Ok
					</Button>
					<Button onClick={handleCloseSL} appearance="subtle">
						Cancel
					</Button>
				</Modal.Footer>
			</Modal>

			<Modal open={openUL} onClose={handleCloseUL} backdrop="static">
				<Modal.Header>
					<Modal.Title>Unique Lists</Modal.Title>
				</Modal.Header>
				<Modal.Body>

					Main List Name
					<br/>
					<b>{id}</b>
					<br/>
					<br/>
					<Input placeholder="New List Name" value={listUName} onChange={setListUName}/>
					<br/>
					<CheckPicker
						block={true}
						data={listsData_THREE}
						placeholder="Select Lists for Unique"
						ref={picker_THREE}
						value={valueTHREE}
						onChange={handleChangeTHREE}
						renderExtraFooter={() => (
						<div style={footerStyles}>
							<Checkbox
								inline
								indeterminate={valueTHREE.length > 0 && valueTHREE.length < lists_THREE.length}
								checked={valueTHREE.length === lists_THREE.length}
								onChange={handleCheckAllTHREE}
							>
								Check all
							</Checkbox>

							<Button
								style={footerButtonStyle}
								appearance="primary"
								size="sm"
								onClick={() => {
									picker_THREE.current.close();
								}}
							>
							Ok
							</Button>
						</div>
						)}
					/>
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={handleSubmitUL} appearance="primary">
						Ok
					</Button>
					<Button onClick={handleCloseUL} appearance="subtle">
						Cancel
					</Button>
				</Modal.Footer>
			</Modal>

			<Modal open={openSBE} onClose={handleCloseSBE} backdrop="static">
				<Modal.Header>
					<Modal.Title>Split Lists by Email</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Input placeholder="@gmail, @outlook" value={valueFOUR} onChange={setValueFOUR} />
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={handleSubmitSBE} appearance="primary">
						Ok
					</Button>
					<Button onClick={handleCloseSBE} appearance="subtle">
						Cancel
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
		</HotKeys>
	);
}