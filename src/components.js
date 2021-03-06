import React, { useState } from "react";
import "./components.css";
import axios from "axios";
import wordsArray from "./startingWords";

// declaring these here for readability + easier balance changes
const baseWordScore = 200;
const bonusLetterMultiplier = 1.5;
const minimumWordLength = 3;
const startingTileCount = 10;
const startingRoundLength = 45;
const scoreTarget = 5000;

class Game extends React.Component {
  // Game component holds all the state variables to keep them consistent between components
  constructor(props) {
    super(props);
    this.state = {
      word: "", // string to track current word
      wordList: "", // text of the "Recent Words" box
      wordsPlayed: 0, // number of words played
      wordDisplay: [], // array for displaying the current word's tiles
      availableTiles: Array(startingTileCount).fill(1), // array of flags to track whether each tile has already been played
      letterTray: [], // array for displaying the tray of letter tiles
      time: {}, // object for tracking the game time
      seconds: startingRoundLength, // number of seconds to be turned into minutes / seconds
      score: 0, // number for tracking the player's score
      wordSet: new Set(), // set for tracking unique words / preventing duplicates
      mascotDialogue: "Welcome to Dictionary Attack!", // string for displaying the mascot's dialogue
      wordDefinition: "", // string for displaying the word's definition (retrieved from backend)
      startingWord: "Lorem",
      mascotImage: "../thesaurus rex neutral.png", // file path for the mascot image
      gameOver: false, // boolean for storing game finish state
      highScores: [], // array for holding high scores ()
      userNameInput: "", // string for holding the user's submitted username (send to backend for high scores)
      totalTimePlayed: 0, //keep track of how long the user played
    };

    ///////////////////////
    // FUNCTION BINDINGS //
    ///////////////////////

    this.addLetter = this.addLetter.bind(this);
    this.removeLetter = this.removeLetter.bind(this);
    // this.calculateWordScore = this.calculateWordScore(this);
    this.clearWord = this.clearWord.bind(this);
    this.generateLetterTray = this.generateLetterTray.bind(this);
    this.submitWord = this.submitWord.bind(this);
    this.reset = this.reset.bind(this);
    this.validateWord = this.validateWord.bind(this);
    this.timer = 0; // used to set interval when timer starts. needs to be set to 0 again whenever interval is cleared
    this.startTimer = this.startTimer.bind(this);
    this.stopTimer = this.stopTimer.bind(this);
    this.resetTimer = this.resetTimer.bind(this);
    this.countDown = this.countDown.bind(this);
    this.getRandomWord = this.getRandomWord.bind(this);
    this.getHighScores = this.getHighScores.bind(this);
    this.setName = this.setName.bind(this);
    this.pushUserToDB = this.pushUserToDB.bind(this);
    this.helloWorld = this.helloWorld.bind(this);
  }

  ////////////////
  // GAME SETUP //
  ////////////////

  componentDidMount() {
    // function that runs when the Game component is loaded
    this.setState({
      letterTray: this.generateLetterTray(),
    });
    let timeLeftVar = this.calcTime(this.state.seconds); // gets min/sec to initialize time display
    this.setState({ time: timeLeftVar }); //sets the timer display
    this.getHighScores();
  }

  getRandomWord() {
    // function that retrieves a random word from startingWords.js
    let i = Math.floor(Math.random() * wordsArray.length);
    let randWord = wordsArray[i].toUpperCase();
    // console.log(randWord);
    return randWord;
  }

