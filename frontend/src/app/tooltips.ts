import {Tooltip} from 'bootstrap';

/**
 * Enable Bootstrap tooltips on all elements with the `data-bs-toggle="tooltip"` attribute in the component template.
 *
 * Tooltips are optional so they must be enabled manually. This function is called in the `ngOnInit` lifecycle hook of
 * the components in which we want to use tooltips.
 *
 * To update the tooltip content:
 * ```typescript
 * import {Tooltip} from 'bootstrap';
 *
 * Tooltip.getInstance(element)?.setContent({'.tooltip-inner': 'New content'});
 * ```
 *
 * @see {@link https://getbootstrap.com/docs/5.3/components/tooltips/#enable-tooltips}
 */
export function enableTooltips() {
  Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]')).map(el => new Tooltip(el));
}
