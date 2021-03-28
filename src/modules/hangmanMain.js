import Application from './application'
import Guess from './guess'

/**
 * This class is the main for the Hangman application. This class initiates the startpage for the.
 * game and calls Guess.startGame().
 */
export default class HangmanMain {
    'use strict'
    static count = 0
    static inFocus = 0

    /**
     * Initiate all necessary fields.
     * Go to initialize().
     */
    constructor () {
      this.count = HangmanMain.count
      const win = new Application('hangman', HangmanMain.count++)
      this.content = win.newApplication()
      this.body = document.createElement('div')
      this.body.id = 'hangmanBody'
      this.content.appendChild(this.body)
      this.hangmanCont = document.createElement('div')
      this.hangmanCont.id = 'hangmanContent' + this.count
      this.header = document.createElement('h1')
      this.sub = document.createElement('h2')
      this.sub.id = 'sub' + this.count
      this.guess = 0
    }

    /**
     * Launches the start page for the game and when the button is clicked.
     * creates a new instance of Guess and goes to guess.startGame().
     */
    initialize () {
      const image = document.createElement('td')
      image.id = 'hangImg' + this.count
      image.innerHTML = '<img src="img/hangman/8.png" alt="Hangman image">'
      this.body.appendChild(image)
      this.body.appendChild(this.hangmanCont)
      this.header.id = ''
      this.header.innerHTML = 'Hangman'
      this.sub.innerHTML = 'Guess the correct word!'
      this.hangmanCont.appendChild(this.header)
      this.hangmanCont.appendChild(this.sub)

      const start = document.createElement('button')
      start.id = 'hangmanBut'
      start.innerHTML = 'New game'
      this.hangmanCont.appendChild(start)
      start.addEventListener('click', () => {
        this.guess = new Guess(this.count)
        start.style.display = 'none'
        this.guess.startGame()
      })
    }
}
