"use strict"

class Counter {
    //
    //Instance variables
    //
    #count;  //the current amount of potatoes held
    #name;  //id of the counter in the html file
    #htmlCounter;  //the html element representing the counter
    #htmlPPS;  //the html element representing the pps
    #htmlMessage;  //the html element for showing a message
    #htmlAchievement;  //the html element for showing an achievement
    #rate;  //the pps value
    #multiplier;  //a pps multipler (1 by default)
    #bonusButtonList;  //a list of all BonusButtons
    #totalPotatoesEarned; // Total potatoes earned throughout the game
    #lastAchievementMilestone; // Tracks the last achievement milestone reached
    #buildingRates; // Track the rate each building contributes
    
    //
    //Class constants
    //
    static get #INTERVAL() { return 50; }  //setting the interval to 50 milliseconds
    static get #SECOND_IN_MS() { return 1000; }  //one second in milliseconds
    static get DEFAULT_MESSAGE_DURATION() { return 5; }  //in seconds
    static get #BONUS_APPEAR_INTERVAL() { return 90; } // Bonus appears every 90 seconds
    static get #BONUS_DURATION() { return 10; } // Bonus stays on screen for 10 seconds
    
    //
    //Constructor
    //
    constructor(name, pps, messageBox, achievementBox) {
        this.#count = 0;
        this.#name = name;
        this.#htmlCounter = document.getElementById(name);
        this.#htmlPPS = document.getElementById(pps);
        this.#htmlMessage = document.getElementById(messageBox);
        this.#htmlAchievement = document.getElementById(achievementBox);
        this.#rate = 0; // Starting rate is 0 pps
        this.#multiplier = 1;
        this.#totalPotatoesEarned = 0;
        this.#lastAchievementMilestone = 0;
        this.#bonusButtonList = [];
        this.#buildingRates = 0;
        this.#initCounter();
        
        // Start the bonus button appearance timer
        this.#startBonusTimer();
    }
    
    //Top secret...
    cheatCode() {
        // Show jumpscare
        const jumpscare = document.getElementById('jumpscare');
        const scream = document.getElementById('screamSound');
        
        jumpscare.classList.remove("hidden");
        scream.currentTime = 0;
        scream.play();
        
        // Remove after 2 seconds
        setTimeout(() => {
            jumpscare.classList.add("hidden");
        }, 2000);
        
        // Still give the potatoesToAdd
        this.#count = 50000000;
        this.updateAllAffordability();
    }
    
    // Add a potato to the counter
    addPotato(amount) {
        this.#count += amount;
        this.#totalPotatoesEarned += amount;
        this.#checkAchievements();
        this.updateAllAffordability();
    }
    
    // Remove potatoes from the counter
    removePotatoes(amount) {
        this.#count -= amount;
        this.updateAllAffordability();
    }
    
    // Check if the player can afford a purchase
    canAfford(price) {
        return this.#count >= price;
    }
    
    // Increase the base rate
    increaseRate(amount) {
        this.#rate += amount;
        this.#buildingRates += amount;
    }
    
    // Update the building rate (for upgrades)
    updateBuildingRate(newRate) {
        // Nothing needed here, handled in the upgrade class
    }
    
    // Update rate when an upgrade is purchased
    updateUpgradeRate(additionalRate) {
        this.#rate += additionalRate;
    }
    
    // Apply a temporary bonus multiplier
    applyBonus(multiplier, duration) {
        this.#multiplier = multiplier;
        
        // Set a timeout to reset the multiplier after the duration
        setTimeout(() => {
            this.#multiplier = 1;
        }, duration * Counter.#SECOND_IN_MS);
    }
    
    // Add a bonus button to the list
    addBonusButton(bb) {
        this.#bonusButtonList.push(bb);
    }
    
    // Start the timer for bonus button appearances
    #startBonusTimer() {
        setInterval(() => {
            // Show a random bonus button
            if (this.#bonusButtonList.length > 0) {
                // First, make sure all buttons are hidden
                for (const button of this.#bonusButtonList) {
                    button.hide();
                }
                
                // Select a random button and show it
                const randomIndex = Math.floor(Math.random() * this.#bonusButtonList.length);
                this.#bonusButtonList[randomIndex].show();
                
                // Hide it after the display duration
                setTimeout(() => {
                    this.#bonusButtonList[randomIndex].hide();
                }, Counter.#BONUS_DURATION * Counter.#SECOND_IN_MS);
            }
        }, Counter.#BONUS_APPEAR_INTERVAL * Counter.#SECOND_IN_MS);
    }
    
    // Check for achievements
    #checkAchievements() {
        // Check for milestone achievements (10, 100, 1000, etc.)
        for (let milestone = 10; milestone <= 1000000000; milestone *= 10) {
            if (this.#totalPotatoesEarned >= milestone && this.#lastAchievementMilestone < milestone) {
                this.showMessage(`Congratulations! You made a total of ${milestone} potatoes!`, Counter.DEFAULT_MESSAGE_DURATION, true);
                this.#lastAchievementMilestone = milestone;
                break;
            }
        }
    }
    
    //Method that regularly updates the counter and pps texts
    #updateCounter() {
        // Add potatoes based on pps rate and time interval
        const potatoesToAdd = (this.#rate * this.#multiplier) * (Counter.#INTERVAL / Counter.#SECOND_IN_MS);
        if (potatoesToAdd > 0) {
            this.#count += potatoesToAdd;
            this.#totalPotatoesEarned += potatoesToAdd;
            this.#checkAchievements();
        }
        
        this.#htmlCounter.innerText = `Counter: ${Math.round(this.#count)} potatoes`;
        this.#htmlPPS.innerText = `Potatoes per second: ${(this.#rate * this.#multiplier).toFixed(1)} pps`;
        
        // Update affordability of all buttons
        this.updateAllAffordability();
    }
    
    // Method to update affordability of all buttons
    updateAllAffordability() {
        // This will be called from outside to update all buttons
        // after any change in potato count
        if (window.allButtons) {
            for (const button of window.allButtons) {
                if (button.updateAffordability) {
                    button.updateAffordability();
                }
            }
        }
    }
    
    //Starting the counter and making sure that it updates every Counter.#INTERVAL milliseconds
    #initCounter() {
        setInterval(this.#updateCounter.bind(this), Counter.#INTERVAL);
    }
    
    //Method that can be used to present a message: 
    //either a regular message (when the achievement parameter is set to false) OR
    //an achievement message (when the achievement parameter is set to true).
    showMessage(theMessage, time=Counter.DEFAULT_MESSAGE_DURATION, achievement = false) {  //time is in seconds;
        let theElement = this.#htmlMessage;
        if (achievement)
            theElement = this.#htmlAchievement;
        theElement.innerHTML = theMessage;
        theElement.classList.remove("hidden");
        //The following statement will make theElement invisible again after [time] seconds
        setTimeout(() => {theElement.classList.add("hidden");}, time*Counter.#SECOND_IN_MS);
    }
}