
import {
    _getProvider as e,
    _registerComponent as t,
    registerVersion as n,
    getApp as i,
    SDK_VERSION as r
} from "/static/webapp/assets/vendor/firebase/app.js";

const s = {
    byteToCharMap_: null,
    charToByteMap_: null,
    byteToCharMapWebSafe_: null,
    charToByteMapWebSafe_: null,
    ENCODED_VALS_BASE: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
    get ENCODED_VALS() {
        return this.ENCODED_VALS_BASE + "+/="
    },
    get ENCODED_VALS_WEBSAFE() {
        return this.ENCODED_VALS_BASE + "-_."
    },
    HAS_NATIVE_SUPPORT: "function" == typeof atob,
    encodeByteArray(e, t) {
        if (!Array.isArray(e)) throw Error("encodeByteArray takes an array as a parameter");
        this.init_();
        const n = t ? this.byteToCharMapWebSafe_ : this.byteToCharMap_, i = [];
        for (let t = 0; t < e.length; t += 3) {
            const r = e[t], s = t + 1 < e.length, o = s ? e[t + 1] : 0, a = t + 2 < e.length, c = a ? e[t + 2] : 0,
                u = r >> 2, d = (3 & r) << 4 | o >> 4;
            let l = (15 & o) << 2 | c >> 6, h = 63 & c;
            a || (h = 64, s || (l = 64)), i.push(n[u], n[d], n[l], n[h])
        }
        return i.join("")
    },
    encodeString(e, t) {
        return this.HAS_NATIVE_SUPPORT && !t ? btoa(e) : this.encodeByteArray(function (e) {
            const t = [];
            let n = 0;
            for (let i = 0; i < e.length; i++) {
                let r = e.charCodeAt(i);
                r < 128 ? t[n++] = r : r < 2048 ? (t[n++] = r >> 6 | 192, t[n++] = 63 & r | 128) : 55296 == (64512 & r) && i + 1 < e.length && 56320 == (64512 & e.charCodeAt(i + 1)) ? (r = 65536 + ((1023 & r) << 10) + (1023 & e.charCodeAt(++i)), t[n++] = r >> 18 | 240, t[n++] = r >> 12 & 63 | 128, t[n++] = r >> 6 & 63 | 128, t[n++] = 63 & r | 128) : (t[n++] = r >> 12 | 224, t[n++] = r >> 6 & 63 | 128, t[n++] = 63 & r | 128)
            }
            return t
        }(e), t)
    },
    decodeString(e, t) {
        return this.HAS_NATIVE_SUPPORT && !t ? atob(e) : function (e) {
            const t = [];
            let n = 0, i = 0;
            for (; n < e.length;) {
                const r = e[n++];
                if (r < 128) t[i++] = String.fromCharCode(r); else if (r > 191 && r < 224) {
                    const s = e[n++];
                    t[i++] = String.fromCharCode((31 & r) << 6 | 63 & s)
                } else if (r > 239 && r < 365) {
                    const s = ((7 & r) << 18 | (63 & e[n++]) << 12 | (63 & e[n++]) << 6 | 63 & e[n++]) - 65536;
                    t[i++] = String.fromCharCode(55296 + (s >> 10)), t[i++] = String.fromCharCode(56320 + (1023 & s))
                } else {
                    const s = e[n++], o = e[n++];
                    t[i++] = String.fromCharCode((15 & r) << 12 | (63 & s) << 6 | 63 & o)
                }
            }
            return t.join("")
        }(this.decodeStringToByteArray(e, t))
    },
    decodeStringToByteArray(e, t) {
        this.init_();
        const n = t ? this.charToByteMapWebSafe_ : this.charToByteMap_, i = [];
        for (let t = 0; t < e.length;) {
            const r = n[e.charAt(t++)], s = t < e.length ? n[e.charAt(t)] : 0;
            ++t;
            const a = t < e.length ? n[e.charAt(t)] : 64;
            ++t;
            const c = t < e.length ? n[e.charAt(t)] : 64;
            if (++t, null == r || null == s || null == a || null == c) throw new o;
            const u = r << 2 | s >> 4;
            if (i.push(u), 64 !== a) {
                const e = s << 4 & 240 | a >> 2;
                if (i.push(e), 64 !== c) {
                    const e = a << 6 & 192 | c;
                    i.push(e)
                }
            }
        }
        return i
    },
    init_() {
        if (!this.byteToCharMap_) {
            this.byteToCharMap_ = {}, this.charToByteMap_ = {}, this.byteToCharMapWebSafe_ = {}, this.charToByteMapWebSafe_ = {};
            for (let e = 0; e < this.ENCODED_VALS.length; e++) this.byteToCharMap_[e] = this.ENCODED_VALS.charAt(e), this.charToByteMap_[this.byteToCharMap_[e]] = e, this.byteToCharMapWebSafe_[e] = this.ENCODED_VALS_WEBSAFE.charAt(e), this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[e]] = e, e >= this.ENCODED_VALS_BASE.length && (this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(e)] = e, this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(e)] = e)
        }
    }
};

class o extends Error {
    constructor() {
        super(...arguments), this.name = "DecodeBase64StringError"
    }
}

const a = function (e) {
    try {
        return s.decodeString(e, !0)
    } catch (e) {
        console.error("base64Decode failed: ", e)
    }
    return null
};
const c = () => function () {
    if ("undefined" != typeof self) return self;
    if ("undefined" != typeof window) return window;
    if ("undefined" != typeof global) return global;
    throw new Error("Unable to locate global object.")
}().__FIREBASE_DEFAULTS__, u = () => {
    try {
        return c() || (() => {
            if ("undefined" == typeof process || void 0 === process.env) return;
            const e = process.env.__FIREBASE_DEFAULTS__;
            return e ? JSON.parse(e) : void 0
        })() || (() => {
            if ("undefined" == typeof document) return;
            let e;
            try {
                e = document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)
            } catch (e) {
                return
            }
            const t = e && a(e[1]);
            return t && JSON.parse(t)
        })()
    } catch (e) {
        return void console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${e}`)
    }
}, d = e => {
    var t;
    return null === (t = u()) || void 0 === t ? void 0 : t[`_${e}`]
};

function l() {
    return "undefined" != typeof navigator && "string" == typeof navigator.userAgent ? navigator.userAgent : ""
}

class h extends Error {
    constructor(e, t, n) {
        super(t), this.code = e, this.customData = n, this.name = "FirebaseError", Object.setPrototypeOf(this, h.prototype), Error.captureStackTrace && Error.captureStackTrace(this, p.prototype.create)
    }
}

class p {
    constructor(e, t, n) {
        this.service = e, this.serviceName = t, this.errors = n
    }

    create(e, ...t) {
        const n = t[0] || {}, i = `${this.service}/${e}`, r = this.errors[e], s = r ? function (e, t) {
            return e.replace(f, ((e, n) => {
                const i = t[n];
                return null != i ? String(i) : `<${n}?>`
            }))
        }(r, n) : "Error", o = `${this.serviceName}: ${s} (${i}).`;
        return new h(i, o, n)
    }
}

const f = /\{\$([^}]+)}/g;

function m(e, t) {
    if (e === t) return !0;
    const n = Object.keys(e), i = Object.keys(t);
    for (const r of n) {
        if (!i.includes(r)) return !1;
        const n = e[r], s = t[r];
        if (g(n) && g(s)) {
            if (!m(n, s)) return !1
        } else if (n !== s) return !1
    }
    for (const e of i) if (!n.includes(e)) return !1;
    return !0
}

function g(e) {
    return null !== e && "object" == typeof e
}

function v(e) {
    const t = [];
    for (const [n, i] of Object.entries(e)) Array.isArray(i) ? i.forEach((e => {
        t.push(encodeURIComponent(n) + "=" + encodeURIComponent(e))
    })) : t.push(encodeURIComponent(n) + "=" + encodeURIComponent(i));
    return t.length ? "&" + t.join("&") : ""
}

function _(e) {
    const t = {};
    return e.replace(/^\?/, "").split("&").forEach((e => {
        if (e) {
            const [n, i] = e.split("=");
            t[decodeURIComponent(n)] = decodeURIComponent(i)
        }
    })), t
}

function I(e) {
    const t = e.indexOf("?");
    if (!t) return "";
    const n = e.indexOf("#", t);
    return e.substring(t, n > 0 ? n : void 0)
}

class T {
    constructor(e, t) {
        this.observers = [], this.unsubscribes = [], this.observerCount = 0, this.task = Promise.resolve(), this.finalized = !1, this.onNoObservers = t, this.task.then((() => {
            e(this)
        })).catch((e => {
            this.error(e)
        }))
    }

    next(e) {
        this.forEachObserver((t => {
            t.next(e)
        }))
    }

    error(e) {
        this.forEachObserver((t => {
            t.error(e)
        })), this.close(e)
    }

    complete() {
        this.forEachObserver((e => {
            e.complete()
        })), this.close()
    }

    subscribe(e, t, n) {
        let i;
        if (void 0 === e && void 0 === t && void 0 === n) throw new Error("Missing Observer.");
        i = function (e, t) {
            if ("object" != typeof e || null === e) return !1;
            for (const n of t) if (n in e && "function" == typeof e[n]) return !0;
            return !1
        }(e, ["next", "error", "complete"]) ? e : {
            next: e,
            error: t,
            complete: n
        }, void 0 === i.next && (i.next = y), void 0 === i.error && (i.error = y), void 0 === i.complete && (i.complete = y);
        const r = this.unsubscribeOne.bind(this, this.observers.length);
        return this.finalized && this.task.then((() => {
            try {
                this.finalError ? i.error(this.finalError) : i.complete()
            } catch (e) {
            }
        })), this.observers.push(i), r
    }

    unsubscribeOne(e) {
        void 0 !== this.observers && void 0 !== this.observers[e] && (delete this.observers[e], this.observerCount -= 1, 0 === this.observerCount && void 0 !== this.onNoObservers && this.onNoObservers(this))
    }

    forEachObserver(e) {
        if (!this.finalized) for (let t = 0; t < this.observers.length; t++) this.sendOne(t, e)
    }

    sendOne(e, t) {
        this.task.then((() => {
            if (void 0 !== this.observers && void 0 !== this.observers[e]) try {
                t(this.observers[e])
            } catch (e) {
                "undefined" != typeof console && console.error && console.error(e)
            }
        }))
    }

    close(e) {
        this.finalized || (this.finalized = !0, void 0 !== e && (this.finalError = e), this.task.then((() => {
            this.observers = void 0, this.onNoObservers = void 0
        })))
    }
}

function y() {
}

function E(e) {
    return e && e._delegate ? e._delegate : e
}

function w(e, t) {
    var n = {};
    for (var i in e) Object.prototype.hasOwnProperty.call(e, i) && t.indexOf(i) < 0 && (n[i] = e[i]);
    if (null != e && "function" == typeof Object.getOwnPropertySymbols) {
        var r = 0;
        for (i = Object.getOwnPropertySymbols(e); r < i.length; r++) t.indexOf(i[r]) < 0 && Object.prototype.propertyIsEnumerable.call(e, i[r]) && (n[i[r]] = e[i[r]])
    }
    return n
}

var A;
!function (e) {
    e[e.DEBUG = 0] = "DEBUG", e[e.VERBOSE = 1] = "VERBOSE", e[e.INFO = 2] = "INFO", e[e.WARN = 3] = "WARN", e[e.ERROR = 4] = "ERROR", e[e.SILENT = 5] = "SILENT"
}(A || (A = {}));
const k = {debug: A.DEBUG, verbose: A.VERBOSE, info: A.INFO, warn: A.WARN, error: A.ERROR, silent: A.SILENT},
    b = A.INFO, S = {[A.DEBUG]: "log", [A.VERBOSE]: "log", [A.INFO]: "info", [A.WARN]: "warn", [A.ERROR]: "error"},
    R = (e, t, ...n) => {
        if (t < e.logLevel) return;
        const i = (new Date).toISOString(), r = S[t];
        if (!r) throw new Error(`Attempted to log a message with an invalid logType (value: ${t})`);
        console[r](`[${i}]  ${e.name}:`, ...n)
    };

class N {
    constructor(e, t, n) {
        this.name = e, this.instanceFactory = t, this.type = n, this.multipleInstances = !1, this.serviceProps = {}, this.instantiationMode = "LAZY", this.onInstanceCreated = null
    }

    setInstantiationMode(e) {
        return this.instantiationMode = e, this
    }

    setMultipleInstances(e) {
        return this.multipleInstances = e, this
    }

    setServiceProps(e) {
        return this.serviceProps = e, this
    }

    setInstanceCreatedCallback(e) {
        return this.onInstanceCreated = e, this
    }
}

const O = {PHONE: "phone", TOTP: "totp"}, C = {
    FACEBOOK: "facebook.com",
    GITHUB: "github.com",
    GOOGLE: "google.com",
    PASSWORD: "password",
    PHONE: "phone",
    TWITTER: "twitter.com"
}, P = {
    EMAIL_LINK: "emailLink",
    EMAIL_PASSWORD: "password",
    FACEBOOK: "facebook.com",
    GITHUB: "github.com",
    GOOGLE: "google.com",
    PHONE: "phone",
    TWITTER: "twitter.com"
}, D = {LINK: "link", REAUTHENTICATE: "reauthenticate", SIGN_IN: "signIn"}, L = {
    EMAIL_SIGNIN: "EMAIL_SIGNIN",
    PASSWORD_RESET: "PASSWORD_RESET",
    RECOVER_EMAIL: "RECOVER_EMAIL",
    REVERT_SECOND_FACTOR_ADDITION: "REVERT_SECOND_FACTOR_ADDITION",
    VERIFY_AND_CHANGE_EMAIL: "VERIFY_AND_CHANGE_EMAIL",
    VERIFY_EMAIL: "VERIFY_EMAIL"
};

function M() {
    return {"dependent-sdk-initialized-before-auth": "Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}
}

const U = function () {
        return {
            "admin-restricted-operation": "This operation is restricted to administrators only.",
            "argument-error": "",
            "app-not-authorized": "This app, identified by the domain where it's hosted, is not authorized to use Firebase Authentication with the provided API key. Review your key configuration in the Google API console.",
            "app-not-installed": "The requested mobile application corresponding to the identifier (Android package name or iOS bundle ID) provided is not installed on this device.",
            "captcha-check-failed": "The reCAPTCHA response token provided is either invalid, expired, already used or the domain associated with it does not match the list of whitelisted domains.",
            "code-expired": "The SMS code has expired. Please re-send the verification code to try again.",
            "cordova-not-ready": "Cordova framework is not ready.",
            "cors-unsupported": "This browser is not supported.",
            "credential-already-in-use": "This credential is already associated with a different user account.",
            "custom-token-mismatch": "The custom token corresponds to a different audience.",
            "requires-recent-login": "This operation is sensitive and requires recent authentication. Log in again before retrying this request.",
            "dependent-sdk-initialized-before-auth": "Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK.",
            "dynamic-link-not-activated": "Please activate Dynamic Links in the Firebase Console and agree to the terms and conditions.",
            "email-change-needs-verification": "Multi-factor users must always have a verified email.",
            "email-already-in-use": "The email address is already in use by another account.",
            "emulator-config-failed": 'Auth instance has already been used to make a network call. Auth can no longer be configured to use the emulator. Try calling "connectAuthEmulator()" sooner.',
            "expired-action-code": "The action code has expired.",
            "cancelled-popup-request": "This operation has been cancelled due to another conflicting popup being opened.",
            "internal-error": "An internal AuthError has occurred.",
            "invalid-app-credential": "The phone verification request contains an invalid application verifier. The reCAPTCHA token response is either invalid or expired.",
            "invalid-app-id": "The mobile app identifier is not registed for the current project.",
            "invalid-user-token": "This user's credential isn't valid for this project. This can happen if the user's token has been tampered with, or if the user isn't for the project associated with this API key.",
            "invalid-auth-event": "An internal AuthError has occurred.",
            "invalid-verification-code": "The SMS verification code used to create the phone auth credential is invalid. Please resend the verification code sms and be sure to use the verification code provided by the user.",
            "invalid-continue-uri": "The continue URL provided in the request is invalid.",
            "invalid-cordova-configuration": "The following Cordova plugins must be installed to enable OAuth sign-in: cordova-plugin-buildinfo, cordova-universal-links-plugin, cordova-plugin-browsertab, cordova-plugin-inappbrowser and cordova-plugin-customurlscheme.",
            "invalid-custom-token": "The custom token format is incorrect. Please check the documentation.",
            "invalid-dynamic-link-domain": "The provided dynamic link domain is not configured or authorized for the current project.",
            "invalid-email": "The email address is badly formatted.",
            "invalid-emulator-scheme": "Emulator URL must start with a valid scheme (http:// or https://).",
            "invalid-api-key": "Your API key is invalid, please check you have copied it correctly.",
            "invalid-cert-hash": "The SHA-1 certificate hash provided is invalid.",
            "invalid-credential": "The supplied auth credential is malformed or has expired.",
            "invalid-message-payload": "The email template corresponding to this action contains invalid characters in its message. Please fix by going to the Auth email templates section in the Firebase Console.",
            "invalid-multi-factor-session": "The request does not contain a valid proof of first factor successful sign-in.",
            "invalid-oauth-provider": "EmailAuthProvider is not supported for this operation. This operation only supports OAuth providers.",
            "invalid-oauth-client-id": "The OAuth client ID provided is either invalid or does not match the specified API key.",
            "unauthorized-domain": "This domain is not authorized for OAuth operations for your Firebase project. Edit the list of authorized domains from the Firebase console.",
            "invalid-action-code": "The action code is invalid. This can happen if the code is malformed, expired, or has already been used.",
            "wrong-password": "The password is invalid or the user does not have a password.",
            "invalid-persistence-type": "The specified persistence type is invalid. It can only be local, session or none.",
            "invalid-phone-number": "The format of the phone number provided is incorrect. Please enter the phone number in a format that can be parsed into E.164 format. E.164 phone numbers are written in the format [+][country code][subscriber number including area code].",
            "invalid-provider-id": "The specified provider ID is invalid.",
            "invalid-recipient-email": "The email corresponding to this action failed to send as the provided recipient email address is invalid.",
            "invalid-sender": "The email template corresponding to this action contains an invalid sender email or name. Please fix by going to the Auth email templates section in the Firebase Console.",
            "invalid-verification-id": "The verification ID used to create the phone auth credential is invalid.",
            "invalid-tenant-id": "The Auth instance's tenant ID is invalid.",
            "login-blocked": "Login blocked by user-provided method: {$originalMessage}",
            "missing-android-pkg-name": "An Android Package Name must be provided if the Android App is required to be installed.",
            "auth-domain-config-required": "Be sure to include authDomain when calling firebase.initializeApp(), by following the instructions in the Firebase console.",
            "missing-app-credential": "The phone verification request is missing an application verifier assertion. A reCAPTCHA response token needs to be provided.",
            "missing-verification-code": "The phone auth credential was created with an empty SMS verification code.",
            "missing-continue-uri": "A continue URL must be provided in the request.",
            "missing-iframe-start": "An internal AuthError has occurred.",
            "missing-ios-bundle-id": "An iOS Bundle ID must be provided if an App Store ID is provided.",
            "missing-or-invalid-nonce": "The request does not contain a valid nonce. This can occur if the SHA-256 hash of the provided raw nonce does not match the hashed nonce in the ID token payload.",
            "missing-password": "A non-empty password must be provided",
            "missing-multi-factor-info": "No second factor identifier is provided.",
            "missing-multi-factor-session": "The request is missing proof of first factor successful sign-in.",
            "missing-phone-number": "To send verification codes, provide a phone number for the recipient.",
            "missing-verification-id": "The phone auth credential was created with an empty verification ID.",
            "app-deleted": "This instance of FirebaseApp has been deleted.",
            "multi-factor-info-not-found": "The user does not have a second factor matching the identifier provided.",
            "multi-factor-auth-required": "Proof of ownership of a second factor is required to complete sign-in.",
            "account-exists-with-different-credential": "An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.",
            "network-request-failed": "A network AuthError (such as timeout, interrupted connection or unreachable host) has occurred.",
            "no-auth-event": "An internal AuthError has occurred.",
            "no-such-provider": "User was not linked to an account with the given provider.",
            "null-user": "A null user object was provided as the argument for an operation which requires a non-null user object.",
            "operation-not-allowed": "The given sign-in provider is disabled for this Firebase project. Enable it in the Firebase console, under the sign-in method tab of the Auth section.",
            "operation-not-supported-in-this-environment": 'This operation is not supported in the environment this application is running on. "location.protocol" must be http, https or chrome-extension and web storage must be enabled.',
            "popup-blocked": "Unable to establish a connection with the popup. It may have been blocked by the browser.",
            "popup-closed-by-user": "The popup has been closed by the user before finalizing the operation.",
            "provider-already-linked": "User can only be linked to one identity for the given provider.",
            "quota-exceeded": "The project's quota for this operation has been exceeded.",
            "redirect-cancelled-by-user": "The redirect operation has been cancelled by the user before finalizing.",
            "redirect-operation-pending": "A redirect sign-in operation is already pending.",
            "rejected-credential": "The request contains malformed or mismatching credentials.",
            "second-factor-already-in-use": "The second factor is already enrolled on this account.",
            "maximum-second-factor-count-exceeded": "The maximum allowed number of second factors on a user has been exceeded.",
            "tenant-id-mismatch": "The provided tenant ID does not match the Auth instance's tenant ID",
            timeout: "The operation has timed out.",
            "user-token-expired": "The user's credential is no longer valid. The user must sign in again.",
            "too-many-requests": "We have blocked all requests from this device due to unusual activity. Try again later.",
            "unauthorized-continue-uri": "The domain of the continue URL is not whitelisted.  Please whitelist the domain in the Firebase console.",
            "unsupported-first-factor": "Enrolling a second factor or signing in with a multi-factor account requires sign-in with a supported first factor.",
            "unsupported-persistence-type": "The current environment does not support the specified persistence type.",
            "unsupported-tenant-operation": "This operation is not supported in a multi-tenant context.",
            "unverified-email": "The operation requires a verified email.",
            "user-cancelled": "The user did not grant your application the permissions it requested.",
            "user-not-found": "There is no user record corresponding to this identifier. The user may have been deleted.",
            "user-disabled": "The user account has been disabled by an administrator.",
            "user-mismatch": "The supplied credentials do not correspond to the previously signed in user.",
            "user-signed-out": "",
            "weak-password": "The password must be 6 characters long or more.",
            "web-storage-unsupported": "This browser is not supported or 3rd party cookies and data may be disabled.",
            "already-initialized": "initializeAuth() has already been called with different options. To avoid this error, call initializeAuth() with the same options as when it was originally called, or call getAuth() to return the already initialized instance.",
            "missing-recaptcha-token": "The reCAPTCHA token is missing when sending request to the backend.",
            "invalid-recaptcha-token": "The reCAPTCHA token is invalid when sending request to the backend.",
            "invalid-recaptcha-action": "The reCAPTCHA action is invalid when sending request to the backend.",
            "recaptcha-not-enabled": "reCAPTCHA Enterprise integration is not enabled for this project.",
            "missing-client-type": "The reCAPTCHA client type is missing when sending request to the backend.",
            "missing-recaptcha-version": "The reCAPTCHA version is missing when sending request to the backend.",
            "invalid-req-type": "Invalid request parameters.",
            "invalid-recaptcha-version": "The reCAPTCHA version is invalid when sending request to the backend."
        }
    }, F = M,
    V = new p("auth", "Firebase", {"dependent-sdk-initialized-before-auth": "Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}),
    x = {
        ADMIN_ONLY_OPERATION: "auth/admin-restricted-operation",
        ARGUMENT_ERROR: "auth/argument-error",
        APP_NOT_AUTHORIZED: "auth/app-not-authorized",
        APP_NOT_INSTALLED: "auth/app-not-installed",
        CAPTCHA_CHECK_FAILED: "auth/captcha-check-failed",
        CODE_EXPIRED: "auth/code-expired",
        CORDOVA_NOT_READY: "auth/cordova-not-ready",
        CORS_UNSUPPORTED: "auth/cors-unsupported",
        CREDENTIAL_ALREADY_IN_USE: "auth/credential-already-in-use",
        CREDENTIAL_MISMATCH: "auth/custom-token-mismatch",
        CREDENTIAL_TOO_OLD_LOGIN_AGAIN: "auth/requires-recent-login",
        DEPENDENT_SDK_INIT_BEFORE_AUTH: "auth/dependent-sdk-initialized-before-auth",
        DYNAMIC_LINK_NOT_ACTIVATED: "auth/dynamic-link-not-activated",
        EMAIL_CHANGE_NEEDS_VERIFICATION: "auth/email-change-needs-verification",
        EMAIL_EXISTS: "auth/email-already-in-use",
        EMULATOR_CONFIG_FAILED: "auth/emulator-config-failed",
        EXPIRED_OOB_CODE: "auth/expired-action-code",
        EXPIRED_POPUP_REQUEST: "auth/cancelled-popup-request",
        INTERNAL_ERROR: "auth/internal-error",
        INVALID_API_KEY: "auth/invalid-api-key",
        INVALID_APP_CREDENTIAL: "auth/invalid-app-credential",
        INVALID_APP_ID: "auth/invalid-app-id",
        INVALID_AUTH: "auth/invalid-user-token",
        INVALID_AUTH_EVENT: "auth/invalid-auth-event",
        INVALID_CERT_HASH: "auth/invalid-cert-hash",
        INVALID_CODE: "auth/invalid-verification-code",
        INVALID_CONTINUE_URI: "auth/invalid-continue-uri",
        INVALID_CORDOVA_CONFIGURATION: "auth/invalid-cordova-configuration",
        INVALID_CUSTOM_TOKEN: "auth/invalid-custom-token",
        INVALID_DYNAMIC_LINK_DOMAIN: "auth/invalid-dynamic-link-domain",
        INVALID_EMAIL: "auth/invalid-email",
        INVALID_EMULATOR_SCHEME: "auth/invalid-emulator-scheme",
        INVALID_IDP_RESPONSE: "auth/invalid-credential",
        INVALID_MESSAGE_PAYLOAD: "auth/invalid-message-payload",
        INVALID_MFA_SESSION: "auth/invalid-multi-factor-session",
        INVALID_OAUTH_CLIENT_ID: "auth/invalid-oauth-client-id",
        INVALID_OAUTH_PROVIDER: "auth/invalid-oauth-provider",
        INVALID_OOB_CODE: "auth/invalid-action-code",
        INVALID_ORIGIN: "auth/unauthorized-domain",
        INVALID_PASSWORD: "auth/wrong-password",
        INVALID_PERSISTENCE: "auth/invalid-persistence-type",
        INVALID_PHONE_NUMBER: "auth/invalid-phone-number",
        INVALID_PROVIDER_ID: "auth/invalid-provider-id",
        INVALID_RECIPIENT_EMAIL: "auth/invalid-recipient-email",
        INVALID_SENDER: "auth/invalid-sender",
        INVALID_SESSION_INFO: "auth/invalid-verification-id",
        INVALID_TENANT_ID: "auth/invalid-tenant-id",
        MFA_INFO_NOT_FOUND: "auth/multi-factor-info-not-found",
        MFA_REQUIRED: "auth/multi-factor-auth-required",
        MISSING_ANDROID_PACKAGE_NAME: "auth/missing-android-pkg-name",
        MISSING_APP_CREDENTIAL: "auth/missing-app-credential",
        MISSING_AUTH_DOMAIN: "auth/auth-domain-config-required",
        MISSING_CODE: "auth/missing-verification-code",
        MISSING_CONTINUE_URI: "auth/missing-continue-uri",
        MISSING_IFRAME_START: "auth/missing-iframe-start",
        MISSING_IOS_BUNDLE_ID: "auth/missing-ios-bundle-id",
        MISSING_OR_INVALID_NONCE: "auth/missing-or-invalid-nonce",
        MISSING_MFA_INFO: "auth/missing-multi-factor-info",
        MISSING_MFA_SESSION: "auth/missing-multi-factor-session",
        MISSING_PHONE_NUMBER: "auth/missing-phone-number",
        MISSING_SESSION_INFO: "auth/missing-verification-id",
        MODULE_DESTROYED: "auth/app-deleted",
        NEED_CONFIRMATION: "auth/account-exists-with-different-credential",
        NETWORK_REQUEST_FAILED: "auth/network-request-failed",
        NULL_USER: "auth/null-user",
        NO_AUTH_EVENT: "auth/no-auth-event",
        NO_SUCH_PROVIDER: "auth/no-such-provider",
        OPERATION_NOT_ALLOWED: "auth/operation-not-allowed",
        OPERATION_NOT_SUPPORTED: "auth/operation-not-supported-in-this-environment",
        POPUP_BLOCKED: "auth/popup-blocked",
        POPUP_CLOSED_BY_USER: "auth/popup-closed-by-user",
        PROVIDER_ALREADY_LINKED: "auth/provider-already-linked",
        QUOTA_EXCEEDED: "auth/quota-exceeded",
        REDIRECT_CANCELLED_BY_USER: "auth/redirect-cancelled-by-user",
        REDIRECT_OPERATION_PENDING: "auth/redirect-operation-pending",
        REJECTED_CREDENTIAL: "auth/rejected-credential",
        SECOND_FACTOR_ALREADY_ENROLLED: "auth/second-factor-already-in-use",
        SECOND_FACTOR_LIMIT_EXCEEDED: "auth/maximum-second-factor-count-exceeded",
        TENANT_ID_MISMATCH: "auth/tenant-id-mismatch",
        TIMEOUT: "auth/timeout",
        TOKEN_EXPIRED: "auth/user-token-expired",
        TOO_MANY_ATTEMPTS_TRY_LATER: "auth/too-many-requests",
        UNAUTHORIZED_DOMAIN: "auth/unauthorized-continue-uri",
        UNSUPPORTED_FIRST_FACTOR: "auth/unsupported-first-factor",
        UNSUPPORTED_PERSISTENCE: "auth/unsupported-persistence-type",
        UNSUPPORTED_TENANT_OPERATION: "auth/unsupported-tenant-operation",
        UNVERIFIED_EMAIL: "auth/unverified-email",
        USER_CANCELLED: "auth/user-cancelled",
        USER_DELETED: "auth/user-not-found",
        USER_DISABLED: "auth/user-disabled",
        USER_MISMATCH: "auth/user-mismatch",
        USER_SIGNED_OUT: "auth/user-signed-out",
        WEAK_PASSWORD: "auth/weak-password",
        WEB_STORAGE_UNSUPPORTED: "auth/web-storage-unsupported",
        ALREADY_INITIALIZED: "auth/already-initialized",
        RECAPTCHA_NOT_ENABLED: "auth/recaptcha-not-enabled",
        MISSING_RECAPTCHA_TOKEN: "auth/missing-recaptcha-token",
        INVALID_RECAPTCHA_TOKEN: "auth/invalid-recaptcha-token",
        INVALID_RECAPTCHA_ACTION: "auth/invalid-recaptcha-action",
        MISSING_CLIENT_TYPE: "auth/missing-client-type",
        MISSING_RECAPTCHA_VERSION: "auth/missing-recaptcha-version",
        INVALID_RECAPTCHA_VERSION: "auth/invalid-recaptcha-version",
        INVALID_REQ_TYPE: "auth/invalid-req-type"
    }, H = new class {
        constructor(e) {
            this.name = e, this._logLevel = b, this._logHandler = R, this._userLogHandler = null
        }

        get logLevel() {
            return this._logLevel
        }

        set logLevel(e) {
            if (!(e in A)) throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);
            this._logLevel = e
        }

        setLogLevel(e) {
            this._logLevel = "string" == typeof e ? k[e] : e
        }

        get logHandler() {
            return this._logHandler
        }

        set logHandler(e) {
            if ("function" != typeof e) throw new TypeError("Value assigned to `logHandler` must be a function");
            this._logHandler = e
        }

        get userLogHandler() {
            return this._userLogHandler
        }

        set userLogHandler(e) {
            this._userLogHandler = e
        }

        debug(...e) {
            this._userLogHandler && this._userLogHandler(this, A.DEBUG, ...e), this._logHandler(this, A.DEBUG, ...e)
        }

        log(...e) {
            this._userLogHandler && this._userLogHandler(this, A.VERBOSE, ...e), this._logHandler(this, A.VERBOSE, ...e)
        }

        info(...e) {
            this._userLogHandler && this._userLogHandler(this, A.INFO, ...e), this._logHandler(this, A.INFO, ...e)
        }

        warn(...e) {
            this._userLogHandler && this._userLogHandler(this, A.WARN, ...e), this._logHandler(this, A.WARN, ...e)
        }

        error(...e) {
            this._userLogHandler && this._userLogHandler(this, A.ERROR, ...e), this._logHandler(this, A.ERROR, ...e)
        }
    }("@firebase/auth");

function j(e, ...t) {
    H.logLevel <= A.ERROR && H.error(`Auth (${r}): ${e}`, ...t)
}

function W(e, ...t) {
    throw B(e, ...t)
}

function q(e, ...t) {
    return B(e, ...t)
}

function z(e, t, n) {
    const i = Object.assign(Object.assign({}, F()), {[t]: n});
    return new p("auth", "Firebase", i).create(t, {appName: e.name})
}

function G(e, t, n) {
    if (!(t instanceof n)) throw n.name !== t.constructor.name && W(e, "argument-error"), z(e, "argument-error", `Type of ${t.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)
}

