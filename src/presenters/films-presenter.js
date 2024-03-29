import FilmsListView from '../views/films-list-view';
import { remove, render, RenderPosition, replace } from '../framework/render';
import { FILMS_COUNT_PER_CLICK, FILMS_RENDER_START, FilmsListType, SortType } from '../consts/app';
import ShowMoreButtonPresenter from './show-more-button-presenter';
import AbstractFilmsPresenter from './abstracts/abstract-films-presenter';
import SortView from '../views/sort-view';
import { sortFilmsByDate, sortFilmsByRating } from '../utils/sort';
import { EventType } from '../consts/observer';
import FilterModel from '../model/filter-model';

export default class FilmsPresenter extends AbstractFilmsPresenter {
  #showMoreButtonPresenter;
  #sortComponent;
  #noFilmsComponent;
  #renderedFilmsCount = FILMS_COUNT_PER_CLICK;
  #currentSortType = SortType.DEFAULT;
  #filterModel = new FilterModel();

  constructor({ container, popupPresenter, filmsModel, commentModel }) {
    super({ popupPresenter, filmsModel, commentModel });

    this.container = container;

    this._filmsModel.addObserver(this._handleModelEvent);
    this.#filterModel.addObserver(this._handleModelEvent);
  }

  _renderList() {
    this.#setFilms();
    this.#handleFilmsEmptyList();
    this.#renderShowMoreButton();
    this._renderFilms(FILMS_RENDER_START, Math.min(this.films.length, this.#renderedFilmsCount));
  }

  _clearList(isRenderedFilmsCountReset = true) {
    super._clearList();

    if (this.films.length > FILMS_COUNT_PER_CLICK) {
      this.#showMoreButtonPresenter.destroy();
    }

    if (isRenderedFilmsCountReset) {
      this.#renderedFilmsCount = FILMS_COUNT_PER_CLICK;
    }
  }

  _handleModelEvent = (event, payload) => {
    switch (event) {
      case EventType.FILTER_CHANGE:
        this.#resetSort();
        this._clearList();
        this._renderList();
        return;
      case EventType.RENDER_LIST:
        this._clearList(false);
        this._renderList();
        return;
      default:
        break;
    }

    super._handleModelEvent(event, payload);
  };

  #setFilms() {
    this.films = this.#filterModel.films;

    switch (this.#currentSortType) {
      case SortType.DATE:
        this.films.sort(sortFilmsByDate);
        break;
      case SortType.RATING:
        this.films.sort(sortFilmsByRating);
        break;
      default:
        break;
    }
  }

  #replaceFilmsListWithEmptyList() {
    this.#noFilmsComponent = new FilmsListView(FilmsListType.EMPTY, this.#filterModel.filterType);

    remove(this.#sortComponent);

    this.replaceWith(this.#noFilmsComponent);
  }

  #replaceEmptyListWithFilmsList() {
    this.#renderSort();
    this.replaceWith(this.#noFilmsComponent);
  }

  #rerenderEmptyList() {
    const prevComponent = this.#noFilmsComponent;

    this.#noFilmsComponent = new FilmsListView(FilmsListType.EMPTY, this.#filterModel.filterType);

    replace(this.#noFilmsComponent, prevComponent);
  }

  #renderShowMoreButton() {
    if (this.films.length > this.#renderedFilmsCount) {
      this.#showMoreButtonPresenter = new ShowMoreButtonPresenter({
        onButtonClick: this.#handleShowMoreButtonClick,
        container: this.component.element
      });

      this.#showMoreButtonPresenter.init();
    }
  }

  #renderSort() {
    this.#sortComponent = new SortView({
      onSortButtonClick: this.#handleSortButtonClick,
      currentSortType: this.#currentSortType
    });

    render(this.#sortComponent, this.container, RenderPosition.BEFOREBEGIN);
  }

  #resetSort() {
    this.#sortComponent.reset();

    this.#currentSortType = SortType.DEFAULT;
  }

  init() {
    super.init();

    this.component = new FilmsListView(FilmsListType.DEFAULT);

    render(this.component, this.container);

    this.#renderSort();
    this._renderList();
  }

  #handleFilmsEmptyList() {
    if (!this.films.length && !this.isComponentReplaced) {
      this.#replaceFilmsListWithEmptyList();

      return;
    }

    if (!this.films.length && this.isComponentReplaced) {
      this.#rerenderEmptyList();

      return;
    }

    if (this.isComponentReplaced && this.films.length) {
      this.#replaceEmptyListWithFilmsList();
    }
  }

  #handleSortButtonClick = (sortType) => {
    if (sortType === this.#currentSortType) {
      return;
    }

    this.#currentSortType = sortType;

    this._clearList();
    this._renderList();
  };

  #handleShowMoreButtonClick = () => {
    const nextFilmsCount = Math.min(this.#renderedFilmsCount + FILMS_COUNT_PER_CLICK, this.films.length);

    this._renderFilms(this.#renderedFilmsCount, nextFilmsCount);

    this.#renderedFilmsCount += FILMS_COUNT_PER_CLICK;

    if (this.#renderedFilmsCount >= this.films.length) {
      this.#showMoreButtonPresenter.destroy();
    }
  };
}
