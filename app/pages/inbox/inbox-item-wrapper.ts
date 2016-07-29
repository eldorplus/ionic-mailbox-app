import {Component, ContentChild, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild} from '@angular/core';
import {Animation, App, Item} from 'ionic-angular';
import {PanGesture, PanGestureController} from '../../utils/gestures/pan-gesture';
import {GestureDirection} from '../../utils/gestures/gesture-direction';

@Component({
  selector: `inbox-item-wrapper`,
  template: `
    <div class="item-wrapper" #itemWrapper>
      <ng-content></ng-content>
      <div class="left-cell" #leftCell
        [class.active]="started && leftToRight"
        [class.disabled]="started && leftToRight && state === 'disabled'"
        [class.short]="started && leftToRight && state === 'short'"
        [class.long]="started && leftToRight && state === 'long'">
        <div class="left-cell-inner">
          <div class="left-cell-content" *ngIf="areAccessoriesVisible()">
            <span class="left-cell-label">{{getLeftCellText()}}</span>
            <ion-icon [name]="getLeftIconName()" class="left-cell-icon"></ion-icon>
          </div>
        </div>
      </div>
      <div class="right-cell" #rightCell
        [class.active]="started && !leftToRight"
        [class.disabled]="started && !leftToRight && state === 'disabled'"
        [class.short]="started && !leftToRight && state === 'short'"
        [class.long]="started && !leftToRight && state === 'long'">
      <div class="right-cell-inner">
        <div class="right-cell-content" *ngIf="areAccessoriesVisible()">
          <span class="right-cell-label">{{getRightCellText()}}</span>
          <ion-icon [name]="getRightIconName()" class="right-cell-icon"></ion-icon>
        </div>
      </div>
      </div>
    </div>
  `
})
export class InboxItemWrapper{

  @Input() enabled: boolean;
  @Input() leftLabelTextShort: string;
  @Input() leftLabelTextLong: string;
  @Input() leftIconShort: string;
  @Input() leftIconLong: string;

  @Input() rightLabelTextShort: string;
  @Input() rightLabelTextLong: string;
  @Input() rightIconShort: string;
  @Input() rightIconLong: string;

  @Input() overrideLeftShortSwipeTransition: (inboxItemWrapper: InboxItemWrapper, elementRef: ElementRef, currentPosition: number, originalNewPosition: number, maximumAchievedVelocity: number, minSuggestedVelocity: number) => Animation;
  @Input() overrideLeftLongSwipeTransition: (inboxItemWrapper: InboxItemWrapper, elementRef: ElementRef, currentPosition: number, originalNewPosition: number, maximumAchievedVelocity: number, minSuggestedVelocity: number) => Animation;
  @Input() overrideRightShortSwipeTransition: (inboxItemWrapper: InboxItemWrapper, elementRef: ElementRef, currentPosition: number, originalNewPosition: number, maximumAchievedVelocity: number, minSuggestedVelocity: number) => Animation;
  @Input() overrideRightLongSwipeTransition: (inboxItemWrapper: InboxItemWrapper, elementRef: ElementRef, currentPosition: number, originalNewPosition: number, maximumAchievedVelocity: number, minSuggestedVelocity: number) => Animation;

  @Output() leftShortSwipe: EventEmitter<any> = new EventEmitter();
  @Output() leftLongSwipe: EventEmitter<any> = new EventEmitter();
  @Output() rightShortSwipe: EventEmitter<any> = new EventEmitter();
  @Output() rightLongSwipe: EventEmitter<any> = new EventEmitter();

  @ViewChild("itemWrapper") wrapperEleRef: ElementRef;
  @ViewChild("leftCell") leftCellRef: ElementRef;
  @ViewChild("rightCell") rightCellRef: ElementRef;

