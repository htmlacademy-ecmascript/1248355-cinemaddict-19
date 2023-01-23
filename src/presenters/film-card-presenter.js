import FilmCardView from '../views/film-card-view';
import { render, replace } from '../framework/render';
import { EventType, UserAction } from '../consts/observer';
import { FilterType } from '../consts/app';
import FilterModel from '../model/filter-model';
import AbstractPresenter from './abstracts/abstract-presenter';

export default class FilmCardPresenter extends AbstractPresenter {
  #popupPresenter;
  #film;
  #handleDataChange;
  #filterModel = new FilterModel();

  constructor({ container, popupPresenter, handleDataChange }) {
    super();
    this.container = container;
    this.#popupPresenter = popupPresenter;
    this.#handleDataChange = handleDataChange;
  }

  #showPopup() {
    this.#popupPresenter.init({
      film: this.#film,
      handleDataChange: this.#handleDataChange
    });
  }

  #handleFilmCardClick = () => {
    if (!this.#popupPresenter.isComponentDestroyed && this.#film.id === this.#popupPresenter.filmId) {
      return;
    }

    if (!this.#popupPresenter.isComponentDestroyed) {
      this.#popupPresenter.destroy();
    }

    this.#showPopup();
  };

  #updateControlButton(type) {
    const eventType = this.#filterModel.filterType === FilterType.ALL ? EventType.PATCH_CARD : EventType.RENDER_LIST;

    this.#handleDataChange(
      UserAction.TOGGLE_FILTER_CONTROL,
      eventType,
      {
        ...this.#film,
        userDetails: { ...this.#film.userDetails, [type]: !this.#film.userDetails[type] }
      });
  }

  #handleFavoriteButtonClick = (type) => {
    this.#updateControlButton(type);
  };

  #handleWatchListButtonClick = (type) => {
    this.#updateControlButton(type);
  };

  #handleHistoryButtonClick = (type) => {
    this.#updateControlButton(type);
  };

  #createNewComponent(film) {
    this.#film = film;
    this.component = new FilmCardView({
      film,
      onFilmCardClick: this.#handleFilmCardClick,
      onFavoriteButtonClick: this.#handleFavoriteButtonClick,
      onHistoryButtonClick: this.#handleHistoryButtonClick,
      onWatchListButtonClick: this.#handleWatchListButtonClick
    });
  }

  init(film) {
    super.init();

    this.#createNewComponent(film);

    render(this.component, this.container);
  }

  update(updatedFilm) {
    const prevComponent = this.component;

    this.#createNewComponent(updatedFilm);

    replace(this.component, prevComponent);
  }
}
