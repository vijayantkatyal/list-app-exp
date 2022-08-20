import { useState } from 'react';
import { Outlet } from "react-router-dom";
// import { NavBar } from './components/navbar';
import { Container, Header, Sidebar, Sidenav, Content, Navbar, Nav } from 'rsuite';
import CogIcon from '@rsuite/icons/legacy/Cog';
import AngleLeftIcon from '@rsuite/icons/legacy/AngleLeft';
import AngleRightIcon from '@rsuite/icons/legacy/AngleRight';
import GearCircleIcon from '@rsuite/icons/legacy/GearCircle';
import DashboardIcon from '@rsuite/icons/Dashboard';
import GroupIcon from '@rsuite/icons/legacy/Group';
import MagicIcon from '@rsuite/icons/legacy/Magic';

import "./App.css";

import 'rsuite/dist/rsuite.min.css';


const headerStyles = {
	padding: 18,
	fontSize: 16,
	height: 56,
	background: '#34c3ff',
	color: ' #fff',
	whiteSpace: 'nowrap',
	overflow: 'hidden'
};


const NavToggle = ({ expand, onChange }) => {
	return (
		<Navbar appearance="subtle" className="nav-toggle">
			<Nav>
				<Nav.Menu
					noCaret
					placement="topStart"
					trigger="click"
					title={<CogIcon style={{ width: 20, height: 20 }} size="sm" />}
				>
					<Nav.Item>Help</Nav.Item>
					<Nav.Item>Settings</Nav.Item>
					<Nav.Item>Sign out</Nav.Item>
				</Nav.Menu>
			</Nav>

			<Nav pullRight>
				<Nav.Item onClick={onChange} style={{ width: 56, textAlign: 'center' }}>
					{expand ? <AngleLeftIcon /> : <AngleRightIcon />}
				</Nav.Item>
			</Nav>
		</Navbar>
	);
};

function App() {
	const [expand, setExpand] = useState(true);

	return (
		// <div id="container" className="bg-white">
		// 	<NavBar/>

		// 	<main className="mt-24">
		// 	 	<Outlet/>
		// 	</main>
		// </div>

		<div className="show-fake-browser sidebar-page">
			<Container>
				<Sidebar
					style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', alignSelf: 'flex-start' }}
					width={expand ? 260 : 56}
					// collapsible
				>
					<Sidenav expanded={expand} defaultOpenKeys={['3']} appearance="default">
						<Sidenav.Header>
							<div style={headerStyles}>Custom Sidenav</div>
						</Sidenav.Header>
						<Sidenav.Body>
							<Nav>
								<Nav.Item eventKey="1" active icon={<DashboardIcon />}>
									Dashboard
								</Nav.Item>
								<Nav.Item eventKey="2" icon={<GroupIcon />}>
									User Group
								</Nav.Item>
							</Nav>
						</Sidenav.Body>
					</Sidenav>
				</Sidebar>

				<Container>
					<Outlet />
				</Container>

			</Container>
		</div>
	)
}

export default App;