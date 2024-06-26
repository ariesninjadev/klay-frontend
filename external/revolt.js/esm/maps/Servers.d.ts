import type { Category, Channel as ChannelI, DataBanCreate, DataCreateChannel, DataCreateServer, DataEditRole, DataEditServer, FieldsServer, Role, Server as ServerI, SystemMessageChannels } from "revolt-api";
import type { File } from "revolt-api";
import { Nullable } from "../util/null";
import { Permission } from "../permissions/definitions";
import Collection from "./Collection";
import { User } from "./Users";
import { Channel, Client, FileArgs } from "..";
import { INotificationChecker } from "../util/Unreads";
import { Override } from "revolt-api";
export declare class Server {
    client: Client;
    _id: string;
    owner: string;
    name: string;
    description: Nullable<string>;
    channel_ids: string[];
    categories: Nullable<Category[]>;
    system_messages: Nullable<SystemMessageChannels>;
    roles: Nullable<{
        [key: string]: Role;
    }>;
    default_permissions: number;
    icon: Nullable<File>;
    banner: Nullable<File>;
    nsfw: Nullable<boolean>;
    flags: Nullable<number>;
    get channels(): (Channel | undefined)[];
    /**
     * Get timestamp when this server was created.
     */
    get createdAt(): number;
    /**
     * Absolute pathname to this server in the client.
     */
    get path(): string;
    /**
     * Get URL to this server.
     */
    get url(): string;
    /**
     * Get an array of ordered categories with their respective channels.
     * Uncategorised channels are returned in `id="default"` category.
     */
    get orderedChannels(): (Omit<Category, "channels"> & {
        channels: Channel[];
    })[];
    /**
     * Get the default channel for this server
     */
    get defaultChannel(): Channel | undefined;
    /**
     * Get an ordered array of roles with their IDs attached.
     * The highest ranking roles will be first followed by lower
     * ranking roles. This is dictated by the "rank" property
     * which is smaller for higher priority roles.
     */
    get orderedRoles(): {
        name: string;
        permissions: {
            a: number;
            d: number;
        };
        colour?: string | null | undefined;
        hoist?: boolean | undefined;
        rank?: number | undefined;
        id: string;
    }[];
    /**
     * Check whether the server is currently unread
     * @param permit Callback function to determine whether a server has certain properties
     * @returns Whether the server is unread
     */
    isUnread(permit?: INotificationChecker): false | Channel | undefined;
    /**
     * Find all message IDs of unread messages
     * @param permit Callback function to determine whether a server has certain properties
     * @returns Array of message IDs which are unread
     */
    getMentions(permit?: INotificationChecker): string[];
    constructor(client: Client, data: ServerI);
    update(data: Partial<ServerI>, clear?: FieldsServer[]): void;
    /**
     * Create a channel
     * @param data Channel create route data
     * @returns The newly-created channel
     */
    createChannel(data: DataCreateChannel): Promise<{
        channel_type: "SavedMessages";
        _id: string;
        user: string;
    } | {
        channel_type: "DirectMessage";
        _id: string;
        active: boolean;
        recipients: string[];
        last_message_id?: string | null | undefined;
    } | {
        channel_type: "Group";
        _id: string;
        name: string;
        owner: string;
        description?: string | null | undefined;
        recipients: string[];
        icon?: {
            _id: string;
            tag: string;
            filename: string;
            metadata: {
                type: "File";
            } | {
                type: "Text";
            } | {
                type: "Image";
                width: number;
                height: number;
            } | {
                type: "Video";
                width: number;
                height: number;
            } | {
                type: "Audio";
            };
            content_type: string;
            size: number;
            deleted?: boolean | null | undefined;
            reported?: boolean | null | undefined;
            message_id?: string | null | undefined;
            user_id?: string | null | undefined;
            server_id?: string | null | undefined;
            object_id?: string | null | undefined;
        } | null | undefined;
        last_message_id?: string | null | undefined;
        permissions?: number | null | undefined;
        nsfw?: boolean | undefined;
    } | {
        channel_type: "TextChannel";
        _id: string;
        server: string;
        name: string;
        description?: string | null | undefined;
        icon?: {
            _id: string;
            tag: string;
            filename: string;
            metadata: {
                type: "File";
            } | {
                type: "Text";
            } | {
                type: "Image";
                width: number;
                height: number;
            } | {
                type: "Video";
                width: number;
                height: number;
            } | {
                type: "Audio";
            };
            content_type: string;
            size: number;
            deleted?: boolean | null | undefined;
            reported?: boolean | null | undefined;
            message_id?: string | null | undefined;
            user_id?: string | null | undefined;
            server_id?: string | null | undefined;
            object_id?: string | null | undefined;
        } | null | undefined;
        last_message_id?: string | null | undefined;
        default_permissions?: {
            a: number;
            d: number;
        } | null | undefined;
        role_permissions?: {
            [key: string]: {
                a: number;
                d: number;
            };
        } | undefined;
        nsfw?: boolean | undefined;
    } | {
        channel_type: "VoiceChannel";
        _id: string;
        server: string;
        name: string;
        description?: string | null | undefined;
        icon?: {
            _id: string;
            tag: string;
            filename: string;
            metadata: {
                type: "File";
            } | {
                type: "Text";
            } | {
                type: "Image";
                width: number;
                height: number;
            } | {
                type: "Video";
                width: number;
                height: number;
            } | {
                type: "Audio";
            };
            content_type: string;
            size: number;
            deleted?: boolean | null | undefined;
            reported?: boolean | null | undefined;
            message_id?: string | null | undefined;
            user_id?: string | null | undefined;
            server_id?: string | null | undefined;
            object_id?: string | null | undefined;
        } | null | undefined;
        default_permissions?: {
            a: number;
            d: number;
        } | null | undefined;
        role_permissions?: {
            [key: string]: {
                a: number;
                d: number;
            };
        } | undefined;
        nsfw?: boolean | undefined;
    }>;
    /**
     * Edit a server
     * @param data Server editing route data
     */
    edit(data: DataEditServer): Promise<{
        _id: string;
        owner: string;
        name: string;
        description?: string | null | undefined;
        channels: string[];
        categories?: {
            id: string;
            title: string;
            channels: string[];
        }[] | null | undefined;
        system_messages?: {
            user_joined?: string | null | undefined;
            user_left?: string | null | undefined;
            user_kicked?: string | null | undefined;
            user_banned?: string | null | undefined;
        } | null | undefined;
        roles?: {
            [key: string]: {
                name: string;
                permissions: {
                    a: number;
                    d: number;
                };
                colour?: string | null | undefined;
                hoist?: boolean | undefined;
                rank?: number | undefined;
            };
        } | undefined;
        default_permissions: number;
        icon?: {
            _id: string;
            tag: string;
            filename: string;
            metadata: {
                type: "File";
            } | {
                type: "Text";
            } | {
                type: "Image";
                width: number;
                height: number;
            } | {
                type: "Video";
                width: number;
                height: number;
            } | {
                type: "Audio";
            };
            content_type: string;
            size: number;
            deleted?: boolean | null | undefined;
            reported?: boolean | null | undefined;
            message_id?: string | null | undefined;
            user_id?: string | null | undefined;
            server_id?: string | null | undefined;
            object_id?: string | null | undefined;
        } | null | undefined;
        banner?: {
            _id: string;
            tag: string;
            filename: string;
            metadata: {
                type: "File";
            } | {
                type: "Text";
            } | {
                type: "Image";
                width: number;
                height: number;
            } | {
                type: "Video";
                width: number;
                height: number;
            } | {
                type: "Audio";
            };
            content_type: string;
            size: number;
            deleted?: boolean | null | undefined;
            reported?: boolean | null | undefined;
            message_id?: string | null | undefined;
            user_id?: string | null | undefined;
            server_id?: string | null | undefined;
            object_id?: string | null | undefined;
        } | null | undefined;
        flags?: number | null | undefined;
        nsfw?: boolean | undefined;
        analytics?: boolean | undefined;
        discoverable?: boolean | undefined;
    }>;
    /**
     * Delete a guild
     */
    delete(leave_silently?: boolean, avoidReq?: boolean): Promise<void>;
    /**
     * Mark a server as read
     */
    ack(): Promise<{
        _id: string;
        username: string;
        discriminator: string;
        display_name: string;
        avatar?: {
            _id: string;
            tag: string;
            filename: string;
            metadata: {
                type: "File";
            } | {
                type: "Text";
            } | {
                type: "Image";
                width: number;
                height: number;
            } | {
                type: "Video";
                width: number;
                height: number;
            } | {
                type: "Audio";
            };
            content_type: string;
            size: number;
            deleted?: boolean | null | undefined;
            reported?: boolean | null | undefined;
            message_id?: string | null | undefined;
            user_id?: string | null | undefined;
            server_id?: string | null | undefined;
            object_id?: string | null | undefined;
        } | null | undefined;
        relations?: {
            _id: string;
            status: "User" | "None" | "Friend" | "Outgoing" | "Incoming" | "Blocked" | "BlockedOther";
        }[] | null | undefined;
        badges?: number | null | undefined;
        status?: {
            text?: string | null | undefined;
            presence?: "Online" | "Idle" | "Focus" | "Busy" | "Invisible" | null | undefined;
        } | null | undefined;
        profile?: {
            content?: string | null | undefined;
            background?: {
                _id: string;
                tag: string;
                filename: string;
                metadata: {
                    type: "File";
                } | {
                    type: "Text";
                } | {
                    type: "Image";
                    width: number;
                    height: number;
                } | {
                    type: "Video";
                    width: number;
                    height: number;
                } | {
                    type: "Audio";
                };
                content_type: string;
                size: number;
                deleted?: boolean | null | undefined;
                reported?: boolean | null | undefined;
                message_id?: string | null | undefined;
                user_id?: string | null | undefined;
                server_id?: string | null | undefined;
                object_id?: string | null | undefined;
            } | null | undefined;
        } | null | undefined;
        flags?: number | null | undefined;
        privileged?: boolean | undefined;
        bot?: {
            owner: string;
        } | null | undefined;
        relationship?: "User" | "None" | "Friend" | "Outgoing" | "Incoming" | "Blocked" | "BlockedOther" | null | undefined;
        online?: boolean | null | undefined;
    } | {
        _id: string;
        parent: {
            type: "Server";
            id: string;
        } | {
            type: "Detached";
        };
        creator_id: string;
        name: string;
        animated?: boolean | undefined;
        nsfw?: boolean | undefined;
    } | undefined>;
    /**
     * Ban user
     * @param user_id User ID
     */
    banUser(user_id: string, data: DataBanCreate): Promise<{
        _id: string;
        owner: string;
        name: string;
        description?: string | null | undefined;
        channels: string[];
        categories?: {
            id: string;
            title: string;
            channels: string[];
        }[] | null | undefined;
        system_messages?: {
            user_joined?: string | null | undefined;
            user_left?: string | null | undefined;
            user_kicked?: string | null | undefined;
            user_banned?: string | null | undefined;
        } | null | undefined;
        roles?: {
            [key: string]: {
                name: string;
                permissions: {
                    a: number;
                    d: number;
                };
                colour?: string | null | undefined;
                hoist?: boolean | undefined;
                rank?: number | undefined;
            };
        } | undefined;
        default_permissions: number;
        icon?: {
            _id: string;
            tag: string;
            filename: string;
            metadata: {
                type: "File";
            } | {
                type: "Text";
            } | {
                type: "Image";
                width: number;
                height: number;
            } | {
                type: "Video";
                width: number;
                height: number;
            } | {
                type: "Audio";
            };
            content_type: string;
            size: number;
            deleted?: boolean | null | undefined;
            reported?: boolean | null | undefined;
            message_id?: string | null | undefined;
            user_id?: string | null | undefined;
            server_id?: string | null | undefined;
            object_id?: string | null | undefined;
        } | null | undefined;
        banner?: {
            _id: string;
            tag: string;
            filename: string;
            metadata: {
                type: "File";
            } | {
                type: "Text";
            } | {
                type: "Image";
                width: number;
                height: number;
            } | {
                type: "Video";
                width: number;
                height: number;
            } | {
                type: "Audio";
            };
            content_type: string;
            size: number;
            deleted?: boolean | null | undefined;
            reported?: boolean | null | undefined;
            message_id?: string | null | undefined;
            user_id?: string | null | undefined;
            server_id?: string | null | undefined;
            object_id?: string | null | undefined;
        } | null | undefined;
        flags?: number | null | undefined;
        nsfw?: boolean | undefined;
        analytics?: boolean | undefined;
        discoverable?: boolean | undefined;
    } | {
        _id: {
            server: string;
            user: string;
        };
        reason?: string | null | undefined;
    } | undefined>;
    /**
     * Unban user
     * @param user_id User ID
     */
    unbanUser(user_id: string): Promise<undefined>;
    /**
     * Fetch a server's invites
     * @returns An array of the server's invites
     */
    fetchInvites(): Promise<({
        type: "Server";
        _id: string;
        server: string;
        creator: string;
        channel: string;
    } | {
        type: "Group";
        _id: string;
        creator: string;
        channel: string;
    })[]>;
    /**
     * Fetch a server's bans
     * @returns An array of the server's bans.
     */
    fetchBans(): Promise<{
        users: {
            _id: string;
            username: string;
            avatar?: {
                _id: string;
                tag: string;
                filename: string;
                metadata: {
                    type: "File";
                } | {
                    type: "Text";
                } | {
                    type: "Image";
                    width: number;
                    height: number;
                } | {
                    type: "Video";
                    width: number;
                    height: number;
                } | {
                    type: "Audio";
                };
                content_type: string;
                size: number;
                deleted?: boolean | null | undefined;
                reported?: boolean | null | undefined;
                message_id?: string | null | undefined;
                user_id?: string | null | undefined;
                server_id?: string | null | undefined;
                object_id?: string | null | undefined;
            } | null | undefined;
        }[];
        bans: {
            _id: {
                server: string;
                user: string;
            };
            reason?: string | null | undefined;
        }[];
    }>;
    /**
     * Set role permissions
     * @param role_id Role Id, set to 'default' to affect all users
     * @param permissions Permission value
     */
    setPermissions(role_id: string | undefined, permissions: Override | number): Promise<{
        _id: string;
        owner: string;
        name: string;
        description?: string | null | undefined;
        channels: string[];
        categories?: {
            id: string;
            title: string;
            channels: string[];
        }[] | null | undefined;
        system_messages?: {
            user_joined?: string | null | undefined;
            user_left?: string | null | undefined;
            user_kicked?: string | null | undefined;
            user_banned?: string | null | undefined;
        } | null | undefined;
        roles?: {
            [key: string]: {
                name: string;
                permissions: {
                    a: number;
                    d: number;
                };
                colour?: string | null | undefined;
                hoist?: boolean | undefined;
                rank?: number | undefined;
            };
        } | undefined;
        default_permissions: number;
        icon?: {
            _id: string;
            tag: string;
            filename: string;
            metadata: {
                type: "File";
            } | {
                type: "Text";
            } | {
                type: "Image";
                width: number;
                height: number;
            } | {
                type: "Video";
                width: number;
                height: number;
            } | {
                type: "Audio";
            };
            content_type: string;
            size: number;
            deleted?: boolean | null | undefined;
            reported?: boolean | null | undefined;
            message_id?: string | null | undefined;
            user_id?: string | null | undefined;
            server_id?: string | null | undefined;
            object_id?: string | null | undefined;
        } | null | undefined;
        banner?: {
            _id: string;
            tag: string;
            filename: string;
            metadata: {
                type: "File";
            } | {
                type: "Text";
            } | {
                type: "Image";
                width: number;
                height: number;
            } | {
                type: "Video";
                width: number;
                height: number;
            } | {
                type: "Audio";
            };
            content_type: string;
            size: number;
            deleted?: boolean | null | undefined;
            reported?: boolean | null | undefined;
            message_id?: string | null | undefined;
            user_id?: string | null | undefined;
            server_id?: string | null | undefined;
            object_id?: string | null | undefined;
        } | null | undefined;
        flags?: number | null | undefined;
        nsfw?: boolean | undefined;
        analytics?: boolean | undefined;
        discoverable?: boolean | undefined;
    }>;
    /**
     * Create role
     * @param name Role name
     */
    createRole(name: string): Promise<{
        id: string;
        role: {
            name: string;
            permissions: {
                a: number;
                d: number;
            };
            colour?: string | null | undefined;
            hoist?: boolean | undefined;
            rank?: number | undefined;
        };
    }>;
    /**
     * Edit a role
     * @param role_id Role ID
     * @param data Role editing route data
     */
    editRole(role_id: string, data: DataEditRole): Promise<{
        name: string;
        permissions: {
            a: number;
            d: number;
        };
        colour?: string | null | undefined;
        hoist?: boolean | undefined;
        rank?: number | undefined;
    }>;
    /**
     * Delete role
     * @param role_id Role ID
     */
    deleteRole(role_id: string): Promise<undefined>;
    /**
     * Fetch a server member
     * @param user User or User ID
     * @returns Server member object
     */
    fetchMember(user: User | string): Promise<import("./Members").Member>;
    /**
     * Optimised member fetch route.
     * @param exclude_offline
     */
    syncMembers(exclude_offline?: boolean): Promise<void>;
    /**
     * Fetch a server's members.
     * @returns An array of the server's members and their user objects.
     */
    fetchMembers(): Promise<{
        members: import("./Members").Member[];
        users: User[];
    }>;
    /**
     * Generate URL to icon for this server
     * @param args File parameters
     * @returns File URL
     */
    generateIconURL(...args: FileArgs): string | undefined;
    /**
     * Generate URL to banner for this server
     * @param args File parameters
     * @returns File URL
     */
    generateBannerURL(...args: FileArgs): string | undefined;
    /**
     * Get our own member object for this server
     */
    get member(): import("./Members").Member | undefined;
    /**
     * Permission the currently authenticated user has against this server
     */
    get permission(): number;
    /**
     * Check whether we have a given permission in a server
     * @param permission Permission Names
     * @returns Whether we have this permission
     */
    havePermission(...permission: (keyof typeof Permission)[]): boolean;
}
export default class Servers extends Collection<string, Server> {
    constructor(client: Client);
    $get(id: string, data?: ServerI): Server;
    /**
     * Fetch a server
     * @param id Server ID
     * @returns The server
     */
    fetch(id: string, data?: ServerI, channels?: ChannelI[]): Promise<Server>;
    /**
     * Create a server object.
     * This is meant for internal use only.
     * @param data: Server Data
     * @returns Server
     */
    createObj(data: ServerI): Server;
    /**
     * Create a server
     * @param data Server create route data
     * @returns The newly-created server
     */
    createServer(data: DataCreateServer): Promise<Server>;
}
