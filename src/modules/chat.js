import Application from './application'

/**
 * This class handles the chat application. Use :emojiName: to insert emoji.
 */
export default class Chat {
    'use strict'

    // Static fields used in this application.
    static count = 0
    static removed = 0
    static inFocus = 0
    static websocket
    static username

    /**
     * Setup all necessary fields and checks if we have a saved username.
     * Goes to either chooseUsername() or initialize().
     */
    constructor () {
      this.count = Chat.count
      const win = new Application('chat', Chat.count++)
      this.content = win.newApplication()
      this.textArea = document.createElement('div')
      this.input = document.createElement('input')
      this.button = document.createElement('button')
      this.changeUser = document.createElement('button')
      this.clearLog = document.createElement('button')
      this.header = document.createElement('h1')
      this.username = document.createElement('input')
      this.submit = document.createElement('button')
      this.websocket = Chat.websocket
    }

    /**
     * Determine whether to go to initialize() or chooseUsername() first.
     */
    init () {
      Chat.username = window.localStorage.getItem('username')
      if (Chat.username === null) { this.chooseUsername() } else { this.initialize() }
    }

    /**
     * Sets up the window to choose a username.
     * Maxlength of the username is 20 characters.
     */
    chooseUsername () {
      this.content.style.textAlign = 'center'
      this.header.innerHTML = 'Choose your username'
      this.username.type = 'text'
      this.username.id = 'chatUsername'
      this.username.maxLength = 20
      this.username.autocomplete = 'off'
      this.submit.innerHTML = 'Submit'
      this.submit.id = 'chatSubmit'

      this.content.appendChild(this.header)
      this.content.appendChild(this.username)
      this.content.appendChild(this.submit)

      this.username.focus()

      /**
       * Click submit button if you hit enter.
       */
      this.username.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') { this.submit.click() }
      })

      /**
       * Convert any emojis in the name to actual emojis and save new username in localstorage.
       * Go to initialize().
       */
      this.submit.addEventListener('click', () => {
        let un = this.username.value
        // Check for emojis
        for (let i = 0; i < un.length - 2; i++) {
          if (un.charAt(i) === ':') {
            for (let j = i + 1; j < un.length; j++) {
              if (un.charAt(j) === ':') {
                un = this.handleEmoji(un, i + 1, j)
              }
            }
          }
        }

        window.localStorage.setItem('username', un)
        Chat.username = un
        this.content.removeChild(this.header)
        this.content.removeChild(this.username)
        this.content.removeChild(this.submit)
        this.content.style.removeProperty('text-align')
        this.initialize()
      })
    }

    /**
     * Sets up the window to view the live chat.
     * The chat is updated in application class but you send messages here.
     * Initiate storage and output messagelog.
     */
    initialize () {
      console.log('Current username: ' + Chat.username)

      this.content.appendChild(this.changeUser)
      this.content.appendChild(this.clearLog)
      this.content.appendChild(this.textArea)
      this.content.appendChild(this.input)
      this.content.appendChild(this.button)

      this.changeUser.innerHTML = 'Change username'
      this.changeUser.id = 'changeUsername'
      this.clearLog.innerHTML = 'Clear history'
      this.clearLog.id = 'clearLog'
      this.textArea.id = 'chatTextarea' + this.count
      this.input.type = 'text'
      this.input.id = 'chatInput' + this.count
      this.input.dataEmoji = 'true'
      this.input.autocomplete = 'off'
      this.button.innerHTML = 'Send'
      this.button.id = 'chatBut'

      this.initStorage()
      this.outputLocal()

      /**
       * Change username.
       */
      this.changeUser.addEventListener('click', () => {
        window.localStorage.removeItem('username')
        const cha = new Chat('chat', this.count, this.content.style.top, this.content.style.left)
        cha.init()
        this.content.style.display = 'none'
      })

      /**
       * Clear message history.
       */
      this.clearLog.addEventListener('click', () => {
        window.localStorage.removeItem('messageLog')
        window.localStorage.setItem('messageLog', JSON.stringify([]))
        this.textArea.innerHTML = ''
      })

      /**
       * Go to sendMessage().
       */
      this.button.addEventListener('click', () => {
        if (this.input.value.length > 0) { this.sendMessage(this.input.value) }
      })

      /**
       * Click button if you hit enter.
       */
      this.input.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') { this.button.click() }
      })

      this.input.focus()
    }

    /**
     * Initiate storage if not already initiated.
     */
    initStorage () {
      const localLog = window.localStorage.getItem('messageLog')

      if (localLog === null) { window.localStorage.setItem('messageLog', JSON.stringify([])) }
    }

    /**
     * Output messagelog from localstorage, scroll to bottom.
     */
    outputLocal () {
      const messages = JSON.parse(window.localStorage.getItem('messageLog'))
      for (let i = messages.length - 1; i >= 0; i--) { this.textArea.innerHTML += '<b>' + messages[i].username + '</b>: ' + messages[i].data + '<br>' }
      this.textArea.scrollTo(0, this.textArea.scrollHeight)
    }

    /**
     * Send a message to websocket. Checks for emojis in the message.
     *
     * @param {string} message the message string to send
     */
    sendMessage (message) {
      this.input.value = ''
      if (!this.websocket || this.websocket.readyState === 3) {
        console.log('The websocket is not connected to a server.')
      } else {
        for (let i = 0; i < message.length - 2; i++) {
          if (message.charAt(i) === ':') {
            for (let j = i + 1; j < message.length; j++) {
              if (message.charAt(j) === ':') {
                message = this.handleEmoji(message, i + 1, j)
              }
            }
          }
        }

        const mess = {
          type: 'message',
          data: message,
          username: Chat.username,
          channel: 'default',
          key: 'eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd'
        }

        this.websocket.send(JSON.stringify(mess))
      }
    }

    /**
     * Convert any :emoji: call to actualy emoji.
     *
     * @param {string} string the string where an emoji is present
     * @param {number} start index of first ':'
     * @param {number} end index of last ':'
     *
     * @returns {string} the same string but the acual emoji instead of ':emojiName:'
     */
    handleEmoji (string, start, end) {
      const emojis = {
        happy: 0x1F600,
        veryHappy: 0x1F601,
        laughing: 0x1F602,
        upsideDown: 0x1F643,
        angel: 0x1F607,
        heartEyes: 0x1F60D,
        loved: 0x1F970,
        starEyes: 0x1F929,
        kiss: 0x1F618,
        crazy: 0x1F92A,
        moneyEyes: 0x1F911,
        thinking: 0x1F914,
        smirk: 0x1F60F,
        sleeping: 0x1F634,
        corona: 0x1F912,
        party: 0x1F973,
        cool: 0x1F60E,
        scared: 0x1F631,
        angry: 0x1F621,
        curse: 0x1F92C,
        devil: 0x1F608,
        poop: 0x1F4A9,
        clown: 0x1F921,
        shyMonkey: 0x1F648,
        laughingMonkey: 0x1F64A,
        heart: 0x2764,
        chat: 0x1F5E8,
        fire: 0x1F525,
        lion: 0x1F981
      }

      const emoji = string.substring(start, end)
      const keys = Object.keys(emojis)
      for (let i = 0; i < keys.length; i++) {
        if (emoji === keys[i]) { return string.substring(0, start - 1) + String.fromCodePoint(emojis[emoji]) + string.substring(end + 1, string.length) }
      }
      return string
    }
}
