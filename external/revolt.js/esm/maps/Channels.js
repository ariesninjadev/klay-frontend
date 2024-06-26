var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { action, computed, makeAutoObservable, runInAction } from "mobx";
import isEqual from "lodash.isequal";
import { decodeTime, ulid } from "ulid";
import { toNullable } from "../util/null";
import Collection from "./Collection";
import { Permission } from "../permissions/definitions";
import { bitwiseAndEq, calculatePermission } from "../permissions/calculator";
export class Channel {
    constructor(client, data) {
        /**
         * Whether this DM is active.
         * @requires `DirectMessage`
         */
        this.active = null;
        /**
         * The ID of the group owner.
         * @requires `Group`
         */
        this.owner_id = null;
        /**
         * The ID of the server this channel is in.
         * @requires `TextChannel`, `VoiceChannel`
         */
        this.server_id = null;
        /**
         * Permissions for group members.
         * @requires `Group`
         */
        this.permissions = null;
        /**
         * Default server channel permissions.
         * @requires `TextChannel`, `VoiceChannel`
         */
        this.default_permissions = null;
        /**
         * Channel permissions for each role.
         * @requires `TextChannel`, `VoiceChannel`
         */
        this.role_permissions = null;
        /**
         * Channel name.
         * @requires `Group`, `TextChannel`, `VoiceChannel`
         */
        this.name = null;
        /**
         * Channel icon.
         * @requires `Group`, `TextChannel`, `VoiceChannel`
         */
        this.icon = null;
        /**
         * Channel description.
         * @requires `Group`, `TextChannel`, `VoiceChannel`
         */
        this.description = null;
        /**
         * Group / DM members.
         * @requires `Group`, `DM`
         */
        this.recipient_ids = null;
        /**
         * Id of last message in channel.
         * @requires `Group`, `DM`, `TextChannel`, `VoiceChannel`
         */
        this.last_message_id = null;
        /**
         * Users typing in channel.
         */
        this.typing_ids = new Set();
        /**
         * Channel is not safe for work.
         * @requires `Group`, `TextChannel`, `VoiceChannel`
         */
        this.nsfw = null;
        this.client = client;
        this._id = data._id;
        this.channel_type = data.channel_type;
        switch (data.channel_type) {
            case "DirectMessage": {
                this.active = toNullable(data.active);
                this.recipient_ids = toNullable(data.recipients);
                this.last_message_id = toNullable(data.last_message_id);
                break;
            }
            case "Group": {
                this.recipient_ids = toNullable(data.recipients);
                this.name = toNullable(data.name);
                this.owner_id = toNullable(data.owner);
                this.description = toNullable(data.description);
                this.last_message_id = toNullable(data.last_message_id);
                this.icon = toNullable(data.icon);
                this.permissions = toNullable(data.permissions);
                this.nsfw = toNullable(data.nsfw);
                break;
            }
            case "TextChannel":
            case "VoiceChannel": {
                this.server_id = toNullable(data.server);
                this.name = toNullable(data.name);
                this.description = toNullable(data.description);
                this.icon = toNullable(data.icon);
                this.default_permissions = toNullable(data.default_permissions);
                this.role_permissions = toNullable(data.role_permissions);
                if (data.channel_type === "TextChannel") {
                    this.last_message_id = toNullable(data.last_message_id);
                    this.nsfw = toNullable(data.nsfw);
                }
                break;
            }
        }
        makeAutoObservable(this, {
            _id: false,
            client: false,
        });
    }
    /**
     * The group owner.
     * @requires `Group`
     */
    get owner() {
        if (this.owner_id === null)
            return;
        return this.client.users.get(this.owner_id);
    }
    /**
     * Server this channel belongs to.
     * @requires `Server`
     */
    get server() {
        if (this.server_id === null)
            return;
        return this.client.servers.get(this.server_id);
    }
    /**
     * The DM recipient.
     * @requires `DM`
     */
    get recipient() {
        var _a;
        const user_id = (_a = this.recipient_ids) === null || _a === void 0 ? void 0 : _a.find((x) => this.client.user._id !== x);
        if (!user_id)
            return;
        return this.client.users.get(user_id);
    }
    /**
     * Last message sent in this channel.
     * @requires `Group`, `DM`, `TextChannel`, `VoiceChannel`
     */
    get last_message() {
        const id = this.last_message_id;
        if (!id)
            return;
        return this.client.messages.get(id);
    }
    /**
     * Get the last message ID if it is present or the origin timestamp.
     * TODO: deprecate
     */
    get last_message_id_or_past() {
        var _a;
        return (_a = this.last_message_id) !== null && _a !== void 0 ? _a : "0";
    }
    /**
     * Group recipients.
     * @requires `Group`
     */
    get recipients() {
        var _a;
        return (_a = this.recipient_ids) === null || _a === void 0 ? void 0 : _a.map((id) => this.client.users.get(id));
    }
    /**
     * Users typing.
     */
    get typing() {
        return Array.from(this.typing_ids).map((id) => this.client.users.get(id));
    }
    /**
     * Get timestamp when this channel was created.
     */
    get createdAt() {
        return decodeTime(this._id);
    }
    /**
     * Get timestamp when this channel last had a message sent or when it was created
     */
    get updatedAt() {
        return this.last_message_id
            ? decodeTime(this.last_message_id)
            : this.createdAt;
    }
    /**
     * Absolute pathname to this channel in the client.
     */
    get path() {
        if (this.server_id) {
            return `/server/${this.server_id}/channel/${this._id}`;
        }
        else {
            return `/channel/${this._id}`;
        }
    }
    /**
     * Get URL to this channel.
     */
    get url() {
        var _a;
        return ((_a = this.client.configuration) === null || _a === void 0 ? void 0 : _a.app) + this.path;
    }
    /**
     * Check whether the channel is currently unread
     * @param permit Callback function to determine whether a channel has certain properties
     * @returns Whether the channel is unread
     */
    isUnread(permit) {
        if (permit.isMuted(this))
            return false;
        return this.unread;
    }
    /**
     * Find all message IDs of unread messages
     * @param permit Callback function to determine whether a channel has certain properties
     * @returns Array of message IDs which are unread
     */
    getMentions(permit) {
        if (permit.isMuted(this))
            return [];
        return this.mentions;
    }
    /**
     * Get whether this channel is unread.
     */
    get unread() {
        var _a, _b, _c;
        if (!this.last_message_id ||
            this.channel_type === "SavedMessages" ||
            this.channel_type === "VoiceChannel")
            return false;
        return (((_c = (_b = (_a = this.client.unreads) === null || _a === void 0 ? void 0 : _a.getUnread(this._id)) === null || _b === void 0 ? void 0 : _b.last_id) !== null && _c !== void 0 ? _c : "0").localeCompare(this.last_message_id) === -1);
    }
    /**
     * Get mentions in this channel for user.
     */
    get mentions() {
        var _a, _b, _c;
        if (this.channel_type === "SavedMessages" ||
            this.channel_type === "VoiceChannel")
            return [];
        return (_c = (_b = (_a = this.client.unreads) === null || _a === void 0 ? void 0 : _a.getUnread(this._id)) === null || _b === void 0 ? void 0 : _b.mentions) !== null && _c !== void 0 ? _c : [];
    }
    update(data, clear = []) {
        const apply = (key, target) => {
            if (
            // @ts-expect-error TODO: clean up types here
            typeof data[key] !== "undefined" &&
                // @ts-expect-error TODO: clean up types here
                !isEqual(this[target !== null && target !== void 0 ? target : key], data[key])) {
                // @ts-expect-error TODO: clean up types here
                this[target !== null && target !== void 0 ? target : key] = data[key];
            }
        };
        for (const entry of clear) {
            switch (entry) {
                case "Description":
                    this.description = null;
                    break;
                case "Icon":
                    this.icon = null;
                    break;
            }
        }
        apply("active");
        apply("owner", "owner_id");
        apply("permissions");
        apply("default_permissions");
        apply("role_permissions");
        apply("name");
        apply("icon");
        apply("description");
        apply("recipients", "recipient_ids");
        apply("last_message_id");
        apply("nsfw");
    }
    updateGroupJoin(user) {
        var _a;
        (_a = this.recipient_ids) === null || _a === void 0 ? void 0 : _a.push(user);
    }
    updateGroupLeave(user) {
        var _a;
        this.recipient_ids = toNullable((_a = this.recipient_ids) === null || _a === void 0 ? void 0 : _a.filter((x) => x !== user));
    }
    updateStartTyping(id) {
        this.typing_ids.add(id);
    }
    updateStopTyping(id) {
        this.typing_ids.delete(id);
    }
    /**
     * Fetch a channel's members.
     * @requires `Group`
     * @returns An array of the channel's members.
     */
    fetchMembers() {
        return __awaiter(this, void 0, void 0, function* () {
            const members = yield this.client.api.get(`/channels/${this._id}/members`);
            return members.map(this.client.users.createObj);
        });
    }
    /**
     * Edit a channel
     * @param data Edit data
     */
    edit(data) {
        return __awaiter(this, void 0, void 0, function* () {
            this.update(yield this.client.api.patch(`/channels/${this._id}`, data));
        });
    }
    /**
     * Delete a channel
     * @requires `DM`, `Group`, `TextChannel`, `VoiceChannel`
     */
    delete(leave_silently, avoidReq) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!avoidReq)
                yield this.client.api.delete(`/channels/${this._id}`, {
                    leave_silently,
                });
            runInAction(() => {
                if (this.channel_type === "DirectMessage") {
                    this.active = false;
                    return;
                }
                if (this.channel_type === "TextChannel" ||
                    this.channel_type === "VoiceChannel") {
                    const server = this.server;
                    if (server) {
                        server.channel_ids = server.channel_ids.filter((x) => x !== this._id);
                    }
                }
                this.client.channels.delete(this._id);
            });
        });
    }
    /**
     * Add a user to a group
     * @param user_id ID of the target user
     */
    addMember(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.api.put(`/channels/${this._id}/recipients/${user_id}`);
        });
    }
    /**
     * Remove a user from a group
     * @param user_id ID of the target user
     */
    removeMember(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.api.delete(`/channels/${this._id}/recipients/${user_id}`);
        });
    }
    /**
     * Send a message
     * @param data Either the message as a string or message sending route data
     * @returns The message
     */
    sendMessage(data, idempotencyKey = ulid()) {
        return __awaiter(this, void 0, void 0, function* () {
            const msg = typeof data === "string" ? { content: data } : data;
            const message = yield this.client.api.post(`/channels/${this._id}/messages`, msg, {
                headers: {
                    "Idempotency-Key": idempotencyKey,
                },
            });
            return this.client.messages.createObj(message, true);
        });
    }
    /**
     * Fetch a message by its ID
     * @param message_id ID of the target message
     * @returns The message
     */
    fetchMessage(message_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = yield this.client.api.get(`/channels/${this._id}/messages/${message_id}`);
            return this.client.messages.createObj(message);
        });
    }
    /**
     * Fetch multiple messages from a channel
     * @param params Message fetching route data
     * @returns The messages
     */
    fetchMessages(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const messages = (yield this.client.api.get(`/channels/${this._id}/messages`, Object.assign({}, params)));
            return runInAction(() => messages.map(this.client.messages.createObj));
        });
    }
    /**
     * Fetch multiple messages from a channel including the users that sent them
     * @param params Message fetching route data
     * @returns Object including messages and users
     */
    fetchMessagesWithUsers(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = (yield this.client.api.get(`/channels/${this._id}/messages`, Object.assign(Object.assign({}, params), { include_users: true })));
            return runInAction(() => {
                var _a;
                return {
                    messages: data.messages.map(this.client.messages.createObj),
                    users: data.users.map(this.client.users.createObj),
                    members: (_a = data.members) === null || _a === void 0 ? void 0 : _a.map(this.client.members.createObj),
                };
            });
        });
    }
    /**
     * Search for messages
     * @param params Message searching route data
     * @returns The messages
     */
    search(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const messages = (yield this.client.api.post(`/channels/${this._id}/search`, params));
            return runInAction(() => messages.map(this.client.messages.createObj));
        });
    }
    /**
     * Search for messages including the users that sent them
     * @param params Message searching route data
     * @returns The messages
     */
    searchWithUsers(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = (yield this.client.api.post(`/channels/${this._id}/search`, Object.assign(Object.assign({}, params), { include_users: true })));
            return runInAction(() => {
                var _a;
                return {
                    messages: data.messages.map(this.client.messages.createObj),
                    users: data.users.map(this.client.users.createObj),
                    members: (_a = data.members) === null || _a === void 0 ? void 0 : _a.map(this.client.members.createObj),
                };
            });
        });
    }
    /**
     * Fetch stale messages
     * @param ids IDs of the target messages
     * @returns The stale messages
     */
    fetchStale(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            /*const data = await this.client.api.post(
                `/channels/${this._id as ''}/messages/stale`,
                { ids },
            );
    
            runInAction(() => {
                data.deleted.forEach((id) => this.client.messages.delete(id));
                data.updated.forEach((data) =>
                    this.client.messages.get(data._id)?.update(data),
                );
            });
    
            return data;*/
            return { deprecated: ids };
        });
    }
    deleteMessages(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.api.delete(`/channels/${this._id}/messages/bulk`, { data: { ids } });
        });
    }
    /**
     * Create an invite to the channel
     * @returns Newly created invite code
     */
    createInvite() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.api.post(`/channels/${this._id}/invites`);
        });
    }
    /**
     * Join a call in a channel
     * @returns Join call response data
     */
    joinCall() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.api.post(`/channels/${this._id}/join_call`);
        });
    }
    /**
     * Mark a channel as read
     * @param message Last read message or its ID
     * @param skipRateLimiter Whether to skip the internal rate limiter
     */
    ack(message, skipRateLimiter) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const id = (_b = (_a = (typeof message === "string" ? message : message === null || message === void 0 ? void 0 : message._id)) !== null && _a !== void 0 ? _a : this.last_message_id) !== null && _b !== void 0 ? _b : ulid();
            const performAck = () => {
                delete this.ackLimit;
                this.client.api.put(`/channels/${this._id}/ack/${id}`);
            };
            if (!this.client.options.ackRateLimiter || skipRateLimiter)
                return performAck();
            clearTimeout(this.ackTimeout);
            if (this.ackLimit && +new Date() > this.ackLimit) {
                performAck();
            }
            // We need to use setTimeout here for both Node.js and browser.
            this.ackTimeout = setTimeout(performAck, 5000);
            if (!this.ackLimit) {
                this.ackLimit = +new Date() + 15e3;
            }
        });
    }
    /**
     * Set role permissions
     * @param role_id Role Id, set to 'default' to affect all users
     * @param permissions Permission value
     */
    setPermissions(role_id = "default", permissions) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.api.put(`/channels/${this._id}/permissions/${role_id}`, { permissions });
        });
    }
    /**
     * Start typing in this channel
     */
    startTyping() {
        this.client.websocket.send({ type: "BeginTyping", channel: this._id });
    }
    /**
     * Stop typing in this channel
     */
    stopTyping() {
        this.client.websocket.send({ type: "EndTyping", channel: this._id });
    }
    /**
     * Generate URL to icon for this channel
     * @param args File parameters
     * @returns File URL
     */
    generateIconURL(...args) {
        var _a, _b, _c;
        if (this.channel_type === "DirectMessage") {
            return this.client.generateFileURL((_b = (_a = this.recipient) === null || _a === void 0 ? void 0 : _a.avatar) !== null && _b !== void 0 ? _b : undefined, ...args);
        }
        return this.client.generateFileURL((_c = this.icon) !== null && _c !== void 0 ? _c : undefined, ...args);
    }
    /**
     * Permission the currently authenticated user has against this channel
     */
    get permission() {
        return calculatePermission(this);
    }
    /**
     * Check whether we have a given permission in a channel
     * @param permission Permission Names
     * @returns Whether we have this permission
     */
    havePermission(...permission) {
        return bitwiseAndEq(this.permission, ...permission.map((x) => Permission[x]));
    }
}
__decorate([
    computed
], Channel.prototype, "isUnread", null);
__decorate([
    computed
], Channel.prototype, "getMentions", null);
__decorate([
    action
], Channel.prototype, "update", null);
__decorate([
    action
], Channel.prototype, "updateGroupJoin", null);
__decorate([
    action
], Channel.prototype, "updateGroupLeave", null);
__decorate([
    action
], Channel.prototype, "updateStartTyping", null);
__decorate([
    action
], Channel.prototype, "updateStopTyping", null);
__decorate([
    computed
], Channel.prototype, "permission", null);
__decorate([
    computed
], Channel.prototype, "havePermission", null);
export default class Channels extends Collection {
    constructor(client) {
        super(client);
        this.createObj = this.createObj.bind(this);
    }
    $get(id, data) {
        const channel = this.get(id);
        if (data)
            channel.update(data);
        return channel;
    }
    /**
     * Check whether a channel should currently exist
     * @param id Channel ID
     * @returns Whether it should current exist
     */
    exists(id) {
        const channel = this.get(id);
        if (channel) {
            switch (channel.channel_type) {
                case "DirectMessage":
                    return channel.active;
                default:
                    return true;
            }
        }
        else {
            return false;
        }
    }
    /**
     * Fetch a channel
     * @param id Channel ID
     * @returns The channel
     */
    fetch(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.has(id))
                return this.$get(id);
            const res = data !== null && data !== void 0 ? data : (yield this.client.api.get(`/channels/${id}`));
            return this.createObj(res);
        });
    }
    /**
     * Create a channel object.
     * This is meant for internal use only.
     * @param data: Channel Data
     * @param emit Whether to emit creation event
     * @returns Channel
     */
    createObj(data, emit) {
        if (this.has(data._id))
            return this.$get(data._id);
        const channel = new Channel(this.client, data);
        runInAction(() => {
            this.set(data._id, channel);
        });
        if (emit === true)
            this.client.emit("channel/create", channel);
        return channel;
    }
    /**
     * Create a group
     * @param data Group create route data
     * @returns The newly-created group
     */
    createGroup(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const group = yield this.client.api.post(`/channels/create`, data);
            return (yield this.fetch(group._id, group));
        });
    }
}
__decorate([
    action
], Channels.prototype, "$get", null);
