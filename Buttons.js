"use strict"

class Button {
    //
    //Instance variables
    //
    #name;
    #counter;
    #htmlButton;
    
    //
    //Class constants
    //
    static get TEXT_ATTRIBUTE() { return "-text"; }
    
    //
    //Constructor
    //
    constructor(name, counter) {
        if (this.constructor === Button) {
            throw new Error("Abstract class Button cannot be instantiated.");
        }
        
        this.#name = name;
        this.#counter = counter;
        this.#htmlButton = document.getElementById(name);
        // Add a click event listener to the button
        this.#htmlButton.addEventListener('click', this.clickAction.bind(this)); //this has a different meaning in this context, so I need to bind my method to it
    }
    
    //Updating the innerHTML text of the button 
    //(note that not all types of buttons have text, but I placed this here to give that code to you)
    updateText(newText) {
        document.getElementById(this.name + Button.TEXT_ATTRIBUTE).innerHTML = newText;
    }
    
    // Method to update affordability visual state
    updateAffordability() {
        if (this.counter.canAfford(this.price)) {
            this.htmlButton.parentElement.classList.remove("unaffordable");
            this.htmlButton.parentElement.classList.add("affordable");
        } else {
            this.htmlButton.parentElement.classList.remove("affordable");
            this.htmlButton.parentElement.classList.add("unaffordable");
        }
    }
    
    //Abstract method that needs to be implemented by all subclasses
    clickAction() {
        throw new Error("Abstract method clickAction() must be implemented by subclasses.");
    }
    
    //
    //Accessors below that you might find useful
    //
    get name() {
        return this.#name;
    }
    
    get counter() {
        return this.#counter;
    }
    
    get htmlButton() {
        return this.#htmlButton;
    }
}

// ClickingButton class - represents the big potato button
class ClickingButton extends Button {
    constructor(name, counter) {
        super(name, counter);
    }
    
    clickAction() {
        // Add 1 potato when clicked
        this.counter.addPotato(1);
        // Show +1 message for a very short time (0.1 second)
        this.counter.showMessage("+1", 0.1);
    }
}

// BuildingButton class - represents buildings that produce potatoes
class BuildingButton extends Button {
    #count;
    #price;
    #rateIncrease;
    
    static get PRICE_MULTIPLIER() { return 1.5; }
    
    constructor(name, counter, initialPrice, rateIncrease) {
        super(name, counter);
        this.#count = 0;
        this.#price = initialPrice;
        this.#rateIncrease = rateIncrease;
        this.updateAffordability();
    }
    
    clickAction() {
        // Check if there are enough potatoes to buy this building
        if (this.counter.canAfford(this.#price)) {
            // Deduct the price
            this.counter.removePotatoes(this.#price);
            // Increase the building count
            this.#count++;
            // Increase the pps rate
            this.counter.increaseRate(this.#rateIncrease);
            // Increase the price for the next purchase
            this.#price = Math.round(this.#price * BuildingButton.PRICE_MULTIPLIER);
            // Update button text
            this.updateButtonText();
            // Update affordability
            this.updateAffordability();
        }
    }
    
    updateButtonText() {
        this.updateText(`${this.#count} ${this.name}<br>Cost: ${Math.round(this.#price)}<br>Adds: ${this.#rateIncrease} pps`);
    }
    
    // Method to upgrade the building rate
    upgradeRate(multiplier) {
        this.#rateIncrease *= multiplier;
        this.counter.updateBuildingRate(this.#rateIncrease);
        this.updateButtonText();
    }
    
    // Accessor for the rate increase
    get rateIncrease() {
        return this.#rateIncrease;
    }
    
    // Accessor for the count
    get count() {
        return this.#count;
    }
    
    // Accessor for the price
    get price() {
        return this.#price;
    }
}

// UpgradeButton class - represents upgrades to buildings
class UpgradeButton extends Button {
    #count;
    #price;
    #improvementValue;
    #associatedBuilding;
    
    static get PRICE_MULTIPLIER() { return 5; }
    
    constructor(name, counter, initialPrice, improvementValue, associatedBuilding) {
        super(name, counter);
        this.#count = 0;
        this.#price = initialPrice;
        this.#improvementValue = improvementValue;
        this.#associatedBuilding = associatedBuilding;
        this.updateAffordability();
    }
    
    clickAction() {
        // Check if there are enough potatoes to buy this upgrade
        if (this.counter.canAfford(this.#price)) {
            // Deduct the price
            this.counter.removePotatoes(this.#price);
            // Increase the upgrade count
            this.#count++;
            
            // Get the current rate before upgrading
            const oldRate = this.#associatedBuilding.rateIncrease;
            
            // Upgrade the associated building
            this.#associatedBuilding.upgradeRate(this.#improvementValue);
            
            // Get the new rate after upgrading
            const newRate = this.#associatedBuilding.rateIncrease;
            console.log(`Old Rate: ${oldRate}, New Rate: ${newRate}`);
            
            // Update the counter's total rate
            this.counter.updateUpgradeRate(newRate - oldRate);
            
            // Increase the price for the next purchase
            this.#price = Math.round(this.#price * UpgradeButton.PRICE_MULTIPLIER);
            
            // Update button text
            this.updateButtonText();
            // Update affordability
            this.updateAffordability();
        }
    }
    
    updateButtonText() {
        this.updateText(`${this.#count} ${this.name}<br>Cost: ${Math.round(this.#price)}<br>${this.#associatedBuilding.name} prod. x ${this.#improvementValue}`);
    }
    
    // Accessor for the price
    get price() {
        return this.#price;
    }
}

// BonusButton class - represents temporary bonuses
class BonusButton extends Button {
    #multiplier;
    #duration;
    
    constructor(name, counter, multiplier, duration) {
        super(name, counter);
        this.#multiplier = multiplier;
        this.#duration = duration;
        // Hide the button initially
        this.htmlButton.classList.add("hidden");
    }
    
    clickAction() {
        // Apply the bonus
        this.counter.applyBonus(this.#multiplier, this.#duration);
        // Hide the button after being clicked
        this.htmlButton.classList.add("hidden");
        // Show message
        this.counter.showMessage(`${this.name} started!<br>${this.#multiplier} x pps for ${this.#duration} seconds!`, 5);
    }
    
    // Show the bonus button
    show() {
        this.htmlButton.classList.remove("hidden");
    }
    
    // Hide the bonus button
    hide() {
        this.htmlButton.classList.add("hidden");
    }
}