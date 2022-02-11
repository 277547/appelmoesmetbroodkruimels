var alphabet = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

//IMPORT NEW ARRAY
var wordList = [];

function getWords(file) {
  var rawFile = new XMLHttpRequest();
  rawFile.open('GET', file, false);
  rawFile.onreadystatechange = function () {
    if(rawFile.readyState === 4) {
      if(rawFile.status === 200 || rawFile.status == 0) {
        wordList = rawFile.responseText.split('\r\n');
      }
    }
  };
  rawFile.send(null);
}

getWords('./words.txt');

var toGuess = wordList[Math.floor(Math.random() * wordList.length)].toUpperCase();
//console.log("toGuess: " + toGuess);

toGuess = toGuess.split(''); //Make toGuess an array

var guesses = 6;
var gameOver = false;

var equal = false; //Used later on to check if toGuess and guessedWord are equal

var characters = document.getElementById("toGuess"); //Div where you see how much characters the word is and what letters you guessed

var guessedWord = []; //Gets filled in if you pick a right letter

for (let i = 0; i < toGuess.length; i++) { 
    characters.innerHTML += "_ "; //Print the length of toGuess represented by _'s
    guessedWord.push("_"); //Make guessedWord the same length as toGuess
}

var rightCharacters = [];
var wrongCharacters = [];

var notChosen = [];
for (i = 0; i < alphabet.length; i++){
    notChosen.push(alphabet[i]);
}

var wordIsGuessed = false;


function getInput(letter){
    if (!gameOver){
        //console.log("Input: " + letter);
        
        document.getElementById(letter).disabled = true; //Can't press the button anymore
        var index = notChosen.indexOf(letter);
        notChosen.splice(index, 1);
        
        if(toGuess.indexOf(letter) != -1){ //Correct letter
            
            rightCharacters.push(letter);
            
            for (let i = 0; i < guessedWord.length; i++) {
                if (letter == toGuess[i]){
                    guessedWord[i] = letter; //Fill in guessedWord
                    }
            }
        }
        else{ //Wrong letter
            wrongCharacters.push(letter);
            
            guesses -= 1;
            document.getElementById("guessesDiv").innerHTML = `Remaining guesses: ${guesses}`;
            document.getElementById('image').src = `Hangman png's/hangman${guesses}.png`;
        }

        if(guesses <= 0){
            toGuess = toGuess.join("");
            document.getElementById("guessesDiv").innerHTML = `Game Over... The word was ${toGuess}`;
            gameOver = true;
        }

        characters.innerHTML = '';
        for (let i = 0; i < guessedWord.length; i++) { //Print guessedWord to screen
            characters.innerHTML += (guessedWord[i] + ' ');
        }

        for (let i = 0; i < toGuess.length; i++) { //Checks if guessedWord == toGuess
            if (toGuess[i] != guessedWord[i]){
                equal = false;
                break;
            }else{
                equal = true;
            }
        }

        if (equal == true){ //Win condition
            //console.log("You guessed the right word!");
            gameOver = true;
            wordIsGuessed = true;
            document.getElementById("guessesDiv").innerHTML = `Good job!! Remaining guesses: ${guesses}`;
            document.getElementById('image').src = `Hangman png's/hangmanWin.png`;
        }
    }
}

function reset(){
    toGuess = wordList[Math.floor(Math.random() * wordList.length)].toUpperCase(); //Pick a random word from the array
    //console.log("toGuess: " + toGuess);

    toGuess = toGuess.split(''); //Make toGuess an array

    guesses = 6;
    document.getElementById("guessesDiv").innerHTML = `Remaining guesses: ${guesses}`;
    gameOver = false;
    
    guessedWord = []; //Gets filled in if you pick a right letter
    
    characters.innerHTML = '';
    
    for (let i = 0; i < toGuess.length; i++) { 
        guessedWord.push("_"); //Make guessedWord the same length as toGuess
        characters.innerHTML += (guessedWord[i] + ' ');
    }
    
    //Reset the buttons:
    for (let i = 0; i < alphabet.length; i++) { 
        document.getElementById(alphabet[i]).disabled = false;
    }
    
    //Reset the image:
    document.getElementById('image').src = `Hangman png's/hangman6.png`;
    
    rightCharacters = [];
    wrongCharacters = [];
    notChosen = [];
    for (i = 0; i < alphabet.length; i++){
        notChosen.push(alphabet[i]);
    }
    
    wordIsGuessed = false;
}