  protected panGesture: PanGesture;
  protected cellRect: any;
  protected percentageDragged: number;
  protected previousXPosition: number;
  protected currentXPosition: number;
  protected leftToRight: boolean;
  protected maximumAchievedVelocity: number = 0;
  protected started: boolean;
  protected animating: boolean;
  protected state: string;

  constructor(protected app: App, protected panGestureController: PanGestureController, protected elementRef: ElementRef) {
  }

  ngAfterViewInit() {

    this.panGesture = this.panGestureController.create(this.wrapperEleRef, {threshold: DRAG_THRESHOLD, direction: GestureDirection.HORIZONTAL});
    this.panGesture.onPanStart((event) => {this.startDrag(event)});
    this.panGesture.onPanMove((event) => {this.handleDrag(event)});
    this.panGesture.onPanEnd((event) => {this.endDrag(event)});
  }

  ngOnChanges(changes: SimpleChanges ) {
    if ( changes['enabled'] ) {
      if ( changes['enabled'].currentValue === false ) {
        //this.stopListeningForDrags();
      }
      else {
        //this.startListeningForDrags();
      }
    }
  }

  getContainerWidth(){
    return this.cellRect.width;
  }

  stopListeningForDrags() {
    if ( this.panGesture ) {
      this.panGesture.unlisten();
      //this.app.setScrollDisabled(false);
    }
  }

  startListeningForDrags() {
    if ( this.panGesture ) {
      this.panGesture.listen();
      //this.app.setScrollDisabled(false);
    }
  }

  startDrag(event: HammerInput) {
    if ( this.started || this.animating || ! this.enabled){
      return;
    }

    this.cellRect = this.wrapperEleRef.nativeElement.getBoundingClientRect();

    if ( event.direction === GestureDirection.LEFT ) {
      this.leftToRight = false;
    }
    else {
      this.leftToRight = true;
    }

    this.started = true;
  }

  handleDrag(event:HammerInput) {
    if ( ! this.started || this.animating || ! this.enabled){
      return;
    }

    this.previousXPosition = this.currentXPosition || event.center.x;
    this.currentXPosition = event.center.x;
    this.percentageDragged = Math.abs(event.deltaX / this.getContainerWidth());

    // check if we're outside of the container
    let relativeY = event.center.y - this.cellRect.top;
    let relativeX = event.center.x - this.cellRect.left;
    if ( relativeY < -10 || relativeY > this.cellRect.height + 10 || relativeX <= 0 || relativeX >= this.cellRect.width ) {
      this.animating = true;
      return this.resetDrag(event);
    }

    // check if we moved too many pixels vertically
    if ( event.deltaY > this.cellRect.height / 2 ) {
      this.animating = true;
      return this.resetDrag(event);
    }

    this.setState();
    this.maximumAchievedVelocity = Math.max(this.maximumAchievedVelocity, event.velocity);
    if ( this.leftToRight ) {
      this.processLeftToRightDrag(event);
    } else{
      this.processRightToLeftDrag(event);
    }
  }

  endDrag(event: HammerInput) {
    if ( ! this.started || this.animating || ! this.enabled ) {
      return;
    }

    this.animating = true;
    if ( this.percentageDragged < INCOMPLETE_DRAG_PERCENTAGE ) {
      this.resetDrag(event);
    }
    else if ( this.percentageDragged < SHORT_DRAG_PERCENTAGE ) {
      this.shortDrag(event);
    }
    else{
      this.longDrag(event);
    }
  }

  resetDrag(event:HammerInput) {
    if ( this.leftToRight ) {
      let currentPosition = this.previousXPosition - this.getContainerWidth();
      let newPosition = 0 - this.getContainerWidth();
      this.animateLeftCellOut(currentPosition, newPosition, this.maximumAchievedVelocity, SUGGESTED_VELOCITY, () => {
        this.animationComplete();
        (<any>event).releaseGesture && (<any>event).releaseGesture();
      });
    } else {
      let currentPosition = this.previousXPosition;
      let newPosition = this.getContainerWidth();
      this.animateRightCellOut(currentPosition, newPosition, this.maximumAchievedVelocity, SUGGESTED_VELOCITY, () => {
        this.animationComplete();
        (<any>event).releaseGesture && (<any>event).releaseGesture();
      });
    }
  }

