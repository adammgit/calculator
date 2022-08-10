"use strict"

/* get DOM elements */
const display = document.querySelector(".display")
const input = document.querySelector("[data-displayInput]")
const number = document.querySelectorAll("[data-number]")
const oper = document.querySelectorAll("[data-operation]")
const parenthesis = document.querySelector("[data-parenthesis]")
const clear = document.querySelector("[data-clear]")
const equals = document.querySelector("[data-equals]")
const undo = document.querySelector("[data-undo]")

/* create stack */
class Stack {
    constructor() {
        this.items = [];
    }
    
    /* add element to the stack */
    add(element) {
        return this.items.push(element);
    }
    
    /* remove element from the stack */
    remove() {
        if(this.items.length > 0) {
            return this.items.pop();
        }
    }
    
    /* view the last element */
    peek() {
        return this.items[this.items.length - 1];
    }
    
    /* check if the stack is empty */
    isEmpty(){
       return this.items.length == 0;
    }
   
    /* the size of the stack */
    size(){
        return this.items.length;
    }
 
    /* empty the stack */
    clear(){
        this.items = [];
    }
}

class Calculator{
    constructor() {
        this.state = {
            currentInput: "",
            calculations: new Stack(),
            inputValid: true,
            parenthesis: "",
            output: ""
        }
    }

    /* initiate calculator by setting focus and events */
    initiateCalculator() {

        /* get display input in focus */
        this.focusDisplay()

        /* set event listeners for keys */
        document.addEventListener("keypress", (event) => {
            if (event.key === "Enter"){
                this.calculate()
            } else if (event.key === 8){
                this.undo()
            }
        })

        /* when user clicks anywhere on display, get cursor to input field */
        display.addEventListener("click", () => {
            this.focusDisplay()
        })

        /* listen for input change and validate it */
        input.addEventListener("input", (event) => {
            this.state.currentInput = event.target.value
            this.validateInput()
        })

        /* listen to clicks on numbers, update input and validate */
        number.forEach((num) => {
            num.addEventListener("click", () => {
                input.value += num.innerText
                this.state.currentInput += num.innerText
                this.validateInput()
            })
        })

        /* listen to clicks on operation and "." buttons and validate */
        oper.forEach((op) => {
            op.addEventListener("click", () => {

                /* for the final expression to be evaluated "x" and "÷"
                have to be converted into "*" and "/" respectively */
                if (op.innerText === "x"){
                    input.value += "*"
                    this.state.currentInput += "*"
                } else if (op.innerText === "÷"){
                    input.value += "/"
                    this.state.currentInput += "/"

                /* "+" and "-" stay as they are */
                } else {
                    input.value += op.innerText
                    this.state.currentInput += op.innerText
                }
                this.validateInput()
            })
        })

        /* monitor clicks on parenthesis and validate */
        parenthesis.addEventListener("click", () => {
            if (this.state.parenthesis[this.state.parenthesis.length - 1] === "("){
                this.state.parenthesis += ")"
                input.value += ")"
                this.state.currentInput += ")"
            } else {
                this.state.parenthesis += "("
                input.value += "("
                this.state.currentInput += "("
            }
            this.validateInput()
        })
        clear.addEventListener("click", (event) => {
            this.clear()
        })
        equals.addEventListener("click", () => {
            this.calculate()
        })
        undo.addEventListener("click", () => {
            this.undo()
        })
    }

    /* get the calculator to focus on the display input */
    focusDisplay(){
        document.querySelector(".display-input").focus()
    }

    /* when the expression is mathematically invalid, set the text colour to red
    and input valid to false */
    toggleValid(valid) {
        if (!valid){
            this.state.inputValid = false
            input.classList.add("invalid")
        } else {
            this.state.inputValid = true
            input.classList.remove("invalid")
        }
    }

    /* check if input is valid and set input valid in state accordingly */
    validateInput() {
        try {
            math.evaluate(this.state.currentInput)
            this.toggleValid(true)
        } catch(error) {
            this.toggleValid(false)
        }
    }

    /* calculate result */
    calculate() {

        /* if input is missing or invalid, do nothing */
        if (!this.state.inputValid || !this.state.currentInput) return

        /* set state output variable to result of evaluation */
        this.state.output = this.roundToTwo(math.evaluate(this.state.currentInput))
        this.appendCalculation()
    }

    roundToTwo(num) {
        return +(Math.round(num + "e+2") + "e-2");
    }

    /* remove calculation history from DOM, reset necessary state values and
    bring focus back to input field */
    clear() {
        this.removeCalcsDOM()
        input.value = ""
        this.state.currentInput = ""
        this.state.calculations.clear()
        this.state.inputValid = true,
        this.state.parenthesis = ""
        this.focusDisplay()
    }

    /* add every calculation including output to calculations stack
    and add calculations to DOM */
    appendCalculation() {
        this.state.calculations.add({
            input: this.state.currentInput,
            output: this.state.output
        })
        const calcElem = document.createElement("div")
        calcElem.className = "calculation"
        calcElem.innerHTML = `<span class="calc-text">${this.state.calculations.peek().input + "=" + this.state.calculations.peek().output}</span>
                                <button
                                    id=${this.state.calculations.peek().output}
                                    class="use-out-but"
                                    onclick="window.calculator.reuseOutput(event.target.id)"
                                >
                                    use output
                                </button>
        `
        display.insertBefore(calcElem, input)
        this.focusDisplay()

        /* reset input and parenthesis */
        input.value = ""
        this.state.currentInput = ""
        this.state.parenthesis = ""
    }

    /* method that removes calculations from DOM */
    removeCalcsDOM() {
        document.querySelectorAll(".calculation").forEach((el) => {
            el.parentNode.removeChild(el)
        })
    }

    /* method that sets new input as output in
    calculation which user has clicked on */
    reuseOutput(output) {
        input.value = output
        this.state.currentInput = output
    }

    /* go one step back / backspace functionality */
    undo() {
        this.state.currentInput = this.state.currentInput.slice(0, this.state.currentInput.length - 1)
        input.value = input.value.slice(0, input.value.length - 1)
        this.validateInput()
    }
}

/* expose calculator to global scope */
var calculator = window.calculator


window.addEventListener("DOMContentLoaded", () => {
    calculator = new Calculator()
    calculator.initiateCalculator()
    console.log("Calculator initiated.")
})
