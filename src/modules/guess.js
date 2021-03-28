/**
 * This class handles the hangman game after starting it.
 */
export default class Guess {
    'use strict'

    /**
     * Initiates all necessary fields and give them their values.
     *
     * @param {number} count the current count for this hangman application
     */
    constructor (count) {
      this.count = count
      this.content = document.getElementById('hangmanContent' + count)
      this.image = document.getElementById('hangImg' + count)
      this.text = document.getElementById('sub' + count)
      this.theWord = document.createElement('h2')
      this.guesses = document.createElement('h3')
      this.guesses.id = 'hangmanWrong'
      this.errorText = document.createTextNode('')
      this.button = document.createElement('button')
      this.input = document.createElement('input')
      this.input.type = 'text'
      this.input.placeholder = 'Letter'
      this.input.maxLength = 1
      this.inputs = document.createElement('div')
      this.inputs.id = 'hangmanInputs'

      this.words = ['happy', 'hippie', 'firetruck', 'moped', 'strong', 'love']
      this.wrongCount = 0
      this.prevGuesses = ''
      this.word = ''
      this.guessedWord = ''
      this.guesses.innerHTML = 'Wrong guesses: '
    }

    /**
     * Start the game. Add all necessary objects and print out all underlines which represents the word.
     * Go to handleGuess() when button is pressed.
     */
    startGame () {
      this.inputs.appendChild(this.input)
      this.inputs.appendChild(this.button)
      this.inputs.appendChild(this.errorText)

      this.content.appendChild(this.inputs)
      this.button.innerHTML = 'Guess'
      this.button.id = 'hangmanBut'
      this.content.appendChild(this.theWord)
      this.content.appendChild(this.guesses)

      this.word = this.words[Math.floor(Math.random() * this.words.length)]
      console.log(this.word)
      for (let i = 0; i < this.word.length; i++) { this.guessedWord += '_' }
      this.theWord.innerHTML = this.guessedWord.split('').join(' ')

      this.button.addEventListener('click', () => {
        this.handleGuess(this.input.value)
      })
      this.input.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') { this.button.click() }
      })
      this.image.style.opacity = '0%'
    }

    /**
     * Replaces one character in a string. Used to replace an underscore with an actual letter.
     *
     * @param {string} str the line in which to replace the character
     * @param {string} c the character to replace with
     * @param {number} index the index where we want to replace the current character
     *
     * @returns {string} the same string, with the character replaced
     */
    replaceChar (str, c, index) {
      return str.substr(0, index) + c + str.substr(index + 1, str.length)
    }

    /**
     * Handle a guessed letter from the user.
     * Uses checkGuess() to check if the guess is correct or not.
     * Go to replaceChar() if the letter is correct and update the image if it was wrong.
     * Go to win() if the user wins and lose() if it loses.
     *
     * @param {string} c the letter which was guessed
     */
    handleGuess (c) {
      this.input.value = ''
      this.input.focus()

      // Check if guess is appropriate
      if (this.checkGuess(c)) {
        // Add letter c to prevGuesses
        this.prevGuesses += c
        // Check if letter c is in the word
        if (this.word.indexOf(c) >= 0) {
          for (let i = 0; i < this.word.length; i++) {
            if (this.word[i] === c) { this.guessedWord = this.replaceChar(this.guessedWord, c.toUpperCase(), i) }
          }

          // Update webpage with correct guess
          this.theWord.innerHTML = this.guessedWord.split('').join(' ')
          if (this.guessedWord.toLowerCase() === this.word) { this.win() }
        } else {
          // If letter c is not in the word. Display a part of the image and add letter to wrong guesses. Check if lose
          this.image.style.opacity = '100%'
          this.image.innerHTML = '<img src="img/hangman/' + this.wrongCount++ + '.png" alt="Hangman image">'
          this.guesses.innerHTML += ' ' + c.toUpperCase()
          if (this.wrongCount === 9) { this.lose() }
        }
      }
    }

    /**
     * Check if a guessed letter is in the word or not.
     * Update errorText if the guess was invalid.
     *
     * @param {string} c the guessed letter
     * @returns {boolean} if the letter was correct or not
     */
    checkGuess (c) {
      this.errorText.nodeValue = ''
      const regex = /^[A-Za-z]+$/
      // Check if input is empty
      if (c === '') {
        this.errorText.nodeValue = 'Type a guess first!'
        return false
      } else if (!c.match(regex)) { // Check if input is a letter
        this.errorText.nodeValue = 'Not a letter!'
        return false
      } else if (this.prevGuesses.indexOf(c) >= 0) { // Check if input has already been guessed
        this.errorText.nodeValue = 'Already guessed that letter!'
        return false
      }
      return true
    }

    /**
     * Handle the case where the user wins.
     * Go to restart() if the user wants to play again.
     */
    lose () {
      this.theWord.innerHTML = this.word.toUpperCase().split('').join(' ')
      this.text.innerHTML = 'YOU LOSE!'
      this.text.style.color = '#5a0000'
      this.inputs.style.display = 'none'
      this.theWord.style.color = '#5a0000'
      document.getElementById('hangmanNum' + this.count).style.backgroundColor = '#f54949'

      const startButton = document.createElement('button')
      startButton.id = 'hangmanBut'
      startButton.innerHTML = 'New Game'
      this.content.insertBefore(startButton, this.theWord)
      startButton.addEventListener('click', () => {
        this.content.removeChild(startButton)
        this.restart()
      })
    }

    /**
     * Handle the case where the user wins.
     * Go to restart() if the user wants to play again.
     */
    win () {
      this.text.innerHTML = 'YOU WIN!'
      this.text.style.color = '#35ff61'
      this.inputs.style.display = 'none'
      this.theWord.style.color = '#35ff61'
      document.getElementById('hangmanNum' + this.count).style.backgroundColor = '#006b20'
      const startButton = document.createElement('button')
      startButton.id = 'hangmanBut'
      startButton.innerHTML = 'New Game'
      this.content.insertBefore(startButton, this.theWord)
      startButton.addEventListener('click', () => {
        this.content.removeChild(startButton)
        this.restart()
      })
      this.image.style.opacity = '100%'
      this.image.innerHTML = '<img src="img/hangman/2.png" alt="Hangman image">'
    }

    /**
     * Restart the game.
     */
    restart () {
      this.inputs.style.removeProperty('display')
      this.text.style.removeProperty('color')
      this.theWord.style.removeProperty('color')
      document.getElementById('hangmanNum' + this.count).style.removeProperty('background-color')
      this.text.innerHTML = 'Guess the correct word!'

      this.wrongCount = 0
      this.prevGuesses = ''
      this.word = ''
      this.guessedWord = ''
      this.guesses.innerHTML = 'Wrong guesses: '
      this.word = this.words[Math.floor(Math.random() * this.words.length)]
      console.log(this.word)
      for (let i = 0; i < this.word.length; i++) { this.guessedWord += '_' }
      this.theWord.innerHTML = this.guessedWord.split('').join(' ')
      this.image.style.opacity = '0%'
    }
}
