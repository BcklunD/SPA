import Score from './score'

/**
 * This class is used by memory to store the 5 best scores.
 * Every single score is saved using the class Score.
 */
export default class Highscores {
  /**
   * Initiate the needed field.
   */
  constructor () {
    this.top5 = []
  }

  /**
   * Adds a new score to the highscore and sort the highscores.
   * Primary sort is depending on how many images the user played with.
   * Secondary sory is depending on how many guesses the user used.
   * Only the 5 best scores are saved.
   *
   * @param {string} user the usernam
   * @param {number} time number of images
   * @param {number} question number of atempts
   */
  newScore (user, time, question) {
    const temp = new Score(user, time, question)
    this.top5.push(temp)
    this.top5.sort(function (a, b) {
      if (a.question === b.question) return a.time - b.time
      else return b.question - a.question
    })
    if (this.top5.length > 5) this.top5.pop()
  }

  /**
   * Function to get the 5 best scores.
   *
   * @returns {object} the list of the best 5 scores
   */
  getScores () {
    return this.top5
  }
}
