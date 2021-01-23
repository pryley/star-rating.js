import { addRemoveClass, createSpanEl, inRange, insertSpanEl, isEmpty, values } from './helpers'
import { supportsPassiveEvents } from 'detect-it'

export class Widget {
    constructor (el, props) { // (HTMLElement, object):void
        this.direction = window.getComputedStyle(el, null).getPropertyValue('direction');
        this.el = el;
        this.events = {
            change: this.onChange.bind(this),
            keydown: this.onKeyDown.bind(this),
            mousedown: this.onPointerDown.bind(this),
            mouseleave: this.onPointerLeave.bind(this),
            mousemove: this.onPointerMove.bind(this),
            reset: this.onReset.bind(this),
            touchend: this.onPointerDown.bind(this),
            touchmove: this.onPointerMove.bind(this),
        };
        this.indexActive = null; // the active span index
        this.indexSelected = null; // the selected span index
        this.props = props;
        this.tick = null;
        this.ticking = false;
        this.values = values(el);
        this.widgetEl = null;
        if (inRange(this.values.length, 1, this.props.maxStars)) {
            this.build();
        } else {
            this.destroy();
        }
    }

    build () { // ():void
        this.destroy();
        this.buildWidget();
        this.changeIndexTo((this.indexSelected = this.selected()), true); // set the initial value
        this.handleEvents('add');
    }

    buildWidget () { // ():void
        const parentEl = insertSpanEl(this.el, false, { class: this.props.classNames.base });
        parentEl.appendChild(this.el);
        parentEl.classList.add(this.props.classNames.base + '--' + this.direction);
        const widgetEl = insertSpanEl(this.el, true, { class: this.props.classNames.base + '--stars' });
        this.values.forEach((item, index) => {
            const el = createSpanEl({ 'data-index': index, 'data-value': item.value });
            if ('function' === typeof this.props.stars) {
                this.props.stars.call(this, el, item, index);
            }
            [].forEach.call(el.children, el => el.style.pointerEvents = 'none');
            widgetEl.innerHTML += el.outerHTML;
        })
        if (this.props.tooltip) {
            widgetEl.setAttribute('role', 'tooltip');
        }
        this.widgetEl = widgetEl;
    }

    changeIndexTo (index, force) { // (int):void
        if (this.indexActive !== index || force) {
            this.widgetEl.childNodes.forEach((el, i) => { // i starts at zero
                addRemoveClass(el, i <= index, this.props.classNames.active);
                addRemoveClass(el, i === this.indexSelected, this.props.classNames.selected);
            });
            if ('function' !== typeof this.props.stars) { // @v3 compat
                this.widgetEl.classList.remove('s' + (10 * (this.indexActive + 1)));
                this.widgetEl.classList.add('s' + (10 * (index + 1)));
            }
            if (this.props.tooltip) {
                const label = index < 0 ? this.props.tooltip : this.values[index].text;
                this.widgetEl.setAttribute('aria-label', label);
            }
            this.indexActive = index;
        }
        this.ticking = false;
    }

    destroy () { // ():void
        this.indexActive = null; // the active span index
        this.indexSelected = this.selected(); // the selected span index
        const wrapEl = this.el.parentNode;
        if (wrapEl.classList.contains(this.props.classNames.base)) {
            this.handleEvents('remove');
            wrapEl.parentNode.replaceChild(this.el, wrapEl);
        }
    }

    eventListener (el, action, events, items) { // (HTMLElement, string, array, object):void
        events.forEach(ev => el[action + 'EventListener'](ev, this.events[ev], items || false));
    }

    handleEvents (action) { // (string):void
        const formEl = this.el.closest('form');
        if (formEl && formEl.tagName === 'FORM') {
            this.eventListener(formEl, action, ['reset']);
        }
        this.eventListener(this.el, action, ['change']); // always trigger the change event, even when SELECT is disabled
        if ('add' === action && this.el.disabled) return;
        this.eventListener(this.el, action, ['keydown']);
        this.eventListener(this.widgetEl, action, ['mousedown', 'mouseleave', 'mousemove', 'touchend', 'touchmove'],
            supportsPassiveEvents ? { passive: false } : false
        );
    }

    indexFromEvent (ev) { // (MouseEvent|TouchEvent):void
        const origin = ev.touches?.[0] || ev.changedTouches?.[0] || ev;
        const el = document.elementFromPoint(origin.clientX, origin.clientY);
        return parseInt(el.dataset.index || -1, 10);
    }

    onChange () { // ():void
        this.changeIndexTo(this.selected(), true);
    }

    onKeyDown (ev) { // (KeyboardEvent):void
        const key = ev.key.slice(5);
        if (!~['Left', 'Right'].indexOf(key)) return;
        let increment = key === 'Left' ? -1 : 1;
        if (this.direction === 'rtl') {
            increment *= -1;
        }
        const maxIndex = this.values.length - 1;
        const minIndex = -1;
        const index = Math.min(Math.max(this.selected() + increment, minIndex), maxIndex);
        this.selectValue(index);
    }

    onPointerDown (ev) { // (MouseEvent|TouchEvent):void
        ev.preventDefault();
        this.el.focus(); // highlight the rating field
        let index = this.indexFromEvent(ev);
        if (this.props.clearable && index === this.indexSelected) {
            index = -1; // remove the value
        }
        this.selectValue(index);
    }

    onPointerLeave (ev) { // (MouseEvent):void
        ev.preventDefault();
        cancelAnimationFrame(this.tick);
        requestAnimationFrame(() => this.changeIndexTo(this.indexSelected));
    }

    onPointerMove (ev) { // (MouseEvent|TouchEvent):void
        ev.preventDefault();
        if (!this.ticking) {
            this.tick = requestAnimationFrame(() => this.changeIndexTo(this.indexFromEvent(ev)));
            this.ticking = true;
        }
    }

    onReset () { // ():void
        const index = this.el.querySelector('[selected]')?.index;
        this.selectValue(this.values.findIndex(val => val.index === index));
    }

    selected () { // ():int
        return this.values.findIndex(val => val.value === +this.el.value); // get the selected span index
    }

    selectValue (index) { // (int):void
        this.el.value = this.values[index]?.value || ''; // first set the value
        this.indexSelected = this.selected(); // get the actual index from the selected value
        this.el.dispatchEvent(new Event('change'));
    }
}