  shortDrag(event:HammerInput) {
    if ( this.leftToRight ) {
      let currentPosition = this.previousXPosition - this.getContainerWidth();
      let newPosition = this.getContainerWidth() * 2;
      if ( this.overrideLeftShortSwipeTransition ) {
        let animation = this.overrideLeftShortSwipeTransition(this, this.leftCellRef, currentPosition, newPosition, this.maximumAchievedVelocity, SUGGESTED_VELOCITY);
        animation.onFinish( () => {
          this.leftShortSwipe.emit({});
        });
        animation.play();
      } else{
        this.animateLeftCellOut(currentPosition, newPosition, this.maximumAchievedVelocity, SUGGESTED_VELOCITY, () => {
          this.animationComplete();
          this.leftShortSwipe.emit({});
        });
      }
    } else {
      let currentPosition = this.previousXPosition;
      let newPosition = 0 - this.getContainerWidth();
      if ( this.overrideRightShortSwipeTransition ) {
        let animation = this.overrideRightShortSwipeTransition(this, this.rightCellRef, currentPosition, newPosition, this.maximumAchievedVelocity, SUGGESTED_VELOCITY);
        animation.onFinish( () => {
          this.rightShortSwipe.emit({});
        });
        animation.play();
      } else{
        this.animateRightCellOut(currentPosition, newPosition, this.maximumAchievedVelocity, SUGGESTED_VELOCITY, () => {
          this.animationComplete();
          this.rightShortSwipe.emit({});
        });
      }
    }
  }

  longDrag(event:HammerInput) {
    if ( this.leftToRight ) {
      let currentPosition = this.previousXPosition - this.getContainerWidth();
      let newPosition = this.getContainerWidth() * 2;
      if ( this.overrideLeftLongSwipeTransition ) {
        let animation = this.overrideLeftLongSwipeTransition(this, this.leftCellRef, currentPosition, newPosition, this.maximumAchievedVelocity, SUGGESTED_VELOCITY);
        animation.onFinish( () => {
          this.leftLongSwipe.emit({});
        });
        animation.play();
      } else {
        this.animateLeftCellOut(currentPosition, newPosition, this.maximumAchievedVelocity, SUGGESTED_VELOCITY, () => {
          this.animationComplete();
          this.leftLongSwipe.emit({});
        });
      }
    } else {
      let currentPosition = this.previousXPosition;
      let newPosition = 0 - this.getContainerWidth();
      if ( this.overrideRightLongSwipeTransition ) {
        let animation = this.overrideRightLongSwipeTransition(this, this.rightCellRef, currentPosition, newPosition, this.maximumAchievedVelocity, SUGGESTED_VELOCITY);
        animation.onFinish( () => {
          this.rightShortSwipe.emit({});
        });
        animation.play();
      } else {
        this.animateRightCellOut(currentPosition, newPosition, this.maximumAchievedVelocity, SUGGESTED_VELOCITY, () => {
          this.animationComplete();
          this.rightLongSwipe.emit({});
        });
      }
    }
  }

  processLeftToRightDrag(event:HammerInput) {
    let currentPosition = this.previousXPosition - this.getContainerWidth();
    let newPosition = this.currentXPosition - this.getContainerWidth();
    this.animateLeftCellIn(currentPosition, newPosition);
  }

  processRightToLeftDrag(event:HammerInput) {
    let currentPosition = this.previousXPosition;
    let newPosition = this.currentXPosition;
    this.animateRightCellIn(currentPosition, newPosition);
  }

