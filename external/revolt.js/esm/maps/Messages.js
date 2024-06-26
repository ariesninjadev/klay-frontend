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
import { makeAutoObservable, runInAction, action, computed, ObservableMap, ObservableSet, } from "mobx";
import isEqual from "lodash.isequal";
import { toNullable, toNullableDate } from "../util/null";
import Collection from "./Collection";
import { decodeTime } from "ulid";
export class Message {
    constructor(client, data) {
        var _a, _b;
        this.client = client;
        this._id = data._id;
        this.nonce = (_a = data.nonce) !== null && _a !== void 0 ? _a : undefined;
        this.channel_id = data.channel;
        this.author_id = data.author;
        this.webhook = toNullable(data.webhook);
        this.content = toNullable(data.content);
        this.system = toNullable(data.system);
        this.attachments = toNullable(data.attachments);
        this.edited = toNullableDate(data.edited);
        this.embeds = toNullable(data.embeds);
        this.mention_ids = toNullable(data.mentions);
        this.reply_ids = toNullable(data.replies);
        this.masquerade = toNullable(data.masquerade);
        this.interactions = toNullable(data.interactions);
        this.reactions = new ObservableMap();
        for (const reaction of Object.keys((_b = data.reactions) !== null && _b !== void 0 ? _b : {})) {
            this.reactions.set(reaction, new ObservableSet(data.reactions[reaction]));
        }
        makeAutoObservable(this, {
            _id: false,
            client: false,
        });
    }
    get channel() {
        return this.client.channels.get(this.channel_id);
    }
    get author() {
        return this.client.users.get(this.author_id);
    }
    get member() {
        const channel = this.channel;
        if ((channel === null || channel === void 0 ? void 0 : channel.channel_type) === "TextChannel") {
            return this.client.members.getKey({
                server: channel.server_id,
                user: this.author_id,
            });
        }
    }
    get mentions() {
        var _a;
        return (_a = this.mention_ids) === null || _a === void 0 ? void 0 : _a.map((id) => this.client.users.get(id));
    }
    /**
     * Get timestamp when this message was created.
     */
    get createdAt() {
        return decodeTime(this._id);
    }
    /**
     * Absolute pathname to this message in the client.
     */
    get path() {
        var _a;
        return ((_a = this.channel) === null || _a === void 0 ? void 0 : _a.path) + "/" + this._id;
    }
    /**
     * Get URL to this message.
     */
    get url() {
        var _a;
        return ((_a = this.client.configuration) === null || _a === void 0 ? void 0 : _a.app) + this.path;
    }
    /**
     * Get the username for this message.
     */
    get username() {
        var _a, _b, _c, _d, _e, _f, _g;
        return ((_f = (_d = (_b = (_a = this.masquerade) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : (_c = this.webhook) === null || _c === void 0 ? void 0 : _c.name) !== null && _d !== void 0 ? _d : (_e = this.member) === null || _e === void 0 ? void 0 : _e.nickname) !== null && _f !== void 0 ? _f : (_g = this.author) === null || _g === void 0 ? void 0 : _g.username);
    }
    /**
     * Get the role colour for this message.
     */
    get roleColour() {
        var _a, _b, _c;
        return (_b = (_a = this.masquerade) === null || _a === void 0 ? void 0 : _a.colour) !== null && _b !== void 0 ? _b : (_c = this.member) === null || _c === void 0 ? void 0 : _c.roleColour;
    }
    /**
     * Get the avatar URL for this message.
     */
    get avatarURL() {
        var _a, _b, _c, _d, _e;
        return ((_a = this.generateMasqAvatarURL()) !== null && _a !== void 0 ? _a : (_b = this.webhook) === null || _b === void 0 ? void 0 : _b.avatar)
            ? `https://autumn.revolt.chat/avatars/${(_c = this.webhook) === null || _c === void 0 ? void 0 : _c.avatar}`
            : this.member
                ? (_d = this.member) === null || _d === void 0 ? void 0 : _d.avatarURL
                : (_e = this.author) === null || _e === void 0 ? void 0 : _e.avatarURL;
    }
    /**
     * Get the animated avatar URL for this message.
     */
    get animatedAvatarURL() {
        var _a, _b, _c, _d, _e;
        return ((_a = this.generateMasqAvatarURL()) !== null && _a !== void 0 ? _a : (_b = this.webhook) === null || _b === void 0 ? void 0 : _b.avatar)
            ? `https://autumn.revolt.chat/avatars/${(_c = this.webhook) === null || _c === void 0 ? void 0 : _c.avatar}`
            : this.member
                ? (_d = this.member) === null || _d === void 0 ? void 0 : _d.animatedAvatarURL
                : (_e = this.author) === null || _e === void 0 ? void 0 : _e.animatedAvatarURL;
    }
    generateMasqAvatarURL() {
        var _a;
        const avatar = (_a = this.masquerade) === null || _a === void 0 ? void 0 : _a.avatar;
        return avatar ? this.client.proxyFile(avatar) : undefined;
    }
    get asSystemMessage() {
        const system = this.system;
        if (!system)
            return { type: "none" };
        const { type } = system;
        const get = (id) => this.client.users.get(id);
        switch (system.type) {
            case "text":
                return system;
            case "user_added":
                return { type, user: get(system.id), by: get(system.by) };
            case "user_remove":
                return { type, user: get(system.id), by: get(system.by) };
            case "user_joined":
                return { type, user: get(system.id) };
            case "user_left":
                return { type, user: get(system.id) };
            case "user_kicked":
                return { type, user: get(system.id) };
            case "user_banned":
                return { type, user: get(system.id) };
            case "channel_renamed":
                return { type, name: system.name, by: get(system.by) };
            case "channel_description_changed":
                return { type, by: get(system.by) };
            case "channel_icon_changed":
                return { type, by: get(system.by) };
            case "channel_ownership_changed":
                return { type, from: get(system.from), to: get(system.to) };
        }
    }
    update(data) {
        const apply = (key, target, transform) => {
            // This code has been tested.
            if (
            // @ts-expect-error TODO: clean up types here
            typeof data[key] !== "undefined" &&
                // @ts-expect-error TODO: clean up types here
                !isEqual(this[target !== null && target !== void 0 ? target : key], data[key])) {
                // @ts-expect-error TODO: clean up types here
                this[target !== null && target !== void 0 ? target : key] = transform
                    ? // @ts-expect-error TODO: clean up types here
                        transform(data[key])
                    : // @ts-expect-error TODO: clean up types here
                        data[key];
            }
        };
        apply("webhook");
        apply("content");
        apply("attachments");
        apply("edited", undefined, toNullableDate);
        apply("embeds");
        apply("mentions", "mention_ids");
        apply("masquerade");
        apply("reactions", undefined, (reactions) => {
            const v = reactions;
            const newMap = new ObservableMap();
            for (const reaction of Object.keys(v)) {
                this.reactions.set(reaction, new ObservableSet(data.reactions[reaction]));
            }
            return newMap;
        });
        apply("interactions");
    }
    append({ embeds }) {
        var _a;
        if (embeds) {
            this.embeds = [...((_a = this.embeds) !== null && _a !== void 0 ? _a : []), ...embeds];
        }
    }
    /**
     * Edit a message
     * @param data Message edit route data
     */
    edit(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.api.patch(`/channels/${this.channel_id}/messages/${this._id}`, data);
        });
    }
    /**
     * Delete a message
     */
    delete() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.api.delete(`/channels/${this.channel_id}/messages/${this._id}`);
        });
    }
    /**
     * Acknowledge this message as read
     */
    ack() {
        var _a;
        (_a = this.channel) === null || _a === void 0 ? void 0 : _a.ack(this);
    }
    /**
     * Reply to Message
     */
    reply(data, mention = true) {
        var _a;
        const obj = typeof data === "string" ? { content: data } : data;
        return (_a = this.channel) === null || _a === void 0 ? void 0 : _a.sendMessage(Object.assign(Object.assign({}, obj), { replies: [{ id: this._id, mention }] }));
    }
    /**
     * Clear all reactions from this message
     */
    clearReactions() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.api.delete(`/channels/${this.channel_id}/messages/${this._id}/reactions`);
        });
    }
    /**
     * React to a message
     * @param emoji Unicode or emoji ID
     */
    react(emoji) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.api.put(`/channels/${this.channel_id}/messages/${this._id}/reactions/${emoji}`);
        });
    }
    /**
     * Unreact from a message
     * @param emoji Unicode or emoji ID
     */
    unreact(emoji) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.api.delete(`/channels/${this.channel_id}/messages/${this._id}/reactions/${emoji}`);
        });
    }
}
__decorate([
    computed
], Message.prototype, "generateMasqAvatarURL", null);
__decorate([
    computed
], Message.prototype, "asSystemMessage", null);
__decorate([
    action
], Message.prototype, "update", null);
__decorate([
    action
], Message.prototype, "append", null);
export default class Messages extends Collection {
    constructor(client) {
        super(client);
        this.createObj = this.createObj.bind(this);
    }
    $get(id, data) {
        const msg = this.get(id);
        if (data)
            msg.update(data);
        return msg;
    }
    /**
     * Create a message object.
     * This is meant for internal use only.
     * @param data Message Data
     * @param emit Whether to emit creation event
     * @returns Message
     */
    createObj(data, emit) {
        if (this.has(data._id))
            return this.$get(data._id);
        const message = new Message(this.client, data);
        runInAction(() => {
            this.set(data._id, message);
        });
        if (emit === true)
            this.client.emit("message", message);
        return message;
    }
}
__decorate([
    action
], Messages.prototype, "$get", null);
