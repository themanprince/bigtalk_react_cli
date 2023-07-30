import React, {Component, createRef} from "react";
import FldStyle from "./Fld.module.css";

const print = function(...texts) {
	let date = new Date();
	
	console.log(`[${date.getSeconds()}:${date.getMilliseconds()}]`, ...texts);
}


export default class Fld extends Component {
	constructor(props) {
		super(props);
		//the uncontrolled state of the input field is gon be controlled by the inputFields state
		//in the Input component
		
		this.limit = null; //its charLimit... will be set in ComponentDidMount lifecycle
		this.resizeHandler = null;
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
	
	addFieldUsingExcess = (value) => {
		const {addInput, setValue} = this.props;
		const remaining = value.slice(0, this.limit);
		
		print('the DOM el is ', this.inputDOM.current);
		setValue(remaining);
		//getting the excess text to move it to new line
		//only if there is, however
		(value.length > this.limit) && addInput(value.slice(this.limit));
		
	}
	
	isLimitPassed = (value, source) => {
		console.group(`Fld ${this.props.myIndex} isLimitPassed checker`);
		//calculating limit if it ain't already
		if(!this.limit)
			this.limit = this.charLimit(this.inputDOM.current.getBoundingClientRect().width);
		
		print(`called by ${source}, limit is ${this.limit}, value length is ${value.length}`);
		
		const {setLimitPassedOnMount} = this.props;
			
		if((source === "componentDidMount") && (value.length >= this.limit)) {
			print(`got here so componentDidMount caused limit breach, text length is ${value.length} limit is ${this.limit}`);
			this.addFieldUsingExcess(value);
			setLimitPassedOnMount(true);
			console.groupEnd();
			
			return true;
		} else if ((source === "valueAddedAction") && (value.length >= this.limit)) {
			print(`got here so value added caused limit breach, text length is ${value.length}, limit is ${this.limit} index is ${this.props.myIndex}`);
			this.addFieldUsingExcess(value);
			console.groupEnd();
			return true;
		} else {
			if(source === "componentDidMount")
				setLimitPassedOnMount(false);
			
			console.groupEnd();
			return false;
		}
		
	}

	//next two shit are required for my change handler
	valueAddedAction = (newVal) => {
		const {setValue} = this.props;
		/*below is like... if limit not passed, reflect changes
		else action already been defined in isLimitPassed
		*/
		this.isLimitPassed(newVal, "valueAddedAction") || setValue(newVal); 
	}
	
	valueRemovedAction = (newVal) => {
		const {setValue, remove, myIndex} = this.props;
		
		if((newVal.length === 0) && myIndex !== 0) { //means value removal caused input fld emptying
			remove(); //remove it
		} else
			setValue(newVal); //its just a regular removal, set it
	}
	
	/*figured out I actually need separate rebouncers for Input and Fld because the timeout var is a reference
	abeg I nur fit explain pass like that*/
	debouncer = (func, time) => {
		let timeoutID = null; //null at first
		
		return (...args) => { //args gon esp be event argument from listener
			clearTimeout(timeoutID);
			
			timeoutID = setTimeout(() => func(...args), time);
		}
	}
	
	/*lifecycles*/
	componentDidMount() {
		console.group(`Fld ${this.props.myIndex} componentDidMount()`);
		const {passRef, value, addToLimitList} = this.props;
		
		passRef && print("passRef was given to this component");
		//checking if I'm supposed to pass its ref to parent
		if(passRef !== null)
			passRef(this.inputDOM.current);	//apparently, this.inputDOM has already been initialised since render() was called before this method
		
		this.resizeHandler =  this.debouncer((event) => {
			this.inputDOM.current &&/*because debouncing may make func call after el is gone*/ (() => {
				const newWidth = this.inputDOM.current.getBoundingClientRect().width;
				this.limit = this.charLimit(newWidth);
				print(`in resize() for fld ${this.props.myIndex}, apparently its DOM ref still exists... its width is ${newWidth}`);
				addToLimitList(this.limit);
			})();
		}, 500);
		
		//window resize handler
		window.addEventListener("resize", this.resizeHandler);
		
		//next make sure onfocus, its caret is always at the end
		const moveCaretToEnd = (event) => {
			const length = event.target.value.length;
			event.target.setSelectionRange(length, length)
		};
		this.inputDOM.current.addEventListener("focus", moveCaretToEnd);
		this.inputDOM.current.addEventListener("click", moveCaretToEnd);
	
		this.isLimitPassed(value, "componentDidMount"); //gon check if limit passed to take neccessary actions
		
		console.groupEnd();
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
		console.group(`Fld ${this.props.myIndex} update`);
		const {isLastInput, passRef} = this.props;
		console.log(`value length is ${this.props.value.length}, limit is ${this.limit}`);
		isLastInput && print(`this Fld is the last one so it'll be passing its Ref to parent`);
		
		if(this.props.value.length >= this.limit) {
			print(`after a (re)render, limit breached so I'm disabling this`);
			//some other external forces may make this component !disabled... so after every
			//render, if its limit is breached, then it posed to be disabled... I'm just making sure
			this.inputDOM.current.disabled = true;
		}
		
		if(isLastInput)
			passRef && passRef(this.inputDOM.current);
		//if its the last, make sure its set as the lastNode ref in parent Input after
		//every render which could be cus of flds getting removed... to make sure it will point to it
		//after update... ion know if I explained this well
	
		console.groupEnd();
	}
	
	componentWillUnmount() {
		print(`in Fld ${this.props.myIndex} componentWillUnmount`);
		window.removeEventListener("resize", this.resizeHandler);
	}
	
}