function B(e, ...t) {
    if ("string" != typeof e) {
        const n = t[0], i = [...t.slice(1)];
        return i[0] && (i[0].appName = e.name), e._errorFactory.create(n, ...i)
    }
    return V.create(e, ...t)
}

function K(e, t, ...n) {
    if (!e) throw B(t, ...n)
}

function $(e) {
    const t = "INTERNAL ASSERTION FAILED: " + e;
    throw j(t), new Error(t)
}

function J(e, t) {
    e || $(t)
}

function Y() {
    var e;
    return "undefined" != typeof self && (null === (e = self.location) || void 0 === e ? void 0 : e.href) || ""
}

function X() {
    return "http:" === Q() || "https:" === Q()
}

function Q() {
    var e;
    return "undefined" != typeof self && (null === (e = self.location) || void 0 === e ? void 0 : e.protocol) || null
}

function Z() {
    return !("undefined" != typeof navigator && navigator && "onLine" in navigator && "boolean" == typeof navigator.onLine && (X() || function () {
        const e = "object" == typeof chrome ? chrome.runtime : "object" == typeof browser ? browser.runtime : void 0;
        return "object" == typeof e && void 0 !== e.id
    }() || "connection" in navigator)) || navigator.onLine
}

class ee {
    constructor(e, t) {
        this.shortDelay = e, this.longDelay = t, J(t > e, "Short delay should be less than long delay!"), this.isMobile = "undefined" != typeof window && !!(window.cordova || window.phonegap || window.PhoneGap) && /ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(l()) || "object" == typeof navigator && "ReactNative" === navigator.product
    }

    get() {
        return Z() ? this.isMobile ? this.longDelay : this.shortDelay : Math.min(5e3, this.shortDelay)
    }
}

function te(e, t) {
    J(e.emulator, "Emulator should always be set here");
    const {url: n} = e.emulator;
    return t ? `${n}${t.startsWith("/") ? t.slice(1) : t}` : n
}

class ne {
    static initialize(e, t, n) {
        this.fetchImpl = e, t && (this.headersImpl = t), n && (this.responseImpl = n)
    }

    static fetch() {
        return this.fetchImpl ? this.fetchImpl : "undefined" != typeof self && "fetch" in self ? self.fetch : void $("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")
    }

    static headers() {
        return this.headersImpl ? this.headersImpl : "undefined" != typeof self && "Headers" in self ? self.Headers : void $("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")
    }

    static response() {
        return this.responseImpl ? this.responseImpl : "undefined" != typeof self && "Response" in self ? self.Response : void $("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")
    }
}

const ie = {
    CREDENTIAL_MISMATCH: "custom-token-mismatch",
    MISSING_CUSTOM_TOKEN: "internal-error",
    INVALID_IDENTIFIER: "invalid-email",
    MISSING_CONTINUE_URI: "internal-error",
    INVALID_PASSWORD: "wrong-password",
    MISSING_PASSWORD: "missing-password",
    EMAIL_EXISTS: "email-already-in-use",
    PASSWORD_LOGIN_DISABLED: "operation-not-allowed",
    INVALID_IDP_RESPONSE: "invalid-credential",
    INVALID_PENDING_TOKEN: "invalid-credential",
    FEDERATED_USER_ID_ALREADY_LINKED: "credential-already-in-use",
    MISSING_REQ_TYPE: "internal-error",
    EMAIL_NOT_FOUND: "user-not-found",
    RESET_PASSWORD_EXCEED_LIMIT: "too-many-requests",
    EXPIRED_OOB_CODE: "expired-action-code",
    INVALID_OOB_CODE: "invalid-action-code",
    MISSING_OOB_CODE: "internal-error",
    CREDENTIAL_TOO_OLD_LOGIN_AGAIN: "requires-recent-login",
    INVALID_ID_TOKEN: "invalid-user-token",
    TOKEN_EXPIRED: "user-token-expired",
    USER_NOT_FOUND: "user-token-expired",
    TOO_MANY_ATTEMPTS_TRY_LATER: "too-many-requests",
    INVALID_CODE: "invalid-verification-code",
    INVALID_SESSION_INFO: "invalid-verification-id",
    INVALID_TEMPORARY_PROOF: "invalid-credential",
    MISSING_SESSION_INFO: "missing-verification-id",
    SESSION_EXPIRED: "code-expired",
    MISSING_ANDROID_PACKAGE_NAME: "missing-android-pkg-name",
    UNAUTHORIZED_DOMAIN: "unauthorized-continue-uri",
    INVALID_OAUTH_CLIENT_ID: "invalid-oauth-client-id",
    ADMIN_ONLY_OPERATION: "admin-restricted-operation",
    INVALID_MFA_PENDING_CREDENTIAL: "invalid-multi-factor-session",
    MFA_ENROLLMENT_NOT_FOUND: "multi-factor-info-not-found",
    MISSING_MFA_ENROLLMENT_ID: "missing-multi-factor-info",
    MISSING_MFA_PENDING_CREDENTIAL: "missing-multi-factor-session",
    SECOND_FACTOR_EXISTS: "second-factor-already-in-use",
    SECOND_FACTOR_LIMIT_EXCEEDED: "maximum-second-factor-count-exceeded",
    BLOCKING_FUNCTION_ERROR_RESPONSE: "internal-error",
    RECAPTCHA_NOT_ENABLED: "recaptcha-not-enabled",
    MISSING_RECAPTCHA_TOKEN: "missing-recaptcha-token",
    INVALID_RECAPTCHA_TOKEN: "invalid-recaptcha-token",
    INVALID_RECAPTCHA_ACTION: "invalid-recaptcha-action",
    MISSING_CLIENT_TYPE: "missing-client-type",
    MISSING_RECAPTCHA_VERSION: "missing-recaptcha-version",
    INVALID_RECAPTCHA_VERSION: "invalid-recaptcha-version",
    INVALID_REQ_TYPE: "invalid-req-type"
}, re = new ee(3e4, 6e4);

function se(e, t) {
    return e.tenantId && !t.tenantId ? Object.assign(Object.assign({}, t), {tenantId: e.tenantId}) : t
}

async function oe(e, t, n, i, r = {}) {
    return ae(e, r, (async () => {
        let r = {}, s = {};
        i && ("GET" === t ? s = i : r = {body: JSON.stringify(i)});
        const o = v(Object.assign({key: e.config.apiKey}, s)).slice(1), a = await e._getAdditionalHeaders();
        return a["Content-Type"] = "application/json", e.languageCode && (a["X-Firebase-Locale"] = e.languageCode), ne.fetch()(ue(e, e.config.apiHost, n, o), Object.assign({
            method: t,
            headers: a,
            referrerPolicy: "no-referrer"
        }, r))
    }))
}

async function ae(e, t, n) {
    e._canInitEmulator = !1;
    const i = Object.assign(Object.assign({}, ie), t);
    try {
        const t = new de(e), r = await Promise.race([n(), t.promise]);
        t.clearNetworkTimeout();
        const s = await r.json();
        if ("needConfirmation" in s) throw le(e, "account-exists-with-different-credential", s);
        if (r.ok && !("errorMessage" in s)) return s;
        {
            const t = r.ok ? s.errorMessage : s.error.message, [n, o] = t.split(" : ");
            if ("FEDERATED_USER_ID_ALREADY_LINKED" === n) throw le(e, "credential-already-in-use", s);
            if ("EMAIL_EXISTS" === n) throw le(e, "email-already-in-use", s);
            if ("USER_DISABLED" === n) throw le(e, "user-disabled", s);
            const a = i[n] || n.toLowerCase().replace(/[_\s]+/g, "-");
            if (o) throw z(e, a, o);
            W(e, a)
        }
    } catch (t) {
        if (t instanceof h) throw t;
        W(e, "network-request-failed", {message: String(t)})
    }
}

async function ce(e, t, n, i, r = {}) {
    const s = await oe(e, t, n, i, r);
    return "mfaPendingCredential" in s && W(e, "multi-factor-auth-required", {_serverResponse: s}), s
}

function ue(e, t, n, i) {
    const r = `${t}${n}?${i}`;
    return e.config.emulator ? te(e.config, r) : `${e.config.apiScheme}://${r}`
}

class de {
    constructor(e) {
        this.auth = e, this.timer = null, this.promise = new Promise(((e, t) => {
            this.timer = setTimeout((() => t(q(this.auth, "network-request-failed"))), re.get())
        }))
    }

    clearNetworkTimeout() {
        clearTimeout(this.timer)
    }
}

function le(e, t, n) {
    const i = {appName: e.name};
    n.email && (i.email = n.email), n.phoneNumber && (i.phoneNumber = n.phoneNumber);
    const r = q(e, t, i);
    return r.customData._tokenResponse = n, r
}

function he(e) {
    if (e) try {
        const t = new Date(Number(e));
        if (!isNaN(t.getTime())) return t.toUTCString()
    } catch (e) {
    }
}

function pe(e, t = !1) {
    return E(e).getIdToken(t)
}

async function fe(e, t = !1) {
    const n = E(e), i = await n.getIdToken(t), r = ge(i);
    K(r && r.exp && r.auth_time && r.iat, n.auth, "internal-error");
    const s = "object" == typeof r.firebase ? r.firebase : void 0, o = null == s ? void 0 : s.sign_in_provider;
    return {
        claims: r,
        token: i,
        authTime: he(me(r.auth_time)),
        issuedAtTime: he(me(r.iat)),
        expirationTime: he(me(r.exp)),
        signInProvider: o || null,
        signInSecondFactor: (null == s ? void 0 : s.sign_in_second_factor) || null
    }
}

