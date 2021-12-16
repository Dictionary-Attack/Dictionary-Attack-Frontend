import React from "react";
import "./components.css";

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      word: "",
      wordList: "",
      wordsPlayed: 0,
      score: 0,
      wordSet: new Set(),
      errorMessage: "",
      mascotDialogue: "Welcome to Dictionary Attack!",
      startingWord: "LOREMIPSUM",
      dupStartingWord: "LOREMIPSUM",
      availableLetters: ["L", "O", "R", "E", "M", "I", "P", "S", "U", "M"],
    };
    this.addLetter = this.addLetter.bind(this);
    this.clearWord = this.clearWord.bind(this);
    this.submitWord = this.submitWord.bind(this);
    this.shuffleWord = this.shuffleWord.bind(this);
  }

  addLetter(letter) {
    this.setState({ word: this.state.word + letter, errorMessage: "" });
  }

  clearWord() {
    this.setState({ word: "", errorMessage: "" });
  }

  shuffleWord() {
    this.clearWord();
    const array = this.state.dupStartingWord.split("");

    let currentIndex = array.length,
      randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }
    this.setState({ availableLetters: array });
  }

  goodEnding() {
    this.setState({ mascotDialogue: "Nice job!" });
  }

  badEnding() {
    this.setState({ mascotDialogue: "Nothing personnel kid." });
  }

  submitWord() {
    /* link to word validation backend here */
    if (true) {
      // The word is valid, check if it has already been played
      if (!this.state.wordSet.has(this.state.word)) {
        // The word is not in the played words, add to word list and increment words played
        this.setState({
          wordList: this.state.wordList + this.state.word + " ",
          wordsPlayed: this.state.wordsPlayed + 1,
          wordSet: this.state.wordSet.add(this.state.word),
        });
        // Run validation for if the played word is the longest possible word, if it is the game ends and next round starts
        if (true) {
          this.goodEnding();
        }
      } else {
        this.setState({
          errorMessage: "Uh oh! That word has already been played.",
        });
      }
    } else {
      // Word is not valid
      this.setState({
        errorMessage: "Whoops! " + this.state.word + " is not a word!",
      });
    }
  }

  render() {
    return (
      <div className="RowTray" id="GameContainer">
        <div className="SideColumn">
          <Mascot dialogue={this.state.mascotDialogue} />
          <Options />
        </div>
        <div className="CenterColumn">
          <h1>Dictionary Attack!</h1>
          <WordBox currentWord={this.state.word} />
          <p> {this.state.errorMessage}</p>
          <div className="LetterBox">
            <Letter
              letter={this.state.availableLetters[0]}
              handleClick={(letter) => this.addLetter(letter)}
            />
            <Letter
              letter={this.state.availableLetters[1]}
              handleClick={(letter) => this.addLetter(letter)}
            />
            <Letter
              letter={this.state.availableLetters[2]}
              handleClick={(letter) => this.addLetter(letter)}
            />
            <Letter
              letter={this.state.availableLetters[3]}
              handleClick={(letter) => this.addLetter(letter)}
            />
            <Letter
              letter={this.state.availableLetters[4]}
              handleClick={(letter) => this.addLetter(letter)}
            />
            <Letter
              letter={this.state.availableLetters[5]}
              handleClick={(letter) => this.addLetter(letter)}
            />
            <Letter
              letter={this.state.availableLetters[6]}
              handleClick={(letter) => this.addLetter(letter)}
            />
            <Letter
              letter={this.state.availableLetters[7]}
              handleClick={(letter) => this.addLetter(letter)}
            />
            <Letter
              letter={this.state.availableLetters[8]}
              handleClick={(letter) => this.addLetter(letter)}
            />
            <Letter
              letter={this.state.availableLetters[9]}
              handleClick={(letter) => this.addLetter(letter)}
            />
          </div>
          <div className="RowTray">
            <BigButton content="Submit" handleClick={this.submitWord} />
            <BigButton content="Clear" handleClick={this.clearWord} />
            <BigButton content="Shuffle" handleClick={this.shuffleWord} />
          </div>
        </div>
        <div className="SideColumn">
          <WordList wordlist={this.state.wordList} />
          <HighScores />
        </div>
      </div>
    );
  }
}

const WordBox = (props) => {
  if (props.currentWord === "") {
    return <h2 class="WordBox">Current word: None!</h2>;
  } else {
    return <h2 class="WordBox">Current word: {props.currentWord}</h2>;
  }
};

const Letter = (props) => {
  return (
    <div className="Letter" onClick={() => props.handleClick(props.letter)}>
      <p>{props.letter}</p>
    </div>
  );
};

const BigButton = (props) => {
  return (
    <div className="BigButtonContainer">
      <div className="BigButton" onClick={() => props.handleClick()}>
        <p>{props.content}</p>
      </div>
    </div>
  );
};

const WordList = (props) => {
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
  return (
    <div id="MascotBox" className="SidebarBox">
      <img
        src="../mascot.png"
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
  return (
    <div id="HighScores" className="SidebarBox">
      <h2>High Scores</h2>
      <p>No high scores yet!</p>
    </div>
  );
};

const Options = (props) => {
  return (
    <div id="Options" className="SidebarBox">
      <h2>Options</h2>
      <p>No options yet!</p>
    </div>
  );
};
export default Game;
