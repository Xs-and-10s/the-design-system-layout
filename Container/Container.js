/**
 * @module containment-layout
 * @description
 * A custom element for defining containment contexts
 * @property {string} name The name of the container, used as the CSS `containment-name` value (optional)
 */
class DesignSystemContainmentLayout extends HTMLElement {
  constructor() {
    super();
    this.render = () => {
      this._i = `Container-${[this.name]}`;
      this.dataset._i = this._i;
      if (!document.getElementById(this._i)) {
        let styleEl = document.createElement('style');
        styleEl.id = this.i;
        styleEl.innerHTML = `
            [data-_i="${this._i}"] {
              display: block;
              container-type: inline-size;
              ${this.name ? `container-name: ${this.name};` : ''}
            }
          `.replace(/\s\s+/g, ' ').trim();
        document.head.appendChild(styleEl);
      }
    }
  }

  get name() {
    return this.getAttribute('name') || null;
  }

  set name(val) {
    return this.setAttribute('name', val);
  }

  static get observedAttributes() {
    return ['name'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }
}

if ('customElements' in window) {
  customElements.define('containment-layout', DesignSystemContainmentLayout);
}
