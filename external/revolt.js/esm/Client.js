var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import EventEmitter from "eventemitter3";
import defaultsDeep from "lodash.defaultsdeep";
import { action, makeObservable, observable } from "mobx";
import { API } from "revolt-api";
import Bots from "./maps/Bots";
import Channels from "./maps/Channels";
import Members from "./maps/Members";
import Messages from "./maps/Messages";
import Servers from "./maps/Servers";
import Users from "./maps/Users";
import Emojis from "./maps/Emojis";
import { WebSocketClient } from "./websocket/client";
import { defaultConfig } from "./config";
import Unreads from "./util/Unreads";
/**
 * Regular expression for mentions.
 */
export const RE_MENTIONS = /<@([A-z0-9]{26})>/g;
/**
 * Regular expression for spoilers.
 */
export const RE_SPOILER = /!!.+!!/g;
export class Client extends EventEmitter {
    constructor(options = {}) {
        super();
        this.user = null;
        this.users = new Users(this);
        this.channels = new Channels(this);
        this.servers = new Servers(this);
        this.members = new Members(this);
        this.messages = new Messages(this);
        this.bots = new Bots(this);
        this.emojis = new Emojis(this);
        makeObservable(this, {
            user: observable,
            users: observable,
            channels: observable,
            servers: observable,
            members: observable,
            messages: observable,
            emojis: observable,
            reset: action,
        }, {
            proxy: false,
        });
        this.options = defaultsDeep(options, defaultConfig);
        if (this.options.cache)
            throw "Cache is not supported yet.";
        if (this.options.unreads) {
            this.unreads = new Unreads(this);
        }
        this.api = new API({ baseURL: this.apiURL });
        this.websocket = new WebSocketClient(this);
        this.heartbeat = this.options.heartbeat;
        this.proxyFile = this.proxyFile.bind(this);
    }
    /**
     * ? Configuration.
     */
    /**
     * Get the current API base URL.
     */
    get apiURL() {
        return this.options.apiURL;
    }
    /**
     * Whether debug mode is turned on.
     */
    get debug() {
        return this.options.debug;
    }
    /**
     * Whether revolt.js should auto-reconnect
     */
    get autoReconnect() {
        return this.options.autoReconnect;
    }
    /**
     * ? Authentication and connection.
     */
    /**
     * Fetches the configuration of the server.
     *
     * @remarks
     * Unlike `fetchConfiguration`, this function also fetches the
     * configuration if it has already been fetched before.
     */
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            this.configuration = yield this.api.get("/");
        });
    }
    /**
     * Fetches the configuration of the server if it has not been already fetched.
     */
    fetchConfiguration() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.configuration)
                yield this.connect();
        });
    }
    /**
     * Update API object to use authentication.
     */
    $updateHeaders() {
        this.api = new API({
            baseURL: this.apiURL,
            authentication: {
                revolt: this.session,
            },
        });
    }
    /**
     * Log in with auth data, creating a new session in the process.
     * @param details Login data object
     * @returns An onboarding function if onboarding is required, undefined otherwise
     */
    login(details) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.fetchConfiguration();
            const data = yield this.api.post("/auth/session/login", details);
            if (data.result === "Success") {
                this.session = data;
                return yield this.$connect();
            }
            else {
                throw "MFA not implemented!";
            }
        });
    }
    /**
     * Use an existing session to log into Revolt.
     * @param session Session data object
     * @returns An onboarding function if onboarding is required, undefined otherwise
     */
    useExistingSession(session) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.fetchConfiguration();
            this.session = session;
            return yield this.$connect();
        });
    }
    /**
     * Log in as a bot.
     * @param token Bot token
     */
    loginBot(token) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.fetchConfiguration();
            this.session = token;
            this.$updateHeaders();
            return yield this.websocket.connect();
        });
    }
    /**
     * Check onboarding status and connect to notifications service.
     * @returns
     */
    $connect() {
        return __awaiter(this, void 0, void 0, function* () {
            this.$updateHeaders();
            const { onboarding } = yield this.api.get("/onboard/hello");
            if (onboarding) {
                return (username, loginAfterSuccess) => this.completeOnboarding({ username }, loginAfterSuccess);
            }
            yield this.websocket.connect();
        });
    }
    /**
     * Finish onboarding for a user, for example by providing a username.
     * @param data Onboarding data object
     * @param loginAfterSuccess Defines whether to automatically log in and connect after onboarding finishes
     */
    completeOnboarding(data, loginAfterSuccess) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.api.post("/onboard/complete", data);
            if (loginAfterSuccess) {
                yield this.websocket.connect();
            }
        });
    }
    /**
     * ? Miscellaneous API routes.
     */
    /**
     * Fetch information about a given invite code.
     * @param code The invite code.
     * @returns Invite information.
     */
    fetchInvite(code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.api.get(`/invites/${code}`);
        });
    }
    /**
     * Use an invite.
     * @param invite Invite
     * @returns Data provided by invite.
     */
    joinInvite(invite) {
        return __awaiter(this, void 0, void 0, function* () {
            const code = typeof invite === "string" ? invite : invite.code;
            if (typeof invite === "object") {
                switch (invite.type) {
                    case "Group": {
                        const group = this.channels.get(invite.channel_id);
                        if (group)
                            return group;
                        break;
                    }
                    case "Server": {
                        const server = this.servers.get(invite.server_id);
                        if (server)
                            return server;
                    }
                }
            }
            const response = yield this.api.post(`/invites/${code}`);
            if (response.type === "Server") {
                return yield this.servers.fetch(response.server._id, response.server, response.channels);
            }
            else {
                throw "Unsupported invite type.";
            }
        });
    }
    /**
     * Delete an invite.
     * @param code The invite code.
     */
    deleteInvite(code) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.api.delete(`/invites/${code}`);
        });
    }
    /**
     * Fetch user settings for current user.
     * @param keys Settings keys to fetch, leave blank to fetch full object.
     * @returns Key-value object of settings.
     */
    syncFetchSettings(keys) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.api.post("/sync/settings/fetch", { keys });
        });
    }
    /**
     * Set user settings for current user.
     * @param data Data to set as an object. Any non-string values will be automatically serialised.
     * @param timestamp Timestamp to use for the current revision.
     */
    syncSetSettings(data, timestamp) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestData = {};
            for (const key of Object.keys(data)) {
                const value = data[key];
                requestData[key] =
                    typeof value === "string" ? value : JSON.stringify(value);
            }
            yield this.api.post(`/sync/settings/set`, Object.assign(Object.assign({}, requestData), { timestamp }));
        });
    }
    /**
     * Fetch user unreads for current user.
     * @returns Array of channel unreads.
     */
    syncFetchUnreads() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.api.get("/sync/unreads");
        });
    }
    /**
     * ? Utility functions.
     */
    /**
     * Log out of Revolt. Disconnect the WebSocket, request a session invalidation and reset the client.
     */
    logout(avoidRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            this.user = null;
            this.emit("logout");
            !avoidRequest && (yield this.api.post("/auth/session/logout"));
            this.reset();
        });
    }
    /**
     * Reset the client by setting properties to their original value or deleting them entirely.
     * Disconnects the current WebSocket.
     */
    reset() {
        this.user = null;
        this.websocket.disconnect();
        delete this.session;
        this.users = new Users(this);
        this.channels = new Channels(this);
        this.servers = new Servers(this);
        this.members = new Members(this);
        this.messages = new Messages(this);
        this.emojis = new Emojis(this);
    }
    /**
     * Register for a new account.
     * @param data Registration data object
     * @returns A promise containing a registration response object
     */
    register(data) {
        return this.api.post("/auth/account/create", data);
    }
    /**
     * Prepare a markdown-based message to be displayed to the user as plain text.
     * @param source Source markdown text
     * @returns Modified plain text
     */
    markdownToText(source) {
        return source
            .replace(RE_MENTIONS, (sub, id) => {
            var _a;
            const user = this.users.get(id);
            if (user) {
                return `${(_a = user.display_name) !== null && _a !== void 0 ? _a : user.username}`;
            }
            return sub;
        })
            .replace(RE_SPOILER, "<spoiler>");
    }
    /**
     * Proxy a file through January.
     * @param url URL to proxy
     * @returns Proxied media URL
     */
    proxyFile(url) {
        var _a;
        if ((_a = this.configuration) === null || _a === void 0 ? void 0 : _a.features.january.enabled) {
            return `${this.configuration.features.january.url}/proxy?url=${encodeURIComponent(url)}`;
        }
    }
    /**
     * Generates a URL to a given file with given options.
     * @param attachment Partial of attachment object
     * @param options Optional query parameters to modify object
     * @param allowAnimation Returns GIF if applicable, no operations occur on image
     * @param fallback Fallback URL
     * @returns Generated URL or nothing
     */
    generateFileURL(attachment, ...args) {
        var _a;
        const [options, allowAnimation, fallback] = args;
        const autumn = (_a = this.configuration) === null || _a === void 0 ? void 0 : _a.features.autumn;
        if (!(autumn === null || autumn === void 0 ? void 0 : autumn.enabled))
            return fallback;
        if (!attachment)
            return fallback;
        const { tag, _id, content_type, metadata } = attachment;
        // ! FIXME: These limits should be done on Autumn.
        if ((metadata === null || metadata === void 0 ? void 0 : metadata.type) === "Image") {
            if (Math.min(metadata.width, metadata.height) <= 0 ||
                (content_type === "image/gif" &&
                    Math.max(metadata.width, metadata.height) >= 1024))
                return fallback;
        }
        let query = "";
        if (options) {
            if (!allowAnimation || content_type !== "image/gif") {
                query =
                    "?" +
                        Object.keys(options)
                            .map((k) => `${k}=${options[k]}`)
                            .join("&");
            }
        }
        return `${autumn.url}/${tag}/${_id}${query}`;
    }
}
