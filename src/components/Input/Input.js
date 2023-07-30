import React, {Component} from "react";
import Fld from "../Fld/Fld.js";
import InputStyle from "./Input.module.css";

const print = function(...texts) {
	let date = new Date();
	
	console.log(`[${date.getSeconds()}:${date.getMilliseconds()}]`, ...texts);
}

export default class Input extends Component {
	constructor(props /*gon be the path and sep symbol*/) {
		super(props);
		
		this.lastOne = null; //reference to the last Fld's input in the DOM
		this.limitPassedOnMount = false;
		//limitPassedOnMount flag is to prevent focusing and enabling for last one done in this Input componentDidUpdate lifecycle
		//because sometimes, its enables the sec-to-last due to state updating behaviour
		this.fldLimitList = []; //this will be filled when window resizes... for new charLimits
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
	
	addToLimitList = (i) => (width) => { /*for Flds to pass they charLimits when resize occurs*/
		this.fldLimitList[i] = width;
	}
	
	/*next, the rebouncer..*/
	debouncer = (func, time) => {
		let timeoutID = null; //first set to null and is in the closure of the returned func
		
		return function(...args) {
			clearTimeout(timeoutID);
			
			timeoutID = setTimeout(() => func(...args), time);
		}
	}
	
	resizeHandler = (event) => {
		this.setState(prevState => {
			console.group(`Input resize handler`);
			let wholeStr = prevState.inputFields.join("");
			let resultArr = [];
			
			//since we here means fldLimitList is filled with these bitches char limits
			const firstOneLimit = this.fldLimitList[0];
			const secOneLimit = this.fldLimitList[1] || firstOneLimit + 4; //lemme explain this
			/*sometimes when resizing from bigger screen widths to smaller and there was only one input on bigger screen,
			 there's no other input el to calculate secOneLimit with...
			 so, having noticed that secOneLimit is mostly 4 chars more than firstOneLimit... but its only an assumption hence I used || symbol
			 so its only done on those few occassions */
			print(`firstOneLimit is ${firstOneLimit}, secOneLimit is ${secOneLimit}`);
			if(wholeStr.length <= firstOneLimit) {
				resultArr[0] = wholeStr;
				this.fldLimitList = []; //clearing the fldLimitList
				print(`got here so wholeStr is <= limit of first`);
				print(`resultArr is `, resultArr);
				console.groupEnd();
				return {
					"inputFields" : resultArr
				};
			} else {
				print(`got here so wholeStr len is more than first input limit`);
				resultArr[0] = wholeStr.slice(0, firstOneLimit);
				wholeStr = wholeStr.slice(firstOneLimit);
				let i = 1; //about to do a loop... '1' for second one
				while(wholeStr.length) {
					if(wholeStr.length <= secOneLimit) {
						resultArr[i++] = wholeStr;
						break;
					} else {
						resultArr[i++] = wholeStr.slice(0, secOneLimit);
						//I'm hoping that when render happens, since the text length
						//will be equal to the limit, it will be disabled
						//then as for the ones that will be unmounted and remounted,
						//they'll be disabled since limitPassedOnMount
						wholeStr = wholeStr.slice(secOneLimit);
					}
				}
				this.fldLimitList = []; //clearing the fldLimitList
				print(`resultArr is `, resultArr);
				console.groupEnd();
				return {
					"inputFields" : resultArr
				};
			}
		});
	}
	
	//LifeCycles
	componentDidMount() {
		window.addEventListener("resize", this.debouncer(this.resizeHandler, 1000));
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
				addToLimitList={this.addToLimitList(i)}
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
			</form>
		
		);
	}
	
	componentDidUpdate() {
		console.group("Input componentDidUpdate");
		//gon make sure last fld is enabled and focused on after every state-change/render
		if(!this.limitPassedOnMount) {
			this.lastOne.disabled = false;
			this.lastOne.focus();
			print(`limit was not Passed On Mount, so just focused on last one which is`, this.lastOne);
		} else {
			print(`got here so limit passed on mount, so I can't focus on lastOne`);
			print(`which is `, this.lastOne);
			print('about to set limitPassedOnMount to false');
			this.limitPassedOnMount = false;
		}
		
		console.groupEnd();
	}
} 