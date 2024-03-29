import { remove, render, replace } from '../../framework/render';

export default class AbstractPresenter {
  #container;
  #component;
  #isComponentDestroyed = true;
  #isComponentReplaced = false;

  constructor() {
    if (new.target === AbstractPresenter) {
      throw new Error('Can\'t instantiate AbstractPresenter only concrete one.');
    }
  }

  get component() {
    return this.#component;
  }

  set component(component) {
    this.#component = component;
  }

  get isComponentDestroyed() {
    return this.#isComponentDestroyed;
  }

  get isComponentReplaced() {
    return this.#isComponentReplaced;
  }

  get container() {
    return this.#container;
  }

  set container(container) {
    this.#container = container;
  }

  init() {
    this.#isComponentDestroyed = false;
  }

  update() {
    throw new Error('Abstract method not implemented: update');
  }

  destroy() {
    this.#isComponentDestroyed = true;

    remove(this.#component);
  }

  rerender() {
    this.#isComponentDestroyed = false;

    render(this.#component, this.#container);
  }

  replaceWith(component) {
    if (this.#isComponentReplaced) {
      this.#isComponentReplaced = false;

      replace(this.#component, component);

      return;
    }

    this.#isComponentReplaced = true;

    replace(component, this.#component);
  }
}
