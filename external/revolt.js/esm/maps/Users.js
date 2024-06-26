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
import { makeAutoObservable, action, runInAction, computed } from "mobx";
import isEqual from "lodash.isequal";
import { U32_MAX, UserPermission } from "../permissions/definitions";
import { toNullable } from "../util/null";
import Collection from "./Collection";
import { decodeTime } from "ulid";
export class User {
    constructor(client, data) {
        var _a, _b;
        this.client = client;
        this._id = data._id;
        this.username = data.username;
        this.discriminator = data.discriminator;
        this.display_name = data.display_name;
        this.avatar = toNullable(data.avatar);
        this.badges = toNullable(data.badges);
        this.status = toNullable(data.status);
        this.relationship = toNullable(data.relationship);
        this.online = (_a = data.online) !== null && _a !== void 0 ? _a : false;
        this.privileged = (_b = data.privileged) !== null && _b !== void 0 ? _b : false;
        this.flags = toNullable(data.flags);
        this.bot = toNullable(data.bot);
        makeAutoObservable(this, {
            _id: false,
            client: false,
        });
    }
    /**
     * Get timestamp when this user was created.
     */
    get createdAt() {
        return decodeTime(this._id);
    }
    update(data, clear = []) {
        const apply = (key) => {
            // This code has been tested.
            if (
            // @ts-expect-error TODO: clean up types here
            typeof data[key] !== "undefined" &&
                // @ts-expect-error TODO: clean up types here
                !isEqual(this[key], data[key])) {
                // @ts-expect-error TODO: clean up types here
                this[key] = data[key];
                if (key === "relationship") {
                    this.client.emit("user/relationship", this);
                }
            }
        };
        for (const entry of clear) {
            switch (entry) {
                case "Avatar":
                    this.avatar = null;
                    break;
                case "StatusText": {
                    if (this.status) {
                        this.status.text = undefined;
                    }
                }
                // @ts-ignore
                case "DisplayName":
                    this.display_name = null;
                    break;
            }
        }
        apply("username");
        apply("discriminator");
        apply("display_name");
        apply("avatar");
        apply("badges");
        apply("status");
        apply("relationship");
        apply("online");
        apply("privileged");
        apply("flags");
        apply("bot");
    }
    /**
     * Open a DM with a user
     * @returns DM Channel
     */
    openDM() {
        return __awaiter(this, void 0, void 0, function* () {
            let dm = [...this.client.channels.values()].find((x) => x.channel_type === "DirectMessage" && x.recipient == this);
            if (!dm) {
                const data = yield this.client.api.get(`/users/${this._id}/dm`);
                dm = yield this.client.channels.fetch(data._id, data);
            }
            runInAction(() => {
                dm.active = true;
            });
            return dm;
        });
    }
    /**
     * Send a friend request to a user
     */
    addFriend() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.api.post(`/users/friend`, {
                username: this.username + "#" + this.discriminator,
            });
        });
    }
    /**
     * Remove a user from the friend list
     */
    removeFriend() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.api.delete(`/users/${this._id}/friend`);
        });
    }
    /**
     * Block a user
     */
    blockUser() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.api.put(`/users/${this._id}/block`);
        });
    }
    /**
     * Unblock a user
     */
    unblockUser() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.api.delete(`/users/${this._id}/block`);
        });
    }
    /**
     * Fetch the profile of a user
     * @returns The profile of the user
     */
    fetchProfile() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.api.get(`/users/${this._id}/profile`);
        });
    }
    /**
     * Fetch the mutual connections of the current user and a target user
     * @returns The mutual connections of the current user and a target user
     */
    fetchMutual() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.api.get(`/users/${this._id}/mutual`);
        });
    }
    /**
     * Get the default avatar URL of a user
     */
    get defaultAvatarURL() {
        return `${this.client.apiURL}/users/${this._id}/default_avatar`;
    }
    /**
     * Get a pre-configured avatar URL of a user
     */
    get avatarURL() {
        return this.generateAvatarURL({ max_side: 256 });
    }
    /**
     * Get a pre-configured animated avatar URL of a user
     */
    get animatedAvatarURL() {
        return this.generateAvatarURL({ max_side: 256 }, true);
    }
    generateAvatarURL(...args) {
        var _a, _b;
        return ((_b = this.client.generateFileURL((_a = this.avatar) !== null && _a !== void 0 ? _a : undefined, ...args)) !== null && _b !== void 0 ? _b : this.defaultAvatarURL);
    }
    get permission() {
        var _a;
        let permissions = 0;
        switch (this.relationship) {
            case "Friend":
            case "User":
                return U32_MAX;
            case "Blocked":
            case "BlockedOther":
                return UserPermission.Access;
            case "Incoming":
            case "Outgoing":
                permissions = UserPermission.Access;
        }
        if ([...this.client.channels.values()].find((channel) => {
            var _a;
            return (channel.channel_type === "Group" ||
                channel.channel_type === "DirectMessage") &&
                ((_a = channel.recipient_ids) === null || _a === void 0 ? void 0 : _a.includes(this.client.user._id));
        }) ||
            [...this.client.members.values()].find((member) => member._id.user === this.client.user._id)) {
            if (((_a = this.client.user) === null || _a === void 0 ? void 0 : _a.bot) || this.bot) {
                permissions |= UserPermission.SendMessage;
            }
            permissions |= UserPermission.Access | UserPermission.ViewProfile;
        }
        return permissions;
    }
}
__decorate([
    action
], User.prototype, "update", null);
__decorate([
    computed
], User.prototype, "generateAvatarURL", null);
__decorate([
    computed
], User.prototype, "permission", null);
export default class Users extends Collection {
    constructor(client) {
        super(client);
        this.createObj = this.createObj.bind(this);
        this.set("00000000000000000000000000", new User(client, {
            _id: "00000000000000000000000000",
            username: "Klay",
            discriminator: "0000",
            display_name: "Klay", // typing issue
        }));
    }
    $get(id, data) {
        const user = this.get(id);
        if (data)
            user.update(data);
        return user;
    }
    /**
     * Fetch a user
     * @param id User ID
     * @returns User
     */
    fetch(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.has(id))
                return this.$get(id, data);
            const res = data !== null && data !== void 0 ? data : (yield this.client.api.get(`/users/${id}`));
            return this.createObj(res);
        });
    }
    /**
     * Create a user object.
     * This is meant for internal use only.
     * @param data: User Data
     * @returns User
     */
    createObj(data) {
        if (this.has(data._id))
            return this.$get(data._id, data);
        const user = new User(this.client, data);
        runInAction(() => {
            this.set(data._id, user);
        });
        this.client.emit("user/relationship", user);
        return user;
    }
    /**
     * Edit the current user
     * @param data User edit data object
     */
    edit(data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.api.patch("/users/@me", data);
        });
    }
    /**
     * Change the username of the current user
     * @param username New username
     * @param password Current password
     */
    changeUsername(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.api.patch("/users/@me/username", {
                username,
                password,
            });
        });
    }
}
__decorate([
    action
], Users.prototype, "$get", null);
