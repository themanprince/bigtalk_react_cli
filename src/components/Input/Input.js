import React, {Component} from "react";
import Fld from "../Fld/Fld.js";
import InputStyle from "./Input.module.css";

export default class Input extends Component {
	constructor(props /*gon be the path and sep symbol*/) {
		super(props);
		
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
	removeLast = () => {
		this.setState(({inputFields}) => {
			const copy = [...inputFields];
			copy.pop();
			return {
				"inputFields": copy
			};	
		});
	}
	
	render() {
		const {inputFields} = this.state;
		const {path, sep} = this.props;
		
		//making Fld views out of all the text models
		const FldViews = inputFields.map((text, i, arr) => <Fld 
				addInput={this.addInput /*passing it the func so that it can add new fields once limit passes in its input handler*/}
				value={text}
				isLastInput={(i === (arr.length - 1))? false: true} /*for telling the input its the last one so that it can auto focus and be;enabled on every;render*/
				setValue={this.setFld(i)/*Higher Order Func*/}
				remove={this.removeLast}
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
} 