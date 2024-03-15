// Health values
let frierenHealth = 100;
let orcsHealth = 100;

let fightStarted = false; // Variable to track if the fight has started
let shieldActive = false; // Variable to track if shield is active

let orcAttackInterval;

// Cooldown values in seconds
const ATTACK_COOLDOWN_DURATION = 3;
const HEAL_COOLDOWN_DURATION = 5;
const SHIELD_COOLDOWN_DURATION = 5;

let attackCooldown = 0;
let healCooldown = 0;
let shieldCooldown = 0;

function endGame(message) {
    fightStarted = false;
    // Stop Orcs' automatic attack
    clearInterval(orcAttackInterval);
    // Display endgame message
    const fightText = document.querySelector('.fight-text');
    fightText.innerText = message;
    // Apply styling to the endgame message
    fightText.style.color = "darkred";
    fightText.style.fontSize = "40px";
    // Enable the start button
    document.querySelector('.start-button').classList.remove('disabled');
    // Add the "disabled" class back to buttons
    document.querySelectorAll('.attack-button, .heal-button, .shield-button').forEach(function(button) {
        button.classList.add('disabled');
    });
}

function startFight() {
    if (!fightStarted) {
        // Reset health for both players
        frierenHealth = 100;
        orcsHealth = 100;
        fightStarted = true;
        // Start Orcs' automatic attack every 7 seconds
        orcAttackInterval = setInterval(orcAttack, 4500); // Assign interval reference to global variable
        // Display "Fight!" text
        const fightText = document.querySelector('.fight-text');
        fightText.innerText = "Fight!";
        // Apply styling to the "Fight!" text
        fightText.style.color = "darkred";
        fightText.style.fontSize = "40px";
        // Update health bars
        updateHealthBars();
        // Disable the start button
        document.querySelector('.start-button').classList.add('disabled');
        setTimeout(function () {
            document.querySelector('.fight-text').innerText = "";
        }, 2000);
    } else {
        // Display endgame message if the game has already started
        endGame("Game in progress");
    }
}

// Function to update cooldown timers
function updateCooldownTimers() {
    updateTimer('#attack-timer', attackCooldown, ATTACK_COOLDOWN_DURATION);
    updateTimer('#heal-timer', healCooldown, HEAL_COOLDOWN_DURATION);
    updateTimer('#shield-timer', shieldCooldown, SHIELD_COOLDOWN_DURATION);
}

function updateTimer(timerClass, cooldown, cooldownDuration) {
    const timerElement = document.querySelector(timerClass);
    if (cooldown === 0) {
        timerElement.style.width = '100%'; // Full green bar when available
    } else {
        timerElement.style.width = (cooldown / cooldownDuration * 100) + '%';
    }
}
// Function to handle cooldowns
function handleCooldowns() {
    if (attackCooldown > 0) {
        attackCooldown -= 0.1;
        if (attackCooldown < 0) attackCooldown = 0;
    }
    if (healCooldown > 0) {
        healCooldown -= 0.1;
        if (healCooldown < 0) healCooldown = 0;
    }
    if (shieldCooldown > 0) {
        shieldCooldown -= 0.1;
        if (shieldCooldown < 0) shieldCooldown = 0;
    }
    updateCooldownTimers();
}

// Function to start cooldown for a specific ability
function startCooldown(ability) {
    switch (ability) {
        case 'attack':
            attackCooldown = ATTACK_COOLDOWN_DURATION;
            break;
        case 'heal':
            healCooldown = HEAL_COOLDOWN_DURATION;
            break;
        case 'shield':
            shieldCooldown = SHIELD_COOLDOWN_DURATION;
            break;
    }
}

// Function to update health bars
function updateHealthBars() {
    // Update Frieren's health bar
    let frierenHealthBar = document.querySelector('.frieren-health');
    frierenHealthBar.style.width = (frierenHealth + '%');

    // Update Orcs' health bar
    let orcsHealthBar = document.querySelector('.orcs-health');
    orcsHealthBar.style.width = (orcsHealth + '%');
}

// Player abilities

