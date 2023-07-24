import React, {Component} from "react";
import FldStyle from "./Fld.module.css";

export default class Fld extends Component {
	constructor(props) {
		super(props);
		//the uncontrolled state of the input field is gon be controlled by the inputFields state
		//in the Input component
		
		this.limit = null; //its charLimit... will be set in ComponentDidMount lifecycle
		
		this.inputDOM = null; //the DOM reference to the input element... will be set in render method
	}
	
	charLimit = (width) => {
		/*this method takes a given width and calculates how many
		monosoace chars can fit into it*/
		let testSpan = document.createElement("span");
		testSpan.appendChild(document.createTextNode("a"));
		//gon add this span to the document temporarily to find out its width so I can know how many chars are allowed
		document.body.appendChild(testSpan);
		const charWidth = testSpan.getBoundingClientRect().width;
		document.body.removeChild(testSpan);
		const charLim = Math.floor(width / charWidth);
			
		return charLim;
	}
	
	

	inputTypeHandler = (event) => {
		/*
		* this handles regular keypresses and Ctrl+V type shit
		* which are "input" events... Sometimes, both are fired at once
		* do Im putting measures to prevent running this bitch twice
		*/
		
		//getting some helpers from the props
		const {addInput, setValue} = this.props;
		
		const value = event.target.value;
		
		if(value.length < (this.limit - 1)) {
			setValue(value);
		} else {
	
			//first getting the excess text to move it to new line
			let excess = value.slice(this.limit);
			addInput(excess);
			const remaining = value.slice(0, this.limit);
							
			setValue(remaining);
		}

	}
	
	/*lifecycles*/
	componentDidMount() {
		//apparently, this.inputDOM has already been set since render() was done before this method
		this.limit = this.charLimit(this.inputDOM.getBoundingClientRect().width);
		this.inputDOM.focus();
	}
	
	render() {
		const {value} = this.props;
		
		return (
			<input
				className={FldStyle["the-input"]}
				type="text"
				onKeyPress={this.inputTypeHandler}
				onChange={this.inputTypeHandler}
				value={value}
				ref={(node) => this.inputDOM = node}
			/>
		);
	}
}