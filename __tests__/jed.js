import Jed from '../jed'

describe("Property Checks", () => {
    test("should exist", () => {
        expect(Jed).toBeTruthy();
    });

    test("should have a context delimiter as per the gettext spec", () => {
        expect(Jed.context_delimiter).toBe("\u0004");
        expect(Jed.context_delimiter).toBe(String.fromCharCode(4));
    });
});

// Group tests that need similar data
(function () {
    var locale_data = {
        "messages": {
            "": {
                "domain": "messages",
                "lang": "en",
                "plural-forms": "nplurals=2; plural=(n != 1);"
            },
            "test": ["test_translation_output"]
        }
    };

    var locale_data2 = {
        "some_domain": {
            "": {
                "domain": "some_domain",
                "lang": "en",
                "plural-forms": "nplurals=2; plural=(n != 1);"
            },
            "test": ["test_translation_output2"],
            "zero length translation": [""]
        }
    };

    var locale_data3 = {
        "some_domain": {
            "": {
                "domain": "some_domain",
                "lang": "ar",
                "plural-forms": "nplurals=6; plural=(n==0 ? 0 : n==1 ? 1 : n==2 ? 2 : n%100>=3 && n%100<=10 ? 3 : n%100>=11 ? 4 : 5);"
            },
            "test": ["test_translation_output3"],
            "zero length translation": [""]
        }
    };

    var i18n = new Jed({
        "domain": "messages",
        "locale_data": locale_data
    });

    var i18n_2 = new Jed({
        "domain": "some_domain",
        "locale_data": locale_data2
    });

    var i18n_3 = new Jed({
        "domain": "some_domain",
        "locale_data": locale_data3
    });

    // Standard shorthand function
    function _(msgid) {
        return i18n_2.gettext(msgid);
    }

    // Actual tests
    describe("Instantiation", () => {
        test("should exist", () => {
            expect(i18n).toBeTruthy();
            expect(i18n_2).toBeTruthy();
            expect(i18n_3).toBeTruthy();
            expect(_).toBeTruthy();
        });
    });

    describe("Basic", () => {
        test("should translate a key that exists in the translation", () => {
            expect(i18n.gettext('test')).toBe('test_translation_output');
        });

        test("should just pass through strings that aren't translatable", () => {
            expect(i18n.gettext('missing')).toBe('missing');
        });

        test(
            "should translate a key in a locale with plural-forms rules that don't assume n==1 will return 0",
            () => {
                expect(i18n_3.gettext('test')).toBe('test_translation_output3');
            }
        );

        test("should allow you to wrap it as a shorthand function", () => {
            expect(_('test')).toBe('test_translation_output2');
            expect(_('missing')).toBe('missing');
        });

        test(
            "should have identical output for wrapped and non-wrapped instances",
            () => {
                expect(_('test')).toBe(i18n_2.gettext('test'));
                expect(_('missing')).toBe(i18n_2.gettext('missing'));
            }
        );

        test("should not allow you to use domains that don't exist", () => {
            function badCreate() {
                var x = new Jed({
                    "domain": "missing_domain",
                    "locale_data": locale_data
                });
                return x;
            }
            expect(badCreate).toThrow();
        });

        test(
            "should just pass through translations that are empty strings",
            () => {
                expect(_('zero length translation')).toBe('zero length translation');
            }
        );

        test(
            "should call the callback function (if given) when a key is missing",
            () => {
                var callbackCalled;
                function missingKeyCallback(key) {
                    callbackCalled = true;
                }

                callbackCalled = false;
                var jedWithCallback = new Jed({
                    "missing_key_callback": missingKeyCallback
                });
                jedWithCallback.gettext('missing key');
                expect(callbackCalled).toBe(true);

                callbackCalled = false;
                var jedWithoutCallback = new Jed({});
                jedWithoutCallback.gettext('missing key');
                expect(callbackCalled).toBe(false);
            }
        );
    });
})();