function attack() {
    // Get the position of Frieren's pfp
    let frierenPosition = document.querySelector('.pfp-container-frieren').getBoundingClientRect();
    let frierenCenterX = frierenPosition.left + frierenPosition.width / 2;
    let frierenCenterY = frierenPosition.top + frierenPosition.height / 2;

    // Create gif element
    let blastGif = document.createElement('img');
    blastGif.src = 'assets/blast.gif';
    blastGif.classList.add('blast');

    // Set the initial position of the blast gif
    blastGif.style.left = frierenCenterX + 20 + 'px';
    blastGif.style.top = frierenCenterY - 50 + 'px';

    // Append gif to the game display
    document.querySelector('.game-display').appendChild(blastGif);

    // Animate the gif
    let distance = frierenPosition.left + frierenPosition.width; // Start from the right edge of Frieren's pfp
    let blastInterval = setInterval(function () {
        distance += 5; // Adjust the speed of the blast
        blastGif.style.left = distance + 'px';

        // Check if the gif hits the Orcs' pfp
        if (distance >= document.querySelector('.pfp-container-orcs').offsetLeft) {
            clearInterval(blastInterval); // Stop the animation
            document.querySelector('.game-display').removeChild(blastGif); // Remove the gif
            // Deal damage to Orcs
            dealDamageToOrcs(25);
        }
    }, 20); // Adjust the interval as needed
}

// Function to deal damage to Orcs
function dealDamageToOrcs(damage) {
    orcsHealth -= damage;
    if (orcsHealth <= 0) {
        orcsHealth = 0;
        endGame("You Won!");
    }
    updateHealthBars(); // Update health bars after taking damage
}

function activateShield() {
    shieldActive = true;
    // Create gif element for shield
    let shieldGif = document.createElement('img');
    shieldGif.src = 'assets/shield.gif';
    shieldGif.classList.add('shield');

    // Position the shield on top of Frieren's pfp
    let frierenPosition = document.querySelector('.pfp-container-frieren').getBoundingClientRect();
    shieldGif.style.left = frierenPosition.left - 32 + 'px';
    shieldGif.style.top = frierenPosition.top - 30 + 'px';

    // Append gif to the game display
    document.querySelector('.game-display').appendChild(shieldGif);

    // Add event listener for button release to deactivate shield and activate Orcs' heal
    document.querySelector('.shield-button').addEventListener('mouseup', () => {
        deactivateShield();
    });
    document.querySelector('.shield-button').addEventListener('mouseleave', () => {
        deactivateShield();
    });
    document.querySelector('.shield-button').addEventListener('touchend', () => {
        deactivateShield();
    });

    // Activate Orcs' heal when shield is used
    activateOrcsHeal();
}

// Function to handle shield deactivation
function deactivateShield() {
    shieldActive = false;
    // Remove the shield gif
    let shieldGif = document.querySelector('.shield');
    if (shieldGif) {
        shieldGif.parentNode.removeChild(shieldGif);
    }
}

// Function to handle heal activation
function activateHeal() {
    // Create gif element for heal
    let healGif = document.createElement('img');
    healGif.src = 'assets/heal.gif';
    healGif.classList.add('heal');

    // Position the heal gif on top of Frieren's pfp
    let frierenPosition = document.querySelector('.pfp-container-frieren').getBoundingClientRect();
    healGif.style.left = frierenPosition.left + 14 + 'px';
    healGif.style.top = frierenPosition.top + 20 + 'px';

    // Append gif to the game display
    document.querySelector('.game-display').appendChild(healGif);

    // Heal Frieren
    frierenHealth += 15;
    if (frierenHealth > 100) {
        frierenHealth = 100; // Limit the health to maximum 100
    }
    updateHealthBars(); // Update health bars after healing

    // Remove the heal gif after a delay (optional)
    setTimeout(() => {
        if (healGif.parentNode) {
            healGif.parentNode.removeChild(healGif);
        }
    }, 1000); // Adjust the delay as needed
}

