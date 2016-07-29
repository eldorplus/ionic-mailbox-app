
import {PanGestureController} from './utils/gestures/pan-gesture';
import {PinchGestureController} from './utils/gestures/pinch-gesture';
import {PressGestureController} from './utils/gestures/press-gesture';
import {RotateGestureController} from './utils/gestures/rotate-gesture';
import {SwipeGestureController} from './utils/gestures/swipe-gesture';
import {TapGestureController} from './utils/gestures/tap-gesture';

import {HammerFactory} from './utils/gestures/hammer-factory';

import {EmailDataProvider} from './pages/inbox/email-data-provider';

import {SnoozeViewController} from './pages/snooze/snooze-view-controller';

import {ScrollDisabler} from './utils/scroll-disabler';
import {WindowProvider} from './utils/window-provider';

export function getProviders(){
    let providers = [];

    providers.push(EmailDataProvider);

    /* Gesture Recognizers */
    providers.push(PanGestureController);
    providers.push(PinchGestureController);
    providers.push(PressGestureController);
    providers.push(RotateGestureController);
    providers.push(SwipeGestureController);
    providers.push(TapGestureController);

    providers.push(HammerFactory);

    providers.push(ScrollDisabler);
    providers.push(WindowProvider);

    providers.push(SnoozeViewController);

    return providers;
}
