import React, {Component} from "react";
import Fld from "../Fld/Fld.js";
import InputStyle from "./Input.module.css";

export default class Input extends Component {
	constructor(props /*gon be the path and sep symbol*/) {
		super(props);
		
		this.lastOne = null; //reference to the last Fld's input in the DOM
		this.limitPassedOnMount = false;
		//this flag is to prevent focusing and enabling for last one done in componentDidUpdate lifecycle
		//because sometimes, its enables the sec-to-last due to state updating behaviour
		this.state = {
			"inputFields": [""] //an array of text
		};
	}
	
	
	addInput = (text = "") => {
		this.setState(prevState => {
			const oldFlds = prevState.inputFields;
			const newFlds = [...oldFlds, text];
			
			return {
				"inputFields": newFlds
			};
		});
	}
	
	
	setFld = (i) => { /*arrow functions so no ones binds their "this'es*/
		return (text) => {
			this.setState( ({inputFields}) => {
				const copy = [...inputFields]; //immutability
				copy[i] = text;
				return {
					"inputFields": copy
				};
			});
		}
	}
	
	/*next method will be passed to flds. it is used to remove backspaced flds from state*/
	/*it is assumed however that the backspace field to remove is the one representing the very last(ith)
	element in inputFields arr */
	remove = (i) => () => {
		if(i !== 0) //in cases of when you press backspace and all we have is empty first one
			this.setState(({inputFields}) => {
				const copy = [...inputFields.slice(0, i), ...inputFields.slice(i + 1)];
				return {
					"inputFields": copy
				};	
			});
	}
	
	changeHandler = (i) => { /*first order is so parent can pass index*/
		return (valueAddedAction, valueRemovedAction) => { /*second order is for;child to pass its;actions*/
			return (event) => {
				const oldVal = this.state["inputFields"][i];
				const newVal = event.target.value;
				
				
				if(newVal.length > oldVal.length) {
					//shit was added
					valueAddedAction(newVal);
				}
				
				if(newVal.length < oldVal.length) {
					//shit was removed
					valueRemovedAction(newVal);
				}
			}
		}
	}
	
	setLimitPassedOnMount = (bool) => {
		this.limitPassedOnMount = bool;
	}
	
	render() {
		const {inputFields} = this.state;
		const {path, sep} = this.props;
		
		//making Fld views out of all the text models
		const FldViews = inputFields.map((text, i, arr) => <Fld 
				addInput={this.addInput /*passing it the func so that it can add new fields once limit passes in its input handler*/}
				value={text}
				passRef={(i === arr.length - 1)? (nodeRef) => this.lastOne = nodeRef : null
				//passRef above goes like, if Fld is last one, pass it a func it can call with its DOM reference
				//Fld supposed to do so when it mounts
				}
				myIndex={i}
				setLimitPassedOnMount={this.setLimitPassedOnMount}
				changeHandler={this.changeHandler(i)}
				isLastInput={(i === (arr.length - 1))? true: false} /*for telling the input its the last one so that it can auto focus and be;enabled on every;render*/
				setValue={this.setFld(i)/*Higher Order Func*/}
				remove={this.remove(i)}
			/>);
		return (
		<form>
			<div>
				{
					//some line gon have sep and path
					FldViews.map((view, i) => {
						let toDisplay = null;
						if(i === 0)
							toDisplay = (<div className={`${InputStyle["first-row"]}`} key={i}>
											<span className={InputStyle.path}>{path}</span>
											<span className={InputStyle.sep}>{sep}</span>
											{view}
										</div>
										);
						else
							toDisplay = <div key={i} className={`${InputStyle["regular-row"]}`}>{view}</div>;
						
						return toDisplay;
					})
				}
			</div>
		</form>);
	}
	
	componentDidUpdate() {
		//gon make sure last fld is enabled and focused on after every state-change/render
		if(!this.limitPassedOnMount) {
			this.lastOne.disabled = false;
			this.lastOne.focus();
			
		} else {
			this.limitPassedOnMount = false;
		}
		
		
	}
} 