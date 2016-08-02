import {ElementRef, EventEmitter, Injectable} from '@angular/core';

import {DisableScroll, GestureController, GestureDelegate, GesturePriority} from 'ionic-angular';
import {GestureDirection} from './gesture-direction';
import {HammerFactory} from './hammer-factory';

import {CaptureError} from './base-gesture';
import {PanGesture, PanGestureOptions} from './pan-gesture';

export class HorizontalEdgePanGesture extends PanGesture {

  protected startX: number;
  protected startY: number;
  protected endX: number;
  protected endY: number;

  constructor(delegate: GestureDelegate, hammerFactory: HammerFactory, elementRef: ElementRef, options: EdgePanGestureOptions) {
    super(delegate, hammerFactory, elementRef, options);
    this.populateInitialBounds(elementRef);
  }

  private populateInitialBounds(elementRef: ElementRef) {
    let rectangle = elementRef.nativeElement.getBoundingClientRect();
    this.startX = rectangle.left;
    this.startY = rectangle.top;
    this.endX = rectangle.left + rectangle.width;
    this.endY = rectangle.top + rectangle.height;
  }

  protected onPanStartHandlerInternal(event: HammerInput) {
    try {
      if ( this.started ) {
        throw new Error('Already started');
      }

      if ( ! this.delegate ) {
        throw new Error('Delegate missing');
      }

      if ( this.captured ) {
        throw new Error('Already captured');
      }

      // check to make sure we're moving left to right, or right to left and the gesture works out
      if ( (event.direction === GestureDirection.LEFT && event.deltaX < 0) || (event.direction === GestureDirection.RIGHT && event.deltaX > 0) ) {
      } else {
        throw new Error('Invalid Pan direction');
      }

      // try to start the gesture
      this.started = this.delegate.start();
      if ( ! this.started ) {
        throw new Error('Failed to start');
      }

      this.captured = this.delegate.capture();

      if ( ! this.captured ) {
        throw new CaptureError('Failed to capture');
      }

      if ( this.onPanStartHandler ) {
        this.onPanStartHandler(event);
      }
    }
    catch (ex) {
      console.debug(`onPanStartHandler: Error occured - ${ex.message}`);
      if ( ex instanceof CaptureError ) {
        this.started = false;
        this.captured = false;
      }
    }
  }

  protected checkIfValidStartingPoint(x: number, y: number) {
    if ( x >= this.startX &&  x <= this.startX + this.options.maxDistanceFromEdge ) {
      // it's a valid left edge
      return true;
    }
    else if ( x <= this.endX && x >= this.endX - this.options.maxDistanceFromEdge ) {
      // it's a valid right edge
      return true;
    }
    return false;
  }

  pointerDown(event: HammerInput) {
    try {
      if ( this.started ) {
        throw new Error('Already started');
      }

      if ( ! this.canStart(event) ) {
        throw new Error('Cannot start');
      }

      if ( ! this.delegate ) {
        throw new Error('Missing delegate');
      }

      if ( ! this.checkIfValidStartingPoint(event.center.x, event.center.y) ) {
        throw new Error('Invalid starting position');
      }

      // we are enabling the gesture recognizer,
      // but we haven't started recongizing
      // or captured a gesture yet
      this.recognizerEnabled = true;
      this.started = false;
      this.captured = false;
    }
    catch (ex) {
      console.log(`Gesture Recognizer: Error occured during pointerdown - ${ex.message}`);
    }
  }
}

export interface EdgePanGestureOptions extends PanGestureOptions{
  maxAngle?: number;
  maxDistanceFromEdge?: number;
}

@Injectable()
export class HorizontalEdgePanGestureController {
  constructor(private gestureController: GestureController, private hammerFactory: HammerFactory) {
  }

  create(elementRef: ElementRef, options: EdgePanGestureOptions = {}) {
    options.priority = !!options.priority ? options.priority : GesturePriority.Normal;
    options.disableScroll = !!options.disableScroll ? options.disableScroll : DisableScroll.DuringCapture;
    options.maxAngle = !!options.maxAngle ? options.maxAngle : MAX_ANGLE;
    options.direction = GestureDirection.HORIZONTAL;
    options.maxDistanceFromEdge = !!options.maxDistanceFromEdge ? options.maxDistanceFromEdge : MAX_DISTANCE_FROM_EDGE;

    let delegate = this.gestureController.create(`horizontal-edge-pan-gesture-#${++count}`, {
      priority: options.priority,
      disableScroll: options.disableScroll
    });

    return new HorizontalEdgePanGesture(delegate, this.hammerFactory, elementRef, options);
  }
}

let count = 0;

const DEFAULT_THRESHOLD = 10;
const MAX_ANGLE = 30;
const MAX_DISTANCE_FROM_EDGE = 50;
