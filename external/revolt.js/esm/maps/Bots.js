var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { runInAction } from "mobx";
export default class Bots {
    constructor(client) {
        this.client = client;
    }
    /**
     * Fetch a bot
     * @param id Bot ID
     * @returns Bot and User object
     */
    fetch(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const { bot, user } = yield this.client.api.get(`/bots/${id}`);
            return {
                bot,
                user: yield this.client.users.fetch(user._id, user),
            };
        });
    }
    /**
     * Delete a bot
     * @param id Bot ID
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.api.delete(`/bots/${id}`);
        });
    }
    /**
     * Fetch a public bot
     * @param id Bot ID
     * @returns Public Bot object
     */
    fetchPublic(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.api.get(`/bots/${id}/invite`);
        });
    }
    /**
     * Invite a public bot
     * @param id Bot ID
     * @param destination The group or server to add to
     */
    invite(id, destination) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.api.post(`/bots/${id}/invite`, destination);
        });
    }
    /**
     * Fetch a bot
     * @param id Bot ID
     * @returns Bot and User objects
     */
    fetchOwned() {
        return __awaiter(this, void 0, void 0, function* () {
            const { bots, users: userObjects } = (yield this.client.api.get(`/bots/@me`));
            const users = [];
            for (const obj of userObjects) {
                users.push(yield this.client.users.fetch(obj._id, obj));
            }
            return { bots, users };
        });
    }
    /**
     * Edit a bot
     * @param id Bot ID
     * @param data Bot edit data object
     */
    edit(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.api.patch(`/bots/${id}`, data);
            if (data.name) {
                const user = this.client.users.get(id);
                if (user) {
                    runInAction(() => {
                        user.username = data.name;
                    });
                }
            }
        });
    }
    /**
     * Create a bot
     * @param data Bot creation data
     */
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const bot = yield this.client.api.post("/bots/create", data);
            const user = yield this.client.users.fetch(bot._id, {
                _id: bot._id,
                username: data.name,
                discriminator: "0000",
                display_name: data.name,
                bot: {
                    owner: this.client.user._id,
                },
            });
            return {
                bot,
                user,
            };
        });
    }
}
