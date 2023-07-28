import React, {Component, createRef} from "react";
import FldStyle from "./Fld.module.css";

export default class Fld extends Component {
	constructor(props) {
		super(props);
		//the uncontrolled state of the input field is gon be controlled by the inputFields state
		//in the Input component
		
		this.limit = null; //its charLimit... will be set in ComponentDidMount lifecycle
		
		this.inputDOM = createRef(); //the DOM reference to the input element... will be set in render method
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
	
	limitPassed = (value, source) => {
		//calculating limit if it ain't already
		if(!this.limit)
			this.limit = this.charLimit(this.inputDOM.current.getBoundingClientRect().width);
		
		if(value.length > (this.limit - 1)) {
			console.log(`got here so Fld limit passed, source is ${source}`);
			const {addInput, setValue, setLimitPassedOnMount} = this.props;
			const remaining = value.slice(0, this.limit);
							
			setValue(remaining);
			//disabling it next
			this.inputDOM.current.disabled = true;
			console.log(`Fld inputDOM ref disabled prop has been set to true and inputDOM is `, this.inputDOM.current);
			//getting the excess text to move it to new line
			let excess = value.slice(this.limit);
			addInput(excess);
			
			if(source === "componentDidMount")
				setLimitPassedOnMount(true);
			else
				setLimitPassedOnMount(false);
			
			return true;
		} else
			return false;
	}
	
	//next two shit are required for my change handler
	valueAddedAction = (newVal) => {
		const {setValue} = this.props;
		/*below is like... if limit not passed, reflect changes
		else action already been defined in limitPassed
		*/
		this.limitPassed(newVal, "valueAddedAction") || setValue(newVal); 
	}
	
	valueRemovedAction = (newVal) => {
		const {setValue, remove} = this.props;
		
		if(newVal.length === 0) { //means value removal caused input fld emptying
			console.log(`got here so removal made fld empty`);
			remove(); //remove it
		} else
			setValue(newVal); //its just a regular removal, set it
	}
	
	/*lifecycles*/
	componentDidMount() {
		console.group(`Fld componentDidMount`);
		//checking if I'm supposed to pass its ref to parent
		const {passRef, value} = this.props;
		
		console.log(`in Fld didMount cycle, passRef is ${passRef}`)
		
		passRef && console.log(`if I'm right, passRef was given to this comp.\n inputDOM is `, this.inputDOM.current);
		
		if(passRef !== null)
			passRef(this.inputDOM.current);	//apparently, this.inputDOM has already been set since render() was done before this method
		
		console.log(`checking if init. value passed limit`);
		this.limitPassed(value, "componentDidMount"); //gon check if limit passed to take neccessary actions
	
		console.groupEnd();
	}
	
	render() {
		const {value, isLastInput, changeHandler} = this.props;
		
		return (
			<input
				className={FldStyle["the-input"]}
				type="text"
				onChange={changeHandler(this.valueAddedAction, this.valueRemovedAction)}
				value={value}
				ref={this.inputDOM}
			/>
		);
	}
	
	componentDidUpdate() {
		const {isLastInput, passRef} = this.props;
		
		if(isLastInput)
			passRef && passRef(this.inputDOM.current);
		//if its the last, make sure its set as the lastNode ref in parent Input after
		//every render which could be cus of flds getting removed... to make sure it will point to it
		//after update... ion know if I explained this well
	}
	
}