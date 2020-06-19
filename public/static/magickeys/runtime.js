const separator = '≫';
const separatorHtml = `<span class='separator'>${separator}</span>`;

var runtime = window.runtime || (function() {
    var self = {
        conf: {
            lastKeys: "",
            // local part from settings
            blacklistPattern: undefined,
            caseSensitive: false,
            clickablePat: /(https?:\/\/|thunder:\/\/|magnet:)\S+/ig,
          clickableSelector: "*.clickable",
            cursorAtEndOfInput: true,
            defaultSearchEngine: "g",
            defaultVoice: "Daniel",
            enableAutoFocus: true,
            experiment: false,
            focusFirstCandidate: false,
            focusOnSaved: true,
            hintAlign: "center",
            historyMUOrder: true,
            language: undefined,
            lastQuery: "",
            modeAfterYank: "",
            nextLinkRegex: /(\b(next)\b)|下页|下一页|>>|»/i,
            omnibarMaxResults: 10,
            omnibarPosition: "middle",
            omnibarSuggestion: true,
            omnibarSuggestionTimeout: 200,
            omnibarTabsQuery: {},
            pageUrlRegex: [],
            prevLinkRegex: /(\b(prev|previous)\b)|上页|上一页|<<|«/i,
            richHintsForKeystroke: 1000,
            scrollStepSize: 70,
            showModeStatus: false,
            showProxyInStatusBar: false,
            smartPageBoundary: false,
            smoothScroll: true,
            startToShowEmoji: 2,
            stealFocusOnLoad: true,
            tabsThreshold: 9,
            scrollFriction: 0,
            useLocalMarkdownAPI: true
        },
        runtime_handlers: {}
    }, actions = {};
    var callbacks = {};

    self.on = function(message, cb) {
        if (!(message in actions) ) {
            actions[message] = [];
        }
        actions[message].push(cb);
    };

    self.command = function(args, cb) {
        args.id = generateQuickGuid();
        if (!window.frameId && window.innerHeight && window.innerWidth) {
            window.frameId = generateQuickGuid();
        }
        args.windowId = window.frameId;
        if (cb) {
            callbacks[args.id] = cb;
            // request background to hold _sendResponse for a while to send back result
            args.ack = true;
        }
        // _port.postMessage(args);
    };
    self.updateHistory = function(type, cmd) {
        var prop = type + 'History';
        runtime.command({
            action: 'getSettings',
            key: prop
        }, function(response) {
            var list = response.settings[prop] || [];
            var toUpdate = {};
            if (cmd.constructor.name === "Array") {
                toUpdate[prop] = cmd;
                self.command({
                    action: 'updateSettings',
                    settings: toUpdate
                });
            } else if (cmd.length) {
                list = list.filter(function(c) {
                    return c.length && c !== cmd;
                });
                list.unshift(cmd);
                if (list.length > 50) {
                    list.pop();
                }
                toUpdate[prop] = list;
                self.command({
                    action: 'updateSettings',
                    settings: toUpdate
                });
            }
        });
    };

    var getTopURLPromise = new Promise(function(resolve, reject) {
        if (window === top) {
            resolve(window.location.href);
        } else {
            self.command({
                action: "getTopURL"
            }, function(rs) {
                resolve(rs.url);
            });
        }
    });

    self.getTopURL = function(cb) {
        getTopURLPromise.then(function(url) {
            cb(url);
        });
    };

    self.postTopMessage = function(msg) {
        getTopURLPromise.then(function(topUrl) {
            if (window === top) {
                // Firefox use "resource://pdf.js" as window.origin for pdf viewer
                topUrl = window.origin;
            }
            if (topUrl === "null" || new URL(topUrl).origin === "file://") {
                topUrl = "*";
            }
            top.postMessage(msg, topUrl);
        });
    };

    return self;
})();