//Allow keyboard input:
document.addEventListener('keydown', function(event) {
    var pressedKey = String.fromCharCode(event.keyCode).toUpperCase()
    
    if(document.getElementById(pressedKey)){
    
        if(document.getElementById(pressedKey).disabled == false){
            getInput(pressedKey);
        }
    }
});


//Functions for bots:

//Get all the words with the right length:
function checkLengths(){ //WORKS
    var possibleMatches = [];
    
    for (let i = 0; i < wordList.length; i++){
        if (wordList[i].length == toGuess.length){
            possibleMatches.push(wordList[i]);
        }
    }
    
    return possibleMatches;
}

//Get the most common character, is given an array to calculate it from and an array of characters which haven't been chosen (because you don't want to return a character that is already chosen)

function getCommon(words, notChosenCharacters){ //WORKS
    
    var wordString = words.join('');
    var length = notChosenCharacters.length;
    var characterFrequencies = [length];
    
    for (let i = 0; i < notChosenCharacters.length; i++){
        var myRegex = notChosenCharacters[i].toLowerCase();
        var regex = new RegExp(myRegex, 'g');
        var matches = wordString.match(regex);
        if (matches == null){
            characterFrequencies[i] = 0;
        }
        else{
            characterFrequencies[i] = matches.length;
        }
    }
    
    var highest = 0;
    var myIndex = 0;
    
    for (let i = 0; i < characterFrequencies.length; i++){
        if (characterFrequencies[i] > highest ){
            highest = characterFrequencies[i];
            myIndex = i;
        }
    }
    
    return notChosenCharacters[myIndex];
}

//This function removes words from an array if they contain the wrong characters:

function removeWrong(wrongCharacters, possibleMatches){ //WORKS
    
    //Make the regex:
    var myRegex = '[^';
    
    for (let i = 0; i < wrongCharacters.length; i++){
        myRegex += wrongCharacters[i].toLowerCase();
    }
    
    myRegex += `]{${toGuess.length}}`;
    
    var regex = new RegExp(myRegex);
    var newMatches = possibleMatches.filter(val => regex.test(val));
    
    return newMatches;
}

//This function makes an array from the correctly chosen array and checks for the matches in a given array

function checkCorrect(guessedWord, possibleMatches){ //(guessedWord is an array with the correctly chosen letters in the right spots, if not chosen there is a '_')
    
    //Make the regex:
    var myRegex = '';
    for (i = 0; i < guessedWord.length; i++){
        if (guessedWord[i] != '_'){
            myRegex += guessedWord[i];
        }else{
          myRegex += '.';
        }
    }
    
    regex = new RegExp(myRegex);
    var newMatches = possibleMatches.filter(val => regex.test(val));
    
    return newMatches;
    
}




//TODO: First make sure all the individual functions work, and then the bot
//This function is the 'bot', which keeps track of the variables and uses all of the previous functions to make choices
function bot(runs){
    var possibleMatches = checkLengths();
    var outcome = 0;
    
    var now = new Date();
    var before = now.getTime();
    
    for (let i = 0; i < runs; i++){
        possibleMatches = checkLengths();
      
        while(!gameOver){
            if (wrongCharacters.length > 0){
                possibleMatches = removeWrong(wrongCharacters, possibleMatches);
            }
            if (rightCharacters.length > 0){
                possibleMatches = checkCorrect(guessedWord, possibleMatches);
            }
            
            var choice = getCommon(possibleMatches, notChosen);
            getInput(choice);
        }
        //Game Over
        if (wordIsGuessed){
            outcome++;
        }
        
        reset();
        possibleMatches = checkLengths();
    }
    
    var average = (outcome / runs) * 100;
    
    now = new Date();
    var after = now.getTime();
    var calcTime = (after - before) / 1000;
    
    console.log("Time: " + calcTime + "s");
    console.log('Average: ' + average + "%");
    //Calculate percentage
}




























