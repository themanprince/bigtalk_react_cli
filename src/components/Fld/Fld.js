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
	

	limitPassed = (value, source) => {
		//calculating limit if it ain't already
		if(!this.limit)
			this.limit = this.charLimit(this.inputDOM.current.getBoundingClientRect().width);
		
		if(value.length > (this.limit - 1)) {
			const {addInput, setValue, setLimitPassedOnMount} = this.props;
			const remaining = value.slice(0, this.limit);
							
			setValue(remaining);
			//disabling it next
			this.inputDOM.current.disabled = true;
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
		const {setValue, remove, myIndex} = this.props;
		
		if((newVal.length === 0) && myIndex !== 0) { //means value removal caused input fld emptying
			remove(); //remove it
		} else
			setValue(newVal); //its just a regular removal, set it
	}
	
	/*lifecycles*/
	componentDidMount() {
		//checking if I'm supposed to pass its ref to parent
		const {passRef, value} = this.props;
		
		
		if(passRef !== null)
			passRef(this.inputDOM.current);	//apparently, this.inputDOM has already been set since render() was done before this method
		
		this.limitPassed(value, "componentDidMount"); //gon check if limit passed to take neccessary actions
	
	}
	
	render() {
		const {value, changeHandler} = this.props;
		
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
	
		//next make sure onfocus, its caret is always at the end
		const moveCaretToEnd = (event) => {
			const length = event.target.value.length;
			event.target.setSelectionRange(length, length)
		};
		this.inputDOM.current.addEventListener("focus", moveCaretToEnd);
		this.inputDOM.current.addEventListener("click", moveCaretToEnd);
	}
	
}