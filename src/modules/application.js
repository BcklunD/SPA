'use strict'
import Memory from './memory'
import HangmanMain from './hangmanMain'
import Chat from './chat'

/**
 * This class creates a new window. Used by all applications to get a new window.
 */
export default class Application {
  static typeInFocus
  /**
   * Initialize all necessary fields.
   *
   * @param  {string} type type of application
   * @param  {number} numOfWindows count for this application
   * @param  {number} top offset top for positioning
   * @param  {number} left offset left for positioning
   */
  constructor (type, numOfWindows, top, left) {
    this.type = type
    this.numOfWindows = numOfWindows
    this.content = document.createElement('div')
    this.applications = document.getElementById('applications')
    this.top = top
    this.left = left
  }

  /**
   * This functions creates a new application window, positions it, adds all elements and handles focus of clicked element.
   * For the chat, this functions starts the websocket and will close it when all chats are closed.
   * In this way we only need 1 socket for all chat applications.
   *
   * @returns {object} The application window
   */
  newApplication () {
    Application.typeInFocus = this.type
    const topbar = document.createElement('div')
    const exit = document.createElement('button')
    const img = document.createElement('img')
    let offset = 30 * this.numOfWindows

    topbar.id = 'topbar'
    exit.innerHTML = 'X'

    // If the application is of type memory
    if (this.type === 'memory') {
      Memory.inFocus = this.numOfWindows
      img.id = 'memoryImg'
      topbar.innerHTML += 'Memory'
      this.content.id = 'memoryNum' + this.numOfWindows

      if (offset > 660) { offset = 660 }
      this.content.style.left = offset + 'px'
      this.content.style.top = (offset < 360) ? offset + 'px' : offset - 330 + 'px'
    } else if (this.type === 'chat') { // If the application is of type chat
      Chat.inFocus = this.numOfWindows
      if (Chat.count === 1) {
        Chat.websocket = new WebSocket('ws://vhost3.lnu.se:20080/socket/')
        /**
         * Signal console that a connection is open.
         */
        Chat.websocket.onopen = function () {
          console.log('The websocket is now open.')
        }
        /**
         * If the socket receives a message we put it at the front of message log and write it out in every chat appliation.
         *
         * @param {event} event the onmessage event
         */
        Chat.websocket.onmessage = function (event) {
          const message = JSON.parse(event.data)
          if (message.type === 'message') {
            const localLog = JSON.parse(window.localStorage.getItem('messageLog'))
            localLog.unshift(message)
            if (localLog.length > 100) { localLog.pop() }

            window.localStorage.setItem('messageLog', JSON.stringify(localLog))
            for (let i = 0; i < Chat.count; i++) {
              const textArea = document.getElementById('chatTextarea' + i)
              if (textArea != null) {
                textArea.innerHTML += '<b>' + message.username + '</b>: ' + message.data + '<br>'
                textArea.scrollTo(0, textArea.scrollHeight)
              }
            }
          }
        }
      }
      img.id = 'chatImg'
      topbar.innerHTML += 'Chat'
      this.content.id = 'chatNum' + this.numOfWindows
      if (offset > 570) { offset = 570 }
      this.content.style.left = offset + 'px'
      this.content.style.top = (offset < 300) ? offset + 'px' : offset - 300 + 'px'
    } else if (this.type === 'hangman') { // If the application is of type hangman
      HangmanMain.inFocus = this.numOfWindows
      img.id = 'hangmanImg'
      topbar.innerHTML += 'Hangman'
      this.content.id = 'hangmanNum' + this.numOfWindows
      if (offset > 540) { offset = 540 }
      this.content.style.left = offset + 'px'
      this.content.style.top = (offset < 330) ? offset + 'px' : offset - 330 + 'px'
    }

    // If we get a value for top and left, use these values.
    if (this.top !== -1) {
      this.content.style.top = this.top - 4 + 'px'
      this.content.style.left = this.left - 4 + '0px'
    }

    topbar.appendChild(img)
    topbar.appendChild(exit)
    this.applications.appendChild(this.content)
    this.content.appendChild(topbar)
    topbar.draggable = 'true'

    /**
     * Call dragStartHandler when you drag the topbar.
     */
    topbar.addEventListener('dragstart', this.dragStartHandler)

    /**
     * Put this window at the front. If chat, maintain scroll height.
     */
    this.content.addEventListener('click', () => {
      const parent = this.content.parentNode
      if (this.type === 'memory') {
        if (Memory.inFocus !== this.numOfWindows || Application.typeInFocus !== this.type) {
          Application.typeInFocus = this.type
          Memory.inFocus = this.numOfWindows
          parent.removeChild(this.content)
          parent.appendChild(this.content)
        }
      } else if (this.type === 'hangman') {
        if (HangmanMain.inFocus !== this.numOfWindows || Application.typeInFocus !== this.type) {
          Application.typeInFocus = this.type
          HangmanMain.inFocus = this.numOfWindows
          parent.removeChild(this.content)
          parent.appendChild(this.content)
        }
      } else if (this.type === 'chat') {
        if (Chat.inFocus !== this.numOfWindows || Application.typeInFocus !== this.type) {
          Application.typeInFocus = this.type
          Chat.inFocus = this.numOfWindows
          const textArea = document.getElementById('chatTextarea' + this.numOfWindows)
          let scrollTop
          if (textArea != null) { scrollTop = textArea.scrollTop }
          parent.removeChild(this.content)
          parent.appendChild(this.content)
          if (textArea != null) {
            textArea.scrollTo(0, scrollTop)
            document.getElementById('chatInput' + this.numOfWindows).focus()
          }
        }
      }
    })
    /**
     * Close application if you click the cross.
     * If this is the last chat window, close socket.
     */
    exit.addEventListener('click', () => {
      this.content.style.display = 'none'
      if (this.type === 'chat') {
        Chat.removed++
        if (Chat.removed === Chat.count) {
          Chat.websocket.onclose = function () {
            console.log('The websocket is now closed.')
          }
          Chat.websocket.close()
          Chat.count = 0
          Chat.removed = 0
        }
      }
    })

    return this.content
  }

  /**
   * Handles dragStart event. Saves top and left value aswell as the id of the parent of the event.
   *
   * @param {event} event the dragstart event
   */
  dragStartHandler (event) {
    const style = window.getComputedStyle(event.target.parentNode, null)

    // Remember the original position and id of the element to move
    event.dataTransfer.setData('text/plain',
      (parseInt(style.getPropertyValue('left'), 10) - event.clientX) + ',' +
            (parseInt(style.getPropertyValue('top'), 10) - event.clientY) + ',' +
            event.target.parentNode.id
    )

    event.dataTransfer.dropEffect = 'move'
  }
}
