'use strict';
const createHtmlElement = require('create-html-element');

// Capture the whole URL in group 1 to keep string.split() support
const urlRegex = () => (/((?:https?(?::\/\/))(?:www\.)?(?:[a-zA-Z\d-_.]+(?:\.[a-zA-Z\d]{2,})|localhost)(?:(?:[-a-zA-Z\d:%_+.~#!?&//=@]*)(?:[,](?![\s]))*)*)/g);

// Get <a> element as string
const linkify = (href, options) => {
	let linkAttr = options.linkAttr;
	let name = options.elName;
	let baseAttributes = {};
	let text = typeof options.value === 'undefined' ? href : undefined;
	let html = typeof options.value === 'undefined' ? undefined : (typeof options.value === 'function' ? options.value(href) : options.value);

	baseAttributes[linkAttr] = href;

	if (options.hrefFilter && typeof options.hrefFilter === 'function') {
		baseAttributes[linkAttr] = options.hrefFilter(href);
	}

	let attributes = Object.assign({}, options.attributes, baseAttributes);

	return createHtmlElement({ name, attributes, text, html });
}

// Get DOM node from HTML
const domify = html => document.createRange().createContextualFragment(html);

const getAsString = (input, options) => {
	return input.replace(urlRegex(), match => linkify(match, options));
};

const getAsDocumentFragment = (input, options) => {
	return input.split(urlRegex()).reduce((frag, text, index) => {
		if (index % 2) { // URLs are always in odd positions
			frag.appendChild(domify(linkify(text, options)));
		} else if (text.length > 0) {
			frag.appendChild(document.createTextNode(text));
		}

		return frag;
	}, document.createDocumentFragment());
};

module.exports = (input, options) => {
	options = Object.assign({
		attributes: {},
		elName: 'a',
		linkAttr: 'href',
		hrefFilter: null,
		type: 'string'
	}, options);

	if (options.type === 'string') {
		return getAsString(input, options);
	}

	if (options.type === 'dom') {
		return getAsDocumentFragment(input, options);
	}

	throw new Error('The type option must be either `dom` or `string`');
};
