/**
 * This class represents a single score in the highscore class used by memory
 */
export default class Score {
  /**
   * Saves all necessary data.
   *
   * @param {string} u the username
   * @param {number} t the number of images used
   * @param {number} q the number of guesses needed
   */
  constructor (u, t, q) {
    this.username = (u.length > 0) ? u : 'Unnamed'
    this.time = t
    this.question = q
  }
}
