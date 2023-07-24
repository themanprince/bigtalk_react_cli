import React, {Component} from "react";
import "./PrakticeRoot.css";
import PropTypes from "prop-types";
import {sortBy} from "lodash";

//next... shit for the URL we'll be fetching from
const DEFAULT_QUERY = 'redux';
const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';

const SORTS = {
	NONE: list => list,
	TITLE: list => sortBy(list, 'title'),
	AUTHOR: list => sortBy(list, 'author'),
	COMMENTS: list => sortBy(list, 'num_comments').reverse(),
	POINTS: list => sortBy(list, 'points').reverse(),
};


class PrakticeRoot extends Component {
	constructor(props) {
		super(props);
		this.state = {
			results: null,
			searchKey: "",
			searchTerm: DEFAULT_QUERY,
			isLoading: false,
		};
		this.dismissEl = this.dismissEl.bind(this);
		this.changeSearchTerm = this.changeSearchTerm.bind(this);
		this.setSearchTopStories = this.setSearchTopStories.bind(this);
		this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
		this.onSearchSubmit = this.onSearchSubmit.bind(this);
	}
	

	dismissEl(id) {
		this.setState(prevState => {
			//filtering out the element
			const updatedList = prevState.result.hits.filter(el => el.objectID !== id);
			const resultState = {...prevState.result, hits: updatedList};
			
			return {result: resultState};
		});
	}
	
	changeSearchTerm(event) {
		this.setState({"searchTerm": event.target.value});
	}
	
	setSearchTopStories(result) {
		//this is to preserve th old hits as well
		//so that new state setting wont override old one
		const { hits, page } = result;
		//it relied on state before, thats why we had to use a func as its setState
		//which gets the right prevState to usr
		this.setState(this.setSearchStateChanger(hits, page));

	}
	//the state changing function fot thr above
	setSearchStateChanger(hits, page) {
		//it shouldnt have been a Higher order func but then
		//I need the hits and page values
		return (prevState) => {
			const {searchKey, results} = prevState;
			
			//the ternary part of this next line ensures that if the current
			//searchKey has not been put in the map before, its oldHits will be []
			const oldHits = results && (results[searchKey]) ? results[searchKey].hits : [];
			
			const updatedHits = [
			...oldHits,
			...hits
			];
			
			return {results: {
				...results,
				[searchKey]: {hits: updatedHits, page: page + 1},
				isLoading: false
			}};

		};
	}
	