// Orcs abilities
// Function to handle Orcs' automatic attack
function orcAttack() {
    // Get the position of Orcs' pfp
    let orcsPosition = document.querySelector('.pfp-container-orcs').getBoundingClientRect();
    let orcsCenterX = orcsPosition.left + orcsPosition.width / 2;
    let orcsCenterY = orcsPosition.top + orcsPosition.height / 2;

    // Create gif element for Orcs' attack
    let orcBlastGif = document.createElement('img');
    orcBlastGif.src = 'assets/blast.gif';
    orcBlastGif.classList.add('orc-blast');

    // Set the initial position of the blast gif off-screen
    orcBlastGif.style.left = '-100px'; // Adjust as needed
    orcBlastGif.style.top = orcsCenterY - 50 + 'px';

    // Append gif to the game display
    document.querySelector('.game-display').appendChild(orcBlastGif);

    // Animate the gif
    let distance = orcsCenterX - 150; // Start from the center
    let orcBlastInterval = setInterval(function () {
        distance -= 5; // Adjust the speed of the blast
        orcBlastGif.style.left = distance + 'px';

        // Get the position of Frieren's pfp
        let frierenPosition = document.querySelector('.pfp-container-frieren').getBoundingClientRect();

        // Calculate the center of Frieren's pfp
        let frierenCenterX = frierenPosition.left + frierenPosition.width / 2;
        let frierenCenterY = frierenPosition.top + frierenPosition.height / 2;

        // Calculate the distance between the orc's attack and Frieren's center
        let distanceToFrierenCenter = Math.abs(distance - frierenCenterX);

        // If the orc's attack is close enough to Frieren's center, consider it a hit
        if (distanceToFrierenCenter <= 20) {
            clearInterval(orcBlastInterval); // Stop the animation
            document.querySelector('.game-display').removeChild(orcBlastGif); // Remove the gif
            // Deal damage to Frieren
            dealDamageToFrieren(45);
        }
    }, 20); // Adjust the interval as needed
}

// Function to handle Orcs' heal activation
function activateOrcsHeal() {
    // Create gif element for Orcs' heal
    let orcHealGif = document.createElement('img');
    orcHealGif.src = 'assets/heal.gif';
    orcHealGif.classList.add('heal');

    // Position the heal gif on top of Orcs' pfp
    let orcsPosition = document.querySelector('.pfp-container-orcs').getBoundingClientRect();
    orcHealGif.style.left = orcsPosition.left + 14 + 'px';
    orcHealGif.style.top = orcsPosition.top + 20 + 'px';

    // Append gif to the game display
    document.querySelector('.game-display').appendChild(orcHealGif);

    // Heal Orcs
    orcsHealth += 15;
    if (orcsHealth > 100) {
        orcsHealth = 100; // Limit the health to maximum 100
    }
    updateHealthBars(); // Update health bars after healing

    // Remove the heal gif after a delay (optional)
    setTimeout(() => {
        if (orcHealGif.parentNode) {
            orcHealGif.parentNode.removeChild(orcHealGif);
        }
    }, 1000); // Adjust the delay as needed
}

// Add an event listener to the start button
document.querySelector('.start-button').addEventListener('click', function () {
    if (!fightStarted) { // Check if the fight hasn't started yet
        startFight();
        // Remove the "disabled" class from buttons
        document.querySelectorAll('.attack-button, .heal-button, .shield-button').forEach(function(button) {
            button.classList.remove('disabled');
        });
    }
});

// Function to check if shield is active
function isShieldActive() {
    return shieldActive;
}

// Function to deal damage to Frieren, considering the shield
function dealDamageToFrieren(damage) {
    if (!isShieldActive()) {
        frierenHealth -= damage;
        if (frierenHealth <= 0) {
            frierenHealth = 0;
            endGame("You Died!");
        }
        updateHealthBars(); // Update health bars after taking damage
    }
}

// Event listener for attack button
document.querySelector('.attack-button').addEventListener('click', function () {
    if (fightStarted && attackCooldown === 0) {
        attack();
        startCooldown('attack');
    }
});

// Event listener for heal button
document.querySelector('.heal-button').addEventListener('click', function () {
    if (fightStarted && healCooldown === 0) {
        activateHeal();
        startCooldown('heal');
    }
});

// Event listener for shield button
document.querySelector('.shield-button').addEventListener('mousedown', function () {
    if (fightStarted && shieldCooldown === 0) {
        activateShield();
    }
});

document.querySelector('.shield-button').addEventListener('mouseup', function () {
    if (fightStarted && shieldCooldown === 0) {
        startCooldown('shield');
    }
});

// Initial health bar update
updateHealthBars();
// Update cooldown timers every 100 milliseconds
setInterval(handleCooldowns, 100);