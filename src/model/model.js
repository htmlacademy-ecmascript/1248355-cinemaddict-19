import { FILM_COUNT } from '../consts/others';
import { generateComments } from '../mocks/comments';
import { generateFilms } from '../mocks/films';

export default class Model {
  #films = generateFilms(FILM_COUNT);
  #comments = generateComments();

  getFilms() {
    return this.#films;
  }

  getComments(ids) {
    if (!Array.isArray(ids) || !ids.length) {
      return [];
    }

    return ids.map((id) =>
      this.#comments.find((comment) =>
        comment.id === id));
  }
}
