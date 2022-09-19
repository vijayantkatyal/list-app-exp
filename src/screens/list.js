import { Fragment, useEffect, useState } from 'react';
import { Table, Pagination, FlexboxGrid, Input, SelectPicker, Dropdown, IconButton } from 'rsuite';
import { useParams, Link, useNavigate } from "react-router-dom";
import { filter } from 'lodash';
import GearIcon from '@rsuite/icons/Gear';
import * as Papa from "papaparse";


const { Column, HeaderCell, Cell } = Table;

export default function CategoryPage() {
	let { id } = useParams();
	const navigate = useNavigate();

	const { ipcRenderer } = window;

	const [filterColumn, setFilterColumn] = useState(null);
	const [filterText, setFilterText] = useState(null);

	const [sortColumn, setSortColumn] = useState();
	const [sortType, setSortType] = useState();
	const [loading, setLoading] = useState(true);

	const [columns, setColumns] = useState([]);
	const [data, setData] = useState([]);

	const [limit, setLimit] = useState(50);
	const [page, setPage] = useState(1);
	const [totalLength, setTotalLength] = useState(0);

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

		setLimit(50);
		setPage(1);
		setFilterText(null);
		setFilterColumn(null);

		getColumns();
		fetchData();
	}, [id]);

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

	const renderIconButton = (props, ref) => {
		return (
		  <IconButton {...props} ref={ref} icon={<GearIcon />} circle color="red" appearance="ghost" style={{ marginLeft: '10px' }}/>
		);
	  };

	return (
		<div>
			<div className="show-grid">
				<FlexboxGrid justify="space-between">
					<FlexboxGrid.Item colspan={12}>
						<h3>
							{id}
							<Dropdown renderToggle={renderIconButton}>
								<Dropdown.Item onSelect={exportList}>Export (CSV)</Dropdown.Item>
								<Dropdown.Item divider />
								<Dropdown.Menu title="Repair">
									<Dropdown.Item>Emails (Domain)</Dropdown.Item>
									<Dropdown.Item>Remove Duplicates</Dropdown.Item>
									<Dropdown.Item>Remove Emails (Filter)</Dropdown.Item>
									<Dropdown.Item>Remove Null Data</Dropdown.Item>
								</Dropdown.Menu>
								<Dropdown.Menu title="Actions">
									<Dropdown.Item>Merge</Dropdown.Item>
									<Dropdown.Item>Subtract</Dropdown.Item>
									<Dropdown.Item>Unique</Dropdown.Item>
								</Dropdown.Menu>
								<Dropdown.Menu title="Split">
									<Dropdown.Item>By Count (1000)</Dropdown.Item>
									<Dropdown.Item>Domain</Dropdown.Item>
								</Dropdown.Menu>
								<Dropdown.Item divider />
								<Dropdown.Item onSelect={deleteList} style={{ color: 'red' }}>Delete</Dropdown.Item>
							</Dropdown>
						</h3>
					</FlexboxGrid.Item>
					<FlexboxGrid.Item colspan={12} style={{ textAlign: 'end' }}>
						<SelectPicker data={columnsData} style={{ width: 150, display: 'inline-block' }} value={filterColumn} onChange={setFilterColumn} />
						<Input value={filterText} onChange={setFilterText} style={{ width: 200, display: 'inline-block' }} placeholder="keyword here"/>
					</FlexboxGrid.Item>
				</FlexboxGrid>
			</div>
			<hr />
			<div style={{ height: "calc(100vh - 170px)" }}>
				<Table data={getData()} autoHeight={false} fillHeight={true} virtualized loading={loading} sortColumn={sortColumn} sortType={sortType} onSortColumn={handleSortColumn}>
					{columns?.map((column, index) => (
						<Column width={column[0] == "email" || column[0] == "Email" ? 350 : 100} flexGrow={column[0] == "email" || column[0] == "Email" ? 2 : 1} sortable>
							<HeaderCell>{column[0]}</HeaderCell>
							<Cell dataKey={column[0]} />
						</Column>
					))}
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
					limitOptions={[50, 100, 150]}
					limit={limit}
					activePage={page}
					onChangePage={setPage}
					onChangeLimit={handleChangeLimit}
				/>
			</div>
		</div>
	);
}