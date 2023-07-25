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
	
	//helper method to check limit
	isLimitPassed = (value) => {
		//it gon do the side effects as well if true
		const limit = this.charLimit(this.inputDOM.getBoundingClientRect().width);
		if( ! (value.length < (limit - 1))) {
			const {addInput, setValue} = this.props;
			//first getting the excess text to move it to new line
			let excess = value.slice(this.limit);
			addInput(excess);
			const remaining = value.slice(0, this.limit);
							
			setValue(remaining);
			
			return true;
		} else {
			return false;
		}
	}

	inputTypeHandler = (event) => {
		/*
		* this handles regular keypresses and Ctrl+V type shit
		* which are "input" events... Sometimes, both are fired at once
		* do Im putting measures to prevent running this bitch twice
		*/
		
		//getting some helpers from the props
		const {setValue} = this.props;
		
		const value = event.target.value;
		//basically whats about to happen is if limitIsPassed is true, setValue below wont be called and
		//the handling will occur in limitIsPassed... else, setValue will be called to simply set the value
		(!this.isLimitPassed(value)) && setValue(value);

	}
	
	backspaceCheckHandler = (event) => {
		if(event.key === "Backspace") {
			const inputVal = event.target.value;
			if(inputVal.length < 2 /*Im hoping to catch it at length 1 but just in case*/) {
				//got here means the backspace made the field empty
				const {remove} = this.props;
				remove();	
			}
		}
	}
	
	/*lifecycles*/
	componentDidMount() {
		//apparently, this.inputDOM has already been set since render() was done before this method
		this.limit = this.charLimit(this.inputDOM.getBoundingClientRect().width);
		this.inputDOM.focus();
		//focus has to happen first incase this value is actually greater
		//than limit and we have to mke new input and give it focus...
		//so this one dont collect focus after creafing it
		this.isLimitPassed(this.props.value);
		//the isLimitPassed function's declaration is more like... if yes, you know what to do... lol, laugh
	}
	
	render() {
		const {value, isLastInput} = this.props;
		
		return (
			<input
				className={FldStyle["the-input"]}
				type="text"
				onKeyDown={this.backspaceCheckHandler}
				onChange={this.inputTypeHandler}
				value={value}
				disabled = {isLastInput? true:false}
				ref={(node) => this.inputDOM = node}
			/>
		);
	}
}