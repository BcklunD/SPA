'use strict'
import Memory from './modules/memory'
import Chat from './modules/chat'
import HangmanMain from './modules/hangmanMain'

/**
 * This is the main of this program where all other applications are launched from
 * Also handles the event when drag ends
 */

const memoryButton = document.getElementById('memoryButton')
const chatButton = document.getElementById('chatButton')
const hangmanButton = document.getElementById('hangmanButton')
const droppableArea = document.getElementById('droppableArea')

/**
 * Launch new memory game when memory icon is pressed.
 */
memoryButton.addEventListener('click', function () {
  const mem = new Memory()
  mem.initialize()
})
/**
 * Launch new Chat application when chat icon is pressed.
 */
chatButton.addEventListener('click', function () {
  const chat = new Chat()
  chat.init()
})
/**
 * Launch new hangman game when hangman icon is pressed.
 */
hangmanButton.addEventListener('click', function () {
  const hang = new HangmanMain()
  hang.initialize()
})

/**
 * Prevent default on dragover.
 */
droppableArea.addEventListener('dragover', (event) => {
  event.preventDefault()
})

/**
 * Moves the application window to the new spot where the user wants it.
 * If chat, maintain the scroll height.
 */
droppableArea.addEventListener('drop', (event) => {
  const data = event.dataTransfer.getData('text/plain').split(',')
  const moved = document.getElementById(data[2])

  if (moved != null) {
    moved.style.left = (event.clientX + parseInt(data[0], 10)) + 'px'
    moved.style.top = (event.clientY + parseInt(data[1], 10)) + 'px'
    let scrollTop
    let textArea
    let count

    if (moved.id.startsWith('chat')) {
      count = moved.id.replace(/\D/g, '')
      textArea = document.getElementById('chatTextarea' + count)
      if (textArea != null) { scrollTop = textArea.scrollTop }
    }

    // Make sure that the item moved is on the front of the page
    const parent = moved.parentNode
    parent.removeChild(moved)
    parent.appendChild(moved)

    if (textArea != null) {
      textArea.scrollTo(0, scrollTop)
      document.getElementById('chatInput' + count).focus()
    }

    event.preventDefault()
  }
})