  generateLetterTray() {
    // function that generates letter tray from a starting word
    let tray = [];
    let randWord = this.getRandomWord();

    this.setState({ wordDisplay: [], startingWord: randWord });
    console.log(randWord);
    const array = randWord.split("");

    let currentIndex = array.length,
      randomIndex;

    // while there remain elements to shuffle...
    while (currentIndex !== 0) {
      // pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // and swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }

    for (let i = 0; i < array.length; i++) {
      // iterate through the scrambled word and generate <Letter> elements from the characters
      tray[i] = (
        <Letter
          key={i}
          letter={array[i]}
          trayPosition={i}
          wordPosition={-1}
          handleClick={(letter, trayPosition, wordPosition) =>
            this.addLetter(letter, trayPosition, wordPosition)
          }
        />
      );
    }
    return tray;
  }

  reset() {
    // function to reinitialize all relevant variables
    this.setState({
      word: "",
      wordList: "",
      wordsPlayed: 0,
      time: startingRoundLength,
      score: 0,
      wordDisplay: [],
      availableTiles: Array(startingTileCount).fill(1),
      letterTray: this.generateLetterTray(),
      wordSet: new Set(),
      mascotImage: "../thesaurus rex neutral.png",
      mascotDialogue: "Welcome to Dictionary Attack!",
    });

    // reset the timer
    this.resetTimer();
  }

  ///////////////////////
  // LETTERS AND WORDS //
  ///////////////////////

  addLetter(letter, trayPosition, wordPosition) {
    // function to add a letter to the word and display it on the UI
    if (!this.state.gameOver) {
      this.startTimer();
    }
    if (this.state.availableTiles[trayPosition] === 1) {
      // the tile is available. add the letter to the word
      this.setState({
        word: this.state.word + letter,
        wordDisplay: this.state.wordDisplay.concat([
          <Letter
            key={this.state.wordDisplay.length}
            letter={letter}
            trayPosition={trayPosition}
            wordPosition={this.state.wordDisplay.length}
            handleClick={(letter, trayPosition, wordPosition) =>
              this.removeLetter(letter, trayPosition, wordPosition)
            }
          />,
        ]),
      });
      this.setState((state) => {
        // console.log(state.availableTiles.toString() + " ==>"); // debug statement
        state.availableTiles[trayPosition] = 0; // mark the tile as having been played
        // console.log(state.availableTiles.toString()); // debug statement
        return state;
      });
    } else {
      // the file is not available. return an error message letting the player know
      this.setState({ mascotDialogue: "Can't select the same letter twice!" });
    }
  }

  removeLetter(letter, trayPosition, wordPosition) {
    // function to remove one or more letters from the word display
    this.setState((state) => {
      // console.log("Tile clicked on: #" + wordPosition); // debug statement
      // console.log(state.availableTiles.toString() + " ==>"); // debug statement
      for (let i = state.wordDisplay.length; i >= wordPosition + 1; i--) {
        // starting from the end of the word and working backward, remove and then free up each tile
        state.availableTiles[state.wordDisplay.pop().props.trayPosition] = 1;
      }
      // also trim the internal string to match
      state.word = state.word.substring(0, wordPosition);
      // console.log(state.availableTiles.toString());
      return state;
    });
  }

  clearWord() {
    // function to clear the current word
    this.setState({
      word: "",
      wordDisplay: [],
      availableTiles: this.state.availableTiles.fill(1),
    });
  }

  submitWord() {
    // function to handle submitting the current word
    let wordMessage = this.state.word + ": " + this.state.wordDefinition;
    if (!this.state.wordSet.has(this.state.word)) {
      // The word is not in the played words, add to word list and increment words played
      this.setState({
        wordList: this.state.wordList + this.state.word + " ",
        wordsPlayed: this.state.wordsPlayed + 1,
        wordSet: this.state.wordSet.add(this.state.word),
        score: this.state.score + this.calculateWordScore(this.state.word),
        seconds: this.state.seconds + this.state.word.length * 2,
        mascotDialogue: wordMessage,
      });
      // Run validation for if the played word is the longest possible word, if it is the game ends, and next round starts
      if (this.state.word === this.state.startingWord) {
        // also give the player enough bonus points to meet the score target
        this.setState((state) => {
          state.score = state.score + scoreTarget;
          return state;
        });
        this.winGame();
      }
      this.clearWord();
      if (this.state.mascotImage === "../thesaurus rex annoyed.png") {
        // clear the "annoyed" image off the mascot box because we've finally submitted a word
        this.setState({
          mascotImage: "../thesaurus rex happy.png",
          mascotDialogue:
            "Finally. I was starting to worry you'd never come up with a word.",
        });
      }
    } else {
      this.setState({
        mascotDialogue: "Uh oh! I think you've already played that one.",
      });
    }
  }

  async validateWord() {
    // function to check the current word's validity
    if (!this.state.gameOver) {
      const inputedWord = this.state.word;
      const call = await axios.get(
        "https://dictionary-attack-backend.herokuapp.com/api/validateWord/" + inputedWord
      );
      // console.log(call);
      if (!call["data"]["error"]) {
        if (call["data"]["definitions"]) {
          this.setState({
            wordDefinition: call["data"]["definitions"].definition,
          });
          if (
            call["data"]["definitions"].definition === "{}" ||
            call["data"]["definitions"].definition === undefined
          ) {
            this.setState({
              mascotDialogue:
                "Uh... I couldn't find a definition for that one.",
            });
          } else {
            this.submitWord();
          }
        } else {
          this.setState({
            mascotDialogue: "Uh... I couldn't find a definition for that one.",
          });
        }
      } else {
        this.setState({
          mascotDialogue: "Sorry, I couldn't find that word in the dictionary.",
        });
      }
    } else {
      this.setState({
        mascotDialogue:
          "The game is already over! Click Reset to start a new game!",
      });
    }
  }

  //This function returns a Hello World from the backend.
  async helloWorld(){
    console.log("hit")
    const call = await axios.get('https://dictionary-attack-backend.herokuapp.com/');
    console.log(call);
    this.setState({mascotDialogue : call['data']['message']});
    console.log("hit");
  }

  //function to push user to database after end of game
  async pushUserToDB() {
    let seconds = "00";
    let minutes = "00";
    let finalTime;

    if (this.state.totalTimePlayed > 60) {
      minutes = Math.floor(this.state.totalTimePlayed / 60);
      seconds = this.state.totalTimePlayed % 60;
      if (seconds < 10) {
        seconds = "0" + seconds;
      }
      finalTime = minutes + ":" + seconds;
    } else {
      finalTime = "00:" + this.state.totalTimePlayed;
    }
    const call = await axios.post("https://dictionary-attack-backend.herokuapp.com/api/postUser", {
      username: this.state.userNameInput,
      highscore: this.state.score,
      time: finalTime,
    });
    console.log(call);
  }

  /////////////
  // SCORING //
  /////////////

  calculateWordScore(word) {
    // function to calculate how many points a word is worth
    return Math.floor(
      baseWordScore *
        Math.pow(bonusLetterMultiplier, word.length - minimumWordLength)
    );
  }

  async getHighScores() {
    // function to retrieve high scores from the database
    var scores = await axios.get("https://dictionary-attack-backend.herokuapp.com/api/getAllUsers");
    var userScores = [];
    for (let i = 0; i < scores["data"].length; i++) {
      userScores.push(scores["data"][i]);
    }
    this.setState({ highScores: userScores });
  }

  setName(Name) {
    // function to receives userNameIn from options user name form below and set game state accordingly
    this.setState({ userNameInput: Name });
  }

  ////////////
  // TIMING //
  ////////////

  calcTime(sec) {
    // function to convert seconds to minutes and seconds
    let minDivisor = sec % (60 * 60);
    let minutes = Math.floor(minDivisor / 60);
    let secDivisor = minDivisor % 60;
    let seconds = Math.ceil(secDivisor);

    let timObj = {
      M: minutes + "",
      S: (seconds + "").padStart(2, "0"), //if less than 2 characters adds a 0 to the front
    };
    return timObj;
  }

  startTimer() {
    // function to start the timer if it hasn't been started yet
    if (this.timer === 0 && this.state.seconds > 0) {
      this.timer = setInterval(this.countDown, 1000);
    }
  }

  countDown() {
    // function to count down the seconds and does some mascot animations based on time
    // console.log("state " + this.state.userNameInput);
    let seconds = this.state.seconds - 1;
    this.state.totalTimePlayed++;
    //console.log(this.state.totalTimePlayed);
    this.setState({
      time: this.calcTime(seconds), //updates time display
      seconds: seconds,
    });

    if (seconds === 0) {
      // end game
      if (this.state.userNameInput.length > 0) {
        this.pushUserToDB();
      }
      clearInterval(this.timer); // stops timer
      this.timer = 0;
      if (this.state.score >= scoreTarget) {
        // player has enough points to win!
        this.winGame();
      } else {
        // player didn't make it :(
        this.loseGame();
      }
    } else if (seconds <= 10 && this.state.wordsPlayed === 0) {
      // Look
      this.setState({
        mascotImage: "../thesaurus rex annoyed.png",
        mascotDialogue: "...you're kinda slow, aren't you?",
      });
    } else if (seconds <= 30 && this.state.wordsPlayed === 0) {
      // Gun
      this.setState({
        mascotImage: "../thesaurus rex annoyed.png",
        mascotDialogue: "Uh... are you gonna put in a word?",
      });
    }
  }

  stopTimer() {
    // function to stop timer by clearing interval and setting timer state back to 0
    clearInterval(this.timer);
    this.timer = 0;
  }

  resetTimer() {
    // function to reset timer back to initial state
    this.setState({
      seconds: startingRoundLength,
      timer: 0,
      time: this.calcTime(startingRoundLength),
      gameOver: false,
      mascotDialogue: "Welcome to Dictionary Attack!",
    });
    clearInterval(this.timer);
    this.timer = 0;
  }

  ///////////////////
  // FINISH STATES //
  ///////////////////

  winGame() {
    // function to run when the player wins the game
    this.setState({
      score: this.state.score + baseWordScore * this.state.seconds,
      mascotImage: "../thesaurus rex happy.png",
      mascotDialogue: "Nice job! I'm so proud of you!!",
      gameOver: true,
    });
    this.stopTimer();
    this.pushUserToDB();
  }

  loseGame() {
    // function to run when the player loses the game
    if (this.state.wordsPlayed === 0) {
      this.setState({
        mascotImage: "../thesaurus rex annoyed.png",
        mascotDialogue:
          "You had all that time and you couldn't think of a single word? Wow.",
        gameOver: true,
      });
    } else {
      this.setState({
        mascotImage: "../thesaurus rex sad.png",
        mascotDialogue: "I-it's okay, you'll do better next time...!",
        gameOver: true,
      });
    }
  }

  ///////////////////
  // RENDER METHOD //
  ///////////////////

  render() {
    // function to render the Game element
    return (
      <div className="RowTray" id="GameContainer">
        <div className="SideColumn">
          <Mascot
            dialogue={this.state.mascotDialogue}
            src={this.state.mascotImage}
          />
          <Options
            //userNameIn={this.state.userNameInput}
            // sends handleName the setName function to adjust the state
            handleName={this.setName}
            // sends handleClick the reset function so the user can reset the game
            handleClick={this.reset}
            handleHelloWorld={this.helloWorld}
          />
          {/* <button onClick={this.reset}>Reset Game</button> */}
        </div>
        <div className="CenterColumn">
          <div>
            <h1>Dictionary Attack!</h1>
            <div className="RowTray">
              {/* displays minutes and seconds */}
              <h3>Time: {this.state.time.M + ":" + this.state.time.S}</h3>
              <h3>
                Score: {this.state.score}/{scoreTarget}
              </h3>
            </div>
          </div>
          {/* <WordBox currentWord={this.state.word} /> */}
          <WordLine letters={this.state.wordDisplay} />
          <div className="LetterBox">{this.state.letterTray}</div>
          <div className="RowTray">
            <BigButton content="Submit" handleClick={this.validateWord} />
            <BigButton content="Clear" handleClick={this.clearWord} />
          </div>
        </div>
        <div className="SideColumn">
          <WordList wordlist={this.state.wordList} />
          <HighScores highScores={this.state.highScores} />
        </div>
      </div>
    );
  }
}

////////////////
// COMPONENTS //
////////////////

const WordLine = (props) => {
  // component that displays the current word as a line of tiles
  return (
    <div>
      <h2>Current word:</h2>
      <div className="WordLine">{props.letters}</div>
    </div>
  );
};

const Letter = (props) => {
  // component that displays each letter as a clickable tile
  return (
    <div
      className="Letter"
      onClick={() =>
        props.handleClick(props.letter, props.trayPosition, props.wordPosition)
      }
    >
      <p>{props.letter}</p>
    </div>
  );
};

const BigButton = (props) => {
  // component to display a generic large button
  return (
    <div className="BigButtonContainer">
      <div className="BigButton" onClick={() => props.handleClick()}>
        <p>{props.content}</p>
      </div>
    </div>
  );
};

const WordList = (props) => {
  // component to display recent words
  if (props.wordlist === "") {
    return (
      <div id="WordList" className="SidebarBox">
        <h2>Recent Words</h2>
        <p>No words yet!</p>
      </div>
    );
  } else {
    let list = props.wordlist.replaceAll(" ", "\n");
    return (
      <div id="WordList" className="SidebarBox">
        <h2>Recent Words</h2>
        <pre>{list}</pre>
      </div>
    );
  }
};

const Mascot = (props) => {
  // component to display mascot image and dialogue
  return (
    <div id="MascotBox" className="SidebarBox">
      <img
        src={props.src}
        id="Mascot"
        alt="Thesaurus Rex"
        title="Thesaurus Rex"
      />
      <p>
        <b>Thesaurus Rex says:</b>
        <br />
        {props.dialogue}
      </p>
    </div>
  );
};

const HighScores = (props) => {
  // component to display high scores
  return (
    <div id="HighScores" className="SidebarBox">
      <h2>High Scores</h2>
      <table>
        <tr>
          <th>Username</th>
          <th>Highscore</th>
          <th>Time</th>
        </tr>
        {props.highScores ? (
          props.highScores.map((user) => (
            <tr>
              <th>{user.username}</th>
              <th>{user.highscore}</th>
              <th>{user.time}</th>
            </tr>
          ))
        ) : (
          <div>No High Scores Yet</div>
        )}
      </table>
    </div>
  );
};

const UsernameForm = (props) => {
  // component that contains the form for users to submit a name to save their high score
  let [userNameIn, setName] = useState(""); // state variable used to save user input name
  let clicked = false; // boolean used to make sure the submit button is only used once
  // console.log(userNameIn);

  const handleSubmit = (event) => {
    // submit button after user enters name, can only be clicked once even if they change username
    event.preventDefault();
    if (userNameIn.length >= 3 && !clicked) {
      clicked = true;
      // console.log("fart  " + userNameIn);
      props.handleName(userNameIn); // handleName function passed through props that sends back user input name to be saved to userNameInput state variable
    }
  };

  return (
    // form for user input with submit button, sets userNameIn on text box value change as user types
    <form onSubmit={handleSubmit}>
      <label>
        Username:&nbsp;
        <input
          type="text"
          placeholder="Min 3 Characters"
          value={userNameIn}
          onChange={(e) => setName(e.target.value)}
        />
        &nbsp;
      </label>
      <input type="submit" />
    </form>
  );
};

const Options = (props) => {
  // component to display options menu
  return (
    <div id="Options" className="SidebarBox">
      <h2>Options</h2>
      <UsernameForm handleName={props.handleName}></UsernameForm>
      {/* only render if user has achieved a high score */}
      {/* <p>No options yet!</p> */}
      {/* handleClick function passed through props to allow user to reset the game with reset function */}
      <button onClick={() => props.handleClick()}>Reset Game</button>
      <button onClick={() => props.handleHelloWorld()}>Hello World</button>
    </div>
  );
};

export default Game;
