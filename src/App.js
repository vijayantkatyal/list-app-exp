import { useEffect, useState } from 'react';
import { Outlet } from "react-router-dom";
import { Container, Header, Sidebar, Sidenav, Content, Navbar, Nav } from 'rsuite';
import ListIcon from '@rsuite/icons/List';
import PlusIcon from '@rsuite/icons/Plus';

import { Link } from "react-router-dom";

import 'rsuite/dist/rsuite.min.css';
import "./App.css";

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
		}
	]);
	const [activeKey, setActiveKey] = useState(null);

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
									eventKey={list.id} icon={<ListIcon />}
									key={index}
									className={
										classNames(
											activeKey == list.id ? 'active': null,
											'nav-item'
										)
									}
								>
									<Link to={"/list/"+list.id}>
										{list.name}
									</Link>
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
				<Outlet />
			</Container>

		</Container>
	)
}

export default App;