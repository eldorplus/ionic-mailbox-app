import {Injectable} from '@angular/core';

export class EmailDataProvider {

  private emails: Email[];

  constructor() {
    this.emails = this.generateInitialEmails();
  }

  private generateInitialEmails() {
    let temp = [];
    temp.push(new Email(false, false, false, null, `stan.hudson@dundermifflin.com`, `Dinner tonight?`, `Wanna grab dinner tonight? I'm free at 7. I'm thinking tacos!`));
    temp.push(new Email(false, false, false, null, `ashley.peters@gmail.com`, `Mom's Birthday`, `When do you want to celebrate Mom's birthday this weekend? Sat works for us.`));
    temp.push(new Email(false, false, false, null, `bill.jazman@gmail.com`, `Tennis Thursday`, `Gents, The match is against Brookfield and starts at 6pm at Nicolet. Dan, Mitch and Stan are subbing this week`));
    temp.push(new Email(false, false, false, null, `jim.darroll@yahoo.com`, `Tennis Subs`, `I can't make it, can anyone sub for me?`));
    temp.push(new Email(false, false, false, null, `ryan.lindowix@gmail.com`, `Tom Delonge`, `Dude, did you hear he quit the band to search for UFOs?`));
    temp.push(new Email(false, false, false, null, `dave.truman@gmail.com`, `Ionic Meet-up`, `How about we shoot for July 19th for the meet-up?`));
    temp.push(new Email(false, false, false, null, `codeworks@codeworks.com`, `Recruiting Emails`, `Sorry, we'll remove you from our distribution list asap`));
    temp.push(new Email(false, false, false, null, `notifications@slickdeals.net`, `Front-Page Notification for 'Golf'`, `This front-page matches your filter for 'Golf'`));
    temp.push(new Email(false, false, false, null, `developer@apple.com`, `See what's next`, `The new beta of Xcode 8 is now available, and includes Swift 3 and SDK that you can use to build apps for the next version of macOS, iOS, watchOS, and tvOS.`));
    temp.push(new Email(false, false, false, null, `notifications@zillow.com`, `Zestimate has decreased. See details`, `The Zestimate for property 123 E. Main St has decreased to $248,715 based on recent sales in area`));
    temp.push(new Email(false, false, false, null, `annalyse.smith@gmail.com`, `Pics of Graham`, `Check out the little man gettin' splashy in the pool`));
    temp.push(new Email(true, false, false, null, `service@paypal.com`, `Receipt for Your Payment to Netflix`, `June 12, 2016 06:54:43 PDT, Transaction ID: 123B4134123`));
    temp.push(new Email(true, false, false, null, `service@paypal.com`, `Receipt for Your Payment to Hulu`, `June 11, 2016 04:18:17 PDT, Transaction ID: EG3BD139111`));
    temp.push(new Email(true, false, false, null, `service@paypal.com`, `Receipt for Your Payment to Spotify`, `June 09, 2016 04:11:19 PDT, Transaction ID: M2QB6194F24`));
    temp.push(new Email(false, false, true, getSnoozedDate(2), `notifications@kohls.com`, `A friendly reminder`, `ACCOUNT SUMMARY: Account ending in 4223 has a balance due: $21.16`));
    temp.push(new Email(false, false, true, getSnoozedDate(3), `ashley.peters@gmail.com`, `July 4th`, `What are you guys planning on doing for the fourth?`));
    return temp;
  }

  getUnreadEmails() {
    return this.emails.filter(email => {
      return !(email.archived || email.deleted || email.snoozed );
    });
  }

  getArchivedEmails() {
    return this.emails.filter(email => {
      return email.archived;
    });
  }

  getSnoozedEmails() {
    return this.emails.filter(email => {
      return email.snoozed;
    });
  }

  deleteEmail(email: Email) {
    email.state = 'deleted';
    email.deleted = true;
    email.snoozed = false;
    email.archived = false;
  }

  archiveEmail(email: Email) {
    email.state = 'archived';
    email.deleted = false;
    email.snoozed = false;
    email.archived = true;
  }

  snoozeEmail(email: Email, snoozedUntil: Date) {
    email.state = 'snoozed';
    email.snoozedUntilDate = snoozedUntil;
    email.deleted = false;
    email.snoozed = true;
    email.archived = false;
  }

  reorder(fromIndex: number, toIndex: number) {
    let temp = this.emails.concat();
    let tempValue = temp[fromIndex];
    temp.splice(fromIndex, 1);
    temp.splice(toIndex, 0,  tempValue);

    this.emails = temp;
    return temp;
  }
}

export class Email{

  public state: string;
  constructor(public archived: boolean,
              public deleted: boolean,
              public snoozed: boolean,
              public snoozedUntilDate: Date,
              public sender: string,
              public subject: string,
              public body: string,
              public favorited:boolean = false) {

    if ( archived ) {
      this.state = 'archived';
    }
    else if ( deleted ) {
      this.state = 'deleted';
    }
    else if ( snoozed ) {
      this.state = 'snoozed';
    }
    else {
      this.state = 'unread';
    }
  }
}

function getSnoozedDate(numDays: number): Date {
  return new Date(Date.now() + numDays * 24 * MILLIS_PER_HOUR);
}

const MILLIS_PER_HOUR = 1000 * 60 * 60;
