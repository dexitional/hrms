"use strict";
/**
 * Copyright 2018 Google LLC
 *
 * Distributed under MIT license.
 * See file LICENSE for detail or copy at https://opensource.org/licenses/MIT
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const gaxios_1 = require("gaxios");
const jws = require("jws");
const mime = require("mime");
const pify = require("pify");
const readFile = pify(fs.readFile);
const GOOGLE_TOKEN_URL = 'https://www.googleapis.com/oauth2/v4/token';
const GOOGLE_REVOKE_TOKEN_URL = 'https://accounts.google.com/o/oauth2/revoke?token=';
class ErrorWithCode extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
    }
}
let getPem;
class GoogleToken {
    /**
     * Create a GoogleToken.
     *
     * @param options  Configuration object.
     */
    constructor(options) {
        this.token = null;
        this.expiresAt = null;
        this.rawToken = null;
        this.tokenExpires = null;
        this.configure(options);
    }
    /**
     * Returns whether the token has expired.
     *
     * @return true if the token has expired, false otherwise.
     */
    hasExpired() {
        const now = (new Date()).getTime();
        if (this.token && this.expiresAt) {
            return now >= this.expiresAt;
        }
        else {
            return true;
        }
    }
    getToken(callback) {
        if (callback) {
            this.getTokenAsync().then(t => callback(null, t), callback);
            return;
        }
        return this.getTokenAsync();
    }
    /**
     * Given a keyFile, extract the key and client email if available
     * @param keyFile Path to a json, pem, or p12 file that contains the key.
     * @returns an object with privateKey and clientEmail properties
     */
    getCredentials(keyFile) {
        return __awaiter(this, void 0, void 0, function* () {
            const mimeType = mime.getType(keyFile);
            switch (mimeType) {
                case 'application/json': {
                    // *.json file
                    const key = yield readFile(keyFile, 'utf8');
                    const body = JSON.parse(key);
                    const privateKey = body.private_key;
                    const clientEmail = body.client_email;
                    if (!privateKey || !clientEmail) {
                        throw new ErrorWithCode('private_key and client_email are required.', 'MISSING_CREDENTIALS');
                    }
                    return { privateKey, clientEmail };
                }
                case 'application/x-x509-ca-cert': {
                    // *.pem file
                    const privateKey = yield readFile(keyFile, 'utf8');
                    return { privateKey };
                }
                case 'application/x-pkcs12': {
                    // *.p12 file
                    // NOTE:  The loading of `google-p12-pem` is deferred for performance
                    // reasons.  The `node-forge` npm module in `google-p12-pem` adds a fair
                    // bit time to overall module loading, and is likely not frequently
                    // used.  In a future release, p12 support will be entirely removed.
                    if (!getPem) {
                        getPem = (yield Promise.resolve().then(() => require('google-p12-pem'))).getPem;
                    }
                    const privateKey = yield getPem(keyFile);
                    return { privateKey };
                }
                default:
                    throw new ErrorWithCode('Unknown certificate type. Type is determined based on file extension. ' +
                        'Current supported extensions are *.json, *.pem, and *.p12.', 'UNKNOWN_CERTIFICATE_TYPE');
            }
        });
    }
    getTokenAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.hasExpired()) {
                return Promise.resolve(this.token);
            }
            if (!this.key && !this.keyFile) {
                throw new Error('No key or keyFile set.');
            }
            if (!this.key && this.keyFile) {
                const creds = yield this.getCredentials(this.keyFile);
                this.key = creds.privateKey;
                this.iss = creds.clientEmail || this.iss;
                if (!creds.clientEmail) {
                    this.ensureEmail();
                }
            }
            return this.requestToken();
        });
    }
    ensureEmail() {
        if (!this.iss) {
            throw new ErrorWithCode('email is required.', 'MISSING_CREDENTIALS');
        }
    }
    revokeToken(callback) {
        if (callback) {
            this.revokeTokenAsync().then(() => callback(), callback);
            return;
        }
        return this.revokeTokenAsync();
    }
    revokeTokenAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.token) {
                throw new Error('No token to revoke.');
            }
            return gaxios_1.request({ url: GOOGLE_REVOKE_TOKEN_URL + this.token }).then(r => {
                this.configure({
                    email: this.iss,
                    sub: this.sub,
                    key: this.key,
                    keyFile: this.keyFile,
                    scope: this.scope,
                    additionalClaims: this.additionalClaims,
                });
            });
        });
    }
    /**
     * Configure the GoogleToken for re-use.
     * @param  {object} options Configuration object.
     */
    configure(options = {}) {
        this.keyFile = options.keyFile;
        this.key = options.key;
        this.token = this.expiresAt = this.rawToken = null;
        this.iss = options.email || options.iss;
        this.sub = options.sub;
        this.additionalClaims = options.additionalClaims;
        if (typeof options.scope === 'object') {
            this.scope = options.scope.join(' ');
        }
        else {
            this.scope = options.scope;
        }
    }
    /**
     * Request the token from Google.
     */
    requestToken() {
        return __awaiter(this, void 0, void 0, function* () {
            const iat = Math.floor(new Date().getTime() / 1000);
            const additionalClaims = this.additionalClaims || {};
            const payload = Object.assign({
                iss: this.iss,
                scope: this.scope,
                aud: GOOGLE_TOKEN_URL,
                exp: iat + 3600,
                iat,
                sub: this.sub
            }, additionalClaims);
            const signedJWT = jws.sign({ header: { alg: 'RS256' }, payload, secret: this.key });
            return gaxios_1.request({
                method: 'POST',
                url: GOOGLE_TOKEN_URL,
                data: {
                    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                    assertion: signedJWT
                },
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                responseType: 'json'
            })
                .then(r => {
                this.rawToken = r.data;
                this.token = r.data.access_token;
                this.expiresAt =
                    (r.data.expires_in === null || r.data.expires_in === undefined) ?
                        null :
                        (iat + r.data.expires_in) * 1000;
                return this.token;
            })
                .catch(e => {
                this.token = null;
                this.tokenExpires = null;
                const body = (e.response && e.response.data) ? e.response.data : {};
                if (body.error) {
                    const desc = body.error_description ? `: ${body.error_description}` : '';
                    e.message = `${body.error}${desc}`;
                }
                throw e;
            });
        });
    }
}
exports.GoogleToken = GoogleToken;
//# sourceMappingURL=index.js.map