(function () {
    var locale_data = {
        "messages_1": {
            "": {
                "domain": "messages_1",
                "lang": "en",
                "plural-forms": "nplurals=2; plural=(n != 1);"
            },
            "test": ["test_1"],
            "test singular": ["test_1 singular", "test_1 plural"],
            "context\u0004test": ["test_1 context"],
            "context\u0004test singular": ["test_1 context singular", "test_1 context plural"]
        },
        "messages_2": {
            "": {
                "domain": "messages_2",
                "lang": "en",
                "plural-forms": "nplurals=2; plural=(n != 1);"
            },
            "test": ["test_2"],
            "test singular": ["test_2 singular", "test_2 plural"],
            "context\u0004test": ["test_2 context"],
            "context\u0004test singular": ["test_2 context singular", "test_2 context plural"]
        }
    };

    describe("Domain", () => {
        var i18n1 = new Jed({
            domain: "messages_1",
            locale_data: locale_data
        });

        var i18n_2 = new Jed({
            domain: "messages_2",
            locale_data: locale_data
        });

        // No default domain
        var i18n_3 = new Jed({
            locale_data: locale_data
        });

        test("should use the correct domain when there are multiple", () => {
            expect(i18n1.gettext('test')).toBe('test_1');
            expect(i18n_2.gettext('test')).toBe('test_2');
        });

        test("should still pass through non-existent keys", () => {
            expect(i18n1.gettext('nope')).toBe('nope');
            expect(i18n_2.gettext('nope again')).toBe('nope again');
        });

        test("should reveal the current domain on any instance", () => {
            expect(i18n1.textdomain()).toBe('messages_1');
            expect(i18n_2.textdomain()).toBe('messages_2');
        });

        test("should use `messages` as the default domain if none given", () => {
            expect(i18n_3.textdomain()).toBe('messages');
        });

        test("should allow on the fly domain switching", () => {
            // Switch these up
            i18n1.textdomain('messages_2');
            i18n_2.textdomain('messages_1');

            expect(i18n1.gettext('test')).toBe('test_2');
            expect(i18n_2.gettext('test')).toBe('test_1');
            expect(i18n1.textdomain()).toBe('messages_2');
            expect(i18n_2.textdomain()).toBe('messages_1');
        });

        describe("#dgettext", () => {
            test("should have the dgettext function", () => {
                expect(i18n_3.dgettext).toBeTruthy();
            });

            test("should allow you to call the domain on the fly", () => {
                expect(i18n_3.dgettext('messages_1', 'test')).toBe('test_1');
                expect(i18n_3.dgettext('messages_2', 'test')).toBe('test_2');
            });

            test("should pass through non-existent keys", () => {
                expect(i18n_3.dgettext('messages_1', 'nope')).toBe('nope');
                expect(i18n_3.dgettext('messages_2', 'nope again')).toBe('nope again');
            });
        });

        describe("#dcgettext", () => {
            var i18n_4 = new Jed({
                locale_data: locale_data
            });

            test("should have the dcgettext function", () => {
                expect(i18n_4.dcgettext).toBeTruthy();
            });

            test("should ignore categories altogether", () => {
                expect(i18n_4.dcgettext('messages_1', 'test', 'A_CATEGORY')).toBe('test_1');
            });
        });
    });

    describe("Pluralization", () => {
        var locale_data1 = {
            "plural_test": {
                "": {
                    "domain": "plural_test",
                    "lang": "en",
                    "plural-forms": "nplurals=2; plural=(n != 1);"
                },
                "test singular": ["test_1"],
                "test plural %1$d": ["test_1_singular %1$d", "test_1_plural %1$d"],
                "context\u0004test context": ["test_1context"],
                "test2": ["test_2"],
                "zero length translation": [""],
                "context\u0004test2": ["test_2context"],
                "Not translated plural": ["asdf", "asdf"], // this should never hit, since it's msgid2
                "context\u0004context plural %1$d": ["context_plural_1 singular %1$d", "context_plural_1 plural %1$d"]
            }
        };

        var locale_data2 = {
            "plural_test2": {
                "": {
                    "domain": "plural_test2",
                    "lang": "sl",
                    // actual Slovenian pluralization rules
                    "plural_forms": "nplurals=4; plural=(n==1 ? 0 : n%10==2 ? 1 : n%10==3 || n%10==4 ? 2 : 3);"
                },
                "Singular": ["Numerus 0", "Numerus 1", "Numerus 2", "Numerus 3"]
            }
        };

        var i18n = new Jed({
            domain: "plural_test",
            locale_data: locale_data1
        });

        var i18n_2 = new Jed({
            domain: "plural_test2",
            locale_data: locale_data2
        });

        describe("#ngettext", () => {

            test("should have a ngettext function", () => {
                expect(i18n.ngettext).toBeTruthy();
            });

            test("should choose the correct pluralization translation", () => {
                expect(i18n.ngettext('test plural %1$d', 'test plural %1$d', 1)).toBe('test_1_singular %1$d');
                expect(i18n.ngettext('test plural %1$d', 'test plural %1$d', 2)).toBe('test_1_plural %1$d');
                expect(i18n.ngettext('test plural %1$d', 'test plural %1$d', 0)).toBe('test_1_plural %1$d');
            });

            test("should still pass through on plurals", () => {
                expect(i18n.ngettext('Not translated', 'Not translated plural', 1)).toBe('Not translated');
                expect(i18n.ngettext('Not translated', 'Not translated plural', 2)).toBe('Not translated plural');
                expect(i18n.ngettext('Not translated', 'Not translated plural', 0)).toBe('Not translated plural');
                expect(i18n_2.ngettext('Not translated', 'Not translated plural', 3)).toBe('Not translated plural');
            });

            test("should be able to parse complex pluralization rules", () => {
                var strings = ['Singular', 'Plural'];
                for (var i = 0; i <= 40; i++) {
                    var translation = i18n_2.ngettext(strings[0], strings[1], i);
                    var plural = ((i == 1) ? 0 :
                        (i % 10 == 2) ? 1 :
                            (i % 10 == 3 || i % 10 == 4) ? 2 : 3);

                    expect(translation).toBe('Numerus ' + plural);
                }
            });
        });

        var locale_data_multi = {
            "messages_3": {
                "": {
                    "domain": "messages_3",
                    "lang": "en",
                    "plural-forms": "nplurals=2; plural=(n != 1);"
                },
                "test": ["test_1"],
                "test singular": ["test_1 singular", "test_1 plural"],
                "context\u0004test": ["test_1 context"],
                "context\u0004test singular": ["test_1 context singular", "test_1 context plural"]
            },
            "messages_4": {
                "": {
                    "domain": "messages_4",
                    "lang": "en",
                    "plural-forms": "nplurals=2; plural=(n != 1);"
                },
                "test": ["test_2"],
                "test singular": ["test_2 singular", "test_2 plural"],
                "context\u0004test": ["test_2 context"],
                "context\u0004test singular": ["test_2 context singular", "test_2 context plural"]
            }
        };

        describe("#dngettext", () => {
            var i18n = new Jed({
                locale_data: locale_data_multi
            });

            test("should have a dngettext function", () => {
                expect(i18n.dngettext).toBeTruthy();
            });

            test("should pluralize correctly, based on domain rules", () => {
                expect(i18n.dngettext('messages_3', 'test singular', 'test plural', 1)).toBe('test_1 singular');
                expect(i18n.dngettext('messages_3', 'test singular', 'test plural', 2)).toBe('test_1 plural');
                expect(i18n.dngettext('messages_3', 'test singular', 'test plural', 0)).toBe('test_1 plural');

                expect(i18n.dngettext('messages_4', 'test singular', 'test plural', 1)).toBe('test_2 singular');
                expect(i18n.dngettext('messages_4', 'test singular', 'test plural', 2)).toBe('test_2 plural');
                expect(i18n.dngettext('messages_4', 'test singular', 'test plural', 0)).toBe('test_2 plural');
            });

            test(
                "should passthrough non-found keys regardless of pluralization addition",
                () => {
                    expect(i18n.dngettext('messages_3', 'Not translated', 'Not translated plural', 1)).toBe('Not translated');
                    expect(i18n.dngettext('messages_3', 'Not translated', 'Not translated plural', 2)).toBe('Not translated plural');
                    expect(i18n.dngettext('messages_3', 'Not translated', 'Not translated plural', 0)).toBe('Not translated plural');

                    expect(i18n.dngettext('messages_4', 'Not translated', 'Not translated plural', 1)).toBe('Not translated');
                    expect(i18n.dngettext('messages_4', 'Not translated', 'Not translated plural', 2)).toBe('Not translated plural');
                    expect(i18n.dngettext('messages_4', 'Not translated', 'Not translated plural', 0)).toBe('Not translated plural');
                }
            );
        });

        describe("#dcngettext", () => {
            var i18n = new Jed({
                locale_data: locale_data_multi
            });

            test("should more or less ignore the category", () => {
                expect(i18n.dcngettext('messages_3', 'test singular', 'test plural', 1, 'LC_MESSAGES')).toBe('test_1 singular');
                expect(i18n.dcngettext('messages_3', 'test singular', 'test plural', 2, 'LC_MESSAGES')).toBe('test_1 plural');
                expect(i18n.dcngettext('messages_3', 'test singular', 'test plural', 0, 'LC_MESSAGES')).toBe('test_1 plural');

                expect(i18n.dcngettext('messages_4', 'test singular', 'test plural', 1, 'LC_MESSAGES')).toBe('test_2 singular');
                expect(i18n.dcngettext('messages_4', 'test singular', 'test plural', 2, 'LC_MESSAGES')).toBe('test_2 plural');
                expect(i18n.dcngettext('messages_4', 'test singular', 'test plural', 0, 'LC_MESSAGES')).toBe('test_2 plural');

                expect(i18n.dcngettext('messages_3', 'Not translated', 'Not translated plural', 1, 'LC_MESSAGES')).toBe('Not translated');
                expect(i18n.dcngettext('messages_3', 'Not translated', 'Not translated plural', 2, 'LC_MESSAGES')).toBe('Not translated plural');
                expect(i18n.dcngettext('messages_3', 'Not translated', 'Not translated plural', 0, 'LC_MESSAGES')).toBe('Not translated plural');

                expect(i18n.dcngettext('messages_4', 'Not translated', 'Not translated plural', 1, 'LC_MESSAGES')).toBe('Not translated');
                expect(i18n.dcngettext('messages_4', 'Not translated', 'Not translated plural', 2, 'LC_MESSAGES')).toBe('Not translated plural');
                expect(i18n.dcngettext('messages_4', 'Not translated', 'Not translated plural', 0, 'LC_MESSAGES')).toBe('Not translated plural');
            });
        });

        describe("#pgettext", () => {
            var locale_data_w_context = {
                "context_test": {
                    "": {
                        "domain": "context_test",
                        "lang": "en",
                        "plural-forms": "nplurals=2; plural=(n != 1);"
                    },
                    "test singular": ["test_1"],
                    "test plural %1$d": ["test_1_singular %1$d", "test_1_plural %1$d"],
                    "context\u0004test context": ["test_1context"],
                    "test2": ["test_2"],
                    "zero length translation": [""],
                    "context\u0004test2": ["test_2context"],
                    "context\u0004context plural %1$d": ["context_plural_1 singular %1$d", "context_plural_1 plural %1$d"]
                }
            };

            var i18n = new Jed({
                domain: "context_test",
                locale_data: locale_data_w_context
            });

            test("should expose the pgettext function", () => {
                expect(i18n.pgettext).toBeTruthy();
            });

            test(
                "should accept a context and look up a new key using the context_glue",
                () => {
                    expect(i18n.pgettext('context', 'test context')).toBe('test_1context');
                }
            );

            test("should still pass through missing keys", () => {
                expect(i18n.pgettext('context', 'Not translated')).toBe('Not translated');
            });

            test(
                "should make sure same msgid returns diff results w/ context when appropriate",
                () => {
                    expect(i18n.gettext('test2')).toBe('test_2');
                    expect(i18n.pgettext('context', 'test2')).toBe('test_2context');
                }
            );
        });

        describe("#dpgettext", () => {
            var i18n = new Jed({
                locale_data: locale_data_multi
            });

            test("should have a dpgettext function", () => {
                expect(i18n.dpgettext).toBeTruthy();
            });

            test("should use the domain and the context simultaneously", () => {
                expect(i18n.dpgettext('messages_3', 'context', 'test')).toBe('test_1 context');
                expect(i18n.dpgettext('messages_4', 'context', 'test')).toBe('test_2 context');
            });

            test(
                "should pass through if either the domain, the key or the context isn't found",
                () => {
                    expect(i18n.dpgettext('messages_3', 'context', 'Not translated')).toBe('Not translated');
                    expect(i18n.dpgettext('messages_4', 'context', 'Not translated')).toBe('Not translated');
                }
            );

        });

        describe("#dcpgettext", () => {
            var i18n = new Jed({
                locale_data: locale_data_multi
            });

            test("should have a dcpgettext function", () => {
                expect(i18n.dcpgettext).toBeTruthy();
            });

            test(
                "should use the domain and the context simultaneously - ignore the category",
                () => {
                    expect(i18n.dcpgettext('messages_3', 'context', 'test', 'LC_MESSAGES')).toBe('test_1 context');
                    expect(i18n.dcpgettext('messages_4', 'context', 'test', 'LC_MESSAGES')).toBe('test_2 context');
                }
            );

            test(
                "should pass through if either the domain, the key or the context isn't found",
                () => {
                    expect(i18n.dcpgettext('messages_3', 'context', 'Not translated', 'LC_MESSAGES')).toBe('Not translated');
                    expect(i18n.dcpgettext('messages_4', 'context', 'Not translated', 'LC_MESSAGES')).toBe('Not translated');
                }
            );

        });

        describe("#npgettext", () => {
            var locale_data_w_context = {
                "context_plural_test": {
                    "": {
                        "domain": "context_plural_test",
                        "lang": "en",
                        "plural-forms": "nplurals=2; plural=(n != 1);"
                    },
                    "test singular": ["test_1"],
                    "test plural %1$d": ["test_1_singular %1$d", "test_1_plural %1$d"],
                    "context\u0004test context": ["test_1context"],
                    "test2": ["test_2"],
                    "zero length translation": [""],
                    "context\u0004test2": ["test_2context"],
                    "context\u0004context plural %1$d": ["context_plural_1 singular %1$d", "context_plural_1 plural %1$d"]
                }
            };

            var i18n = new Jed({
                domain: "context_plural_test",
                locale_data: locale_data_w_context
            });

            test("should have a dcpgettext function", () => {
                expect(i18n.dcpgettext).toBeTruthy();
            });

            test("should handle plurals at the same time as contexts", () => {
                expect(i18n.npgettext('context', 'context plural %1$d', 'plural %1$d', 1)).toBe('context_plural_1 singular %1$d');
                expect(i18n.npgettext('context', 'context plural %1$d', 'plural %1$d', 2)).toBe('context_plural_1 plural %1$d');
                expect(i18n.npgettext('context', 'context plural %1$d', 'plural %1$d', 0)).toBe('context_plural_1 plural %1$d');
            });

            test("should just pass through on not-found cases", () => {
                expect(i18n.npgettext('context', 'Not translated', 'Not translated plural', 1)).toBe('Not translated');
                expect(i18n.npgettext('context', 'Not translated', 'Not translated plural', 2)).toBe('Not translated plural');
                expect(i18n.npgettext('context', 'Not translated', 'Not translated plural', 0)).toBe('Not translated plural');
            });
        });

        describe("#dnpgettext", () => {
            var i18n = new Jed({
                locale_data: locale_data_multi
            });

            test("should have a dnpgettext function", () => {
                expect(i18n.dnpgettext).toBeTruthy();
            });

            test(
                "should be able to do a domain, context, and pluralization lookup all at once",
                () => {
                    expect(i18n.dnpgettext('messages_3', 'context', 'test singular', 'test plural', 1)).toBe('test_1 context singular');
                    expect(i18n.dnpgettext('messages_3', 'context', 'test singular', 'test plural', 2)).toBe('test_1 context plural');
                    expect(i18n.dnpgettext('messages_3', 'context', 'test singular', 'test plural', 0)).toBe('test_1 context plural');

                    expect(i18n.dnpgettext('messages_4', 'context', 'test singular', 'test plural', 1)).toBe('test_2 context singular');
                    expect(i18n.dnpgettext('messages_4', 'context', 'test singular', 'test plural', 2)).toBe('test_2 context plural');
                    expect(i18n.dnpgettext('messages_4', 'context', 'test singular', 'test plural', 0)).toBe('test_2 context plural');
                }
            );

            test(
                "should pass through if everything doesn't point towards a key",
                () => {
                    expect(i18n.dnpgettext('messages_3', 'context', 'Not translated', 'Not translated plural', 1)).toBe('Not translated');
                    expect(i18n.dnpgettext('messages_3', 'context', 'Not translated', 'Not translated plural', 2)).toBe('Not translated plural');
                    expect(i18n.dnpgettext('messages_3', 'context', 'Not translated', 'Not translated plural', 0)).toBe('Not translated plural');

                    expect(i18n.dnpgettext('messages_4', 'context', 'Not translated', 'Not translated plural', 1)).toBe('Not translated');
                    expect(i18n.dnpgettext('messages_4', 'context', 'Not translated', 'Not translated plural', 2)).toBe('Not translated plural');
                    expect(i18n.dnpgettext('messages_4', 'context', 'Not translated', 'Not translated plural', 0)).toBe('Not translated plural');
                }
            );
        });

        describe("#dcnpgettext", () => {
            var i18n = new Jed({
                locale_data: locale_data_multi
            });

            test("should have a dcnpgettext function", () => {
                expect(i18n.dcnpgettext).toBeTruthy();
            });

            test(
                "should be able to do a domain, context, and pluralization lookup all at once - ignore category",
                () => {
                    expect(i18n.dcnpgettext('messages_3', 'context', 'test singular', 'test plural', 1, "LC_MESSAGES")).toBe('test_1 context singular');
                    expect(i18n.dcnpgettext('messages_3', 'context', 'test singular', 'test plural', 2, "LC_MESSAGES")).toBe('test_1 context plural');
                    expect(i18n.dcnpgettext('messages_3', 'context', 'test singular', 'test plural', 0, "LC_MESSAGES")).toBe('test_1 context plural');

                    expect(i18n.dcnpgettext('messages_4', 'context', 'test singular', 'test plural', 1, "LC_MESSAGES")).toBe('test_2 context singular');
                    expect(i18n.dcnpgettext('messages_4', 'context', 'test singular', 'test plural', 2, "LC_MESSAGES")).toBe('test_2 context plural');
                    expect(i18n.dcnpgettext('messages_4', 'context', 'test singular', 'test plural', 0, "LC_MESSAGES")).toBe('test_2 context plural');
                }
            );

            test(
                "should pass through if everything doesn't point towards a key",
                () => {
                    expect(i18n.dcnpgettext('messages_3', 'context', 'Not translated', 'Not translated plural', 1, "LC_MESSAGES")).toBe('Not translated');
                    expect(i18n.dcnpgettext('messages_3', 'context', 'Not translated', 'Not translated plural', 2, "LC_MESSAGES")).toBe('Not translated plural');
                    expect(i18n.dcnpgettext('messages_3', 'context', 'Not translated', 'Not translated plural', 0, "LC_MESSAGES")).toBe('Not translated plural');

                    expect(i18n.dcnpgettext('messages_4', 'context', 'Not translated', 'Not translated plural', 1, "LC_MESSAGES")).toBe('Not translated');
                    expect(i18n.dcnpgettext('messages_4', 'context', 'Not translated', 'Not translated plural', 2, "LC_MESSAGES")).toBe('Not translated plural');
                    expect(i18n.dcnpgettext('messages_4', 'context', 'Not translated', 'Not translated plural', 0, "LC_MESSAGES")).toBe('Not translated plural');
                }
            );
        });
    });

    describe("Plural Forms Parsing", () => {
        // This is the method from the original gettext.js that uses new Function
        function evalParse(plural_forms) {
            var pf_re = new RegExp('^(\\s*nplurals\\s*=\\s*[0-9]+\\s*;\\s*plural\\s*=\\s*(?:\\s|[-\\?\\|&=!<>+*/%:;a-zA-Z0-9_\(\)])+)', 'm');
            if (pf_re.test(plural_forms)) {
                var pf = plural_forms;
                if (! /;\s*$/.test(pf)) pf = pf.concat(';');

                var code = 'var plural; var nplurals; ' + pf + ' return { "nplural" : nplurals, "plural" : (plural === true ? 1 : plural ? plural : 0) };';
                return (new Function("n", code));
            } else {
                throw new Error("Syntax error in language file. Plural-Forms header is invalid [" + plural_forms + "]");
            }
        }

        // http://translate.sourceforge.net/wiki/l10n/pluralforms
        test(
            "should have the same result as doing an eval on the expression for all known plural-forms.",
            () => {
                var pfs = ["nplurals=2; plural=(n > 1)", "nplurals=2; plural=(n != 1)", "nplurals=6; plural= n==0 ? 0 : n==1 ? 1 : n==2 ? 2 : n%100>=3 && n%100<=10 ? 3 : n%100>=11 ? 4 : 5;", "nplurals=1; plural=0", "nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2)", "nplurals=3; plural=(n==1) ? 0 : (n>=2 && n<=4) ? 1 : 2", "nplurals=3; plural=n==1 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2", "nplurals=4; plural= (n==1) ? 0 : (n==2) ? 1 : (n != 8 && n != 11) ? 2 : 3", "nplurals=2; plural=n > 1", "nplurals=5; plural=n==1 ? 0 : n==2 ? 1 : n<7 ? 2 : n<11 ? 3 : 4", "nplurals=4; plural=(n==1 || n==11) ? 0 : (n==2 || n==12) ? 1 : (n > 2 && n < 20) ? 2 : 3", "nplurals=2; plural= (n > 1)", "nplurals=2; plural=(n%10!=1 || n%100==11)", "nplurals=2; plural=n!=0", "nplurals=2; plural=(n!=1)", "nplurals=2; plural=(n!= 1)", "nplurals=4; plural= (n==1) ? 0 : (n==2) ? 1 : (n == 3) ? 2 : 3", "nplurals=2; plural=n>1;", "nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && (n%100<10 || n%100>=20) ? 1 : 2)", "nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n != 0 ? 1 : 2)", "nplurals=2; plural= n==1 || n%10==1 ? 0 : 1", "nplurals=3; plural=(n==0 ? 0 : n==1 ? 1 : 2)", "nplurals=4; plural=(n==1 ? 0 : n==0 || ( n%100>1 && n%100<11) ? 1 : (n%100>10 && n%100<20 ) ? 2 : 3)", "nplurals=3; plural=(n==1 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2)", "nplurals=2; plural=(n!=1);", "nplurals=3; plural=(n==1 ? 0 : (n==0 || (n%100 > 0 && n%100 < 20)) ? 1 : 2);", "nplurals=4; plural=(n%100==1 ? 1 : n%100==2 ? 2 : n%100==3 || n%100==4 ? 3 : 0)", "nplurals=2; plural=n != 1", "nplurals=2; plural=(n>1)", "nplurals=1; plural=0;"],
                    pf, pfc, pfe, pfi, i;
                for (pfi = 0; pfi < pfs.length; pfi++) {
                    pf = "" + pfs[pfi];
                    for (i = 0; i < 106; i++) {
                        pfc = Jed.PF.compile("" + pf)(i);
                        pfe = evalParse("" + pf)(i).plural;
                        if (pfc !== pfe) {
                            throw new Error('expected ' + pfe + ' but got ' + pfc);
                        }
                    }
                }
            }
        );

    });

    describe("Chainable API", () => {
        var locale_data_w_context = {
            "context_sprintf_test": {
                "": {
                    "domain": "context_sprintf_test",
                    "lang": "en",
                    "plural-forms": "nplurals=2; plural=(n != 1);"
                },
                "test singular": ["test_1"],
                "test plural %1$d": ["test_1_singular %1$d", "test_1_plural %1$d"],
                "context\u0004test context": ["test_1context"],
                "test2": ["test_2"],
                "zero length translation": [""],
                "context\u0004test2": ["test_2context"],
                "context\u0004context plural %1$d": ["context_plural_1 singular %1$d", "context_plural_1 plural %1$d"]
            },
            "other_domain": {
                "": {
                    "domain": "other_domain",
                    "lang": "en",
                    "plural-forms": "nplurals=2; plural=(n != 1);"
                },
                "test other_domain singular": ["other domain test 1"],
                "context\u0004context other plural %1$d": ["context_plural_1 singular %1$d", "context_plural_1 plural %1$d"]
            }
        };
        var i18n = new Jed({
            "locale_data": locale_data_w_context,
            "domain": "context_sprintf_test"
        });

        test("should handle a simple gettext passthrough", () => {
            expect(i18n.translate('test singular').fetch()).toBe('test_1');
        });

        test("should handle changing domains", () => {
            expect(i18n.translate('test other_domain singular').onDomain('other_domain').fetch()).toBe('other domain test 1');
        });

        test("should allow you to add plural information in the chain.", () => {
            expect(i18n.translate("test plural %1$d").ifPlural(5, "dont matta").fetch()).toBe("test_1_plural %1$d");
        });

        test(
            "should take in a sprintf set of args (as array) on the plural lookup",
            () => {
                expect(i18n.translate("test plural %1$d").ifPlural(5, "dont matta").fetch([5])).toBe("test_1_plural 5");
                expect(i18n.translate("test plural %1$d %2$d").ifPlural(5, "dont matta %1$d %2$d").fetch([5, 6])).toBe("dont matta 5 6");
                expect(i18n.translate("test plural %1$d %2$d").ifPlural(1, "dont matta %1$d %2$d").fetch([1, 6])).toBe("test plural 1 6");
            }
        );

        test(
            "should take in a sprintf set of args (as args) on the plural lookup",
            () => {
                expect(i18n.translate("test plural %1$d %2$d").ifPlural(5, "dont matta %1$d %2$d").fetch(5, 6)).toBe("dont matta 5 6");
                expect(i18n.translate("test plural %1$d %2$d").ifPlural(1, "dont matta %1$d %2$d").fetch(1, 6)).toBe("test plural 1 6");
            }
        );

        test("should handle context information.", () => {
            expect(i18n.translate('test context').withContext('context').fetch()).toBe('test_1context');
        });

        test("should be able to do all at the same time.", () => {
            expect(i18n.translate("context other plural %1$d").withContext('context').onDomain('other_domain').ifPlural(5, "ignored %1$d").fetch(5)).toBe("context_plural_1 plural 5");
            expect(i18n.translate("context other plural %1$d").withContext('context').onDomain('other_domain').ifPlural(1, "ignored %1$d").fetch(1)).toBe("context_plural_1 singular 1");
        });

    });

    describe("Sprintf", () => {
        var locale_data_w_context = {
            "context_sprintf_test": {
                "": {
                    "domain": "context_sprintf_test",
                    "lang": "en",
                    "plural-forms": "nplurals=2; plural=(n != 1);"
                },
                "test singular": ["test_1"],
                "test plural %1$d": ["test_1_singular %1$d", "test_1_plural %1$d"],
                "context\u0004test context": ["test_1context"],
                "test2": ["test_2"],
                "zero length translation": [""],
                "context\u0004test2": ["test_2context"],
                "context\u0004context plural %1$d": ["context_plural_1 singular %1$d", "context_plural_1 plural %1$d"]
            }
        };

        var i18n = new Jed({
            "locale_data": locale_data_w_context,
            "domain": "context_sprintf_test"
        });


        test("should take multiple types of arrays as input", () => {
            var strings = {
                "blah": "blah",
                "thing%1$sbob": "thing[one]bob",
                "thing%1$s%2$sbob": "thing[one][two]bob",
                "thing%1$sasdf%2$sasdf": "thing[one]asdf[two]asdf",
                //"%1$s%2$s%3$s": "[one][two]",
                "tom%1$saDick": "tom[one]aDick"
            };
            var args = ["[one]", "[two]"];

            for (var i in strings) {
                expect(Jed.sprintf(i, args)).toBe(strings[i]);
                expect(i18n.sprintf(i, args)).toBe(strings[i]);
            }
        });



        test("should accept a single string instead of an array", () => {
            // test using scalar rather than array
            var strings = {
                "blah": "blah",
                "": "",
                "%%": "%",
                "tom%%dick": "tom%dick",
                "thing%1$sbob": "thing[one]bob",
                // "thing%1$s%2$sbob": "thing[one]bob",
                //"thing%1$sasdf%2$sasdf": "thing[one]asdfasdf",
                //"%1$s%2$s%3$s": "[one]"
            };
            var arg = "[one]";

            for (var i in strings) {
                expect(Jed.sprintf(i, arg)).toBe(strings[i]);
                expect(i18n.sprintf(i, arg)).toBe(strings[i]);
            }
        });
    });
})();
