import {ElementRef, EventEmitter, Injectable} from '@angular/core';

import {DisableScroll, GestureController, GestureDelegate, GesturePriority} from 'ionic-angular';
import {GestureDirection} from './gesture-direction';
import {CaptureError, BaseHammerGesture} from './base-gesture';
import {HammerFactory} from './hammer-factory';

export class PressGesture extends BaseHammerGesture {

  private onPressHandler: (event: HammerInput) => any;

  private _onPressHandlerInternal = (event: HammerInput) => {
    this.onPressHandlerInternal(event);
  }


  constructor(delegate: GestureDelegate, hammerFactory: HammerFactory, elementRef: ElementRef, options: PressGestureOptions) {
    super(delegate, hammerFactory, hammerFactory.createPressGestureRecognizer, options, elementRef);
    this.listen();
  }

  listen() {
    super.listen();
    this.hammerManager.on('press', this._onPressHandlerInternal);
  }

  unlisten() {
    this.hammerManager.off('press', this._onPressHandlerInternal);
    super.unlisten();
  }

  destroy() {
    super.destroy();
    this.onPressHandler = null;
  }

  onPressHandlerInternal(event: HammerInput) {
    try {
      if ( this.started ) {
        throw new Error('Already started');
      }

      if ( this.captured ) {
        throw new Error('Already captured');
      }

      if ( ! this.delegate ) {
        throw new Error('Missing delegate');
      }

      this.delegate.release();
      this.started = this.delegate.start();

      if ( ! this.started ) {
        throw new Error('Failed to start');
      }

      this.captured = this.delegate.capture();
      if ( ! this.captured ) {
        throw new CaptureError('Failed to capture');
      }

      if ( this.onPressHandler ) {
        this.onPressHandler(event);
      }
    }
    catch (ex) {
      console.debug(`onPressHandler: Error occured - ${ex.message}`);
      if ( ex instanceof CaptureError ) {
        this.notCaptured(event);
      }
    }
    finally {
      this.delegate.release();
      this.started = false;
      this.captured = false;
    }
  }


  onPress(handler: (event: HammerInput) => any) {
    this.onPressHandler = handler;
  }

}

export interface PressGestureOptions {
  pointers?: number;
  threshold?: number;
  time?: number;
  priority?: GesturePriority;
  disableScroll?: DisableScroll;
}

@Injectable()
export class PressGestureController {
  constructor(private gestureController: GestureController, private hammerFactory: HammerFactory) {
  }

  create(elementRef: ElementRef, options: PressGestureOptions = {}) {
    options.priority = !!options.priority ? options.priority : GesturePriority.Normal;
    options.disableScroll = !!options.disableScroll ? options.disableScroll : DisableScroll.Never;
    let delegate = this.gestureController.create(`press-gesture-#${++count}`, {
      priority: options.priority,
      disableScroll: options.disableScroll
    });

    return new PressGesture(delegate, this.hammerFactory, elementRef, options);
  }
}

let count = 0;
