import { Fragment, useEffect, useState, useRef } from 'react';
import { Table, Pagination, FlexboxGrid, Input, SelectPicker, Dropdown, IconButton, Modal, Placeholder, Button, CheckPicker, Checkbox, TagInput, Form } from 'rsuite';
import { useParams, Link, useNavigate } from "react-router-dom";
import { filter } from 'lodash';
import GearIcon from '@rsuite/icons/Gear';
import * as Papa from "papaparse";
import { HotKeys } from "react-hotkeys";
import TrashIcon from '@rsuite/icons/Trash';

import { Notification, useToaster } from 'rsuite';

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

	function message(type, text) {
		return (
			<Notification type={type} header={type} closable>
			<p>{text}</p>
			</Notification>
		);
	};

	const toaster = useToaster();

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

	const [openNRM, setOpenNRM] = useState(false);
  	const handleOpenNRM = () => setOpenNRM(true);
  	const handleCloseNRM = () => setOpenNRM(false);

	const initNRFormValue = {
		first_name: "",
		last_name: "",
		email: ""
	};

	const initLFormValue = {
		list_type: "",
		list_type_number: ""
	};

	const [nRFormValue, setNRFormValue] = useState(initNRFormValue);
	const [lFormValue, setLFormValue] = useState(initLFormValue);

	const [rdeInput, setRdeInput] = useState(null);
	const [openRDE, setOpenRDE] = useState(false);
	const handleOpenRDE = () => setOpenRDE(true);
	const handleCloseRDE = () => setOpenRDE(false);

	const [openSBE, setOpenSBE] = useState(false);
  	const handleOpenSBE = () => setOpenSBE(true);
  	const handleCloseSBE = () => setOpenSBE(false);

	const [openSBC, setOpenSBC] = useState(false);
  	const handleOpenSBC = () => setOpenSBC(true);
  	const handleCloseSBC = () => setOpenSBC(false);

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
		checked = true;
	}

	const handleCheckAllRows = (value, checked) => {
		
		if(filterText != null)
		{
			var _dd = data;
			if(_dd.length > 0)
			{
				var _dd = _dd.filter(function(item){
					if(item && item[filterColumn])
					{
						return item[filterColumn].includes(filterText);
					}
				});
			}
			var keys = checked ? _dd.map(item => item.id) : [];
			setCheckedKeys(keys);

			console.log(filterText);

			console.log(keys);
		}
		else
		{
			var keys = checked ? data?.map(item => item.id) : [];
			setCheckedKeys(keys);
		}
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

	const listTypeData = [
		{
			label: 'By Records Count',
			value: 'by_record_count'
		},
		{
			label: 'By No. of Lists',
			value: 'by_number_of_lists'
		}
	].map(
		item => ({
			label: item.label,
			value: item.value
		})
	);


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

		toaster.push(message("info", "loading data"), {
			placement: 'bottomEnd'
		});

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

			toaster.push(message("info", "list data filtered"), {
				placement: 'bottomEnd'
			});
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

		toaster.push(message("info", "fetching table data"), {
			placement: 'bottomEnd'
		});
	}, [id]);

	function renameList() {
		handleOpenRM();
	}

	async function handleSubmitRM() {

		if(rmInput != null && rmInput != "")
		{

			// check special characters, space, numbers
			if(rmInput.includes(' '))
			{
				alert("Space not allowed in list name");
			}
			else if(/\d/.test(rmInput))
			{
				alert("no number allowed in list name");
			}

			else if(/[!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?]+/.test(rmInput))
			{
				alert("no special characters allowed");
			}
			else
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

				toaster.push(message("info", "list renamed"), {
					placement: 'bottomEnd'
				});
			}
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

			toaster.push(message("info", "list removed"), {
				placement: 'bottomEnd'
			});
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

	function exportSelectedRows() {

		var _dd = data.filter(({id}) => checkedKeys.includes(id));

		let csv = Papa.unparse({
			data: _dd
		});

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

		toaster.push(message("info", "list duplicated removed"), {
			placement: 'bottomEnd'
		});
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

			toaster.push(message("info", "list data filtered"), {
				placement: 'bottomEnd'
			});

			setRdeInput(null);

			handleCloseRDE();
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

		toaster.push(message("info", "removed missing emails from list"), {
			placement: 'bottomEnd'
		});
	}

	async function fixEmailsTypo() {
		var _req = {
			"query": "fix_email_typos_from_table",
			"table_name": id
		};
		var _res = await ipcRenderer.sendSync('message', _req);
		console.log(_res);

		toaster.push(message("info", "fixed "+ _res +" emails typo from list, re-open list again"), {
			placement: 'bottomEnd'
		});
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

		toaster.push(message("info", "list merge done"), {
			placement: 'bottomEnd'
		});

		handleOpenML();
	}

	async function handleSubmitML() {

		if(listMName != null && listMName != "" && value.length > 1)
		{
			// check special characters, space, numbers
			if(listMName.includes(' '))
			{
				alert("Space not allowed in list name");
			}
			else if(/\d/.test(listMName))
			{
				alert("no number allowed in list name");
			}

			else if(/[!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?]+/.test(listMName))
			{
				alert("no special characters allowed");
			}
			else
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

				toaster.push(message("info", "merge done"), {
					placement: 'bottomEnd'
				});
			}
		}
		else
		{
			alert("select atleast 2 lists and list name")
		}
	}

	const renderIconButton = (props, ref) => {
		return (
		  <IconButton {...props} ref={ref} icon={<GearIcon />} circle color="green" appearance="ghost" style={{ marginLeft: '10px' }}/>
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
			// check special characters, space, numbers
			if(listSName.includes(' '))
			{
				alert("Space not allowed in list name");
			}
			else if(/\d/.test(listSName))
			{
				alert("no number allowed in list name");
			}

			else if(/[!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?]+/.test(listSName))
			{
				alert("no special characters allowed");
			}
			else
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

				toaster.push(message("info", "list subtract operation done"), {
					placement: 'bottomEnd'
				});
			}
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
			// check special characters, space, numbers
			if(listUName.includes(' '))
			{
				alert("Space not allowed in list name");
			}
			else if(/\d/.test(listUName))
			{
				alert("no number allowed in list name");
			}

			else if(/[!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?]+/.test(listUName))
			{
				alert("no special characters allowed");
			}
			else
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

				toaster.push(message("info", "list unique operation done"), {
					placement: 'bottomEnd'
				});
			}
		}
		else
		{
			alert("select atleast one list(s) and list name")
		}
	}

	function splitListByDomain() {
		handleOpenSBE();
	}

	function splitListByCount() {
		handleOpenSBC();
	}

	async function handleSubmitSBC() {

		if(lFormValue.list_type != null && lFormValue.list_type != "" && lFormValue.list_type_number != null && lFormValue.list_type_number != "" && isNaN(lFormValue.list_type_number) == false)
		{
			console.log(lFormValue);

			var _req = {
				"query": "split_tables",
				"main_table": id,
				"type": lFormValue.list_type,
				"number": lFormValue.list_type_number
			};
			var _res = await ipcRenderer.sendSync('message', _req);
			console.log(_res);

			handleCloseSBC();
		}
		else
		{
			alert("select list type and valid number");
		}
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

			toaster.push(message("info", "list split operation done"), {
				placement: 'bottomEnd'
			});
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

		toaster.push(message("info", "list row data changed"), {
			placement: 'bottomEnd'
		});
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

			toaster.push(message("info", "list row delete operation done"), {
				placement: 'bottomEnd'
			});
		}
	};

	async function deleteSelectedRows() {
		var result = window.confirm("Sure, Want to delete these rows?");
		if(result)
		{
			var _ids = checkedKeys;

			console.log(_ids);

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

			toaster.push(message("info", "list rows delete operation done"), {
				placement: 'bottomEnd'
			});
			
		}
	}

	function addNewRow() {
		handleOpenNRM();
	}

	async function handleSubmitNRM() {
		console.log(nRFormValue);
		// alert("submit");

		if(nRFormValue.email == null || nRFormValue.email == "")
		{
			alert("Email is Required");
		}

		if(nRFormValue.email != null && nRFormValue.email != "")
		{
			var _req = {
				"query": "insert_new_row",
				"table_name": id,
				"first_name": nRFormValue.first_name,
				"last_name": nRFormValue.last_name,
				"email": nRFormValue.email
			};

			var _res = await ipcRenderer.sendSync('message', _req);

			handleCloseNRM();

			toaster.push(message("info", "list new row operation done"), {
				placement: 'bottomEnd'
			});
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
								<Dropdown.Item onSelect={addNewRow}>Add Record</Dropdown.Item>
								<Dropdown.Item onSelect={exportList}>Export (CSV)</Dropdown.Item>
								<Dropdown.Item divider />
								<Dropdown.Menu title="Repair">
									<Dropdown.Item onSelect={removeMissingEmail}>Remove Null Data</Dropdown.Item>
									<Dropdown.Item onSelect={fixEmailsTypo}>Fix Emails Typo</Dropdown.Item>
									<Dropdown.Item onSelect={removeEmailsFilter}>Remove Emails (Filter)</Dropdown.Item>
									<Dropdown.Item onSelect={removeDuplicates}>Remove Duplicates</Dropdown.Item>
								</Dropdown.Menu>
								<Dropdown.Menu title="Actions">
									<Dropdown.Item onSelect={mergeLists}>Merge</Dropdown.Item>
									<Dropdown.Item onSelect={subtractList}>Subtract</Dropdown.Item>
									<Dropdown.Item onSelect={uniqueList}>Unique</Dropdown.Item>
								</Dropdown.Menu>
								<Dropdown.Menu title="Split">
									<Dropdown.Item onSelect={splitListByCount}>By Count (1000)</Dropdown.Item>
									<Dropdown.Item onSelect={splitListByDomain}>Domain</Dropdown.Item>
								</Dropdown.Menu>
								<Dropdown.Item divider />
								<Dropdown.Item onSelect={deleteList} style={{ color: 'red' }}>Delete</Dropdown.Item>
							</Dropdown>

							{checkedKeys.length > 0 ?
								<>
									<Button appearance="ghost" color="red" style={{ marginLeft: '5px' }} onClick={deleteSelectedRows}>Delete Selected ({ checkedKeys.length })</Button>
									<Button appearance="ghost" color="green" style={{ marginLeft: '5px' }} onClick={exportSelectedRows}>Export Selected ({ checkedKeys.length })</Button>
								</>
							: null}
						</h3>
					</FlexboxGrid.Item>
					<FlexboxGrid.Item colspan={12} style={{ textAlign: 'end' }}>
						<SelectPicker data={columnsData} style={{ width: 150, display: 'inline-block' }} value={filterColumn} onChange={setFilterColumn} />
						<Input value={filterText} onChange={setFilterText} style={{ width: 200, display: 'inline-block' }} ref={search_containerRef} placeholder="search here"/>
					</FlexboxGrid.Item>
				</FlexboxGrid>
			</div>
			<hr />
			<div style={{ height: "calc(90vh - 170px)" }}>
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
					<Input placeholder="junk, spam" value={rdeInput} onChange={setRdeInput} />
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

			<Modal open={openSBC} onClose={handleCloseSBC} backdrop="static">
				<Modal.Header>
					<Modal.Title>Split Lists by Count</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					
					<Form fluid formValue={lFormValue} onChange={lFormValue => setLFormValue(lFormValue)}>
						<Form.Group controlId="list_type">
							<Form.ControlLabel>List Type</Form.ControlLabel>
							<Form.Control name="list_type" data={listTypeData} searchable={false} block accepter={SelectPicker} placeholder="Divide List By" />
						</Form.Group>

						<Form.Group controlId="list_type_number">
							<Form.ControlLabel>No. of Records / Lists</Form.ControlLabel>
							<Form.Control name="list_type_number" required/>
						</Form.Group>
					</Form>

				</Modal.Body>
				<Modal.Footer>
					<Button onClick={handleSubmitSBC} appearance="primary">
						Ok
					</Button>
					<Button onClick={handleCloseSBC} appearance="subtle">
						Cancel
					</Button>
				</Modal.Footer>
			</Modal>

			<Modal open={openNRM} onClose={handleCloseNRM} backdrop="static">
				<Modal.Header>
					<Modal.Title>Add Row</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form fluid formValue={nRFormValue} onChange={formValue => setNRFormValue(formValue)}>

						<Form.Group controlId="first_name">
							<Form.ControlLabel>First Name</Form.ControlLabel>
							<Form.Control name="first_name" required/>
						</Form.Group>

						<Form.Group controlId="last_name">
							<Form.ControlLabel>Last Name</Form.ControlLabel>
							<Form.Control name="last_name" required/>
						</Form.Group>

						<Form.Group controlId="email">
							<Form.ControlLabel>Email</Form.ControlLabel>
							<Form.Control name="email" required/>
						</Form.Group>

					</Form>
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={handleSubmitNRM} appearance="primary">
						Ok
					</Button>
					<Button onClick={handleCloseNRM} appearance="subtle">
						Cancel
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
		</HotKeys>
	);
}