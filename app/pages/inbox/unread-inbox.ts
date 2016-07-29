import {Component, ContentChildren, ElementRef, Input, QueryList, ViewChildren} from "@angular/core";
import {animate, state, style, trigger, transition} from '@angular/core';
import {App, AlertController, Animation, NavController} from 'ionic-angular';

import {EmailDataProvider, Email} from "./email-data-provider";
import {InboxItemWrapper} from "./inbox-item-wrapper";

import {SnoozeViewController} from '../snooze/snooze-view-controller';

@Component({
  selector: 'unread-inbox',
  directives: [InboxItemWrapper],
  template: `
  <ion-list >
    <inbox-item-wrapper #instance
      *ngFor="let email of emails; let i = index"
      (tap)="favorite(email)"
      leftIconShort="checkmark"
      leftIconLong="close"
      rightIconShort="time"
      rightIconLong="menu"
      [enabled]="!reorderEnabled"
      [overrideRightShortSwipeTransition]="overrideAnimation"
      (leftShortSwipe)="archive(i)"
      (leftLongSwipe)="delete(i)"
      (rightShortSwipe)="snooze(i)"
      (rightLongSwipe)="somethingElse(i)"
    >
      <button ion-item detail-none >
        <ion-icon ios="ios-star-outline" md="ios-star-outline" item-left *ngIf="!email.favorited" primary></ion-icon>
        <ion-icon class="yellow" ios="ios-star" md="ios-star" item-left *ngIf="email.favorited"></ion-icon>
        <p>{{email.sender}}</p>
        <h2>{{email.subject}}</h2>
        <p>{{email.body}}</p>
      </button>
    </inbox-item-wrapper>
  </ion-list>
  `
})
export class UnreadInbox{

  @Input() reorderEnabled: boolean = false;
  @ViewChildren('instance', {read: ElementRef}) itemWrappers: QueryList<ElementRef>;

  private emails: Email[];

  constructor(private alertController: AlertController, private app: App, private emailDataProvider: EmailDataProvider, private nav: NavController, private snoozeViewController: SnoozeViewController){
    this.loadUnreadEmails();
  }

  loadUnreadEmails(){
    this.emails = this.emailDataProvider.getUnreadEmails();
  }

  favorite(email:any){
    email.favorited = !email.favorited;
  }

  archive(index: number){
    this.animateItemWrapperOut(index, () => {
      this.emailDataProvider.archiveEmail(this.emails[index]);
      this.loadUnreadEmails();
    });
  }

  delete(index: number){
    this.animateItemWrapperOut(index, () => {
      this.emailDataProvider.deleteEmail(this.emails[index]);
      this.loadUnreadEmails();
    });
  }

  snooze(index: number){
    let snoozeView = this.snoozeViewController.create();
    snoozeView.onDidDismiss((data) => {
      this.animateItemWrapperOut(index, () => {
        this.emailDataProvider.snoozeEmail(this.emails[index], data.snoozedUntilDate);
        this.loadUnreadEmails();
      });
    });
    snoozeView.present(snoozeView);
  }

  somethingElse(index: number){
    let alert = this.alertController.create({
      title: 'Some Action',
      subTitle: `w00t! You've taken an action! Try some other swipes!`,
      buttons: ['OK']
    });
    alert.present();
  }

  overrideAnimation(inboxItemWrapper: InboxItemWrapper, elementRef: ElementRef, currentPosition: number, originalNewPosition: number, maximumAchievedVelocity: number, minSuggestedVelocity: number): Animation{
    let velocity = Math.max(Math.abs(maximumAchievedVelocity), minSuggestedVelocity);
    let transitionTimeInMillis = Math.abs(Math.floor(currentPosition/velocity));
    inboxItemWrapper.setState();
    let animation = new Animation(elementRef,  {renderDelay: 0});
    animation.fromTo('translateX', `${currentPosition}px`, `${0}px`);
    animation.duration(transitionTimeInMillis);
    return animation;
  }

  animateItemWrapperOut(index: number, callback: () => any):void {
    let array = this.itemWrappers.toArray();
    let animation = new Animation(array[index].nativeElement, {renderDelay: 0});

    animation.fromTo('height', `${array[index].nativeElement.clientHeight}px`, `${0}px`);
    animation.easing('ease-in');
    animation.duration(DELETE_ANIMATION_DURATION);
    animation.onFinish(callback);
    animation.play();
  }

  reorder(fromTo: any){
    let from = fromTo.from;
    let to = fromTo.to;

    let temp = this.emails.concat();
    let tempValue = temp[from];
    temp.splice(from, 1);
    temp.splice(to, 0,  tempValue);

    this.emails = temp;
  }
}

const DELETE_ANIMATION_DURATION = 100;
