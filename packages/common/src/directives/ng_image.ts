/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, Inject, InjectionToken, Input, Optional, Renderer2, SimpleChanges, ɵRuntimeError as RuntimeError} from '@angular/core';

import {RuntimeErrorCode} from '../errors';

/**
 * Config options recognized by the image loader function.
 */
export interface ImageLoaderConfig {
  src: string;
  width: number;
  quality: string;
}

/**
 * Represents an image loader function.
 */
export type ImageLoader = (config: ImageLoaderConfig) => string;

/**
 * Special token that allows to configure a function that will be used to produce an image URL based
 * on the specified input.
 */
export const IMAGE_LOADER = new InjectionToken<ImageLoader>('ImageLoader');

/**
 * ** EXPERIMENTAL **
 *
 * Image directive description.
 *
 * IMPORTANT: this directive should become standalone (i.e. not attached to any NgModule) once
 * the `standalone` flag is implemented and available as a public API. For now, this directive
 * is added into the `CommonModule`, so that it's available for testing.
 *
 * @usageNotes
 * Image directive usage notes.
 */
@Directive({
  selector: 'img[raw-src]',
  host: {'[src]': 'getRewrittenSrc()'},
})
export class NgImage {
  constructor(
      @Optional() @Inject(IMAGE_LOADER) private imageLoader: ImageLoader|null,  //
      private elementRef: ElementRef,                                           //
      private renderer: Renderer2                                               //
  ) {
    // TODO: should we require image loader function to always be present (remove @Optional)?
    // Notes:
    // - `this.elementRef.nativeElement` gives an access to the underlying <img> DOM element
    // - `this.renderer` is an abstraction to manipulate a native element, see
    // https://angular.io/api/core/Renderer2.
  }

  @Input('raw-src') rawSrc!: string;
  @Input() width?: string;

  // Get a value of the `src` if it's set on a host <img> element.
  // This input is needed, so that we can verify that there are no `src` and `raw-src` provided at
  // the same time (thus causing an ambiguity on which src to use).
  // TODO: also handle `attr.src` case.
  @Input() src?: string;

  ngOnInit() {
    if (ngDevMode) {
      // Dev-mode checks/asserts can be wrapped into `ngDevMode` checks like this to tree-shake
      // them away in prod code.

      // If an `src` property is set on a host element - throw an error.
      if (this.src) {
        throw new RuntimeError(
            RuntimeErrorCode.UNEXPECTED_SRC_ATTR,
            `The NgImage directive (activated on an <img> element with the ` +
                `\`raw-src="${this.rawSrc}"\`) detected that the \`src\` is also set ` +
                `(to \`${this.src}\`). ` +
                `Please remove an existing \`src\`, the NgImage will use the \`raw-src\` ` +
                `to compute the final image URL and set the \`src\` itself.`);
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['raw-src']) {
      // The `raw-src` has changed (in case of dynamic binding: `<img [raw-src]="myImgURL">`).
    }
  }

  getRewrittenSrc(): string {
    if (this.imageLoader) {
      const width = +(this.width ?? 100);
      const quality = 'high';
      return this.imageLoader({
        src: this.rawSrc,
        width,
        quality,
      });
    }
    return this.rawSrc;
  }
}
