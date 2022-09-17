import { Fragment, useEffect, useState } from 'react';
import { Table, Pagination } from 'rsuite';
import { useParams, Link } from "react-router-dom";

const { Column, HeaderCell, Cell } = Table;

export default function CategoryPage() {
	let { id } = useParams();

	const { ipcRenderer } = window;

	const [loading, setLoading] = useState(true);

	const [columns, setColumns] = useState([]);
	const [data, setData] = useState([]);

	const [limit, setLimit] = useState(50);
	const [page, setPage] = useState(1);

	const handleChangeLimit = dataKey => {
		setPage(1);
		setLimit(dataKey);
	};

	const pageData = data.filter((v, i) => {
		const start = limit * (page - 1);
		const end = start + limit;
		return i >= start && i < end;
	});


	// const data = defaultData.filter((v, i) => {
	// 	const start = limit * (page - 1);
	// 	const end = start + limit;
	// 	return i >= start && i < end;
	// });

	// check table / list exists
	// get data in pagination
	// show in table / grid

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

	async function getData() {
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
		setLoading(false);
	}

	useEffect(() => {
		getColumns();
		getData();
	},[id]);

	return (
		<div>
			<h3>{id}</h3>
			<hr/>
			<div style={{ height: "calc(100vh - 170px)" }}>
				<Table data={pageData} autoHeight={false} fillHeight={true} virtualized loading={loading}>
					{columns?.map((column, index) => (
						<Column width={column[0] == "email" || column[0] == "Email" ? 350 : 100}  flexGrow={column[0] == "email" || column[0] == "Email" ? 2 : 1}>
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
					total={data.length}
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