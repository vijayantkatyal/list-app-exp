import { Fragment, useState } from 'react';

export default function Overview() {
	return (
		<h1>
			4
Yep, Chrome has some issues, especially with nested flexboxes. For example I've got a nested flex box with children that have height:100% but they are rendering with natural height instead. And the weird thing is if I change their height to auto, then they render as height:100% like I was trying to do. It is definitely not intuitive if that's how it should work.
		</h1>
	)
}