function me(e) {
    return 1e3 * Number(e)
}

function ge(e) {
    const [t, n, i] = e.split(".");
    if (void 0 === t || void 0 === n || void 0 === i) return j("JWT malformed, contained fewer than 3 sections"), null;
    try {
        const e = a(n);
        return e ? JSON.parse(e) : (j("Failed to decode base64 JWT payload"), null)
    } catch (e) {
        return j("Caught error parsing JWT payload as JSON", null == e ? void 0 : e.toString()), null
    }
}

async function ve(e, t, n = !1) {
    if (n) return t;
    try {
        return await t
    } catch (t) {
        throw t instanceof h && function ({code: e}) {
            return "auth/user-disabled" === e || "auth/user-token-expired" === e
        }(t) && e.auth.currentUser === e && await e.auth.signOut(), t
    }
}

class _e {
    constructor(e) {
        this.user = e, this.isRunning = !1, this.timerId = null, this.errorBackoff = 3e4
    }

    _start() {
        this.isRunning || (this.isRunning = !0, this.schedule())
    }

    _stop() {
        this.isRunning && (this.isRunning = !1, null !== this.timerId && clearTimeout(this.timerId))
    }

    getInterval(e) {
        var t;
        if (e) {
            const e = this.errorBackoff;
            return this.errorBackoff = Math.min(2 * this.errorBackoff, 96e4), e
        }
        {
            this.errorBackoff = 3e4;
            const e = (null !== (t = this.user.stsTokenManager.expirationTime) && void 0 !== t ? t : 0) - Date.now() - 3e5;
            return Math.max(0, e)
        }
    }

    schedule(e = !1) {
        if (!this.isRunning) return;
        const t = this.getInterval(e);
        this.timerId = setTimeout((async () => {
            await this.iteration()
        }), t)
    }

    async iteration() {
        try {
            await this.user.getIdToken(!0)
        } catch (e) {
            return void ("auth/network-request-failed" === (null == e ? void 0 : e.code) && this.schedule(!0))
        }
        this.schedule()
    }
}

class Ie {
    constructor(e, t) {
        this.createdAt = e, this.lastLoginAt = t, this._initializeTime()
    }

    _initializeTime() {
        this.lastSignInTime = he(this.lastLoginAt), this.creationTime = he(this.createdAt)
    }

    _copy(e) {
        this.createdAt = e.createdAt, this.lastLoginAt = e.lastLoginAt, this._initializeTime()
    }

    toJSON() {
        return {createdAt: this.createdAt, lastLoginAt: this.lastLoginAt}
    }
}

async function Te(e) {
    var t;
    const n = e.auth, i = await e.getIdToken(), r = await ve(e, async function (e, t) {
        return oe(e, "POST", "/v1/accounts:lookup", t)
    }(n, {idToken: i}));
    K(null == r ? void 0 : r.users.length, n, "internal-error");
    const s = r.users[0];
    e._notifyReloadListener(s);
    const o = (null === (t = s.providerUserInfo) || void 0 === t ? void 0 : t.length) ? s.providerUserInfo.map((e => {
        var {providerId: t} = e, n = w(e, ["providerId"]);
        return {
            providerId: t,
            uid: n.rawId || "",
            displayName: n.displayName || null,
            email: n.email || null,
            phoneNumber: n.phoneNumber || null,
            photoURL: n.photoUrl || null
        }
    })) : [];
    const a = (c = e.providerData, u = o, [...c.filter((e => !u.some((t => t.providerId === e.providerId)))), ...u]);
    var c, u;
    const d = e.isAnonymous, l = !(e.email && s.passwordHash || (null == a ? void 0 : a.length)), h = !!d && l, p = {
        uid: s.localId,
        displayName: s.displayName || null,
        photoURL: s.photoUrl || null,
        email: s.email || null,
        emailVerified: s.emailVerified || !1,
        phoneNumber: s.phoneNumber || null,
        tenantId: s.tenantId || null,
        providerData: a,
        metadata: new Ie(s.createdAt, s.lastLoginAt),
        isAnonymous: h
    };
    Object.assign(e, p)
}

async function ye(e) {
    const t = E(e);
    await Te(t), await t.auth._persistUserIfCurrent(t), t.auth._notifyListenersIfCurrent(t)
}

class Ee {
    constructor() {
        this.refreshToken = null, this.accessToken = null, this.expirationTime = null
    }

    get isExpired() {
        return !this.expirationTime || Date.now() > this.expirationTime - 3e4
    }

    updateFromServerResponse(e) {
        K(e.idToken, "internal-error"), K(void 0 !== e.idToken, "internal-error"), K(void 0 !== e.refreshToken, "internal-error");
        const t = "expiresIn" in e && void 0 !== e.expiresIn ? Number(e.expiresIn) : function (e) {
            const t = ge(e);
            return K(t, "internal-error"), K(void 0 !== t.exp, "internal-error"), K(void 0 !== t.iat, "internal-error"), Number(t.exp) - Number(t.iat)
        }(e.idToken);
        this.updateTokensAndExpiration(e.idToken, e.refreshToken, t)
    }

    async getToken(e, t = !1) {
        return K(!this.accessToken || this.refreshToken, e, "user-token-expired"), t || !this.accessToken || this.isExpired ? this.refreshToken ? (await this.refresh(e, this.refreshToken), this.accessToken) : null : this.accessToken
    }

    clearRefreshToken() {
        this.refreshToken = null
    }

    async refresh(e, t) {
        const {accessToken: n, refreshToken: i, expiresIn: r} = await async function (e, t) {
            const n = await ae(e, {}, (async () => {
                const n = v({grant_type: "refresh_token", refresh_token: t}).slice(1), {
                    tokenApiHost: i,
                    apiKey: r
                } = e.config, s = ue(e, i, "/v1/token", `key=${r}`), o = await e._getAdditionalHeaders();
                return o["Content-Type"] = "application/x-www-form-urlencoded", ne.fetch()(s, {
                    method: "POST",
                    headers: o,
                    body: n
                })
            }));
            return {accessToken: n.access_token, expiresIn: n.expires_in, refreshToken: n.refresh_token}
        }(e, t);
        this.updateTokensAndExpiration(n, i, Number(r))
    }

    updateTokensAndExpiration(e, t, n) {
        this.refreshToken = t || null, this.accessToken = e || null, this.expirationTime = Date.now() + 1e3 * n
    }

    static fromJSON(e, t) {
        const {refreshToken: n, accessToken: i, expirationTime: r} = t, s = new Ee;
        return n && (K("string" == typeof n, "internal-error", {appName: e}), s.refreshToken = n), i && (K("string" == typeof i, "internal-error", {appName: e}), s.accessToken = i), r && (K("number" == typeof r, "internal-error", {appName: e}), s.expirationTime = r), s
    }

    toJSON() {
        return {refreshToken: this.refreshToken, accessToken: this.accessToken, expirationTime: this.expirationTime}
    }

    _assign(e) {
        this.accessToken = e.accessToken, this.refreshToken = e.refreshToken, this.expirationTime = e.expirationTime
    }

    _clone() {
        return Object.assign(new Ee, this.toJSON())
    }

    _performRefresh() {
        return $("not implemented")
    }
}

function we(e, t) {
    K("string" == typeof e || void 0 === e, "internal-error", {appName: t})
}

class Ae {
    constructor(e) {
        var {uid: t, auth: n, stsTokenManager: i} = e, r = w(e, ["uid", "auth", "stsTokenManager"]);
        this.providerId = "firebase", this.proactiveRefresh = new _e(this), this.reloadUserInfo = null, this.reloadListener = null, this.uid = t, this.auth = n, this.stsTokenManager = i, this.accessToken = i.accessToken, this.displayName = r.displayName || null, this.email = r.email || null, this.emailVerified = r.emailVerified || !1, this.phoneNumber = r.phoneNumber || null, this.photoURL = r.photoURL || null, this.isAnonymous = r.isAnonymous || !1, this.tenantId = r.tenantId || null, this.providerData = r.providerData ? [...r.providerData] : [], this.metadata = new Ie(r.createdAt || void 0, r.lastLoginAt || void 0)
    }

    async getIdToken(e) {
        const t = await ve(this, this.stsTokenManager.getToken(this.auth, e));
        return K(t, this.auth, "internal-error"), this.accessToken !== t && (this.accessToken = t, await this.auth._persistUserIfCurrent(this), this.auth._notifyListenersIfCurrent(this)), t
    }

    getIdTokenResult(e) {
        return fe(this, e)
    }

    reload() {
        return ye(this)
    }

    _assign(e) {
        this !== e && (K(this.uid === e.uid, this.auth, "internal-error"), this.displayName = e.displayName, this.photoURL = e.photoURL, this.email = e.email, this.emailVerified = e.emailVerified, this.phoneNumber = e.phoneNumber, this.isAnonymous = e.isAnonymous, this.tenantId = e.tenantId, this.providerData = e.providerData.map((e => Object.assign({}, e))), this.metadata._copy(e.metadata), this.stsTokenManager._assign(e.stsTokenManager))
    }

    _clone(e) {
        const t = new Ae(Object.assign(Object.assign({}, this), {
            auth: e,
            stsTokenManager: this.stsTokenManager._clone()
        }));
        return t.metadata._copy(this.metadata), t
    }

    _onReload(e) {
        K(!this.reloadListener, this.auth, "internal-error"), this.reloadListener = e, this.reloadUserInfo && (this._notifyReloadListener(this.reloadUserInfo), this.reloadUserInfo = null)
    }

    _notifyReloadListener(e) {
        this.reloadListener ? this.reloadListener(e) : this.reloadUserInfo = e
    }

    _startProactiveRefresh() {
        this.proactiveRefresh._start()
    }

    _stopProactiveRefresh() {
        this.proactiveRefresh._stop()
    }

    async _updateTokensIfNecessary(e, t = !1) {
        let n = !1;
        e.idToken && e.idToken !== this.stsTokenManager.accessToken && (this.stsTokenManager.updateFromServerResponse(e), n = !0), t && await Te(this), await this.auth._persistUserIfCurrent(this), n && this.auth._notifyListenersIfCurrent(this)
    }

    async delete() {
        const e = await this.getIdToken();
        return await ve(this, async function (e, t) {
            return oe(e, "POST", "/v1/accounts:delete", t)
        }(this.auth, {idToken: e})), this.stsTokenManager.clearRefreshToken(), this.auth.signOut()
    }

    toJSON() {
        return Object.assign(Object.assign({
            uid: this.uid,
            email: this.email || void 0,
            emailVerified: this.emailVerified,
            displayName: this.displayName || void 0,
            isAnonymous: this.isAnonymous,
            photoURL: this.photoURL || void 0,
            phoneNumber: this.phoneNumber || void 0,
            tenantId: this.tenantId || void 0,
            providerData: this.providerData.map((e => Object.assign({}, e))),
            stsTokenManager: this.stsTokenManager.toJSON(),
            _redirectEventId: this._redirectEventId
        }, this.metadata.toJSON()), {apiKey: this.auth.config.apiKey, appName: this.auth.name})
    }

    get refreshToken() {
        return this.stsTokenManager.refreshToken || ""
    }

    static _fromJSON(e, t) {
        var n, i, r, s, o, a, c, u;
        const d = null !== (n = t.displayName) && void 0 !== n ? n : void 0,
            l = null !== (i = t.email) && void 0 !== i ? i : void 0,
            h = null !== (r = t.phoneNumber) && void 0 !== r ? r : void 0,
            p = null !== (s = t.photoURL) && void 0 !== s ? s : void 0,
            f = null !== (o = t.tenantId) && void 0 !== o ? o : void 0,
            m = null !== (a = t._redirectEventId) && void 0 !== a ? a : void 0,
            g = null !== (c = t.createdAt) && void 0 !== c ? c : void 0,
            v = null !== (u = t.lastLoginAt) && void 0 !== u ? u : void 0, {
                uid: _,
                emailVerified: I,
                isAnonymous: T,
                providerData: y,
                stsTokenManager: E
            } = t;
        K(_ && E, e, "internal-error");
        const w = Ee.fromJSON(this.name, E);
        K("string" == typeof _, e, "internal-error"), we(d, e.name), we(l, e.name), K("boolean" == typeof I, e, "internal-error"), K("boolean" == typeof T, e, "internal-error"), we(h, e.name), we(p, e.name), we(f, e.name), we(m, e.name), we(g, e.name), we(v, e.name);
        const A = new Ae({
            uid: _,
            auth: e,
            email: l,
            emailVerified: I,
            displayName: d,
            isAnonymous: T,
            photoURL: p,
            phoneNumber: h,
            tenantId: f,
            stsTokenManager: w,
            createdAt: g,
            lastLoginAt: v
        });
        return y && Array.isArray(y) && (A.providerData = y.map((e => Object.assign({}, e)))), m && (A._redirectEventId = m), A
    }

    static async _fromIdTokenResponse(e, t, n = !1) {
        const i = new Ee;
        i.updateFromServerResponse(t);
        const r = new Ae({uid: t.localId, auth: e, stsTokenManager: i, isAnonymous: n});
        return await Te(r), r
    }
}

const ke = new Map;

function be(e) {
    J(e instanceof Function, "Expected a class definition");
    let t = ke.get(e);
    return t ? (J(t instanceof e, "Instance stored in cache mismatched with class"), t) : (t = new e, ke.set(e, t), t)
}

class Se {
    constructor() {
        this.type = "NONE", this.storage = {}
    }

    async _isAvailable() {
        return !0
    }

    async _set(e, t) {
        this.storage[e] = t
    }

    async _get(e) {
        const t = this.storage[e];
        return void 0 === t ? null : t
    }

    async _remove(e) {
        delete this.storage[e]
    }

    _addListener(e, t) {
    }

    _removeListener(e, t) {
    }
}

Se.type = "NONE";
const Re = Se;

function Ne(e, t, n) {
    return `firebase:${e}:${t}:${n}`
}

class Oe {
    constructor(e, t, n) {
        this.persistence = e, this.auth = t, this.userKey = n;
        const {config: i, name: r} = this.auth;
        this.fullUserKey = Ne(this.userKey, i.apiKey, r), this.fullPersistenceKey = Ne("persistence", i.apiKey, r), this.boundEventHandler = t._onStorageEvent.bind(t), this.persistence._addListener(this.fullUserKey, this.boundEventHandler)
    }

    setCurrentUser(e) {
        return this.persistence._set(this.fullUserKey, e.toJSON())
    }

    async getCurrentUser() {
        const e = await this.persistence._get(this.fullUserKey);
        return e ? Ae._fromJSON(this.auth, e) : null
    }

    removeCurrentUser() {
        return this.persistence._remove(this.fullUserKey)
    }

    savePersistenceForRedirect() {
        return this.persistence._set(this.fullPersistenceKey, this.persistence.type)
    }

    async setPersistence(e) {
        if (this.persistence === e) return;
        const t = await this.getCurrentUser();
        return await this.removeCurrentUser(), this.persistence = e, t ? this.setCurrentUser(t) : void 0
    }

    delete() {
        this.persistence._removeListener(this.fullUserKey, this.boundEventHandler)
    }

    static async create(e, t, n = "authUser") {
        if (!t.length) return new Oe(be(Re), e, n);
        const i = (await Promise.all(t.map((async e => {
            if (await e._isAvailable()) return e
        })))).filter((e => e));
        let r = i[0] || be(Re);
        const s = Ne(n, e.config.apiKey, e.name);
        let o = null;
        for (const n of t) try {
            const t = await n._get(s);
            if (t) {
                const i = Ae._fromJSON(e, t);
                n !== r && (o = i), r = n;
                break
            }
        } catch (e) {
        }
        const a = i.filter((e => e._shouldAllowMigration));
        return r._shouldAllowMigration && a.length ? (r = a[0], o && await r._set(s, o.toJSON()), await Promise.all(t.map((async e => {
            if (e !== r) try {
                await e._remove(s)
            } catch (e) {
            }
        }))), new Oe(r, e, n)) : new Oe(r, e, n)
    }
}

