var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { backOff } from "@insertish/exponential-backoff";
import { ObservableSet, runInAction } from "mobx";
import WebSocket from "@insertish/isomorphic-ws";
export class WebSocketClient {
    constructor(client) {
        this.client = client;
        this.connected = false;
        this.ready = false;
    }
    /**
     * Disconnect the WebSocket and disable heartbeats.
     */
    disconnect() {
        clearInterval(this.heartbeat);
        this.connected = false;
        this.ready = false;
        if (typeof this.ws !== "undefined" &&
            this.ws.readyState === WebSocket.OPEN) {
            this.ws.close();
        }
    }
    /**
     * Send a notification
     * @param notification Serverbound notification
     */
    send(notification) {
        if (typeof this.ws === "undefined" ||
            this.ws.readyState !== WebSocket.OPEN)
            return;
        const data = JSON.stringify(notification);
        if (this.client.debug)
            console.debug("[<] PACKET", data);
        this.ws.send(data);
    }
    /**
     * Connect the WebSocket
     * @param disallowReconnect Whether to disallow reconnection
     */
    connect(disallowReconnect) {
        this.client.emit("connecting");
        return new Promise((resolve, $reject) => {
            let thrown = false;
            const reject = (err) => {
                if (!thrown) {
                    thrown = true;
                    $reject(err);
                }
            };
            this.disconnect();
            if (typeof this.client.configuration === "undefined") {
                throw new Error("Attempted to open WebSocket without syncing configuration from server.");
            }
            if (typeof this.client.session === "undefined") {
                throw new Error("Attempted to open WebSocket without valid session.");
            }
            const ws = new WebSocket(this.client.configuration.ws);
            this.ws = ws;
            ws.onopen = () => {
                if (typeof this.client.session === "string") {
                    this.send({
                        type: "Authenticate",
                        token: this.client.session,
                    });
                }
                else {
                    this.send(Object.assign({ type: "Authenticate" }, this.client.session));
                }
            };
            const process = (packet) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                this.client.emit("packet", packet);
                try {
                    switch (packet.type) {
                        case "Bulk": {
                            for (const entry of packet.v) {
                                yield process(entry);
                            }
                            break;
                        }
                        case "Error": {
                            reject(packet.error);
                            break;
                        }
                        case "Authenticated": {
                            disallowReconnect = false;
                            this.client.emit("connected");
                            this.connected = true;
                            break;
                        }
                        case "Ready": {
                            runInAction(() => {
                                if (packet.type !== "Ready")
                                    throw 0;
                                for (const user of packet.users) {
                                    this.client.users.createObj(user);
                                }
                                for (const channel of packet.channels) {
                                    this.client.channels.createObj(channel);
                                }
                                for (const server of packet.servers) {
                                    this.client.servers.createObj(server);
                                }
                                for (const member of packet.members) {
                                    this.client.members.createObj(member);
                                }
                                for (const emoji of packet.emojis) {
                                    this.client.emojis.createObj(emoji);
                                }
                            });
                            this.client.user = this.client.users.get(packet.users.find((x) => x.relationship === "User")._id);
                            this.client.emit("ready");
                            this.ready = true;
                            resolve();
                            // Sync unreads.
                            (_a = this.client.unreads) === null || _a === void 0 ? void 0 : _a.sync();
                            // Setup heartbeat.
                            if (this.client.heartbeat > 0) {
                                this.send({ type: "Ping", data: +new Date() });
                                this.heartbeat = setInterval(() => {
                                    this.send({
                                        type: "Ping",
                                        data: +new Date(),
                                    });
                                    if (this.client.options.pongTimeout) {
                                        let pongReceived = false;
                                        this.client.once("packet", (p) => {
                                            if (p.type == "Pong")
                                                pongReceived = true;
                                        });
                                        setTimeout(() => {
                                            if (!pongReceived) {
                                                if (this.client.options
                                                    .onPongTimeout == "EXIT") {
                                                    throw "Client did not receive a pong in time";
                                                }
                                                else {
                                                    console.warn("Warning: Client did not receive a pong in time; Reconnecting.");
                                                    this.disconnect();
                                                    this.connect(disallowReconnect);
                                                }
                                            }
                                        }, this.client.options.pongTimeout * 1000);
                                    }
                                }, this.client.heartbeat * 1e3);
                            }
                            break;
                        }
                        case "Message": {
                            if (!this.client.messages.has(packet._id)) {
                                if (packet.author ===
                                    "00000000000000000000000000") {
                                    if (packet.system) {
                                        switch (packet.system.type) {
                                            case "user_added":
                                            case "user_remove":
                                                yield this.client.users.fetch(packet.system.by);
                                                break;
                                            case "user_joined":
                                                yield this.client.users.fetch(packet.system.id);
                                                break;
                                            case "channel_description_changed":
                                            case "channel_icon_changed":
                                            case "channel_renamed":
                                                yield this.client.users.fetch(packet.system.by);
                                                break;
                                        }
                                    }
                                }
                                else if (!packet.webhook) {
                                    yield this.client.users.fetch(packet.author);
                                }
                                const channel = yield this.client.channels.fetch(packet.channel);
                                if (channel.channel_type === "TextChannel") {
                                    const server = yield this.client.servers.fetch(channel.server_id);
                                    if (packet.author !==
                                        "00000000000000000000000000" &&
                                        !packet.webhook)
                                        yield server.fetchMember(packet.author);
                                }
                                const message = this.client.messages.createObj(packet, true);
                                runInAction(() => {
                                    var _a;
                                    if (channel.channel_type === "DirectMessage") {
                                        channel.active = true;
                                    }
                                    channel.last_message_id = message._id;
                                    if (this.client.unreads &&
                                        ((_a = message.mention_ids) === null || _a === void 0 ? void 0 : _a.includes(this.client.user._id))) {
                                        this.client.unreads.markMention(message.channel_id, message._id);
                                    }
                                });
                            }
                            break;
                        }
                        case "MessageUpdate": {
                            const message = this.client.messages.get(packet.id);
                            if (message) {
                                message.update(packet.data);
                                this.client.emit("message/update", message);
                                this.client.emit("message/updated", message, packet);
                            }
                            break;
                        }
                        case "MessageAppend": {
                            const message = this.client.messages.get(packet.id);
                            if (message) {
                                message.append(packet.append);
                                this.client.emit("message/append", message);
                                this.client.emit("message/updated", message, packet);
                            }
                            break;
                        }
                        case "MessageDelete": {
                            const msg = this.client.messages.get(packet.id);
                            this.client.messages.delete(packet.id);
                            this.client.emit("message/delete", packet.id, msg);
                            break;
                        }
                        case "MessageReact": {
                            const msg = this.client.messages.get(packet.id);
                            if (msg) {
                                if (msg.reactions.has(packet.emoji_id)) {
                                    msg.reactions
                                        .get(packet.emoji_id)
                                        .add(packet.user_id);
                                }
                                else {
                                    msg.reactions.set(packet.emoji_id, new ObservableSet([packet.user_id]));
                                }
                                this.client.emit("message/updated", msg, packet);
                            }
                            break;
                        }
                        case "MessageUnreact": {
                            const msg = this.client.messages.get(packet.id);
                            if (msg) {
                                const user_ids = msg.reactions.get(packet.emoji_id);
                                if (user_ids) {
                                    user_ids.delete(packet.user_id);
                                    if (user_ids.size === 0) {
                                        msg.reactions.delete(packet.emoji_id);
                                    }
                                }
                                this.client.emit("message/updated", msg, packet);
                            }
                            break;
                        }
                        case "MessageRemoveReaction": {
                            const msg = this.client.messages.get(packet.id);
                            if (msg) {
                                msg.reactions.delete(packet.emoji_id);
                                this.client.emit("message/updated", msg, packet);
                            }
                            break;
                        }
                        case "BulkMessageDelete": {
                            runInAction(() => {
                                for (const id of packet.ids) {
                                    const msg = this.client.messages.get(id);
                                    this.client.messages.delete(id);
                                    this.client.emit("message/delete", id, msg);
                                }
                            });
                            break;
                        }
                        case "ChannelCreate": {
                            runInAction(() => __awaiter(this, void 0, void 0, function* () {
                                if (packet.type !== "ChannelCreate")
                                    throw 0;
                                if (packet.channel_type === "TextChannel" ||
                                    packet.channel_type === "VoiceChannel") {
                                    const server = yield this.client.servers.fetch(packet.server);
                                    server.channel_ids.push(packet._id);
                                }
                                this.client.channels.createObj(packet, true);
                            }));
                            break;
                        }
                        case "ChannelUpdate": {
                            const channel = this.client.channels.get(packet.id);
                            if (channel) {
                                channel.update(packet.data, packet.clear);
                                this.client.emit("channel/update", channel);
                            }
                            break;
                        }
                        case "ChannelDelete": {
                            const channel = this.client.channels.get(packet.id);
                            channel === null || channel === void 0 ? void 0 : channel.delete(false, true);
                            this.client.emit("channel/delete", packet.id, channel);
                            break;
                        }
                        case "ChannelGroupJoin": {
                            (_b = this.client.channels
                                .get(packet.id)) === null || _b === void 0 ? void 0 : _b.updateGroupJoin(packet.user);
                            break;
                        }
                        case "ChannelGroupLeave": {
                            const channel = this.client.channels.get(packet.id);
                            if (channel) {
                                if (packet.user === ((_c = this.client.user) === null || _c === void 0 ? void 0 : _c._id)) {
                                    channel.delete(false, true);
                                }
                                else {
                                    channel.updateGroupLeave(packet.user);
                                }
                            }
                            break;
                        }
                        case "ServerCreate": {
                            runInAction(() => __awaiter(this, void 0, void 0, function* () {
                                const channels = [];
                                for (const channel of packet.channels) {
                                    channels.push(yield this.client.channels.fetch(channel._id, channel));
                                }
                                yield this.client.servers.fetch(packet.id, packet.server);
                            }));
                            break;
                        }
                        case "ServerUpdate": {
                            const server = this.client.servers.get(packet.id);
                            if (server) {
                                server.update(packet.data, packet.clear);
                                this.client.emit("server/update", server);
                            }
                            break;
                        }
                        case "ServerDelete": {
                            const server = this.client.servers.get(packet.id);
                            server === null || server === void 0 ? void 0 : server.delete(false, true);
                            this.client.emit("server/delete", packet.id, server);
                            break;
                        }
                        case "ServerMemberUpdate": {
                            const member = this.client.members.getKey(packet.id);
                            if (member) {
                                member.update(packet.data, packet.clear);
                                this.client.emit("member/update", member);
                            }
                            break;
                        }
                        case "ServerMemberJoin": {
                            runInAction(() => __awaiter(this, void 0, void 0, function* () {
                                yield this.client.servers.fetch(packet.id);
                                yield this.client.users.fetch(packet.user);
                                this.client.members.createObj({
                                    _id: {
                                        server: packet.id,
                                        user: packet.user,
                                    },
                                    joined_at: new Date().toISOString(),
                                }, true);
                            }));
                            break;
                        }
                        case "ServerMemberLeave": {
                            if (packet.user === this.client.user._id) {
                                const server_id = packet.id;
                                runInAction(() => {
                                    var _a;
                                    (_a = this.client.servers
                                        .get(server_id)) === null || _a === void 0 ? void 0 : _a.delete(false, true);
                                    [...this.client.members.keys()].forEach((key) => {
                                        if (JSON.parse(key).server ===
                                            server_id) {
                                            this.client.members.delete(key);
                                        }
                                    });
                                });
                            }
                            else {
                                this.client.members.deleteKey({
                                    server: packet.id,
                                    user: packet.user,
                                });
                                this.client.emit("member/leave", {
                                    server: packet.id,
                                    user: packet.user,
                                });
                            }
                            break;
                        }
                        case "ServerRoleUpdate": {
                            const server = this.client.servers.get(packet.id);
                            if (server) {
                                const role = Object.assign(Object.assign({}, (_d = server.roles) === null || _d === void 0 ? void 0 : _d[packet.role_id]), packet.data);
                                server.roles = Object.assign(Object.assign({}, server.roles), { [packet.role_id]: role });
                                this.client.emit("role/update", packet.role_id, role, packet.id);
                            }
                            break;
                        }
                        case "ServerRoleDelete": {
                            const server = this.client.servers.get(packet.id);
                            if (server) {
                                const _j = (_e = server.roles) !== null && _e !== void 0 ? _e : {}, _k = packet.role_id, _ = _j[_k], roles = __rest(_j, [typeof _k === "symbol" ? _k : _k + ""]);
                                server.roles = roles;
                                this.client.emit("role/delete", packet.role_id, packet.id);
                            }
                            break;
                        }
                        case "UserPlatformWipe": {
                            runInAction(() => {
                                var _a;
                                const user_id = packet.user_id;
                                (_a = this.client.users.get(user_id)) === null || _a === void 0 ? void 0 : _a.update({
                                    username: "Removed User",
                                    online: false,
                                    relationship: "None",
                                    flags: packet.flags,
                                }, [
                                    "Avatar",
                                    "ProfileBackground",
                                    "ProfileContent",
                                    "StatusPresence",
                                    "StatusText",
                                ]);
                                const dm_channel = [
                                    ...this.client.channels.values(),
                                ].find((channel) => {
                                    var _a;
                                    return channel.channel_type ===
                                        "DirectMessage" &&
                                        ((_a = channel.recipient_ids) === null || _a === void 0 ? void 0 : _a.includes(user_id));
                                });
                                if (dm_channel) {
                                    this.client.channels.delete(dm_channel._id);
                                }
                                const member_ids = [
                                    ...this.client.members.values(),
                                ]
                                    .filter((member) => member._id.user === user_id)
                                    .map((member) => member._id);
                                for (const member_id of member_ids) {
                                    this.client.members.deleteKey(member_id);
                                }
                                for (const message of [
                                    ...this.client.messages.values(),
                                ].filter((message) => message.author_id === user_id)) {
                                    message.content = "(message withheld)";
                                    message.attachments = [];
                                    message.embeds = [];
                                }
                            });
                            break;
                        }
                        case "UserUpdate": {
                            (_f = this.client.users
                                .get(packet.id)) === null || _f === void 0 ? void 0 : _f.update(packet.data, packet.clear);
                            break;
                        }
                        case "UserRelationship": {
                            const user = this.client.users.get(packet.user._id);
                            if (user) {
                                user.update(Object.assign(Object.assign({}, packet.user), { relationship: packet.status }));
                            }
                            else {
                                this.client.users.createObj(packet.user);
                            }
                            break;
                        }
                        case "ChannelStartTyping": {
                            const channel = this.client.channels.get(packet.id);
                            const user = packet.user;
                            if (channel) {
                                channel.updateStartTyping(user);
                                clearInterval(timeouts[packet.id + user]);
                                timeouts[packet.id + user] = setTimeout(() => {
                                    channel.updateStopTyping(user);
                                }, 3000);
                            }
                            break;
                        }
                        case "ChannelStopTyping": {
                            (_g = this.client.channels
                                .get(packet.id)) === null || _g === void 0 ? void 0 : _g.updateStopTyping(packet.user);
                            clearInterval(timeouts[packet.id + packet.user]);
                            break;
                        }
                        case "ChannelAck": {
                            (_h = this.client.unreads) === null || _h === void 0 ? void 0 : _h.markRead(packet.id, packet.message_id);
                            break;
                        }
                        case "EmojiCreate": {
                            this.client.emojis.createObj(packet, true);
                            break;
                        }
                        case "EmojiDelete": {
                            const emoji = this.client.emojis.get(packet.id);
                            this.client.emit("emoji/delete", packet.id, emoji);
                            break;
                        }
                        case "Pong": {
                            this.ping = +new Date() - packet.data;
                            break;
                        }
                        default:
                            this.client.debug &&
                                console.warn(`Warning: Unhandled packet! ${packet.type}`);
                    }
                }
                catch (e) {
                    console.error(e);
                }
            });
            const timeouts = {};
            const handle = (msg) => __awaiter(this, void 0, void 0, function* () {
                const data = msg.data;
                if (typeof data !== "string")
                    return;
                if (this.client.debug)
                    console.debug("[>] PACKET", data);
                const packet = JSON.parse(data);
                yield process(packet);
            });
            let processing = false;
            const queue = [];
            ws.onmessage = (data) => __awaiter(this, void 0, void 0, function* () {
                queue.push(data);
                if (!processing) {
                    processing = true;
                    while (queue.length > 0) {
                        yield handle(queue.shift());
                    }
                    processing = false;
                }
            });
            ws.onerror = (err) => {
                reject(err);
            };
            ws.onclose = () => {
                this.client.emit("dropped");
                this.connected = false;
                this.ready = false;
                Object.keys(timeouts)
                    .map((k) => timeouts[k])
                    .forEach(clearTimeout);
                runInAction(() => {
                    [...this.client.users.values()].forEach((user) => (user.online = false));
                    [...this.client.channels.values()].forEach((channel) => channel.typing_ids.clear());
                });
                if (!disallowReconnect && this.client.autoReconnect) {
                    backOff(() => this.connect(true)).catch(reject);
                }
            };
        });
    }
}
