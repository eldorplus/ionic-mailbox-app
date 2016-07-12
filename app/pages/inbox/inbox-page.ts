import {Component, ContentChildren, ElementRef, QueryList, ViewChildren} from "@angular/core";
import {App, Alert, Animation, NavController} from 'ionic-angular';

import {EmailDataProvider, Email} from "./email-data-provider";

import {ArchivedInbox} from './archived-inbox';
import {SnoozedInbox} from './snoozed-inbox';
import {UnreadInbox} from './unread-inbox';

@Component({
  directives: [ArchivedInbox, SnoozedInbox, UnreadInbox],
  template:`
  <ion-header>
    <ion-navbar no-border-bottom>
      <ion-segment primary padding [(ngModel)]="activeSegment" [disabled]="reorderEnabled">
        <ion-segment-button value="snoozed" class="small-seg-btn">
          <ion-icon name="time"></ion-icon>
        </ion-segment-button>
        <ion-segment-button value="inbox" class="small-seg-btn">
          <ion-icon name="mail"></ion-icon>
        </ion-segment-button>
        <ion-segment-button value="archived" class="small-seg-btn">
          <ion-icon name="checkmark-circle"></ion-icon>
        </ion-segment-button>
      </ion-segment>
      <!--<ion-buttons end *ngIf="activeSegment === 'inbox' && ! reorderEnabled">
        <button (click)="toggleReorder(true)">
          <ion-icon name="reorder"></ion-icon>
        </button>
      </ion-buttons>
      <ion-buttons end *ngIf="activeSegment === 'inbox' && reorderEnabled">
        <button (click)="toggleReorder(false)">
          <ion-icon name="close"></ion-icon>
        </button>
      </ion-buttons>-->
    </ion-navbar>
  </ion-header>
  <ion-content [ngSwitch]="activeSegment">
    <snoozed-inbox *ngSwitchCase="'snoozed'">Snoozed</snoozed-inbox>
    <unread-inbox *ngSwitchCase="'inbox'" [reorderEnabled]="reorderEnabled"></unread-inbox>
    <archived-inbox *ngSwitchCase="'archived'"></archived-inbox>
  </ion-content>
  `
})
export class InboxPage{

  private activeSegment: string;
  reorderEnabled: boolean;

  constructor(){
      this.activeSegment = 'inbox';
  }

  toggleReorder(value:boolean){
    this.reorderEnabled = value;
  }
}
