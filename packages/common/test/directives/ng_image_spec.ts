/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {IMAGE_LOADER, ImageLoader} from '@angular/common/src/directives/ng_image';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';

fdescribe('Image directive', () => {
  // NOTE: use `isNode` to detect browser/Node envs (if some tests are env-specific):
  // if (isNode) { /* node env */ } else { /* browser env */ }

  it('should set `src` to `raw-src` value if image loader is not provided', () => {
    setupTestingModule();

    const template = '<img raw-src="path/img.png">';
    const fixture = createTestComponent(template);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const img = nativeElement.querySelector('img')!;
    expect(img.src).toEqual('/path/img.png');
  });

  it('should use image loader if provided', () => {
    const imageLoader = (config: {src: string, width: number, quality: string}) =>
        `${config.src}?w=${config.width}&q=${config.quality}`;
    setupTestingModule({imageLoader});

    const template = '<img raw-src="path/img.png">';
    const fixture = createTestComponent(template);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const img = nativeElement.querySelector('img')!;
    expect(img.src).toEqual('/path/img.png?w=100&q=high');
  });

  it('should throw if both `src` and `raw-src` are present', () => {
    setupTestingModule();

    const template = '<img raw-src="path/img.png" src="path/img2.png">';
    expect(() => {
      const fixture = createTestComponent(template);
      fixture.detectChanges();
    })
        .toThrowError(
            'NG02950: The NgImage directive (activated on an <img> element ' +
            'with the `raw-src="path/img.png"`) detected that the `src` is also set ' +
            '(to `path/img2.png`). Please remove an existing `src`, the NgImage will ' +
            'use the `raw-src` to compute the final image URL and set the `src` itself.');
  });
});

// Helpers

@Component({selector: 'test-cmp', template: ''})
class TestComponent {
}

function setupTestingModule(config?: {imageLoader: ImageLoader}) {
  const providers =
      config?.imageLoader ? [{provide: IMAGE_LOADER, useValue: config?.imageLoader}] : [];
  TestBed.configureTestingModule({
    declarations: [TestComponent],
    imports: [CommonModule],
    providers,
  });
}

function createTestComponent(template: string): ComponentFixture<TestComponent> {
  return TestBed.overrideComponent(TestComponent, {set: {template: template}})
      .createComponent(TestComponent);
}
