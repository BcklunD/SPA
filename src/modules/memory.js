import Application from './application'
import Highscore from './highscore'

/**
 * This class handles the memory game.
 * Highscore is used to track highscores and Score is used for each individual score.
 */
export default class Memory {
    'use strict'
    static count = 0
    static inFocus = 0
    static highScore = new Highscore()
    /**
     * Setup all necessary fields and elements.
     * Go to initialize() to start app.
     *
     * @param {number} numOfImages how many number of images the user wants
     * @param {number} top value of top coordinate
     * @param {number} left value of left coordinate
     */
    constructor (numOfImages = 16, top = -1, left = -1) {
      const win = new Application('memory', Memory.count++, top, left)
      this.content = win.newApplication()

      this.hiddenBlocks = new Array(numOfImages)
      this.count = Memory.count - 1
      this.numOfImages = numOfImages
      this.previousGuess = -1
      this.correct = 0
      this.counter = 0
      this.guessCounter = 0
      this.focused = -1
      this.username = ''

      // Create the table used to position images
      this.table = document.createElement('table')
      this.table.id = 'memoryTable' + this.count
      this.content.appendChild(this.table)
    }

    /**
     * Launch the start page where you choose the amount of images.
     * Go to start().
     */
    initialize () {
      Memory.inFocus = this.count
      const h1 = document.createElement('h1')
      const text = document.createTextNode('Select number of images')
      const buttonCont = document.createElement('div')
      const username = document.createElement('input')
      username.type = 'text'
      username.id = 'memoryInput'
      username.placeholder = 'Username'
      username.autocomplete = 'off'
      h1.appendChild(text)
      this.content.appendChild(h1)
      this.content.appendChild(username)
      this.content.appendChild(buttonCont)
      for (let i = 16; i > 2; i /= 2) {
        const temp = document.createElement('button')
        temp.id = 'memButton'
        temp.innerHTML = i
        buttonCont.appendChild(temp)
        temp.tabIndex = 0

        temp.addEventListener('click', () => {
          this.numOfImages = i
          this.username = username.value
          this.content.removeChild(h1)
          this.content.removeChild(buttonCont)
          this.content.removeChild(username)
          this.start()
        })
      }
    }

    /**
     * Launch the game with the appropriate number of images.
     * Add event listeners to each image and also to the document to listen to arrowkey presses.
     */
    start () {
      if (this.numOfImages === 8) { this.content.style.height = '250px' } else if (this.numOfImages === 4) {
        this.content.style.height = '250px'
        this.content.style.width = '300px'
      }
      let row = document.createElement('tr')
      this.table.appendChild(row)
      for (var i = 0; i < this.numOfImages; i++) {
        if (i === this.numOfImages / 2 || i % 4 === 0) {
          row = document.createElement('tr')
          this.table.appendChild(row)
        }
        const temp = document.createElement('td')
        temp.id = this.count + 'cell' + i
        temp.addEventListener('click', () => {
          const currId = temp.id.split('cell')[1]
          if (this.counter < 2 && this.previousGuess !== currId) {
            this.displayHidden(temp)
            this.previousGuess = currId
          }
          if (this.counter === 0) { this.previousGuess = -1 }
        })
        this.randomizeBlock(i, this.numOfImages)
        temp.innerHTML = '<img id="memImg" src="img/memory/questionmark.png">'
        row.appendChild(temp)
      }

      document.addEventListener('keyup', (event) => {
        if (Memory.inFocus === this.count && Application.typeInFocus === 'memory' && this.correct < this.numOfImages) { this.arrowKeysHandler(event.key) }
      })
    }

    /**
     * Handle the event of an arrowkeypress.
     * Moves the focused image one step in the correct direction.
     * Go to focus().
     *
     * @param {string} key the name of the key that was pressed
     */
    arrowKeysHandler (key) {
      if (this.focused === -1) { document.getElementById(this.count + 'cell' + ++this.focused).style.outline = 'solid 2px #dfa300' } else {
        const current = document.getElementById(this.count + 'cell' + this.focused)
        if (key === 'Enter') {
          current.click()
        } else if (this.numOfImages === 4) {
          if (key === 'ArrowRight' && this.focused !== 3) {
            this.focused++
            this.focus(current)
          } else if (key === 'ArrowLeft' && this.focused !== 0) {
            this.focused--
            this.focus(current)
          } else if (key === 'ArrowUp' && this.focused > 1) {
            this.focused -= 2
            this.focus(current)
          } else if (key === 'ArrowDown' && this.focused < 2) {
            this.focused += 2
            this.focus(current)
          }
        } else {
          if (key === 'ArrowRight' && this.focused !== this.numOfImages - 1) {
            this.focused++
            this.focus(current)
          } else if (key === 'ArrowLeft' && this.focused !== 0) {
            this.focused--
            this.focus(current)
          } else if (key === 'ArrowUp' && this.focused > 1) {
            this.focused -= 4
            this.focus(current)
          } else if (key === 'ArrowDown' && this.focused - this.numOfImages < -4) {
            this.focused += 4
            this.focus(current)
          }
        }
      }
    }