	fetchSearchTopStories(searchTerm, page=0) {
		this.setState({isLoading: true});
		fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}`)
		.then(response => response.json())
		.then(result => this.setSearchTopStories(result))
		.catch(e => e);
		//considering that react puts all the state setting activities in a queue which runs
		//after all synchronous funcs/methods currently in stack are run,
		//Well, since the fetch is asynchronous, fetchSearchTopStories() returns immediately(terminates, hence being thr last thing on the stack)
		//So react will set the state(cus stack empty) till the fetch obtains a result and the associated func is called which changes the state again
		//so for now, setting isLoading to false will really make the component render "Loading..." till fetch obtains result
		
	}
	
	
	componentDidMount() {
		//these happen just once after component rendering
		this.setState(prevState => {
			const { searchTerm } = prevState;
			this.fetchSearchTopStories(searchTerm);
			return {searchKey: searchTerm};
	});
	}
	
	onSearchSubmit(event) {
		this.setState(prevState => {
			this.fetchSearchTopStories(prevState.searchTerm);
			return {"searchKey": this.state.searchTerm};
		});
		
		//to prevent page reloading behaviour which is default behav
		event.preventDefault();
	}
	
	render() {
		//next line will happen only on (re)rendering
		//so everytime input causes the searchTerm state to change,
		//component will be (re)rendered
		const {
			searchTerm,
			results,
			searchKey,
			isLoading
		} = this.state;
		const page = (
			results &&
			results[searchKey] &&
			results[searchKey].page
		) || 0;
		const list = (
			results &&
			results[searchKey] &&
			results[searchKey].hits
		) || [];
		
		return (
		 <div className="page">
			<div className="interactions">
				<Search type="text" value={this.state.searchTerm} onSubmit={this.onSearchSubmit} onChange={this.changeSearchTerm}>
					Find
				</Search>
			</div>
			{
				results &&
				<Table list={list} dismissEl={this.dismissEl} searchTerm={searchTerm}/>
			}
			<div className="interactions">
				<ButtonWithLoad isLoading={isLoading} onClick={() => this.fetchSearchTopStories(searchKey, page + 1)} />
			</div>
		 </div>
		 );
	}
}

//making extra components for input fld nd the list
//cus they getting too buggy on Root component

class Search extends Component {
	componentDidMount() {
		this.input.focus();
	}
	render() {
		const {value, onChange, onSubmit, children} = this.props;
		
		return (
		<form onSubmit={onSubmit}>
			{
			//the function we pass to the ref prop will be passed the DOM reference of the input node below
			//so I pass it to a field called input which can be used in componentDidMount(), because it is next
			//in the order of lifecycles
			}
			<input ref={(node) => {this.input = node; }} type="text" value={value} onChange={onChange}/>
			<button>{children}</button>
		</form>);
	}
}

Search.propTypes = {
	"value": PropTypes.string,
	"onChange": PropTypes.func,
	"onSubmit": PropTypes.func,
	"children": PropTypes.node
};

class Table extends Component {
	
	constructor(props) {
		super(props);
		
		this.state = {
			sortKey: "NONE"
		};
		this.onSort = this.onSort.bind(this);
	}
	
	onSort(sortKey) {
		this.setState({sortKey});
	}
	
	
	render() {
		const {
			list,
			dismissEl,
			searchTerm
		} = this.props;
		
		const {sortKey} = this.state;
		
		return (
			<div className="table">
				
				<div className="table-header">
					<span style={{ width: '40%' }}>
						<Sort
						sortKey={'TITLE'}
						onSort={this.onSort}
						>
							Title
						</Sort>
					</span>
					<span style={{ width: '30%' }}>
						<Sort
						sortKey={'AUTHOR'}
						onSort={this.onSort}
						>
							Author
						</Sort>
					</span>
					<span style={{ width: '10%' }}>
						<Sort
						sortKey={'COMMENTS'}
						onSort={this.onSort}
						>
							Comments
						</Sort>
					</span>
					<span style={{ width: '10%' }}>
						<Sort
						sortKey={'POINTS'}
						onSort={this.onSort}
						>
							Points
						</Sort>
					</span>
					<span style={{ width: '10%' }}>
						Archive
					</span>
					</div>
				
				{SORTS[sortKey](list).map(el => (
				<div key={el.objectID} className="table-row">
					<span>
						<a href={el.url}>{el.title}</a>
					</span>
					<span>{el.author}</span>
					<span>{el.num_comments}</span>
					<span>{el.points}</span>
					<span>
						<Button className="button-inline" onClick={() => dismissEl(el.objectID)}>Dismiss</Button>
					</span>
				</div>
			))}
		</div>
		);
	}
}

Table.propTypes = {
	"list": PropTypes.arrayOf(
		PropTypes.shape({
			objectID: PropTypes.string.isRequired,
			author: PropTypes.string,
			url: PropTypes.string,
			num_comments: PropTypes.number,
			points: PropTypes.number
		}).isRequired),
	"dismissEl": PropTypes.string,
	"searchTerm": PropTypes.string
};

const Sort = ({ sortKey, onSort, children }) =>
	<Button className="button-inline" onClick={() => onSort(sortKey)}>
		{children}
	</Button>;

const Button = ({onClick, className = "", children}) => (
	<button onClick={onClick} className={className} type="button">
		{children}
	</button>
);

Button.propTypes = {
	"onClick": PropTypes.func,
	"className": PropTypes.string,
	"children": PropTypes.node
};

const Loading = () => <div>Loading...</div>;

//making the Higher Order Component that gon either display <Loading /> or <Button>
//depending on a condition which will be passed to it
function withLoad(Component) {
	return function ({isLoading, ...rest}) {
		return isLoading? <Loading /> : <Button {...rest}/>;
	}
}

const ButtonWithLoad = withLoad(Button);


export default PrakticeRoot;
export {Button, Search, Table};