function Ce(e) {
    const t = e.toLowerCase();
    if (t.includes("opera/") || t.includes("opr/") || t.includes("opios/")) return "Opera";
    if (Me(t)) return "IEMobile";
    if (t.includes("msie") || t.includes("trident/")) return "IE";
    if (t.includes("edge/")) return "Edge";
    if (Pe(t)) return "Firefox";
    if (t.includes("silk/")) return "Silk";
    if (Fe(t)) return "Blackberry";
    if (Ve(t)) return "Webos";
    if (De(t)) return "Safari";
    if ((t.includes("chrome/") || Le(t)) && !t.includes("edge/")) return "Chrome";
    if (Ue(t)) return "Android";
    {
        const t = /([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/, n = e.match(t);
        if (2 === (null == n ? void 0 : n.length)) return n[1]
    }
    return "Other"
}

function Pe(e = l()) {
    return /firefox\//i.test(e)
}

function De(e = l()) {
    const t = e.toLowerCase();
    return t.includes("safari/") && !t.includes("chrome/") && !t.includes("crios/") && !t.includes("android")
}

function Le(e = l()) {
    return /crios\//i.test(e)
}

function Me(e = l()) {
    return /iemobile/i.test(e)
}

function Ue(e = l()) {
    return /android/i.test(e)
}

function Fe(e = l()) {
    return /blackberry/i.test(e)
}

function Ve(e = l()) {
    return /webos/i.test(e)
}

function xe(e = l()) {
    return /iphone|ipad|ipod/i.test(e) || /macintosh/i.test(e) && /mobile/i.test(e)
}

function He() {
    return function () {
        const e = l();
        return e.indexOf("MSIE ") >= 0 || e.indexOf("Trident/") >= 0
    }() && 10 === document.documentMode
}

function je(e = l()) {
    return xe(e) || Ue(e) || Ve(e) || Fe(e) || /windows phone/i.test(e) || Me(e)
}

function We(e, t = []) {
    let n;
    switch (e) {
        case"Browser":
            n = Ce(l());
            break;
        case"Worker":
            n = `${Ce(l())}-${e}`;
            break;
        default:
            n = e
    }
    const i = t.length ? t.join(",") : "FirebaseCore-web";
    return `${n}/JsCore/${r}/${i}`
}

async function qe(e, t) {
    return oe(e, "GET", "/v2/recaptchaConfig", se(e, t))
}

function ze(e) {
    return void 0 !== e && void 0 !== e.getResponse
}

function Ge(e) {
    return void 0 !== e && void 0 !== e.enterprise
}

class Be {
    constructor(e) {
        if (this.siteKey = "", this.emailPasswordEnabled = !1, void 0 === e.recaptchaKey) throw new Error("recaptchaKey undefined");
        this.siteKey = e.recaptchaKey.split("/")[3], this.emailPasswordEnabled = e.recaptchaEnforcementState.some((e => "EMAIL_PASSWORD_PROVIDER" === e.provider && "OFF" !== e.enforcementState))
    }
}

function Ke(e) {
    return new Promise(((t, n) => {
        const i = document.createElement("script");
        var r, s;
        i.setAttribute("src", e), i.onload = t, i.onerror = e => {
            const t = q("internal-error");
            t.customData = e, n(t)
        }, i.type = "text/javascript", i.charset = "UTF-8", (null !== (s = null === (r = document.getElementsByTagName("head")) || void 0 === r ? void 0 : r[0]) && void 0 !== s ? s : document).appendChild(i)
    }))
}

function $e(e) {
    return `__${e}${Math.floor(1e6 * Math.random())}`
}

class Je {
    constructor(e) {
        this.type = "recaptcha-enterprise", this.auth = Ze(e)
    }

    async verify(e = "verify", t = !1) {
        function n(t, n, i) {
            const r = window.grecaptcha;
            Ge(r) ? r.enterprise.ready((() => {
                r.enterprise.execute(t, {action: e}).then((e => {
                    n(e)
                })).catch((() => {
                    n("NO_RECAPTCHA")
                }))
            })) : i(Error("No reCAPTCHA enterprise script loaded."))
        }

        return new Promise(((e, i) => {
            (async function (e) {
                if (!t) {
                    if (null == e.tenantId && null != e._agentRecaptchaConfig) return e._agentRecaptchaConfig.siteKey;
                    if (null != e.tenantId && void 0 !== e._tenantRecaptchaConfigs[e.tenantId]) return e._tenantRecaptchaConfigs[e.tenantId].siteKey
                }
                return new Promise((async (t, n) => {
                    qe(e, {clientType: "CLIENT_TYPE_WEB", version: "RECAPTCHA_ENTERPRISE"}).then((i => {
                        if (void 0 !== i.recaptchaKey) {
                            const n = new Be(i);
                            return null == e.tenantId ? e._agentRecaptchaConfig = n : e._tenantRecaptchaConfigs[e.tenantId] = n, t(n.siteKey)
                        }
                        n(new Error("recaptcha Enterprise site key undefined"))
                    })).catch((e => {
                        n(e)
                    }))
                }))
            })(this.auth).then((r => {
                if (!t && Ge(window.grecaptcha)) n(r, e, i); else {
                    if ("undefined" == typeof window) return void i(new Error("RecaptchaVerifier is only supported in browser"));
                    Ke("https://www.google.com/recaptcha/enterprise.js?render=" + r).then((() => {
                        n(r, e, i)
                    })).catch((e => {
                        i(e)
                    }))
                }
            })).catch((e => {
                i(e)
            }))
        }))
    }
}

async function Ye(e, t, n, i = !1) {
    const r = new Je(e);
    let s;
    try {
        s = await r.verify(n)
    } catch (e) {
        s = await r.verify(n, !0)
    }
    const o = Object.assign({}, t);
    return i ? Object.assign(o, {captchaResp: s}) : Object.assign(o, {captchaResponse: s}), Object.assign(o, {clientType: "CLIENT_TYPE_WEB"}), Object.assign(o, {recaptchaVersion: "RECAPTCHA_ENTERPRISE"}), o
}

class Xe {
    constructor(e) {
        this.auth = e, this.queue = []
    }

    pushCallback(e, t) {
        const n = t => new Promise(((n, i) => {
            try {
                n(e(t))
            } catch (e) {
                i(e)
            }
        }));
        n.onAbort = t, this.queue.push(n);
        const i = this.queue.length - 1;
        return () => {
            this.queue[i] = () => Promise.resolve()
        }
    }

    async runMiddleware(e) {
        if (this.auth.currentUser === e) return;
        const t = [];
        try {
            for (const n of this.queue) await n(e), n.onAbort && t.push(n.onAbort)
        } catch (e) {
            t.reverse();
            for (const e of t) try {
                e()
            } catch (e) {
            }
            throw this.auth._errorFactory.create("login-blocked", {originalMessage: null == e ? void 0 : e.message})
        }
    }
}

class Qe {
    constructor(e, t, n, i) {
        this.app = e, this.heartbeatServiceProvider = t, this.appCheckServiceProvider = n, this.config = i, this.currentUser = null, this.emulatorConfig = null, this.operations = Promise.resolve(), this.authStateSubscription = new et(this), this.idTokenSubscription = new et(this), this.beforeStateQueue = new Xe(this), this.redirectUser = null, this.isProactiveRefreshEnabled = !1, this._canInitEmulator = !0, this._isInitialized = !1, this._deleted = !1, this._initializationPromise = null, this._popupRedirectResolver = null, this._errorFactory = V, this._agentRecaptchaConfig = null, this._tenantRecaptchaConfigs = {}, this.lastNotifiedUid = void 0, this.languageCode = null, this.tenantId = null, this.settings = {appVerificationDisabledForTesting: !1}, this.frameworks = [], this.name = e.name, this.clientVersion = i.sdkClientVersion
    }

    _initializeWithPersistence(e, t) {
        return t && (this._popupRedirectResolver = be(t)), this._initializationPromise = this.queue((async () => {
            var n, i;
            if (!this._deleted && (this.persistenceManager = await Oe.create(this, e), !this._deleted)) {
                if (null === (n = this._popupRedirectResolver) || void 0 === n ? void 0 : n._shouldInitProactively) try {
                    await this._popupRedirectResolver._initialize(this)
                } catch (e) {
                }
                await this.initializeCurrentUser(t), this.lastNotifiedUid = (null === (i = this.currentUser) || void 0 === i ? void 0 : i.uid) || null, this._deleted || (this._isInitialized = !0)
            }
        })), this._initializationPromise
    }

    async _onStorageEvent() {
        if (this._deleted) return;
        const e = await this.assertedPersistence.getCurrentUser();
        return this.currentUser || e ? this.currentUser && e && this.currentUser.uid === e.uid ? (this._currentUser._assign(e), void await this.currentUser.getIdToken()) : void await this._updateCurrentUser(e, !0) : void 0
    }

    async initializeCurrentUser(e) {
        var t;
        const n = await this.assertedPersistence.getCurrentUser();
        let i = n, r = !1;
        if (e && this.config.authDomain) {
            await this.getOrInitRedirectPersistenceManager();
            const n = null === (t = this.redirectUser) || void 0 === t ? void 0 : t._redirectEventId,
                s = null == i ? void 0 : i._redirectEventId, o = await this.tryRedirectSignIn(e);
            n && n !== s || !(null == o ? void 0 : o.user) || (i = o.user, r = !0)
        }
        if (!i) return this.directlySetCurrentUser(null);
        if (!i._redirectEventId) {
            if (r) try {
                await this.beforeStateQueue.runMiddleware(i)
            } catch (e) {
                i = n, this._popupRedirectResolver._overrideRedirectResult(this, (() => Promise.reject(e)))
            }
            return i ? this.reloadAndSetCurrentUserOrClear(i) : this.directlySetCurrentUser(null)
        }
        return K(this._popupRedirectResolver, this, "argument-error"), await this.getOrInitRedirectPersistenceManager(), this.redirectUser && this.redirectUser._redirectEventId === i._redirectEventId ? this.directlySetCurrentUser(i) : this.reloadAndSetCurrentUserOrClear(i)
    }

    async tryRedirectSignIn(e) {
        let t = null;
        try {
            t = await this._popupRedirectResolver._completeRedirectFn(this, e, !0)
        } catch (e) {
            await this._setRedirectUser(null)
        }
        return t
    }

    async reloadAndSetCurrentUserOrClear(e) {
        try {
            await Te(e)
        } catch (e) {
            if ("auth/network-request-failed" !== (null == e ? void 0 : e.code)) return this.directlySetCurrentUser(null)
        }
        return this.directlySetCurrentUser(e)
    }

    useDeviceLanguage() {
        this.languageCode = function () {
            if ("undefined" == typeof navigator) return null;
            const e = navigator;
            return e.languages && e.languages[0] || e.language || null
        }()
    }

    async _delete() {
        this._deleted = !0
    }

    async updateCurrentUser(e) {
        const t = e ? E(e) : null;
        return t && K(t.auth.config.apiKey === this.config.apiKey, this, "invalid-user-token"), this._updateCurrentUser(t && t._clone(this))
    }

    async _updateCurrentUser(e, t = !1) {
        if (!this._deleted) return e && K(this.tenantId === e.tenantId, this, "tenant-id-mismatch"), t || await this.beforeStateQueue.runMiddleware(e), this.queue((async () => {
            await this.directlySetCurrentUser(e), this.notifyAuthListeners()
        }))
    }

    async signOut() {
        return await this.beforeStateQueue.runMiddleware(null), (this.redirectPersistenceManager || this._popupRedirectResolver) && await this._setRedirectUser(null), this._updateCurrentUser(null, !0)
    }

    setPersistence(e) {
        return this.queue((async () => {
            await this.assertedPersistence.setPersistence(be(e))
        }))
    }

    async initializeRecaptchaConfig() {
        const e = await qe(this, {clientType: "CLIENT_TYPE_WEB", version: "RECAPTCHA_ENTERPRISE"}), t = new Be(e);
        if (null == this.tenantId ? this._agentRecaptchaConfig = t : this._tenantRecaptchaConfigs[this.tenantId] = t, t.emailPasswordEnabled) {
            new Je(this).verify()
        }
    }

    _getRecaptchaConfig() {
        return null == this.tenantId ? this._agentRecaptchaConfig : this._tenantRecaptchaConfigs[this.tenantId]
    }

    _getPersistence() {
        return this.assertedPersistence.persistence.type
    }

    _updateErrorMap(e) {
        this._errorFactory = new p("auth", "Firebase", e())
    }

    onAuthStateChanged(e, t, n) {
        return this.registerStateListener(this.authStateSubscription, e, t, n)
    }

    beforeAuthStateChanged(e, t) {
        return this.beforeStateQueue.pushCallback(e, t)
    }

    onIdTokenChanged(e, t, n) {
        return this.registerStateListener(this.idTokenSubscription, e, t, n)
    }

    toJSON() {
        var e;
        return {
            apiKey: this.config.apiKey,
            authDomain: this.config.authDomain,
            appName: this.name,
            currentUser: null === (e = this._currentUser) || void 0 === e ? void 0 : e.toJSON()
        }
    }

    async _setRedirectUser(e, t) {
        const n = await this.getOrInitRedirectPersistenceManager(t);
        return null === e ? n.removeCurrentUser() : n.setCurrentUser(e)
    }

    async getOrInitRedirectPersistenceManager(e) {
        if (!this.redirectPersistenceManager) {
            const t = e && be(e) || this._popupRedirectResolver;
            K(t, this, "argument-error"), this.redirectPersistenceManager = await Oe.create(this, [be(t._redirectPersistence)], "redirectUser"), this.redirectUser = await this.redirectPersistenceManager.getCurrentUser()
        }
        return this.redirectPersistenceManager
    }

    async _redirectUserForId(e) {
        var t, n;
        return this._isInitialized && await this.queue((async () => {
        })), (null === (t = this._currentUser) || void 0 === t ? void 0 : t._redirectEventId) === e ? this._currentUser : (null === (n = this.redirectUser) || void 0 === n ? void 0 : n._redirectEventId) === e ? this.redirectUser : null
    }

    async _persistUserIfCurrent(e) {
        if (e === this.currentUser) return this.queue((async () => this.directlySetCurrentUser(e)))
    }

    _notifyListenersIfCurrent(e) {
        e === this.currentUser && this.notifyAuthListeners()
    }

    _key() {
        return `${this.config.authDomain}:${this.config.apiKey}:${this.name}`
    }

    _startProactiveRefresh() {
        this.isProactiveRefreshEnabled = !0, this.currentUser && this._currentUser._startProactiveRefresh()
    }

    _stopProactiveRefresh() {
        this.isProactiveRefreshEnabled = !1, this.currentUser && this._currentUser._stopProactiveRefresh()
    }

    get _currentUser() {
        return this.currentUser
    }

    notifyAuthListeners() {
        var e, t;
        if (!this._isInitialized) return;
        this.idTokenSubscription.next(this.currentUser);
        const n = null !== (t = null === (e = this.currentUser) || void 0 === e ? void 0 : e.uid) && void 0 !== t ? t : null;
        this.lastNotifiedUid !== n && (this.lastNotifiedUid = n, this.authStateSubscription.next(this.currentUser))
    }

    registerStateListener(e, t, n, i) {
        if (this._deleted) return () => {
        };
        const r = "function" == typeof t ? t : t.next.bind(t),
            s = this._isInitialized ? Promise.resolve() : this._initializationPromise;
        return K(s, this, "internal-error"), s.then((() => r(this.currentUser))), "function" == typeof t ? e.addObserver(t, n, i) : e.addObserver(t)
    }

    async directlySetCurrentUser(e) {
        this.currentUser && this.currentUser !== e && this._currentUser._stopProactiveRefresh(), e && this.isProactiveRefreshEnabled && e._startProactiveRefresh(), this.currentUser = e, e ? await this.assertedPersistence.setCurrentUser(e) : await this.assertedPersistence.removeCurrentUser()
    }

    queue(e) {
        return this.operations = this.operations.then(e, e), this.operations
    }

    get assertedPersistence() {
        return K(this.persistenceManager, this, "internal-error"), this.persistenceManager
    }

    _logFramework(e) {
        e && !this.frameworks.includes(e) && (this.frameworks.push(e), this.frameworks.sort(), this.clientVersion = We(this.config.clientPlatform, this._getFrameworks()))
    }

    _getFrameworks() {
        return this.frameworks
    }

    async _getAdditionalHeaders() {
        var e;
        const t = {"X-Client-Version": this.clientVersion};
        this.app.options.appId && (t["X-Firebase-gmpid"] = this.app.options.appId);
        const n = await (null === (e = this.heartbeatServiceProvider.getImmediate({optional: !0})) || void 0 === e ? void 0 : e.getHeartbeatsHeader());
        n && (t["X-Firebase-Client"] = n);
        const i = await this._getAppCheckToken();
        return i && (t["X-Firebase-AppCheck"] = i), t
    }

    async _getAppCheckToken() {
        var e;
        const t = await (null === (e = this.appCheckServiceProvider.getImmediate({optional: !0})) || void 0 === e ? void 0 : e.getToken());
        return (null == t ? void 0 : t.error) && function (e, ...t) {
            H.logLevel <= A.WARN && H.warn(`Auth (${r}): ${e}`, ...t)
        }(`Error while retrieving App Check token: ${t.error}`), null == t ? void 0 : t.token
    }
}

function Ze(e) {
    return E(e)
}

class et {
    constructor(e) {
        this.auth = e, this.observer = null, this.addObserver = function (e, t) {
            const n = new T(e, t);
            return n.subscribe.bind(n)
        }((e => this.observer = e))
    }

    get next() {
        return K(this.observer, this.auth, "internal-error"), this.observer.next.bind(this.observer)
    }
}

function tt(t, n) {
    const i = e(t, "auth");
    if (i.isInitialized()) {
        const e = i.getImmediate();
        if (m(i.getOptions(), null != n ? n : {})) return e;
        W(e, "already-initialized")
    }
    return i.initialize({options: n})
}

function nt(e, t, n) {
    const i = Ze(e);
    K(i._canInitEmulator, i, "emulator-config-failed"), K(/^https?:\/\//.test(t), i, "invalid-emulator-scheme");
    const r = !!(null == n ? void 0 : n.disableWarnings), s = it(t), {host: o, port: a} = function (e) {
        const t = it(e), n = /(\/\/)?([^?#/]+)/.exec(e.substr(t.length));
        if (!n) return {host: "", port: null};
        const i = n[2].split("@").pop() || "", r = /^(\[[^\]]+\])(:|$)/.exec(i);
        if (r) {
            const e = r[1];
            return {host: e, port: rt(i.substr(e.length + 1))}
        }
        {
            const [e, t] = i.split(":");
            return {host: e, port: rt(t)}
        }
    }(t), c = null === a ? "" : `:${a}`;
    i.config.emulator = {url: `${s}//${o}${c}/`}, i.settings.appVerificationDisabledForTesting = !0, i.emulatorConfig = Object.freeze({
        host: o,
        port: a,
        protocol: s.replace(":", ""),
        options: Object.freeze({disableWarnings: r})
    }), r || function () {
        function e() {
            const e = document.createElement("p"), t = e.style;
            e.innerText = "Running in emulator mode. Do not use with production credentials.", t.position = "fixed", t.width = "100%", t.backgroundColor = "#ffffff", t.border = ".1em solid #000000", t.color = "#b50000", t.bottom = "0px", t.left = "0px", t.margin = "0px", t.zIndex = "10000", t.textAlign = "center", e.classList.add("firebase-emulator-warning"), document.body.appendChild(e)
        }

        "undefined" != typeof console && "function" == typeof console.info && console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials.");
        "undefined" != typeof window && "undefined" != typeof document && ("loading" === document.readyState ? window.addEventListener("DOMContentLoaded", e) : e())
    }()
}

function it(e) {
    const t = e.indexOf(":");
    return t < 0 ? "" : e.substr(0, t + 1)
}

function rt(e) {
    if (!e) return null;
    const t = Number(e);
    return isNaN(t) ? null : t
}

class st {
    constructor(e, t) {
        this.providerId = e, this.signInMethod = t
    }

    toJSON() {
        return $("not implemented")
    }

    _getIdTokenResponse(e) {
        return $("not implemented")
    }

    _linkToIdToken(e, t) {
        return $("not implemented")
    }

    _getReauthenticationResolver(e) {
        return $("not implemented")
    }
}

async function ot(e, t) {
    return oe(e, "POST", "/v1/accounts:resetPassword", se(e, t))
}

async function at(e, t) {
    return oe(e, "POST", "/v1/accounts:update", t)
}

async function ct(e, t) {
    return ce(e, "POST", "/v1/accounts:signInWithPassword", se(e, t))
}

async function ut(e, t) {
    return oe(e, "POST", "/v1/accounts:sendOobCode", se(e, t))
}

async function dt(e, t) {
    return ut(e, t)
}

async function lt(e, t) {
    return ut(e, t)
}

class ht extends st {
    constructor(e, t, n, i = null) {
        super("password", n), this._email = e, this._password = t, this._tenantId = i
    }

    static _fromEmailAndPassword(e, t) {
        return new ht(e, t, "password")
    }

    static _fromEmailAndCode(e, t, n = null) {
        return new ht(e, t, "emailLink", n)
    }

    toJSON() {
        return {email: this._email, password: this._password, signInMethod: this.signInMethod, tenantId: this._tenantId}
    }

    static fromJSON(e) {
        const t = "string" == typeof e ? JSON.parse(e) : e;
        if ((null == t ? void 0 : t.email) && (null == t ? void 0 : t.password)) {
            if ("password" === t.signInMethod) return this._fromEmailAndPassword(t.email, t.password);
            if ("emailLink" === t.signInMethod) return this._fromEmailAndCode(t.email, t.password, t.tenantId)
        }
        return null
    }

    async _getIdTokenResponse(e) {
        var t;
        switch (this.signInMethod) {
            case"password":
                const n = {
                    returnSecureToken: !0,
                    email: this._email,
                    password: this._password,
                    clientType: "CLIENT_TYPE_WEB"
                };
                if (null === (t = e._getRecaptchaConfig()) || void 0 === t ? void 0 : t.emailPasswordEnabled) {
                    const t = await Ye(e, n, "signInWithPassword");
                    return ct(e, t)
                }
                return ct(e, n).catch((async t => {
                    if ("auth/missing-recaptcha-token" === t.code) {
                        console.log("Sign-in with email address and password is protected by reCAPTCHA for this project. Automatically triggering the reCAPTCHA flow and restarting the sign-in flow.");
                        const t = await Ye(e, n, "signInWithPassword");
                        return ct(e, t)
                    }
                    return Promise.reject(t)
                }));
            case"emailLink":
                return async function (e, t) {
                    return ce(e, "POST", "/v1/accounts:signInWithEmailLink", se(e, t))
                }(e, {email: this._email, oobCode: this._password});
            default:
                W(e, "internal-error")
        }
    }

    async _linkToIdToken(e, t) {
        switch (this.signInMethod) {
            case"password":
                return at(e, {idToken: t, returnSecureToken: !0, email: this._email, password: this._password});
            case"emailLink":
                return async function (e, t) {
                    return ce(e, "POST", "/v1/accounts:signInWithEmailLink", se(e, t))
                }(e, {idToken: t, email: this._email, oobCode: this._password});
            default:
                W(e, "internal-error")
        }
    }

    _getReauthenticationResolver(e) {
        return this._getIdTokenResponse(e)
    }
}

async function pt(e, t) {
    return ce(e, "POST", "/v1/accounts:signInWithIdp", se(e, t))
}

class ft extends st {
    constructor() {
        super(...arguments), this.pendingToken = null
    }

    static _fromParams(e) {
        const t = new ft(e.providerId, e.signInMethod);
        return e.idToken || e.accessToken ? (e.idToken && (t.idToken = e.idToken), e.accessToken && (t.accessToken = e.accessToken), e.nonce && !e.pendingToken && (t.nonce = e.nonce), e.pendingToken && (t.pendingToken = e.pendingToken)) : e.oauthToken && e.oauthTokenSecret ? (t.accessToken = e.oauthToken, t.secret = e.oauthTokenSecret) : W("argument-error"), t
    }

    toJSON() {
        return {
            idToken: this.idToken,
            accessToken: this.accessToken,
            secret: this.secret,
            nonce: this.nonce,
            pendingToken: this.pendingToken,
            providerId: this.providerId,
            signInMethod: this.signInMethod
        }
    }

    static fromJSON(e) {
        const t = "string" == typeof e ? JSON.parse(e) : e, {providerId: n, signInMethod: i} = t,
            r = w(t, ["providerId", "signInMethod"]);
        if (!n || !i) return null;
        const s = new ft(n, i);
        return s.idToken = r.idToken || void 0, s.accessToken = r.accessToken || void 0, s.secret = r.secret, s.nonce = r.nonce, s.pendingToken = r.pendingToken || null, s
    }

    _getIdTokenResponse(e) {
        return pt(e, this.buildRequest())
    }

    _linkToIdToken(e, t) {
        const n = this.buildRequest();
        return n.idToken = t, pt(e, n)
    }

    _getReauthenticationResolver(e) {
        const t = this.buildRequest();
        return t.autoCreate = !1, pt(e, t)
    }

    buildRequest() {
        const e = {requestUri: "http://localhost", returnSecureToken: !0};
        if (this.pendingToken) e.pendingToken = this.pendingToken; else {
            const t = {};
            this.idToken && (t.id_token = this.idToken), this.accessToken && (t.access_token = this.accessToken), this.secret && (t.oauth_token_secret = this.secret), t.providerId = this.providerId, this.nonce && !this.pendingToken && (t.nonce = this.nonce), e.postBody = v(t)
        }
        return e
    }
}

const mt = {USER_NOT_FOUND: "user-not-found"};

class gt extends st {
    constructor(e) {
        super("phone", "phone"), this.params = e
    }

    static _fromVerification(e, t) {
        return new gt({verificationId: e, verificationCode: t})
    }

    static _fromTokenResponse(e, t) {
        return new gt({phoneNumber: e, temporaryProof: t})
    }

    _getIdTokenResponse(e) {
        return async function (e, t) {
            return ce(e, "POST", "/v1/accounts:signInWithPhoneNumber", se(e, t))
        }(e, this._makeVerificationRequest())
    }

    _linkToIdToken(e, t) {
        return async function (e, t) {
            const n = await ce(e, "POST", "/v1/accounts:signInWithPhoneNumber", se(e, t));
            if (n.temporaryProof) throw le(e, "account-exists-with-different-credential", n);
            return n
        }(e, Object.assign({idToken: t}, this._makeVerificationRequest()))
    }

    _getReauthenticationResolver(e) {
        return async function (e, t) {
            return ce(e, "POST", "/v1/accounts:signInWithPhoneNumber", se(e, Object.assign(Object.assign({}, t), {operation: "REAUTH"})), mt)
        }(e, this._makeVerificationRequest())
    }

    _makeVerificationRequest() {
        const {temporaryProof: e, phoneNumber: t, verificationId: n, verificationCode: i} = this.params;
        return e && t ? {temporaryProof: e, phoneNumber: t} : {sessionInfo: n, code: i}
    }

    toJSON() {
        const e = {providerId: this.providerId};
        return this.params.phoneNumber && (e.phoneNumber = this.params.phoneNumber), this.params.temporaryProof && (e.temporaryProof = this.params.temporaryProof), this.params.verificationCode && (e.verificationCode = this.params.verificationCode), this.params.verificationId && (e.verificationId = this.params.verificationId), e
    }

    static fromJSON(e) {
        "string" == typeof e && (e = JSON.parse(e));
        const {verificationId: t, verificationCode: n, phoneNumber: i, temporaryProof: r} = e;
        return n || t || i || r ? new gt({
            verificationId: t,
            verificationCode: n,
            phoneNumber: i,
            temporaryProof: r
        }) : null
    }
}

class vt {
    constructor(e) {
        var t, n, i, r, s, o;
        const a = _(I(e)), c = null !== (t = a.apiKey) && void 0 !== t ? t : null,
            u = null !== (n = a.oobCode) && void 0 !== n ? n : null, d = function (e) {
                switch (e) {
                    case"recoverEmail":
                        return "RECOVER_EMAIL";
                    case"resetPassword":
                        return "PASSWORD_RESET";
                    case"signIn":
                        return "EMAIL_SIGNIN";
                    case"verifyEmail":
                        return "VERIFY_EMAIL";
                    case"verifyAndChangeEmail":
                        return "VERIFY_AND_CHANGE_EMAIL";
                    case"revertSecondFactorAddition":
                        return "REVERT_SECOND_FACTOR_ADDITION";
                    default:
                        return null
                }
            }(null !== (i = a.mode) && void 0 !== i ? i : null);
        K(c && u && d, "argument-error"), this.apiKey = c, this.operation = d, this.code = u, this.continueUrl = null !== (r = a.continueUrl) && void 0 !== r ? r : null, this.languageCode = null !== (s = a.languageCode) && void 0 !== s ? s : null, this.tenantId = null !== (o = a.tenantId) && void 0 !== o ? o : null
    }

    static parseLink(e) {
        const t = function (e) {
            const t = _(I(e)).link, n = t ? _(I(t)).deep_link_id : null, i = _(I(e)).deep_link_id;
            return (i ? _(I(i)).link : null) || i || n || t || e
        }(e);
        try {
            return new vt(t)
        } catch (e) {
            return null
        }
    }
}

function _t(e) {
    return vt.parseLink(e)
}

class It {
    constructor() {
        this.providerId = It.PROVIDER_ID
    }

    static credential(e, t) {
        return ht._fromEmailAndPassword(e, t)
    }

    static credentialWithLink(e, t) {
        const n = vt.parseLink(t);
        return K(n, "argument-error"), ht._fromEmailAndCode(e, n.code, n.tenantId)
    }
}

It.PROVIDER_ID = "password", It.EMAIL_PASSWORD_SIGN_IN_METHOD = "password", It.EMAIL_LINK_SIGN_IN_METHOD = "emailLink";

class Tt {
    constructor(e) {
        this.providerId = e, this.defaultLanguageCode = null, this.customParameters = {}
    }

    setDefaultLanguage(e) {
        this.defaultLanguageCode = e
    }

    setCustomParameters(e) {
        return this.customParameters = e, this
    }

    getCustomParameters() {
        return this.customParameters
    }
}

class yt extends Tt {
    constructor() {
        super(...arguments), this.scopes = []
    }

    addScope(e) {
        return this.scopes.includes(e) || this.scopes.push(e), this
    }

    getScopes() {
        return [...this.scopes]
    }
}

class Et extends yt {
    static credentialFromJSON(e) {
        const t = "string" == typeof e ? JSON.parse(e) : e;
        return K("providerId" in t && "signInMethod" in t, "argument-error"), ft._fromParams(t)
    }

    credential(e) {
        return this._credential(Object.assign(Object.assign({}, e), {nonce: e.rawNonce}))
    }

    _credential(e) {
        return K(e.idToken || e.accessToken, "argument-error"), ft._fromParams(Object.assign(Object.assign({}, e), {
            providerId: this.providerId,
            signInMethod: this.providerId
        }))
    }

    static credentialFromResult(e) {
        return Et.oauthCredentialFromTaggedObject(e)
    }

    static credentialFromError(e) {
        return Et.oauthCredentialFromTaggedObject(e.customData || {})
    }

    static oauthCredentialFromTaggedObject({_tokenResponse: e}) {
        if (!e) return null;
        const {oauthIdToken: t, oauthAccessToken: n, oauthTokenSecret: i, pendingToken: r, nonce: s, providerId: o} = e;
        if (!(n || i || t || r)) return null;
        if (!o) return null;
        try {
            return new Et(o)._credential({idToken: t, accessToken: n, nonce: s, pendingToken: r})
        } catch (e) {
            return null
        }
    }
}

class wt extends yt {
    constructor() {
        super("facebook.com")
    }

    static credential(e) {
        return ft._fromParams({providerId: wt.PROVIDER_ID, signInMethod: wt.FACEBOOK_SIGN_IN_METHOD, accessToken: e})
    }

    static credentialFromResult(e) {
        return wt.credentialFromTaggedObject(e)
    }

    static credentialFromError(e) {
        return wt.credentialFromTaggedObject(e.customData || {})
    }

    static credentialFromTaggedObject({_tokenResponse: e}) {
        if (!e || !("oauthAccessToken" in e)) return null;
        if (!e.oauthAccessToken) return null;
        try {
            return wt.credential(e.oauthAccessToken)
        } catch (e) {
            return null
        }
    }
}

wt.FACEBOOK_SIGN_IN_METHOD = "facebook.com", wt.PROVIDER_ID = "facebook.com";

class At extends yt {
    constructor() {
        super("google.com"), this.addScope("profile")
    }

    static credential(e, t) {
        return ft._fromParams({
            providerId: At.PROVIDER_ID,
            signInMethod: At.GOOGLE_SIGN_IN_METHOD,
            idToken: e,
            accessToken: t
        })
    }

    static credentialFromResult(e) {
        return At.credentialFromTaggedObject(e)
    }

    static credentialFromError(e) {
        return At.credentialFromTaggedObject(e.customData || {})
    }

    static credentialFromTaggedObject({_tokenResponse: e}) {
        if (!e) return null;
        const {oauthIdToken: t, oauthAccessToken: n} = e;
        if (!t && !n) return null;
        try {
            return At.credential(t, n)
        } catch (e) {
            return null
        }
    }
}

At.GOOGLE_SIGN_IN_METHOD = "google.com", At.PROVIDER_ID = "google.com";

class kt extends yt {
    constructor() {
        super("github.com")
    }

    static credential(e) {
        return ft._fromParams({providerId: kt.PROVIDER_ID, signInMethod: kt.GITHUB_SIGN_IN_METHOD, accessToken: e})
    }

    static credentialFromResult(e) {
        return kt.credentialFromTaggedObject(e)
    }

    static credentialFromError(e) {
        return kt.credentialFromTaggedObject(e.customData || {})
    }

    static credentialFromTaggedObject({_tokenResponse: e}) {
        if (!e || !("oauthAccessToken" in e)) return null;
        if (!e.oauthAccessToken) return null;
        try {
            return kt.credential(e.oauthAccessToken)
        } catch (e) {
            return null
        }
    }
}

kt.GITHUB_SIGN_IN_METHOD = "github.com", kt.PROVIDER_ID = "github.com";

class bt extends st {
    constructor(e, t) {
        super(e, e), this.pendingToken = t
    }

    _getIdTokenResponse(e) {
        return pt(e, this.buildRequest())
    }

    _linkToIdToken(e, t) {
        const n = this.buildRequest();
        return n.idToken = t, pt(e, n)
    }

    _getReauthenticationResolver(e) {
        const t = this.buildRequest();
        return t.autoCreate = !1, pt(e, t)
    }

    toJSON() {
        return {signInMethod: this.signInMethod, providerId: this.providerId, pendingToken: this.pendingToken}
    }

    static fromJSON(e) {
        const t = "string" == typeof e ? JSON.parse(e) : e, {providerId: n, signInMethod: i, pendingToken: r} = t;
        return n && i && r && n === i ? new bt(n, r) : null
    }

    static _create(e, t) {
        return new bt(e, t)
    }

    buildRequest() {
        return {requestUri: "http://localhost", returnSecureToken: !0, pendingToken: this.pendingToken}
    }
}

class St extends Tt {
    constructor(e) {
        K(e.startsWith("saml."), "argument-error"), super(e)
    }

    static credentialFromResult(e) {
        return St.samlCredentialFromTaggedObject(e)
    }

    static credentialFromError(e) {
        return St.samlCredentialFromTaggedObject(e.customData || {})
    }

    static credentialFromJSON(e) {
        const t = bt.fromJSON(e);
        return K(t, "argument-error"), t
    }

    static samlCredentialFromTaggedObject({_tokenResponse: e}) {
        if (!e) return null;
        const {pendingToken: t, providerId: n} = e;
        if (!t || !n) return null;
        try {
            return bt._create(n, t)
        } catch (e) {
            return null
        }
    }
}

class Rt extends yt {
    constructor() {
        super("twitter.com")
    }

    static credential(e, t) {
        return ft._fromParams({
            providerId: Rt.PROVIDER_ID,
            signInMethod: Rt.TWITTER_SIGN_IN_METHOD,
            oauthToken: e,
            oauthTokenSecret: t
        })
    }

    static credentialFromResult(e) {
        return Rt.credentialFromTaggedObject(e)
    }

    static credentialFromError(e) {
        return Rt.credentialFromTaggedObject(e.customData || {})
    }

    static credentialFromTaggedObject({_tokenResponse: e}) {
        if (!e) return null;
        const {oauthAccessToken: t, oauthTokenSecret: n} = e;
        if (!t || !n) return null;
        try {
            return Rt.credential(t, n)
        } catch (e) {
            return null
        }
    }
}

async function Nt(e, t) {
    return ce(e, "POST", "/v1/accounts:signUp", se(e, t))
}

Rt.TWITTER_SIGN_IN_METHOD = "twitter.com", Rt.PROVIDER_ID = "twitter.com";

class Ot {
    constructor(e) {
        this.user = e.user, this.providerId = e.providerId, this._tokenResponse = e._tokenResponse, this.operationType = e.operationType
    }

    static async _fromIdTokenResponse(e, t, n, i = !1) {
        const r = await Ae._fromIdTokenResponse(e, n, i), s = Ct(n);
        return new Ot({user: r, providerId: s, _tokenResponse: n, operationType: t})
    }

    static async _forOperation(e, t, n) {
        await e._updateTokensIfNecessary(n, !0);
        const i = Ct(n);
        return new Ot({user: e, providerId: i, _tokenResponse: n, operationType: t})
    }
}

function Ct(e) {
    return e.providerId ? e.providerId : "phoneNumber" in e ? "phone" : null
}

async function Pt(e) {
    var t;
    const n = Ze(e);
    if (await n._initializationPromise, null === (t = n.currentUser) || void 0 === t ? void 0 : t.isAnonymous) return new Ot({
        user: n.currentUser,
        providerId: null,
        operationType: "signIn"
    });
    const i = await Nt(n, {returnSecureToken: !0}), r = await Ot._fromIdTokenResponse(n, "signIn", i, !0);
    return await n._updateCurrentUser(r.user), r
}

class Dt extends h {
    constructor(e, t, n, i) {
        var r;
        super(t.code, t.message), this.operationType = n, this.user = i, Object.setPrototypeOf(this, Dt.prototype), this.customData = {
            appName: e.name,
            tenantId: null !== (r = e.tenantId) && void 0 !== r ? r : void 0,
            _serverResponse: t.customData._serverResponse,
            operationType: n
        }
    }

    static _fromErrorAndOperation(e, t, n, i) {
        return new Dt(e, t, n, i)
    }
}

function Lt(e, t, n, i) {
    return ("reauthenticate" === t ? n._getReauthenticationResolver(e) : n._getIdTokenResponse(e)).catch((n => {
        if ("auth/multi-factor-auth-required" === n.code) throw Dt._fromErrorAndOperation(e, n, t, i);
        throw n
    }))
}

function Mt(e) {
    return new Set(e.map((({providerId: e}) => e)).filter((e => !!e)))
}

async function Ut(e, t) {
    const n = E(e);
    await Vt(!0, n, t);
    const {providerUserInfo: i} = await async function (e, t) {
        return oe(e, "POST", "/v1/accounts:update", t)
    }(n.auth, {idToken: await n.getIdToken(), deleteProvider: [t]}), r = Mt(i || []);
    return n.providerData = n.providerData.filter((e => r.has(e.providerId))), r.has("phone") || (n.phoneNumber = null), await n.auth._persistUserIfCurrent(n), n
}

async function Ft(e, t, n = !1) {
    const i = await ve(e, t._linkToIdToken(e.auth, await e.getIdToken()), n);
    return Ot._forOperation(e, "link", i)
}

async function Vt(e, t, n) {
    await Te(t);
    const i = !1 === e ? "provider-already-linked" : "no-such-provider";
    K(Mt(t.providerData).has(n) === e, t.auth, i)
}

async function xt(e, t, n = !1) {
    const {auth: i} = e, r = "reauthenticate";
    try {
        const s = await ve(e, Lt(i, r, t, e), n);
        K(s.idToken, i, "internal-error");
        const o = ge(s.idToken);
        K(o, i, "internal-error");
        const {sub: a} = o;
        return K(e.uid === a, i, "user-mismatch"), Ot._forOperation(e, r, s)
    } catch (e) {
        throw "auth/user-not-found" === (null == e ? void 0 : e.code) && W(i, "user-mismatch"), e
    }
}

async function Ht(e, t, n = !1) {
    const i = "signIn", r = await Lt(e, i, t), s = await Ot._fromIdTokenResponse(e, i, r);
    return n || await e._updateCurrentUser(s.user), s
}

async function jt(e, t) {
    return Ht(Ze(e), t)
}

async function Wt(e, t) {
    const n = E(e);
    return await Vt(!1, n, t.providerId), Ft(n, t)
}

async function qt(e, t) {
    return xt(E(e), t)
}

async function zt(e, t) {
    const n = Ze(e), i = await async function (e, t) {
        return ce(e, "POST", "/v1/accounts:signInWithCustomToken", se(e, t))
    }(n, {token: t, returnSecureToken: !0}), r = await Ot._fromIdTokenResponse(n, "signIn", i);
    return await n._updateCurrentUser(r.user), r
}

class Gt {
    constructor(e, t) {
        this.factorId = e, this.uid = t.mfaEnrollmentId, this.enrollmentTime = new Date(t.enrolledAt).toUTCString(), this.displayName = t.displayName
    }

    static _fromServerResponse(e, t) {
        return "phoneInfo" in t ? Bt._fromServerResponse(e, t) : "totpInfo" in t ? Kt._fromServerResponse(e, t) : W(e, "internal-error")
    }
}

class Bt extends Gt {
    constructor(e) {
        super("phone", e), this.phoneNumber = e.phoneInfo
    }

    static _fromServerResponse(e, t) {
        return new Bt(t)
    }
}

class Kt extends Gt {
    constructor(e) {
        super("totp", e)
    }

    static _fromServerResponse(e, t) {
        return new Kt(t)
    }
}

function $t(e, t, n) {
    var i;
    K((null === (i = n.url) || void 0 === i ? void 0 : i.length) > 0, e, "invalid-continue-uri"), K(void 0 === n.dynamicLinkDomain || n.dynamicLinkDomain.length > 0, e, "invalid-dynamic-link-domain"), t.continueUrl = n.url, t.dynamicLinkDomain = n.dynamicLinkDomain, t.canHandleCodeInApp = n.handleCodeInApp, n.iOS && (K(n.iOS.bundleId.length > 0, e, "missing-ios-bundle-id"), t.iOSBundleId = n.iOS.bundleId), n.android && (K(n.android.packageName.length > 0, e, "missing-android-pkg-name"), t.androidInstallApp = n.android.installApp, t.androidMinimumVersionCode = n.android.minimumVersion, t.androidPackageName = n.android.packageName)
}

async function Jt(e, t, n) {
    var i;
    const r = Ze(e), s = {requestType: "PASSWORD_RESET", email: t, clientType: "CLIENT_TYPE_WEB"};
    if (null === (i = r._getRecaptchaConfig()) || void 0 === i ? void 0 : i.emailPasswordEnabled) {
        const e = await Ye(r, s, "getOobCode", !0);
        n && $t(r, e, n), await dt(r, e)
    } else n && $t(r, s, n), await dt(r, s).catch((async e => {
        if ("auth/missing-recaptcha-token" !== e.code) return Promise.reject(e);
        {
            console.log("Password resets are protected by reCAPTCHA for this project. Automatically triggering the reCAPTCHA flow and restarting the password reset flow.");
            const e = await Ye(r, s, "getOobCode", !0);
            n && $t(r, e, n), await dt(r, e)
        }
    }))
}

async function Yt(e, t, n) {
    await ot(E(e), {oobCode: t, newPassword: n})
}

async function Xt(e, t) {
    await async function (e, t) {
        return oe(e, "POST", "/v1/accounts:update", se(e, t))
    }(E(e), {oobCode: t})
}

async function Qt(e, t) {
    const n = E(e), i = await ot(n, {oobCode: t}), r = i.requestType;
    switch (K(r, n, "internal-error"), r) {
        case"EMAIL_SIGNIN":
            break;
        case"VERIFY_AND_CHANGE_EMAIL":
            K(i.newEmail, n, "internal-error");
            break;
        case"REVERT_SECOND_FACTOR_ADDITION":
            K(i.mfaInfo, n, "internal-error");
        default:
            K(i.email, n, "internal-error")
    }
    let s = null;
    return i.mfaInfo && (s = Gt._fromServerResponse(Ze(n), i.mfaInfo)), {
        data: {
            email: ("VERIFY_AND_CHANGE_EMAIL" === i.requestType ? i.newEmail : i.email) || null,
            previousEmail: ("VERIFY_AND_CHANGE_EMAIL" === i.requestType ? i.email : i.newEmail) || null,
            multiFactorInfo: s
        }, operation: r
    }
}

async function Zt(e, t) {
    const {data: n} = await Qt(E(e), t);
    return n.email
}

async function en(e, t, n) {
    var i;
    const r = Ze(e), s = {returnSecureToken: !0, email: t, password: n, clientType: "CLIENT_TYPE_WEB"};
    let o;
    if (null === (i = r._getRecaptchaConfig()) || void 0 === i ? void 0 : i.emailPasswordEnabled) {
        const e = await Ye(r, s, "signUpPassword");
        o = Nt(r, e)
    } else o = Nt(r, s).catch((async e => {
        if ("auth/missing-recaptcha-token" === e.code) {
            console.log("Sign-up is protected by reCAPTCHA for this project. Automatically triggering the reCAPTCHA flow and restarting the sign-up flow.");
            const e = await Ye(r, s, "signUpPassword");
            return Nt(r, e)
        }
        return Promise.reject(e)
    }));
    const a = await o.catch((e => Promise.reject(e))), c = await Ot._fromIdTokenResponse(r, "signIn", a);
    return await r._updateCurrentUser(c.user), c
}

function tn(e, t, n) {
    return jt(E(e), It.credential(t, n))
}

async function nn(e, t, n) {
    var i;
    const r = Ze(e), s = {requestType: "EMAIL_SIGNIN", email: t, clientType: "CLIENT_TYPE_WEB"};

    function o(e, t) {
        K(t.handleCodeInApp, r, "argument-error"), t && $t(r, e, t)
    }

    if (null === (i = r._getRecaptchaConfig()) || void 0 === i ? void 0 : i.emailPasswordEnabled) {
        const e = await Ye(r, s, "getOobCode", !0);
        o(e, n), await lt(r, e)
    } else o(s, n), await lt(r, s).catch((async e => {
        if ("auth/missing-recaptcha-token" !== e.code) return Promise.reject(e);
        {
            console.log("Email link sign-in is protected by reCAPTCHA for this project. Automatically triggering the reCAPTCHA flow and restarting the sign-in flow.");
            const e = await Ye(r, s, "getOobCode", !0);
            o(e, n), await lt(r, e)
        }
    }))
}

function rn(e, t) {
    const n = vt.parseLink(t);
    return "EMAIL_SIGNIN" === (null == n ? void 0 : n.operation)
}

async function sn(e, t, n) {
    const i = E(e), r = It.credentialWithLink(t, n || Y());
    return K(r._tenantId === (i.tenantId || null), i, "tenant-id-mismatch"), jt(i, r)
}

async function on(e, t) {
    const n = {
        identifier: t,
        continueUri: X() ? Y() : "http://localhost"
    }, {signinMethods: i} = await async function (e, t) {
        return oe(e, "POST", "/v1/accounts:createAuthUri", se(e, t))
    }(E(e), n);
    return i || []
}

async function an(e, t) {
    const n = E(e), i = {requestType: "VERIFY_EMAIL", idToken: await e.getIdToken()};
    t && $t(n.auth, i, t);
    const {email: r} = await async function (e, t) {
        return ut(e, t)
    }(n.auth, i);
    r !== e.email && await e.reload()
}

async function cn(e, t, n) {
    const i = E(e), r = {requestType: "VERIFY_AND_CHANGE_EMAIL", idToken: await e.getIdToken(), newEmail: t};
    n && $t(i.auth, r, n);
    const {email: s} = await async function (e, t) {
        return ut(e, t)
    }(i.auth, r);
    s !== e.email && await e.reload()
}

async function un(e, {displayName: t, photoURL: n}) {
    if (void 0 === t && void 0 === n) return;
    const i = E(e), r = {idToken: await i.getIdToken(), displayName: t, photoUrl: n, returnSecureToken: !0},
        s = await ve(i, async function (e, t) {
            return oe(e, "POST", "/v1/accounts:update", t)
        }(i.auth, r));
    i.displayName = s.displayName || null, i.photoURL = s.photoUrl || null;
    const o = i.providerData.find((({providerId: e}) => "password" === e));
    o && (o.displayName = i.displayName, o.photoURL = i.photoURL), await i._updateTokensIfNecessary(s)
}

function dn(e, t) {
    return hn(E(e), t, null)
}

function ln(e, t) {
    return hn(E(e), null, t)
}

async function hn(e, t, n) {
    const {auth: i} = e, r = {idToken: await e.getIdToken(), returnSecureToken: !0};
    t && (r.email = t), n && (r.password = n);
    const s = await ve(e, at(i, r));
    await e._updateTokensIfNecessary(s, !0)
}

class pn {
    constructor(e, t, n = {}) {
        this.isNewUser = e, this.providerId = t, this.profile = n
    }
}

class fn extends pn {
    constructor(e, t, n, i) {
        super(e, t, n), this.username = i
    }
}

class mn extends pn {
    constructor(e, t) {
        super(e, "facebook.com", t)
    }
}

class gn extends fn {
    constructor(e, t) {
        super(e, "github.com", t, "string" == typeof (null == t ? void 0 : t.login) ? null == t ? void 0 : t.login : null)
    }
}

class vn extends pn {
    constructor(e, t) {
        super(e, "google.com", t)
    }
}

class _n extends fn {
    constructor(e, t, n) {
        super(e, "twitter.com", t, n)
    }
}

function In(e) {
    const {user: t, _tokenResponse: n} = e;
    return t.isAnonymous && !n ? {providerId: null, isNewUser: !1, profile: null} : function (e) {
        var t, n;
        if (!e) return null;
        const {providerId: i} = e, r = e.rawUserInfo ? JSON.parse(e.rawUserInfo) : {},
            s = e.isNewUser || "identitytoolkit#SignupNewUserResponse" === e.kind;
        if (!i && (null == e ? void 0 : e.idToken)) {
            const i = null === (n = null === (t = ge(e.idToken)) || void 0 === t ? void 0 : t.firebase) || void 0 === n ? void 0 : n.sign_in_provider;
            if (i) return new pn(s, "anonymous" !== i && "custom" !== i ? i : null)
        }
        if (!i) return null;
        switch (i) {
            case"facebook.com":
                return new mn(s, r);
            case"github.com":
                return new gn(s, r);
            case"google.com":
                return new vn(s, r);
            case"twitter.com":
                return new _n(s, r, e.screenName || null);
            case"custom":
            case"anonymous":
                return new pn(s, null);
            default:
                return new pn(s, i, r)
        }
    }(n)
}

function Tn(e, t) {
    return E(e).setPersistence(t)
}

function yn(e) {
    return Ze(e).initializeRecaptchaConfig()
}

function En(e, t, n, i) {
    return E(e).onIdTokenChanged(t, n, i)
}

function wn(e, t, n) {
    return E(e).beforeAuthStateChanged(t, n)
}

function An(e, t, n, i) {
    return E(e).onAuthStateChanged(t, n, i)
}

function kn(e) {
    E(e).useDeviceLanguage()
}

function bn(e, t) {
    return E(e).updateCurrentUser(t)
}

function Sn(e) {
    return E(e).signOut()
}

async function Rn(e) {
    return E(e).delete()
}

class Nn {
    constructor(e, t, n) {
        this.type = e, this.credential = t, this.user = n
    }

    static _fromIdtoken(e, t) {
        return new Nn("enroll", e, t)
    }

    static _fromMfaPendingCredential(e) {
        return new Nn("signin", e)
    }

    toJSON() {
        return {multiFactorSession: {["enroll" === this.type ? "idToken" : "pendingCredential"]: this.credential}}
    }

    static fromJSON(e) {
        var t, n;
        if (null == e ? void 0 : e.multiFactorSession) {
            if (null === (t = e.multiFactorSession) || void 0 === t ? void 0 : t.pendingCredential) return Nn._fromMfaPendingCredential(e.multiFactorSession.pendingCredential);
            if (null === (n = e.multiFactorSession) || void 0 === n ? void 0 : n.idToken) return Nn._fromIdtoken(e.multiFactorSession.idToken)
        }
        return null
    }
}

class On {
    constructor(e, t, n) {
        this.session = e, this.hints = t, this.signInResolver = n
    }

    static _fromError(e, t) {
        const n = Ze(e), i = t.customData._serverResponse,
            r = (i.mfaInfo || []).map((e => Gt._fromServerResponse(n, e)));
        K(i.mfaPendingCredential, n, "internal-error");
        const s = Nn._fromMfaPendingCredential(i.mfaPendingCredential);
        return new On(s, r, (async e => {
            const r = await e._process(n, s);
            delete i.mfaInfo, delete i.mfaPendingCredential;
            const o = Object.assign(Object.assign({}, i), {idToken: r.idToken, refreshToken: r.refreshToken});
            switch (t.operationType) {
                case"signIn":
                    const e = await Ot._fromIdTokenResponse(n, t.operationType, o);
                    return await n._updateCurrentUser(e.user), e;
                case"reauthenticate":
                    return K(t.user, n, "internal-error"), Ot._forOperation(t.user, t.operationType, o);
                default:
                    W(n, "internal-error")
            }
        }))
    }

    async resolveSignIn(e) {
        const t = e;
        return this.signInResolver(t)
    }
}

function Cn(e, t) {
    var n;
    const i = E(e), r = t;
    return K(t.customData.operationType, i, "argument-error"), K(null === (n = r.customData._serverResponse) || void 0 === n ? void 0 : n.mfaPendingCredential, i, "argument-error"), On._fromError(i, r)
}

class Pn {
    constructor(e) {
        this.user = e, this.enrolledFactors = [], e._onReload((t => {
            t.mfaInfo && (this.enrolledFactors = t.mfaInfo.map((t => Gt._fromServerResponse(e.auth, t))))
        }))
    }

    static _fromUser(e) {
        return new Pn(e)
    }

    async getSession() {
        return Nn._fromIdtoken(await this.user.getIdToken(), this.user)
    }

    async enroll(e, t) {
        const n = e, i = await this.getSession(), r = await ve(this.user, n._process(this.user.auth, i, t));
        return await this.user._updateTokensIfNecessary(r), this.user.reload()
    }

    async unenroll(e) {
        const t = "string" == typeof e ? e : e.uid, n = await this.user.getIdToken();
        try {
            const e = await ve(this.user, (i = this.user.auth, r = {
                idToken: n,
                mfaEnrollmentId: t
            }, oe(i, "POST", "/v2/accounts/mfaEnrollment:withdraw", se(i, r))));
            this.enrolledFactors = this.enrolledFactors.filter((({uid: e}) => e !== t)), await this.user._updateTokensIfNecessary(e), await this.user.reload()
        } catch (e) {
            throw e
        }
        var i, r
    }
}

const Dn = new WeakMap;

function Ln(e) {
    const t = E(e);
    return Dn.has(t) || Dn.set(t, Pn._fromUser(t)), Dn.get(t)
}

class Mn {
    constructor(e, t) {
        this.storageRetriever = e, this.type = t
    }

    _isAvailable() {
        try {
            return this.storage ? (this.storage.setItem("__sak", "1"), this.storage.removeItem("__sak"), Promise.resolve(!0)) : Promise.resolve(!1)
        } catch (e) {
            return Promise.resolve(!1)
        }
    }

    _set(e, t) {
        return this.storage.setItem(e, JSON.stringify(t)), Promise.resolve()
    }

    _get(e) {
        const t = this.storage.getItem(e);
        return Promise.resolve(t ? JSON.parse(t) : null)
    }

    _remove(e) {
        return this.storage.removeItem(e), Promise.resolve()
    }

    get storage() {
        return this.storageRetriever()
    }
}

class Un extends Mn {
    constructor() {
        super((() => window.localStorage), "LOCAL"), this.boundEventHandler = (e, t) => this.onStorageEvent(e, t), this.listeners = {}, this.localCache = {}, this.pollTimer = null, this.safariLocalStorageNotSynced = function () {
            const e = l();
            return De(e) || xe(e)
        }() && function () {
            try {
                return !(!window || window === window.top)
            } catch (e) {
                return !1
            }
        }(), this.fallbackToPolling = je(), this._shouldAllowMigration = !0
    }

    forAllChangedKeys(e) {
        for (const t of Object.keys(this.listeners)) {
            const n = this.storage.getItem(t), i = this.localCache[t];
            n !== i && e(t, i, n)
        }
    }

    onStorageEvent(e, t = !1) {
        if (!e.key) return void this.forAllChangedKeys(((e, t, n) => {
            this.notifyListeners(e, n)
        }));
        const n = e.key;
        if (t ? this.detachListener() : this.stopPolling(), this.safariLocalStorageNotSynced) {
            const i = this.storage.getItem(n);
            if (e.newValue !== i) null !== e.newValue ? this.storage.setItem(n, e.newValue) : this.storage.removeItem(n); else if (this.localCache[n] === e.newValue && !t) return
        }
        const i = () => {
            const e = this.storage.getItem(n);
            (t || this.localCache[n] !== e) && this.notifyListeners(n, e)
        }, r = this.storage.getItem(n);
        He() && r !== e.newValue && e.newValue !== e.oldValue ? setTimeout(i, 10) : i()
    }

    notifyListeners(e, t) {
        this.localCache[e] = t;
        const n = this.listeners[e];
        if (n) for (const e of Array.from(n)) e(t ? JSON.parse(t) : t)
    }

    startPolling() {
        this.stopPolling(), this.pollTimer = setInterval((() => {
            this.forAllChangedKeys(((e, t, n) => {
                this.onStorageEvent(new StorageEvent("storage", {key: e, oldValue: t, newValue: n}), !0)
            }))
        }), 1e3)
    }

    stopPolling() {
        this.pollTimer && (clearInterval(this.pollTimer), this.pollTimer = null)
    }

    attachListener() {
        window.addEventListener("storage", this.boundEventHandler)
    }

    detachListener() {
        window.removeEventListener("storage", this.boundEventHandler)
    }

    _addListener(e, t) {
        0 === Object.keys(this.listeners).length && (this.fallbackToPolling ? this.startPolling() : this.attachListener()), this.listeners[e] || (this.listeners[e] = new Set, this.localCache[e] = this.storage.getItem(e)), this.listeners[e].add(t)
    }

    _removeListener(e, t) {
        this.listeners[e] && (this.listeners[e].delete(t), 0 === this.listeners[e].size && delete this.listeners[e]), 0 === Object.keys(this.listeners).length && (this.detachListener(), this.stopPolling())
    }

    async _set(e, t) {
        await super._set(e, t), this.localCache[e] = JSON.stringify(t)
    }

    async _get(e) {
        const t = await super._get(e);
        return this.localCache[e] = JSON.stringify(t), t
    }

    async _remove(e) {
        await super._remove(e), delete this.localCache[e]
    }
}

Un.type = "LOCAL";
const Fn = Un;

class Vn extends Mn {
    constructor() {
        super((() => window.sessionStorage), "SESSION")
    }

    _addListener(e, t) {
    }

    _removeListener(e, t) {
    }
}

Vn.type = "SESSION";
const xn = Vn;

class Hn {
    constructor(e) {
        this.eventTarget = e, this.handlersMap = {}, this.boundEventHandler = this.handleEvent.bind(this)
    }

    static _getInstance(e) {
        const t = this.receivers.find((t => t.isListeningto(e)));
        if (t) return t;
        const n = new Hn(e);
        return this.receivers.push(n), n
    }

    isListeningto(e) {
        return this.eventTarget === e
    }

    async handleEvent(e) {
        const t = e, {eventId: n, eventType: i, data: r} = t.data, s = this.handlersMap[i];
        if (!(null == s ? void 0 : s.size)) return;
        t.ports[0].postMessage({status: "ack", eventId: n, eventType: i});
        const o = Array.from(s).map((async e => e(t.origin, r))), a = await function (e) {
            return Promise.all(e.map((async e => {
                try {
                    return {fulfilled: !0, value: await e}
                } catch (e) {
                    return {fulfilled: !1, reason: e}
                }
            })))
        }(o);
        t.ports[0].postMessage({status: "done", eventId: n, eventType: i, response: a})
    }

    _subscribe(e, t) {
        0 === Object.keys(this.handlersMap).length && this.eventTarget.addEventListener("message", this.boundEventHandler), this.handlersMap[e] || (this.handlersMap[e] = new Set), this.handlersMap[e].add(t)
    }

    _unsubscribe(e, t) {
        this.handlersMap[e] && t && this.handlersMap[e].delete(t), t && 0 !== this.handlersMap[e].size || delete this.handlersMap[e], 0 === Object.keys(this.handlersMap).length && this.eventTarget.removeEventListener("message", this.boundEventHandler)
    }
}

function jn(e = "", t = 10) {
    let n = "";
    for (let e = 0; e < t; e++) n += Math.floor(10 * Math.random());
    return e + n
}

Hn.receivers = [];

class Wn {
    constructor(e) {
        this.target = e, this.handlers = new Set
    }

    removeMessageHandler(e) {
        e.messageChannel && (e.messageChannel.port1.removeEventListener("message", e.onMessage), e.messageChannel.port1.close()), this.handlers.delete(e)
    }

    async _send(e, t, n = 50) {
        const i = "undefined" != typeof MessageChannel ? new MessageChannel : null;
        if (!i) throw new Error("connection_unavailable");
        let r, s;
        return new Promise(((o, a) => {
            const c = jn("", 20);
            i.port1.start();
            const u = setTimeout((() => {
                a(new Error("unsupported_event"))
            }), n);
            s = {
                messageChannel: i, onMessage(e) {
                    const t = e;
                    if (t.data.eventId === c) switch (t.data.status) {
                        case"ack":
                            clearTimeout(u), r = setTimeout((() => {
                                a(new Error("timeout"))
                            }), 3e3);
                            break;
                        case"done":
                            clearTimeout(r), o(t.data.response);
                            break;
                        default:
                            clearTimeout(u), clearTimeout(r), a(new Error("invalid_response"))
                    }
                }
            }, this.handlers.add(s), i.port1.addEventListener("message", s.onMessage), this.target.postMessage({
                eventType: e,
                eventId: c,
                data: t
            }, [i.port2])
        })).finally((() => {
            s && this.removeMessageHandler(s)
        }))
    }
}

function qn() {
    return window
}

function zn() {
    return void 0 !== qn().WorkerGlobalScope && "function" == typeof qn().importScripts
}

const Gn = "firebaseLocalStorageDb";

class Bn {
    constructor(e) {
        this.request = e
    }

    toPromise() {
        return new Promise(((e, t) => {
            this.request.addEventListener("success", (() => {
                e(this.request.result)
            })), this.request.addEventListener("error", (() => {
                t(this.request.error)
            }))
        }))
    }
}

function Kn(e, t) {
    return e.transaction(["firebaseLocalStorage"], t ? "readwrite" : "readonly").objectStore("firebaseLocalStorage")
}

function $n() {
    const e = indexedDB.open(Gn, 1);
    return new Promise(((t, n) => {
        e.addEventListener("error", (() => {
            n(e.error)
        })), e.addEventListener("upgradeneeded", (() => {
            const t = e.result;
            try {
                t.createObjectStore("firebaseLocalStorage", {keyPath: "fbase_key"})
            } catch (e) {
                n(e)
            }
        })), e.addEventListener("success", (async () => {
            const n = e.result;
            n.objectStoreNames.contains("firebaseLocalStorage") ? t(n) : (n.close(), await function () {
                const e = indexedDB.deleteDatabase(Gn);
                return new Bn(e).toPromise()
            }(), t(await $n()))
        }))
    }))
}

async function Jn(e, t, n) {
    const i = Kn(e, !0).put({fbase_key: t, value: n});
    return new Bn(i).toPromise()
}

function Yn(e, t) {
    const n = Kn(e, !0).delete(t);
    return new Bn(n).toPromise()
}

class Xn {
    constructor() {
        this.type = "LOCAL", this._shouldAllowMigration = !0, this.listeners = {}, this.localCache = {}, this.pollTimer = null, this.pendingWrites = 0, this.receiver = null, this.sender = null, this.serviceWorkerReceiverAvailable = !1, this.activeServiceWorker = null, this._workerInitializationPromise = this.initializeServiceWorkerMessaging().then((() => {
        }), (() => {
        }))
    }

    async _openDb() {
        return this.db || (this.db = await $n()), this.db
    }

    async _withRetries(e) {
        let t = 0;
        for (; ;) try {
            const t = await this._openDb();
            return await e(t)
        } catch (e) {
            if (t++ > 3) throw e;
            this.db && (this.db.close(), this.db = void 0)
        }
    }

    async initializeServiceWorkerMessaging() {
        return zn() ? this.initializeReceiver() : this.initializeSender()
    }

    async initializeReceiver() {
        this.receiver = Hn._getInstance(zn() ? self : null), this.receiver._subscribe("keyChanged", (async (e, t) => ({keyProcessed: (await this._poll()).includes(t.key)}))), this.receiver._subscribe("ping", (async (e, t) => ["keyChanged"]))
    }

    async initializeSender() {
        var e, t;
        if (this.activeServiceWorker = await async function () {
            if (!(null === navigator || void 0 === navigator ? void 0 : navigator.serviceWorker)) return null;
            try {
                return (await navigator.serviceWorker.ready).active
            } catch (e) {
                return null
            }
        }(), !this.activeServiceWorker) return;
        this.sender = new Wn(this.activeServiceWorker);
        const n = await this.sender._send("ping", {}, 800);
        n && (null === (e = n[0]) || void 0 === e ? void 0 : e.fulfilled) && (null === (t = n[0]) || void 0 === t ? void 0 : t.value.includes("keyChanged")) && (this.serviceWorkerReceiverAvailable = !0)
    }

    async notifyServiceWorker(e) {
        var t;
        if (this.sender && this.activeServiceWorker && ((null === (t = null === navigator || void 0 === navigator ? void 0 : navigator.serviceWorker) || void 0 === t ? void 0 : t.controller) || null) === this.activeServiceWorker) try {
            await this.sender._send("keyChanged", {key: e}, this.serviceWorkerReceiverAvailable ? 800 : 50)
        } catch (t) {
        }
    }

    async _isAvailable() {
        try {
            if (!indexedDB) return !1;
            const e = await $n();
            return await Jn(e, "__sak", "1"), await Yn(e, "__sak"), !0
        } catch (e) {
        }
        return !1
    }

    async _withPendingWrite(e) {
        this.pendingWrites++;
        try {
            await e()
        } finally {
            this.pendingWrites--
        }
    }

    async _set(e, t) {
        return this._withPendingWrite((async () => (await this._withRetries((n => Jn(n, e, t))), this.localCache[e] = t, this.notifyServiceWorker(e))))
    }

    async _get(e) {
        const t = await this._withRetries((t => async function (e, t) {
            const n = Kn(e, !1).get(t), i = await new Bn(n).toPromise();
            return void 0 === i ? null : i.value
        }(t, e)));
        return this.localCache[e] = t, t
    }

    async _remove(e) {
        return this._withPendingWrite((async () => (await this._withRetries((t => Yn(t, e))), delete this.localCache[e], this.notifyServiceWorker(e))))
    }

    async _poll() {
        const e = await this._withRetries((e => {
            const t = Kn(e, !1).getAll();
            return new Bn(t).toPromise()
        }));
        if (!e) return [];
        if (0 !== this.pendingWrites) return [];
        const t = [], n = new Set;
        for (const {
            fbase_key: i,
            value: r
        } of e) n.add(i), JSON.stringify(this.localCache[i]) !== JSON.stringify(r) && (this.notifyListeners(i, r), t.push(i));
        for (const e of Object.keys(this.localCache)) this.localCache[e] && !n.has(e) && (this.notifyListeners(e, null), t.push(e));
        return t
    }

    notifyListeners(e, t) {
        this.localCache[e] = t;
        const n = this.listeners[e];
        if (n) for (const e of Array.from(n)) e(t)
    }

    startPolling() {
        this.stopPolling(), this.pollTimer = setInterval((async () => this._poll()), 800)
    }

    stopPolling() {
        this.pollTimer && (clearInterval(this.pollTimer), this.pollTimer = null)
    }

    _addListener(e, t) {
        0 === Object.keys(this.listeners).length && this.startPolling(), this.listeners[e] || (this.listeners[e] = new Set, this._get(e)), this.listeners[e].add(t)
    }

    _removeListener(e, t) {
        this.listeners[e] && (this.listeners[e].delete(t), 0 === this.listeners[e].size && delete this.listeners[e]), 0 === Object.keys(this.listeners).length && this.stopPolling()
    }
}

Xn.type = "LOCAL";
const Qn = Xn;

class Zn {
    constructor(e) {
        this.auth = e, this.counter = 1e12, this._widgets = new Map
    }

    render(e, t) {
        const n = this.counter;
        return this._widgets.set(n, new ei(e, this.auth.name, t || {})), this.counter++, n
    }

    reset(e) {
        var t;
        const n = e || 1e12;
        null === (t = this._widgets.get(n)) || void 0 === t || t.delete(), this._widgets.delete(n)
    }

    getResponse(e) {
        var t;
        const n = e || 1e12;
        return (null === (t = this._widgets.get(n)) || void 0 === t ? void 0 : t.getResponse()) || ""
    }

    async execute(e) {
        var t;
        const n = e || 1e12;
        return null === (t = this._widgets.get(n)) || void 0 === t || t.execute(), ""
    }
}

class ei {
    constructor(e, t, n) {
        this.params = n, this.timerId = null, this.deleted = !1, this.responseToken = null, this.clickHandler = () => {
            this.execute()
        };
        const i = "string" == typeof e ? document.getElementById(e) : e;
        K(i, "argument-error", {appName: t}), this.container = i, this.isVisible = "invisible" !== this.params.size, this.isVisible ? this.execute() : this.container.addEventListener("click", this.clickHandler)
    }

    getResponse() {
        return this.checkIfDeleted(), this.responseToken
    }

    delete() {
        this.checkIfDeleted(), this.deleted = !0, this.timerId && (clearTimeout(this.timerId), this.timerId = null), this.container.removeEventListener("click", this.clickHandler)
    }

    execute() {
        this.checkIfDeleted(), this.timerId || (this.timerId = window.setTimeout((() => {
            this.responseToken = function (e) {
                const t = [], n = "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
                for (let i = 0; i < e; i++) t.push(n.charAt(Math.floor(Math.random() * n.length)));
                return t.join("")
            }(50);
            const {callback: e, "expired-callback": t} = this.params;
            if (e) try {
                e(this.responseToken)
            } catch (e) {
            }
            this.timerId = window.setTimeout((() => {
                if (this.timerId = null, this.responseToken = null, t) try {
                    t()
                } catch (e) {
                }
                this.isVisible && this.execute()
            }), 6e4)
        }), 500))
    }

    checkIfDeleted() {
        if (this.deleted) throw new Error("reCAPTCHA mock was already deleted!")
    }
}

const ti = $e("rcb"), ni = new ee(3e4, 6e4);

class ii {
    constructor() {
        var e;
        this.hostLanguage = "", this.counter = 0, this.librarySeparatelyLoaded = !!(null === (e = qn().grecaptcha) || void 0 === e ? void 0 : e.render)
    }

    load(e, t = "") {
        return K(function (e) {
            return e.length <= 6 && /^\s*[a-zA-Z0-9\-]*\s*$/.test(e)
        }(t), e, "argument-error"), this.shouldResolveImmediately(t) && ze(qn().grecaptcha) ? Promise.resolve(qn().grecaptcha) : new Promise(((n, i) => {
            const r = qn().setTimeout((() => {
                i(q(e, "network-request-failed"))
            }), ni.get());
            qn()[ti] = () => {
                qn().clearTimeout(r), delete qn()[ti];
                const s = qn().grecaptcha;
                if (!s || !ze(s)) return void i(q(e, "internal-error"));
                const o = s.render;
                s.render = (e, t) => {
                    const n = o(e, t);
                    return this.counter++, n
                }, this.hostLanguage = t, n(s)
            };
            Ke(`https://www.google.com/recaptcha/api.js??${v({onload: ti, render: "explicit", hl: t})}`).catch((() => {
                clearTimeout(r), i(q(e, "internal-error"))
            }))
        }))
    }

    clearedOneInstance() {
        this.counter--
    }

    shouldResolveImmediately(e) {
        var t;
        return !!(null === (t = qn().grecaptcha) || void 0 === t ? void 0 : t.render) && (e === this.hostLanguage || this.counter > 0 || this.librarySeparatelyLoaded)
    }
}

class ri {
    async load(e) {
        return new Zn(e)
    }

    clearedOneInstance() {
    }
}

const si = {theme: "light", type: "image"};

class oi {
    constructor(e, t = Object.assign({}, si), n) {
        this.parameters = t, this.type = "recaptcha", this.destroyed = !1, this.widgetId = null, this.tokenChangeListeners = new Set, this.renderPromise = null, this.recaptcha = null, this.auth = Ze(n), this.isInvisible = "invisible" === this.parameters.size, K("undefined" != typeof document, this.auth, "operation-not-supported-in-this-environment");
        const i = "string" == typeof e ? document.getElementById(e) : e;
        K(i, this.auth, "argument-error"), this.container = i, this.parameters.callback = this.makeTokenCallback(this.parameters.callback), this._recaptchaLoader = this.auth.settings.appVerificationDisabledForTesting ? new ri : new ii, this.validateStartingState()
    }

    async verify() {
        this.assertNotDestroyed();
        const e = await this.render(), t = this.getAssertedRecaptcha(), n = t.getResponse(e);
        return n || new Promise((n => {
            const i = e => {
                e && (this.tokenChangeListeners.delete(i), n(e))
            };
            this.tokenChangeListeners.add(i), this.isInvisible && t.execute(e)
        }))
    }

    render() {
        try {
            this.assertNotDestroyed()
        } catch (e) {
            return Promise.reject(e)
        }
        return this.renderPromise || (this.renderPromise = this.makeRenderPromise().catch((e => {
            throw this.renderPromise = null, e
        }))), this.renderPromise
    }

    _reset() {
        this.assertNotDestroyed(), null !== this.widgetId && this.getAssertedRecaptcha().reset(this.widgetId)
    }

    clear() {
        this.assertNotDestroyed(), this.destroyed = !0, this._recaptchaLoader.clearedOneInstance(), this.isInvisible || this.container.childNodes.forEach((e => {
            this.container.removeChild(e)
        }))
    }

    validateStartingState() {
        K(!this.parameters.sitekey, this.auth, "argument-error"), K(this.isInvisible || !this.container.hasChildNodes(), this.auth, "argument-error"), K("undefined" != typeof document, this.auth, "operation-not-supported-in-this-environment")
    }

    makeTokenCallback(e) {
        return t => {
            if (this.tokenChangeListeners.forEach((e => e(t))), "function" == typeof e) e(t); else if ("string" == typeof e) {
                const n = qn()[e];
                "function" == typeof n && n(t)
            }
        }
    }

    assertNotDestroyed() {
        K(!this.destroyed, this.auth, "internal-error")
    }

    async makeRenderPromise() {
        if (await this.init(), !this.widgetId) {
            let e = this.container;
            if (!this.isInvisible) {
                const t = document.createElement("div");
                e.appendChild(t), e = t
            }
            this.widgetId = this.getAssertedRecaptcha().render(e, this.parameters)
        }
        return this.widgetId
    }

    async init() {
        K(X() && !zn(), this.auth, "internal-error"), await function () {
            let e = null;
            return new Promise((t => {
                "complete" !== document.readyState ? (e = () => t(), window.addEventListener("load", e)) : t()
            })).catch((t => {
                throw e && window.removeEventListener("load", e), t
            }))
        }(), this.recaptcha = await this._recaptchaLoader.load(this.auth, this.auth.languageCode || void 0);
        const e = await async function (e) {
            return (await oe(e, "GET", "/v1/recaptchaParams")).recaptchaSiteKey || ""
        }(this.auth);
        K(e, this.auth, "internal-error"), this.parameters.sitekey = e
    }

    getAssertedRecaptcha() {
        return K(this.recaptcha, this.auth, "internal-error"), this.recaptcha
    }
}

class ai {
    constructor(e, t) {
        this.verificationId = e, this.onConfirmation = t
    }

    confirm(e) {
        const t = gt._fromVerification(this.verificationId, e);
        return this.onConfirmation(t)
    }
}

async function ci(e, t, n) {
    const i = Ze(e), r = await li(i, t, E(n));
    return new ai(r, (e => jt(i, e)))
}

async function ui(e, t, n) {
    const i = E(e);
    await Vt(!1, i, "phone");
    const r = await li(i.auth, t, E(n));
    return new ai(r, (e => Wt(i, e)))
}

async function di(e, t, n) {
    const i = E(e), r = await li(i.auth, t, E(n));
    return new ai(r, (e => qt(i, e)))
}

async function li(e, t, n) {
    var i;
    const r = await n.verify();
    try {
        let s;
        if (K("string" == typeof r, e, "argument-error"), K("recaptcha" === n.type, e, "argument-error"), s = "string" == typeof t ? {phoneNumber: t} : t, "session" in s) {
            const t = s.session;
            if ("phoneNumber" in s) {
                K("enroll" === t.type, e, "internal-error");
                const n = await function (e, t) {
                    return oe(e, "POST", "/v2/accounts/mfaEnrollment:start", se(e, t))
                }(e, {idToken: t.credential, phoneEnrollmentInfo: {phoneNumber: s.phoneNumber, recaptchaToken: r}});
                return n.phoneSessionInfo.sessionInfo
            }
            {
                K("signin" === t.type, e, "internal-error");
                const n = (null === (i = s.multiFactorHint) || void 0 === i ? void 0 : i.uid) || s.multiFactorUid;
                K(n, e, "missing-multi-factor-info");
                const o = await function (e, t) {
                    return oe(e, "POST", "/v2/accounts/mfaSignIn:start", se(e, t))
                }(e, {mfaPendingCredential: t.credential, mfaEnrollmentId: n, phoneSignInInfo: {recaptchaToken: r}});
                return o.phoneResponseInfo.sessionInfo
            }
        }
        {
            const {sessionInfo: t} = await async function (e, t) {
                return oe(e, "POST", "/v1/accounts:sendVerificationCode", se(e, t))
            }(e, {phoneNumber: s.phoneNumber, recaptchaToken: r});
            return t
        }
    } finally {
        n._reset()
    }
}

async function hi(e, t) {
    await Ft(E(e), t)
}

class pi {
    constructor(e) {
        this.providerId = pi.PROVIDER_ID, this.auth = Ze(e)
    }

    verifyPhoneNumber(e, t) {
        return li(this.auth, e, E(t))
    }

    static credential(e, t) {
        return gt._fromVerification(e, t)
    }

    static credentialFromResult(e) {
        const t = e;
        return pi.credentialFromTaggedObject(t)
    }

    static credentialFromError(e) {
        return pi.credentialFromTaggedObject(e.customData || {})
    }

    static credentialFromTaggedObject({_tokenResponse: e}) {
        if (!e) return null;
        const {phoneNumber: t, temporaryProof: n} = e;
        return t && n ? gt._fromTokenResponse(t, n) : null
    }
}

function fi(e, t) {
    return t ? be(t) : (K(e._popupRedirectResolver, e, "argument-error"), e._popupRedirectResolver)
}

pi.PROVIDER_ID = "phone", pi.PHONE_SIGN_IN_METHOD = "phone";

class mi extends st {
    constructor(e) {
        super("custom", "custom"), this.params = e
    }

    _getIdTokenResponse(e) {
        return pt(e, this._buildIdpRequest())
    }

    _linkToIdToken(e, t) {
        return pt(e, this._buildIdpRequest(t))
    }

    _getReauthenticationResolver(e) {
        return pt(e, this._buildIdpRequest())
    }

    _buildIdpRequest(e) {
        const t = {
            requestUri: this.params.requestUri,
            sessionId: this.params.sessionId,
            postBody: this.params.postBody,
            tenantId: this.params.tenantId,
            pendingToken: this.params.pendingToken,
            returnSecureToken: !0,
            returnIdpCredential: !0
        };
        return e && (t.idToken = e), t
    }
}

function gi(e) {
    return Ht(e.auth, new mi(e), e.bypassAuthState)
}

function vi(e) {
    const {auth: t, user: n} = e;
    return K(n, t, "internal-error"), xt(n, new mi(e), e.bypassAuthState)
}

async function _i(e) {
    const {auth: t, user: n} = e;
    return K(n, t, "internal-error"), Ft(n, new mi(e), e.bypassAuthState)
}

class Ii {
    constructor(e, t, n, i, r = !1) {
        this.auth = e, this.resolver = n, this.user = i, this.bypassAuthState = r, this.pendingPromise = null, this.eventManager = null, this.filter = Array.isArray(t) ? t : [t]
    }

    execute() {
        return new Promise((async (e, t) => {
            this.pendingPromise = {resolve: e, reject: t};
            try {
                this.eventManager = await this.resolver._initialize(this.auth), await this.onExecution(), this.eventManager.registerConsumer(this)
            } catch (e) {
                this.reject(e)
            }
        }))
    }

    async onAuthEvent(e) {
        const {urlResponse: t, sessionId: n, postBody: i, tenantId: r, error: s, type: o} = e;
        if (s) return void this.reject(s);
        const a = {
            auth: this.auth,
            requestUri: t,
            sessionId: n,
            tenantId: r || void 0,
            postBody: i || void 0,
            user: this.user,
            bypassAuthState: this.bypassAuthState
        };
        try {
            this.resolve(await this.getIdpTask(o)(a))
        } catch (e) {
            this.reject(e)
        }
    }

    onError(e) {
        this.reject(e)
    }

    getIdpTask(e) {
        switch (e) {
            case"signInViaPopup":
            case"signInViaRedirect":
                return gi;
            case"linkViaPopup":
            case"linkViaRedirect":
                return _i;
            case"reauthViaPopup":
            case"reauthViaRedirect":
                return vi;
            default:
                W(this.auth, "internal-error")
        }
    }

    resolve(e) {
        J(this.pendingPromise, "Pending promise was never set"), this.pendingPromise.resolve(e), this.unregisterAndCleanUp()
    }

    reject(e) {
        J(this.pendingPromise, "Pending promise was never set"), this.pendingPromise.reject(e), this.unregisterAndCleanUp()
    }

    unregisterAndCleanUp() {
        this.eventManager && this.eventManager.unregisterConsumer(this), this.pendingPromise = null, this.cleanUp()
    }
}

const Ti = new ee(2e3, 1e4);

async function yi(e, t, n) {
    const i = Ze(e);
    G(e, t, Tt);
    const r = fi(i, n);
    return new Ai(i, "signInViaPopup", t, r).executeNotNull()
}

async function Ei(e, t, n) {
    const i = E(e);
    G(i.auth, t, Tt);
    const r = fi(i.auth, n);
    return new Ai(i.auth, "reauthViaPopup", t, r, i).executeNotNull()
}

async function wi(e, t, n) {
    const i = E(e);
    G(i.auth, t, Tt);
    const r = fi(i.auth, n);
    return new Ai(i.auth, "linkViaPopup", t, r, i).executeNotNull()
}

class Ai extends Ii {
    constructor(e, t, n, i, r) {
        super(e, t, i, r), this.provider = n, this.authWindow = null, this.pollId = null, Ai.currentPopupAction && Ai.currentPopupAction.cancel(), Ai.currentPopupAction = this
    }

    async executeNotNull() {
        const e = await this.execute();
        return K(e, this.auth, "internal-error"), e
    }

    async onExecution() {
        J(1 === this.filter.length, "Popup operations only handle one event");
        const e = jn();
        this.authWindow = await this.resolver._openPopup(this.auth, this.provider, this.filter[0], e), this.authWindow.associatedEvent = e, this.resolver._originValidation(this.auth).catch((e => {
            this.reject(e)
        })), this.resolver._isIframeWebStorageSupported(this.auth, (e => {
            e || this.reject(q(this.auth, "web-storage-unsupported"))
        })), this.pollUserCancellation()
    }

    get eventId() {
        var e;
        return (null === (e = this.authWindow) || void 0 === e ? void 0 : e.associatedEvent) || null
    }

    cancel() {
        this.reject(q(this.auth, "cancelled-popup-request"))
    }

    cleanUp() {
        this.authWindow && this.authWindow.close(), this.pollId && window.clearTimeout(this.pollId), this.authWindow = null, this.pollId = null, Ai.currentPopupAction = null
    }

    pollUserCancellation() {
        const e = () => {
            var t, n;
            (null === (n = null === (t = this.authWindow) || void 0 === t ? void 0 : t.window) || void 0 === n ? void 0 : n.closed) ? this.pollId = window.setTimeout((() => {
                this.pollId = null, this.reject(q(this.auth, "popup-closed-by-user"))
            }), 8e3) : this.pollId = window.setTimeout(e, Ti.get())
        };
        e()
    }
}

Ai.currentPopupAction = null;
const ki = new Map;

class bi extends Ii {
    constructor(e, t, n = !1) {
        super(e, ["signInViaRedirect", "linkViaRedirect", "reauthViaRedirect", "unknown"], t, void 0, n), this.eventId = null
    }

    async execute() {
        let e = ki.get(this.auth._key());
        if (!e) {
            try {
                const t = await async function (e, t) {
                    const n = Oi(t), i = Ni(e);
                    if (!await i._isAvailable()) return !1;
                    const r = "true" === await i._get(n);
                    return await i._remove(n), r
                }(this.resolver, this.auth) ? await super.execute() : null;
                e = () => Promise.resolve(t)
            } catch (t) {
                e = () => Promise.reject(t)
            }
            ki.set(this.auth._key(), e)
        }
        return this.bypassAuthState || ki.set(this.auth._key(), (() => Promise.resolve(null))), e()
    }

    async onAuthEvent(e) {
        if ("signInViaRedirect" === e.type) return super.onAuthEvent(e);
        if ("unknown" !== e.type) {
            if (e.eventId) {
                const t = await this.auth._redirectUserForId(e.eventId);
                if (t) return this.user = t, super.onAuthEvent(e);
                this.resolve(null)
            }
        } else this.resolve(null)
    }

    async onExecution() {
    }

    cleanUp() {
    }
}

async function Si(e, t) {
    return Ni(e)._set(Oi(t), "true")
}

function Ri(e, t) {
    ki.set(e._key(), t)
}

function Ni(e) {
    return be(e._redirectPersistence)
}

function Oi(e) {
    return Ne("pendingRedirect", e.config.apiKey, e.name)
}

function Ci(e, t, n) {
    return async function (e, t, n) {
        const i = Ze(e);
        G(e, t, Tt), await i._initializationPromise;
        const r = fi(i, n);
        return await Si(r, i), r._openRedirect(i, t, "signInViaRedirect")
    }(e, t, n)
}

function Pi(e, t, n) {
    return async function (e, t, n) {
        const i = E(e);
        G(i.auth, t, Tt), await i.auth._initializationPromise;
        const r = fi(i.auth, n);
        await Si(r, i.auth);
        const s = await Ui(i);
        return r._openRedirect(i.auth, t, "reauthViaRedirect", s)
    }(e, t, n)
}

function Di(e, t, n) {
    return async function (e, t, n) {
        const i = E(e);
        G(i.auth, t, Tt), await i.auth._initializationPromise;
        const r = fi(i.auth, n);
        await Vt(!1, i, t.providerId), await Si(r, i.auth);
        const s = await Ui(i);
        return r._openRedirect(i.auth, t, "linkViaRedirect", s)
    }(e, t, n)
}

async function Li(e, t) {
    return await Ze(e)._initializationPromise, Mi(e, t, !1)
}

async function Mi(e, t, n = !1) {
    const i = Ze(e), r = fi(i, t), s = new bi(i, r, n), o = await s.execute();
    return o && !n && (delete o.user._redirectEventId, await i._persistUserIfCurrent(o.user), await i._setRedirectUser(null, t)), o
}

async function Ui(e) {
    const t = jn(`${e.uid}:::`);
    return e._redirectEventId = t, await e.auth._setRedirectUser(e), await e.auth._persistUserIfCurrent(e), t
}

class Fi {
    constructor(e) {
        this.auth = e, this.cachedEventUids = new Set, this.consumers = new Set, this.queuedRedirectEvent = null, this.hasHandledPotentialRedirect = !1, this.lastProcessedEventTime = Date.now()
    }

    registerConsumer(e) {
        this.consumers.add(e), this.queuedRedirectEvent && this.isEventForConsumer(this.queuedRedirectEvent, e) && (this.sendToConsumer(this.queuedRedirectEvent, e), this.saveEventToCache(this.queuedRedirectEvent), this.queuedRedirectEvent = null)
    }

    unregisterConsumer(e) {
        this.consumers.delete(e)
    }

    onEvent(e) {
        if (this.hasEventBeenHandled(e)) return !1;
        let t = !1;
        return this.consumers.forEach((n => {
            this.isEventForConsumer(e, n) && (t = !0, this.sendToConsumer(e, n), this.saveEventToCache(e))
        })), this.hasHandledPotentialRedirect || !function (e) {
            switch (e.type) {
                case"signInViaRedirect":
                case"linkViaRedirect":
                case"reauthViaRedirect":
                    return !0;
                case"unknown":
                    return xi(e);
                default:
                    return !1
            }
        }(e) || (this.hasHandledPotentialRedirect = !0, t || (this.queuedRedirectEvent = e, t = !0)), t
    }

    sendToConsumer(e, t) {
        var n;
        if (e.error && !xi(e)) {
            const i = (null === (n = e.error.code) || void 0 === n ? void 0 : n.split("auth/")[1]) || "internal-error";
            t.onError(q(this.auth, i))
        } else t.onAuthEvent(e)
    }

    isEventForConsumer(e, t) {
        const n = null === t.eventId || !!e.eventId && e.eventId === t.eventId;
        return t.filter.includes(e.type) && n
    }

    hasEventBeenHandled(e) {
        return Date.now() - this.lastProcessedEventTime >= 6e5 && this.cachedEventUids.clear(), this.cachedEventUids.has(Vi(e))
    }

    saveEventToCache(e) {
        this.cachedEventUids.add(Vi(e)), this.lastProcessedEventTime = Date.now()
    }
}

function Vi(e) {
    return [e.type, e.eventId, e.sessionId, e.tenantId].filter((e => e)).join("-")
}

function xi({type: e, error: t}) {
    return "unknown" === e && "auth/no-auth-event" === (null == t ? void 0 : t.code)
}

const Hi = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, ji = /^https?/;

async function Wi(e) {
    if (e.config.emulator) return;
    const {authorizedDomains: t} = await async function (e, t = {}) {
        return oe(e, "GET", "/v1/projects", t)
    }(e);
    for (const e of t) try {
        if (qi(e)) return
    } catch (e) {
    }
    W(e, "unauthorized-domain")
}

function qi(e) {
    const t = Y(), {protocol: n, hostname: i} = new URL(t);
    if (e.startsWith("chrome-extension://")) {
        const r = new URL(e);
        return "" === r.hostname && "" === i ? "chrome-extension:" === n && e.replace("chrome-extension://", "") === t.replace("chrome-extension://", "") : "chrome-extension:" === n && r.hostname === i
    }
    if (!ji.test(n)) return !1;
    if (Hi.test(e)) return i === e;
    const r = e.replace(/\./g, "\\.");
    return new RegExp("^(.+\\." + r + "|" + r + ")$", "i").test(i)
}

const zi = new ee(3e4, 6e4);

function Gi() {
    const e = qn().___jsl;
    if (null == e ? void 0 : e.H) for (const t of Object.keys(e.H)) if (e.H[t].r = e.H[t].r || [], e.H[t].L = e.H[t].L || [], e.H[t].r = [...e.H[t].L], e.CP) for (let t = 0; t < e.CP.length; t++) e.CP[t] = null
}

let Bi = null;

function Ki(e) {
    return Bi = Bi || function (e) {
        return new Promise(((t, n) => {
            var i, r, s;

            function o() {
                Gi(), gapi.load("gapi.iframes", {
                    callback: () => {
                        t(gapi.iframes.getContext())
                    }, ontimeout: () => {
                        Gi(), n(q(e, "network-request-failed"))
                    }, timeout: zi.get()
                })
            }

            if (null === (r = null === (i = qn().gapi) || void 0 === i ? void 0 : i.iframes) || void 0 === r ? void 0 : r.Iframe) t(gapi.iframes.getContext()); else {
                if (!(null === (s = qn().gapi) || void 0 === s ? void 0 : s.load)) {
                    const t = $e("iframefcb");
                    return qn()[t] = () => {
                        gapi.load ? o() : n(q(e, "network-request-failed"))
                    }, Ke(`https://apis.google.com/js/api.js?onload=${t}`).catch((e => n(e)))
                }
                o()
            }
        })).catch((e => {
            throw Bi = null, e
        }))
    }(e), Bi
}

const $i = new ee(5e3, 15e3), Ji = {
        style: {position: "absolute", top: "-100px", width: "1px", height: "1px"},
        "aria-hidden": "true",
        tabindex: "-1"
    },
    Yi = new Map([["identitytoolkit.googleapis.com", "p"], ["staging-identitytoolkit.sandbox.googleapis.com", "s"], ["test-identitytoolkit.sandbox.googleapis.com", "t"]]);

function Xi(e) {
    const t = e.config;
    K(t.authDomain, e, "auth-domain-config-required");
    const n = t.emulator ? te(t, "emulator/auth/iframe") : `https://${e.config.authDomain}/__/auth/iframe`,
        i = {apiKey: t.apiKey, appName: e.name, v: r}, s = Yi.get(e.config.apiHost);
    s && (i.eid = s);
    const o = e._getFrameworks();
    return o.length && (i.fw = o.join(",")), `${n}?${v(i).slice(1)}`
}

const Qi = {location: "yes", resizable: "yes", statusbar: "yes", toolbar: "no"};

class Zi {
    constructor(e) {
        this.window = e, this.associatedEvent = null
    }

    close() {
        if (this.window) try {
            this.window.close()
        } catch (e) {
        }
    }
}

function er(e, t, n, i = 500, r = 600) {
    const s = Math.max((window.screen.availHeight - r) / 2, 0).toString(),
        o = Math.max((window.screen.availWidth - i) / 2, 0).toString();
    let a = "";
    const c = Object.assign(Object.assign({}, Qi), {width: i.toString(), height: r.toString(), top: s, left: o}),
        u = l().toLowerCase();
    n && (a = Le(u) ? "_blank" : n), Pe(u) && (t = t || "http://localhost", c.scrollbars = "yes");
    const d = Object.entries(c).reduce(((e, [t, n]) => `${e}${t}=${n},`), "");
    if (function (e = l()) {
        var t;
        return xe(e) && !!(null === (t = window.navigator) || void 0 === t ? void 0 : t.standalone)
    }(u) && "_self" !== a) return function (e, t) {
        const n = document.createElement("a");
        n.href = e, n.target = t;
        const i = document.createEvent("MouseEvent");
        i.initMouseEvent("click", !0, !0, window, 1, 0, 0, 0, 0, !1, !1, !1, !1, 1, null), n.dispatchEvent(i)
    }(t || "", a), new Zi(null);
    const h = window.open(t || "", a, d);
    K(h, e, "popup-blocked");
    try {
        h.focus()
    } catch (e) {
    }
    return new Zi(h)
}

const tr = encodeURIComponent("fac");

async function nr(e, t, n, i, s, o) {
    K(e.config.authDomain, e, "auth-domain-config-required"), K(e.config.apiKey, e, "invalid-api-key");
    const a = {apiKey: e.config.apiKey, appName: e.name, authType: n, redirectUrl: i, v: r, eventId: s};
    if (t instanceof Tt) {
        t.setDefaultLanguage(e.languageCode), a.providerId = t.providerId || "", function (e) {
            for (const t in e) if (Object.prototype.hasOwnProperty.call(e, t)) return !1;
            return !0
        }(t.getCustomParameters()) || (a.customParameters = JSON.stringify(t.getCustomParameters()));
        for (const [e, t] of Object.entries(o || {})) a[e] = t
    }
    if (t instanceof yt) {
        const e = t.getScopes().filter((e => "" !== e));
        e.length > 0 && (a.scopes = e.join(","))
    }
    e.tenantId && (a.tid = e.tenantId);
    const c = a;
    for (const e of Object.keys(c)) void 0 === c[e] && delete c[e];
    const u = await e._getAppCheckToken(), d = u ? `#${tr}=${encodeURIComponent(u)}` : "";
    return `${function ({config: e}) {
        if (!e.emulator) return `https://${e.authDomain}/__/auth/handler`;
        return te(e, "emulator/auth/handler")
    }(e)}?${v(c).slice(1)}${d}`
}

const ir = class {
    constructor() {
        this.eventManagers = {}, this.iframes = {}, this.originValidationPromises = {}, this._redirectPersistence = xn, this._completeRedirectFn = Mi, this._overrideRedirectResult = Ri
    }

    async _openPopup(e, t, n, i) {
        var r;
        J(null === (r = this.eventManagers[e._key()]) || void 0 === r ? void 0 : r.manager, "_initialize() not called before _openPopup()");
        return er(e, await nr(e, t, n, Y(), i), jn())
    }

    async _openRedirect(e, t, n, i) {
        await this._originValidation(e);
        return function (e) {
            qn().location.href = e
        }(await nr(e, t, n, Y(), i)), new Promise((() => {
        }))
    }

    _initialize(e) {
        const t = e._key();
        if (this.eventManagers[t]) {
            const {manager: e, promise: n} = this.eventManagers[t];
            return e ? Promise.resolve(e) : (J(n, "If manager is not set, promise should be"), n)
        }
        const n = this.initAndGetManager(e);
        return this.eventManagers[t] = {promise: n}, n.catch((() => {
            delete this.eventManagers[t]
        })), n
    }

    async initAndGetManager(e) {
        const t = await async function (e) {
            const t = await Ki(e), n = qn().gapi;
            return K(n, e, "internal-error"), t.open({
                where: document.body,
                url: Xi(e),
                messageHandlersFilter: n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,
                attributes: Ji,
                dontclear: !0
            }, (t => new Promise((async (n, i) => {
                await t.restyle({setHideOnLeave: !1});
                const r = q(e, "network-request-failed"), s = qn().setTimeout((() => {
                    i(r)
                }), $i.get());

                function o() {
                    qn().clearTimeout(s), n(t)
                }

                t.ping(o).then(o, (() => {
                    i(r)
                }))
            }))))
        }(e), n = new Fi(e);
        return t.register("authEvent", (t => {
            K(null == t ? void 0 : t.authEvent, e, "invalid-auth-event");
            return {status: n.onEvent(t.authEvent) ? "ACK" : "ERROR"}
        }), gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER), this.eventManagers[e._key()] = {manager: n}, this.iframes[e._key()] = t, n
    }

    _isIframeWebStorageSupported(e, t) {
        this.iframes[e._key()].send("webStorageSupport", {type: "webStorageSupport"}, (n => {
            var i;
            const r = null === (i = null == n ? void 0 : n[0]) || void 0 === i ? void 0 : i.webStorageSupport;
            void 0 !== r && t(!!r), W(e, "internal-error")
        }), gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)
    }

    _originValidation(e) {
        const t = e._key();
        return this.originValidationPromises[t] || (this.originValidationPromises[t] = Wi(e)), this.originValidationPromises[t]
    }

    get _shouldInitProactively() {
        return je() || De() || xe()
    }
};

class rr {
    constructor(e) {
        this.factorId = e
    }

    _process(e, t, n) {
        switch (t.type) {
            case"enroll":
                return this._finalizeEnroll(e, t.credential, n);
            case"signin":
                return this._finalizeSignIn(e, t.credential);
            default:
                return $("unexpected MultiFactorSessionType")
        }
    }
}

class sr extends rr {
    constructor(e) {
        super("phone"), this.credential = e
    }

    static _fromCredential(e) {
        return new sr(e)
    }

    _finalizeEnroll(e, t, n) {
        return function (e, t) {
            return oe(e, "POST", "/v2/accounts/mfaEnrollment:finalize", se(e, t))
        }(e, {idToken: t, displayName: n, phoneVerificationInfo: this.credential._makeVerificationRequest()})
    }

    _finalizeSignIn(e, t) {
        return function (e, t) {
            return oe(e, "POST", "/v2/accounts/mfaSignIn:finalize", se(e, t))
        }(e, {mfaPendingCredential: t, phoneVerificationInfo: this.credential._makeVerificationRequest()})
    }
}

class or {
    constructor() {
    }

    static assertion(e) {
        return sr._fromCredential(e)
    }
}

or.FACTOR_ID = "phone";

class ar {
    static assertionForEnrollment(e, t) {
        return cr._fromSecret(e, t)
    }

    static assertionForSignIn(e, t) {
        return cr._fromEnrollmentId(e, t)
    }

    static async generateSecret(e) {
        var t;
        const n = e;
        K(void 0 !== (null === (t = n.user) || void 0 === t ? void 0 : t.auth), "internal-error");
        const i = await (r = n.user.auth, s = {
            idToken: n.credential,
            totpEnrollmentInfo: {}
        }, oe(r, "POST", "/v2/accounts/mfaEnrollment:start", se(r, s)));
        var r, s;
        return ur._fromStartTotpMfaEnrollmentResponse(i, n.user.auth)
    }
}

ar.FACTOR_ID = "totp";

class cr extends rr {
    constructor(e, t, n) {
        super("totp"), this.otp = e, this.enrollmentId = t, this.secret = n
    }

    static _fromSecret(e, t) {
        return new cr(t, void 0, e)
    }

    static _fromEnrollmentId(e, t) {
        return new cr(t, e)
    }

    async _finalizeEnroll(e, t, n) {
        return K(void 0 !== this.secret, e, "argument-error"), function (e, t) {
            return oe(e, "POST", "/v2/accounts/mfaEnrollment:finalize", se(e, t))
        }(e, {idToken: t, displayName: n, totpVerificationInfo: this.secret._makeTotpVerificationInfo(this.otp)})
    }

    async _finalizeSignIn(e, t) {
        K(void 0 !== this.enrollmentId && void 0 !== this.otp, e, "argument-error");
        const n = {verificationCode: this.otp};
        return function (e, t) {
            return oe(e, "POST", "/v2/accounts/mfaSignIn:finalize", se(e, t))
        }(e, {mfaPendingCredential: t, mfaEnrollmentId: this.enrollmentId, totpVerificationInfo: n})
    }
}

class ur {
    constructor(e, t, n, i, r, s, o) {
        this.sessionInfo = s, this.auth = o, this.secretKey = e, this.hashingAlgorithm = t, this.codeLength = n, this.codeIntervalSeconds = i, this.enrollmentCompletionDeadline = r
    }

    static _fromStartTotpMfaEnrollmentResponse(e, t) {
        return new ur(e.totpSessionInfo.sharedSecretKey, e.totpSessionInfo.hashingAlgorithm, e.totpSessionInfo.verificationCodeLength, e.totpSessionInfo.periodSec, new Date(e.totpSessionInfo.finalizeEnrollmentTime).toUTCString(), e.totpSessionInfo.sessionInfo, t)
    }

    _makeTotpVerificationInfo(e) {
        return {sessionInfo: this.sessionInfo, verificationCode: e}
    }

    generateQrCodeUrl(e, t) {
        var n;
        let i = !1;
        return (dr(e) || dr(t)) && (i = !0), i && (dr(e) && (e = (null === (n = this.auth.currentUser) || void 0 === n ? void 0 : n.email) || "unknownuser"), dr(t) && (t = this.auth.name)), `otpauth://totp/${t}:${e}?secret=${this.secretKey}&issuer=${t}&algorithm=${this.hashingAlgorithm}&digits=${this.codeLength}`
    }
}

function dr(e) {
    return void 0 === e || 0 === (null == e ? void 0 : e.length)
}

var lr = "@firebase/auth";

class hr {
    constructor(e) {
        this.auth = e, this.internalListeners = new Map
    }

    getUid() {
        var e;
        return this.assertAuthConfigured(), (null === (e = this.auth.currentUser) || void 0 === e ? void 0 : e.uid) || null
    }

    async getToken(e) {
        if (this.assertAuthConfigured(), await this.auth._initializationPromise, !this.auth.currentUser) return null;
        return {accessToken: await this.auth.currentUser.getIdToken(e)}
    }

    addAuthTokenListener(e) {
        if (this.assertAuthConfigured(), this.internalListeners.has(e)) return;
        const t = this.auth.onIdTokenChanged((t => {
            e((null == t ? void 0 : t.stsTokenManager.accessToken) || null)
        }));
        this.internalListeners.set(e, t), this.updateProactiveRefresh()
    }

    removeAuthTokenListener(e) {
        this.assertAuthConfigured();
        const t = this.internalListeners.get(e);
        t && (this.internalListeners.delete(e), t(), this.updateProactiveRefresh())
    }

    assertAuthConfigured() {
        K(this.auth._initializationPromise, "dependent-sdk-initialized-before-auth")
    }

    updateProactiveRefresh() {
        this.internalListeners.size > 0 ? this.auth._startProactiveRefresh() : this.auth._stopProactiveRefresh()
    }
}

const pr = d("authIdTokenMaxAge") || 300;
let fr = null;

function mr(t = i()) {
    const n = e(t, "auth");
    if (n.isInitialized()) return n.getImmediate();
    const r = tt(t, {popupRedirectResolver: ir, persistence: [Qn, Fn, xn]}), s = d("authTokenSyncURL");
    if (s) {
        const e = (o = s, async e => {
            const t = e && await e.getIdTokenResult(),
                n = t && ((new Date).getTime() - Date.parse(t.issuedAtTime)) / 1e3;
            if (n && n > pr) return;
            const i = null == t ? void 0 : t.token;
            fr !== i && (fr = i, await fetch(o, {
                method: i ? "POST" : "DELETE",
                headers: i ? {Authorization: `Bearer ${i}`} : {}
            }))
        });
        wn(r, e, (() => e(r.currentUser))), En(r, (t => e(t)))
    }
    var o;
    const a = (c = "auth", null === (h = null === (l = u()) || void 0 === l ? void 0 : l.emulatorHosts) || void 0 === h ? void 0 : h[c]);
    var c, l, h;
    return a && nt(r, `http://${a}`), r
}

var gr;
gr = "Browser", t(new N("auth", ((e, {options: t}) => {
    const n = e.getProvider("app").getImmediate(), i = e.getProvider("heartbeat"),
        r = e.getProvider("app-check-internal"), {apiKey: s, authDomain: o} = n.options;
    K(s && !s.includes(":"), "invalid-api-key", {appName: n.name});
    const a = {
        apiKey: s,
        authDomain: o,
        clientPlatform: gr,
        apiHost: "identitytoolkit.googleapis.com",
        tokenApiHost: "securetoken.googleapis.com",
        apiScheme: "https",
        sdkClientVersion: We(gr)
    }, c = new Qe(n, i, r, a);
    return function (e, t) {
        const n = (null == t ? void 0 : t.persistence) || [], i = (Array.isArray(n) ? n : [n]).map(be);
        (null == t ? void 0 : t.errorMap) && e._updateErrorMap(t.errorMap), e._initializeWithPersistence(i, null == t ? void 0 : t.popupRedirectResolver)
    }(c, t), c
}), "PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback(((e, t, n) => {
    e.getProvider("auth-internal").initialize()
}))), t(new N("auth-internal", (e => (e => new hr(e))(Ze(e.getProvider("auth").getImmediate()))), "PRIVATE").setInstantiationMode("EXPLICIT")), n(lr, "0.23.2", function (e) {
    switch (e) {
        case"Node":
            return "node";
        case"ReactNative":
            return "rn";
        case"Worker":
            return "webworker";
        case"Cordova":
            return "cordova";
        default:
            return
    }
}(gr)), n(lr, "0.23.2", "esm2017");
export {
    L as ActionCodeOperation,
    vt as ActionCodeURL,
    st as AuthCredential,
    x as AuthErrorCodes,
    ht as EmailAuthCredential,
    It as EmailAuthProvider,
    wt as FacebookAuthProvider,
    O as FactorId,
    kt as GithubAuthProvider,
    At as GoogleAuthProvider,
    ft as OAuthCredential,
    Et as OAuthProvider,
    D as OperationType,
    gt as PhoneAuthCredential,
    pi as PhoneAuthProvider,
    or as PhoneMultiFactorGenerator,
    C as ProviderId,
    oi as RecaptchaVerifier,
    St as SAMLAuthProvider,
    P as SignInMethod,
    ar as TotpMultiFactorGenerator,
    ur as TotpSecret,
    Rt as TwitterAuthProvider,
    Xt as applyActionCode,
    wn as beforeAuthStateChanged,
    Fn as browserLocalPersistence,
    ir as browserPopupRedirectResolver,
    xn as browserSessionPersistence,
    Qt as checkActionCode,
    Yt as confirmPasswordReset,
    nt as connectAuthEmulator,
    en as createUserWithEmailAndPassword,
    U as debugErrorMap,
    Rn as deleteUser,
    on as fetchSignInMethodsForEmail,
    In as getAdditionalUserInfo,
    mr as getAuth,
    pe as getIdToken,
    fe as getIdTokenResult,
    Cn as getMultiFactorResolver,
    Li as getRedirectResult,
    Re as inMemoryPersistence,
    Qn as indexedDBLocalPersistence,
    tt as initializeAuth,
    yn as initializeRecaptchaConfig,
    rn as isSignInWithEmailLink,
    Wt as linkWithCredential,
    ui as linkWithPhoneNumber,
    wi as linkWithPopup,
    Di as linkWithRedirect,
    Ln as multiFactor,
    An as onAuthStateChanged,
    En as onIdTokenChanged,
    _t as parseActionCodeURL,
    F as prodErrorMap,
    qt as reauthenticateWithCredential,
    di as reauthenticateWithPhoneNumber,
    Ei as reauthenticateWithPopup,
    Pi as reauthenticateWithRedirect,
    ye as reload,
    an as sendEmailVerification,
    Jt as sendPasswordResetEmail,
    nn as sendSignInLinkToEmail,
    Tn as setPersistence,
    Pt as signInAnonymously,
    jt as signInWithCredential,
    zt as signInWithCustomToken,
    tn as signInWithEmailAndPassword,
    sn as signInWithEmailLink,
    ci as signInWithPhoneNumber,
    yi as signInWithPopup,
    Ci as signInWithRedirect,
    Sn as signOut,
    Ut as unlink,
    bn as updateCurrentUser,
    dn as updateEmail,
    ln as updatePassword,
    hi as updatePhoneNumber,
    un as updateProfile,
    kn as useDeviceLanguage,
    cn as verifyBeforeUpdateEmail,
    Zt as verifyPasswordResetCode
};