    /**
     * Puts an orange outline around the focused image.
     *
     * @param {HTMLElement} current the currently focused image
     */
    focus (current) {
      current.style.outline = 'none'
      document.getElementById(this.count + 'cell' + this.focused).style.outline = 'solid 2px #dfa300'
    }

    /**
     * Randomizes the blocks.
     * Calls alreadyTwo() to make sure that we don't have more than 2 of each number.
     *
     * @param {number} pos the position to randomize a new number into
     * @param {number} total the total number of images
     */
    randomizeBlock (pos, total) {
      let rand = Math.floor(Math.random() * total / 2)
      while (this.alreadyTwo(rand)) { rand = Math.floor(Math.random() * total / 2) }
      this.hiddenBlocks[pos] = rand
    }

    /**
     * Checks if we already have 2 of this particular number. Used by randomizeBlock().
     *
     * @param {number} num the number to check
     * @returns {boolean} true or false
     */
    alreadyTwo (num) {
      let count = 0
      for (let i = 0; i < this.hiddenBlocks.length; i++) {
        if (this.hiddenBlocks[i] === num) { count++ }
      }

      if (count > 1) { return true }
      return false
    }

    /**
     * Display the image of the button that was pressed. If 2 images are shown, wait 1 second flipping them back.
     *
     * @param {object} temp the cell where we want to display the image
     */
    displayHidden (temp) {
      const i = temp.id.split('cell')[1]
      const count = temp.id.split('cell')[0]
      temp.innerHTML = '<img id="memImg" src="img/memory/' + this.hiddenBlocks[i] + '.png">'
      this.counter++
      const previous = document.getElementById(count + 'cell' + this.previousGuess)
      if (this.counter === 2) {
        this.guessCounter++
        if (this.hiddenBlocks[this.previousGuess] !== this.hiddenBlocks[i]) {
          setTimeout(() => {
            previous.innerHTML = '<img id="memImg" src="img/memory/questionmark.png">'
            temp.innerHTML = '<img id="memImg" src="img/memory/questionmark.png">'
            this.counter = 0
          }, 1000)
        } else {
          setTimeout(() => {
            // Remove tabindex
            temp.tabIndex = -1
            previous.tabIndex = -1

            // Clone nodes to remove event listners and set img to a blank image
            let newNode = temp.cloneNode()
            temp.parentNode.replaceChild(newNode, temp)
            newNode.innerHTML = '<img id="memImg" src="img/memory/empty.png">'
            newNode = previous.cloneNode()
            previous.parentNode.replaceChild(newNode, previous)
            newNode.innerHTML = '<img id="memImg" src="img/memory/empty.png">'
          }, 500)
          this.counter = 0
          this.correct += 2
          if (this.correct === this.numOfImages) {
            previous.innerHTML = '<img id="empty" src="img/memory/empty.png">'
            temp.innerHTML = '<img id="empty" src="img/memory/empty.png">'
            this.win()
          }
        }
      }
    }

    /**
     * Handle the event of a win. If user wants to play again, launch new memory window.
     * Calls printScoreboard() to display the current scoreboard.
     */
    win () {
      this.content.removeChild(this.table)
      Memory.highScore.newScore(this.username, this.guessCounter, this.numOfImages)
      this.content.style.height = '400px'
      this.content.style.width = '500px'
      const h1 = document.createElement('h1')
      const text = document.createTextNode('You win in ' + this.guessCounter + ' guesses!')
      h1.appendChild(text)
      this.content.appendChild(h1)
      this.printScoreboard()
      this.content.style.backgroundColor = 'rgb(185, 136, 0)'
      const winButton = document.createElement('button')
      winButton.id = 'memButton'
      winButton.innerHTML = 'New Game'
      winButton.tabIndex = 0
      winButton.addEventListener('click', () => {
        this.content.style.display = 'none'
        const mem = new Memory('memory', this.numOfImages, this.content.style.top, this.content.style.left)
        mem.initialize()
      })
      this.content.appendChild(winButton)
    }

    /**
     * Display the current scoreboard. Uses the class Highscore to store and sort the scores.
     */
    printScoreboard () {
      const top5 = Memory.highScore.getScores()
      const tbl = document.createElement('table')
      tbl.id = 'memoryTable'
      tbl.createCaption().innerHTML = '<h3><u>Highscores</u><h3>'
      const head = tbl.createTHead()
      let row = head.insertRow(0)
      row.insertCell(0).innerHTML = '<b>Username</b>'
      row.insertCell(1).innerHTML = '<b>Images</b>'
      row.insertCell(2).innerHTML = '<b>Guesses</b>'
      const body = tbl.createTBody()

      for (let i = 0; i < top5.length; i++) {
        row = body.insertRow(i)
        row.insertCell(0).innerHTML = top5[i].username
        row.insertCell(1).innerHTML = top5[i].question
        row.insertCell(2).innerHTML = top5[i].time
      }
      this.content.appendChild(tbl)
    }
}