  animateLeftCellIn(currentPosition:number, newPosition:number) {
    let animation = new Animation(this.leftCellRef.nativeElement, {renderDelay: 0});
    animation.fromTo('translateX', `${currentPosition}px`, `${newPosition}px`);
    animation.play();
  }

  animateLeftCellOut(currentPosition: number, endPosition: number, maximumAchievedVelocity: number, suggestedVelocity: number, callback: Function) {
    let distance = Math.abs(endPosition - currentPosition);
    let velocity = Math.max(Math.abs(maximumAchievedVelocity), suggestedVelocity);
    let transitionTimeInMillis = Math.abs(Math.floor(distance/velocity));
    let animation = new Animation(this.leftCellRef.nativeElement, {renderDelay: 0});
    animation.fromTo('translateX', `${currentPosition}px`, `${endPosition}px`);
    animation.duration(transitionTimeInMillis);
    animation.easing('linear');
    animation.onFinish( () => {
      if ( callback ) {
        callback();
      }
    });
    animation.play();
  }

  animateRightCellIn(currentPosition:number, newPosition:number) {
    let animation = new Animation(this.rightCellRef.nativeElement, {renderDelay: 0});
    animation.fromTo('translateX', `${currentPosition}px`, `${newPosition}px`);
    animation.play();
  }

  animateRightCellOut(currentPosition: number, endPosition: number, maximumAchievedVelocity: number, suggestedVelocity: number, callback: Function) {
    let distance = Math.abs(endPosition - currentPosition);
    let velocity = Math.max(Math.abs(maximumAchievedVelocity), suggestedVelocity);
    let transitionTimeInMillis = Math.abs(Math.floor(distance/velocity));
    let animation = new Animation(this.rightCellRef.nativeElement, {renderDelay: 0});
    animation.fromTo('translateX', `${currentPosition}px`, `${endPosition}px`);
    animation.duration(transitionTimeInMillis);
    animation.easing('linear');
    animation.onFinish( () => {
      if ( callback ) {
        callback();
      }
    });
    animation.play();
  }

  animationComplete(){
    this.started = false;
    this.animating = false;
    this.state = STATE_INACTIVE;
    this.currentXPosition = null;
    this.previousXPosition = null;
    this.app.setEnabled(true);
    //this.app.setScrollDisabled(false);
  }

  setState() {
    if (  this.percentageDragged < INCOMPLETE_DRAG_PERCENTAGE ) {
      this.state = STATE_DISABLED;
    }
    else if ( this.percentageDragged < SHORT_DRAG_PERCENTAGE) {
      this.state = STATE_SHORT_SWIPE;
    }
    else{
      this.state = STATE_LONG_SWIPE;
    }
  }

  areAccessoriesVisible() {
    return !(this.percentageDragged < INCOMPLETE_DRAG_PERCENTAGE);
  }

  isShortDrag() {
    return this.percentageDragged < SHORT_DRAG_PERCENTAGE;
  }

  getLeftCellText() {
    if ( this.isShortDrag() ) {
      return this.leftLabelTextShort;
    }
    return this.leftLabelTextLong;
  }

  getRightCellText() {
    if ( this.isShortDrag() ) {
      return this.rightLabelTextShort;
    }
    return this.rightLabelTextLong;
  }

  getLeftIconName() {
    if ( this.isShortDrag() ) {
      return this.leftIconShort;
    }
    return this.leftIconLong;
  }

  getRightIconName() {
    if ( this.isShortDrag() ) {
      return this.rightIconShort;
    }
    return this.rightIconLong;
  }
}

const DRAG_THRESHOLD = 85;
const STATE_INACTIVE = "inactive";
const STATE_DISABLED = "disabled";
const STATE_SHORT_SWIPE = "short";
const STATE_LONG_SWIPE = "long";

const INCOMPLETE_DRAG_PERCENTAGE = .40;
const SHORT_DRAG_PERCENTAGE = .60;

export const SUGGESTED_VELOCITY = 3.0;
