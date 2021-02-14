/**!
 * Star Rating
 * @version: 4.1.1
 * @author: Paul Ryley (http://geminilabs.io)
 * @url: https://github.com/pryley/star-rating.js
 * @license: MIT
 */

import { defaults } from './defaults'
import { merge, type } from './helpers'
import { Widget } from './widget'

class StarRating {
    constructor (selector, props) { // (HTMLSelectElement|NodeList|string, object):void
        this.destroy = this.destroy.bind(this);
        this.rebuild = this.rebuild.bind(this);
        this.widgets = [];
        this.buildWidgets(selector, props);
    }

    buildWidgets(selector, props) { // (HTMLSelectElement|NodeList|string, object):void
        this.queryElements(selector).forEach(el => {
            const options = merge(defaults, props, JSON.parse(el.getAttribute('data-options')));
            if ('SELECT' === el.tagName && (options.prebuilt || !el.parentNode.classList.contains(options.classNames.base))) {
                this.widgets.push(new Widget(el, options));
            }
        });
    }

    destroy () { // ():void
        this.widgets.forEach(widget => widget.destroy());
    }

    queryElements (selector) { // (HTMLSelectElement|NodeList|string):array
        if ('HTMLSelectElement' === type(selector)) {
            return [selector];
        }
        if ('NodeList' === type(selector)) {
            return [].slice.call(selector);
        }
        if ('String' === type(selector)) {
            return [].slice.call(document.querySelectorAll(selector))
        }
        return []
    }

    rebuild () { // ():void
        this.widgets.forEach(widget => widget.build());
    }
}

export default StarRating
