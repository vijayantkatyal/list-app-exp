import { useEffect, useState } from 'react';
import { Outlet } from "react-router-dom";
import { Container, Header, Sidebar, Sidenav, Content, Navbar, Nav } from 'rsuite';
import ListIcon from '@rsuite/icons/List';
import PlusIcon from '@rsuite/icons/Plus';
import TableIcon from '@rsuite/icons/Table';
import PageIcon from '@rsuite/icons/Page';

import { Link, useNavigate } from "react-router-dom";

import 'rsuite/dist/rsuite.min.css';
import "./App.css";

// import database from './database';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

function App() {
	const [lists, setLists] = useState([
		{
			id: 1,
			name: "List A",
			uniqueid: "mz34928"
		},
		{
			id: 2,
			name: "List B",
			uniqueid: "mz34928"
		},
		{
			id: 3,
			name: "List C",
			uniqueid: "mzasda34928"
		}
	]);

	const [activeKey, setActiveKey] = useState(null);
	const navigate = useNavigate();

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
									eventKey={list.id} icon={<TableIcon />}
									key={index}
									className={
										classNames(
											activeKey == list.id ? 'active': null,
											'nav-item'
										)
									}
									style={{ paddingLeft: '45px' }}
									onClick={() => navigate("/list/"+list.id)}
								>									
										{list.name}
								</Nav.Item>
							))}
							{lists.length > 0 ?
							<Nav.Item divider style={{ borderTop: '1px solid #ddd' }} /> : null }
							<Nav.Item eventKey="add" icon={<PlusIcon />} href="/list/1">
								Add
							</Nav.Item>
						</Nav>
					</Sidenav.Body>
				</Sidenav>
			</Sidebar>

			<Container className="mainContainer">
				{activeKey != null ? <Outlet /> : "Welcome" }
			</Container>

		</Container>
	)
}

export default App;