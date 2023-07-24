//import { render, screen } from '@testing-library/react';
import PrakticeRoot, {Search, Button, Table} from './PrakticeRoot';
import renderer from "react-test-renderer";
import React from "react";
import ReactDOM from "react-dom";

/*test('Find Button', () => {
  render(<PrakticeRoot />);
  const linkElement = screen.getByText(/Find/i);
  expect(linkElement).toBeInTheDocument();
});
*/

describe("PrakticeRoot", () => {
	it("renders ohhhh", () => {
		const div = document.createElement("div");
		ReactDOM.render(<PrakticeRoot />, div);
	});
	
	test("has valid snapshot", () => {
		const component = renderer.create(<PrakticeRoot />);
		let tree = component.toJSON();
		expect(tree).toMatchSnapshot();
	});
});

describe("Search", () => {
	it("renders at all", () => {
		const div = document.createElement('div');
		ReactDOM.render(<Search>Test</Search>, div);
	});
	
	test("valid snapshot", () => {
		const snapshot = renderer.create(<Search>Test</Search>);
		let tree = snapshot.toJSON();
		expect(tree).toMatchSnapshot();
	});
});

describe("Button", () => {
	it("renders at all", () => {
		const div = document.createElement('div');
		ReactDOM.render(<Button>Test</Button>, div);
	});
	
	test("valid snapshot", () => {
		const snapshot = renderer.create(<Button>Test</Button>);
		let tree = snapshot.toJSON();
		expect(tree).toMatchSnapshot();
	});
});

describe("Table", () => {
	
	const props = { list: [
		{ title: '1', author: '1', num_comments: 1, points: 2, objectID: 'y' },
		{ title: '2', author: '2', num_comments: 1, points: 2, objectID: 'z' },
	]};
	
	it("renders fine", () => {
		const div = document.createElement("div");
		ReactDOM.render(<Table {...props} />, div);
	});
	
	test("snapshot valid", () => {
		const snapshot = renderer.create(<Table {...props} />);
		let tree = snapshot.toJSON();
		expect(tree).toMatchSnapshot();
	});
});