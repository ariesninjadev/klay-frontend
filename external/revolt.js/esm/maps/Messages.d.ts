import type { DataEditMessage, DataMessageSend, Embed, Interactions, Masquerade, Message as MessageI, SystemMessage } from "revolt-api";
import type { File } from "revolt-api";
import { ObservableMap, ObservableSet } from "mobx";
import { Nullable } from "../util/null";
import Collection from "./Collection";
import { Client } from "..";
export declare class Message {
    client: Client;
    _id: string;
    nonce?: string;
    channel_id: string;
    author_id: string;
    webhook?: {
        name: string;
        avatar?: string;
    };
    content: Nullable<string>;
    system: Nullable<SystemMessage>;
    attachments: Nullable<File[]>;
    edited: Nullable<Date>;
    embeds: Nullable<Embed[]>;
    mention_ids: Nullable<string[]>;
    reply_ids: Nullable<string[]>;
    masquerade: Nullable<Masquerade>;
    reactions: ObservableMap<string, ObservableSet<string>>;
    interactions: Nullable<Interactions>;
    get channel(): import("./Channels").Channel | undefined;
    get author(): import("./Users").User | undefined;
    get member(): import("./Members").Member | undefined;
    get mentions(): (import("./Users").User | undefined)[] | undefined;
    /**
     * Get timestamp when this message was created.
     */
    get createdAt(): number;
    /**
     * Absolute pathname to this message in the client.
     */
    get path(): string;
    /**
     * Get URL to this message.
     */
    get url(): string;
    /**
     * Get the username for this message.
     */
    get username(): string | undefined;
    /**
     * Get the role colour for this message.
     */
    get roleColour(): string | null | undefined;
    /**
     * Get the avatar URL for this message.
     */
    get avatarURL(): string | undefined;
    /**
     * Get the animated avatar URL for this message.
     */
    get animatedAvatarURL(): string | undefined;
    generateMasqAvatarURL(): string | undefined;
    get asSystemMessage(): {
        type: "text";
        content: string;
    } | {
        type: string;
        user?: undefined;
        by?: undefined;
        name?: undefined;
        from?: undefined;
        to?: undefined;
    } | {
        type: "text" | "user_added" | "user_remove" | "user_joined" | "user_left" | "user_kicked" | "user_banned" | "channel_renamed" | "channel_description_changed" | "channel_icon_changed" | "channel_ownership_changed";
        user: import("./Users").User | undefined;
        by: import("./Users").User | undefined;
        name?: undefined;
        from?: undefined;
        to?: undefined;
    } | {
        type: "text" | "user_added" | "user_remove" | "user_joined" | "user_left" | "user_kicked" | "user_banned" | "channel_renamed" | "channel_description_changed" | "channel_icon_changed" | "channel_ownership_changed";
        user: import("./Users").User | undefined;
        by?: undefined;
        name?: undefined;
        from?: undefined;
        to?: undefined;
    } | {
        type: "text" | "user_added" | "user_remove" | "user_joined" | "user_left" | "user_kicked" | "user_banned" | "channel_renamed" | "channel_description_changed" | "channel_icon_changed" | "channel_ownership_changed";
        name: string;
        by: import("./Users").User | undefined;
        user?: undefined;
        from?: undefined;
        to?: undefined;
    } | {
        type: "text" | "user_added" | "user_remove" | "user_joined" | "user_left" | "user_kicked" | "user_banned" | "channel_renamed" | "channel_description_changed" | "channel_icon_changed" | "channel_ownership_changed";
        by: import("./Users").User | undefined;
        user?: undefined;
        name?: undefined;
        from?: undefined;
        to?: undefined;
    } | {
        type: "text" | "user_added" | "user_remove" | "user_joined" | "user_left" | "user_kicked" | "user_banned" | "channel_renamed" | "channel_description_changed" | "channel_icon_changed" | "channel_ownership_changed";
        from: import("./Users").User | undefined;
        to: import("./Users").User | undefined;
        user?: undefined;
        by?: undefined;
        name?: undefined;
    };
    constructor(client: Client, data: MessageI);
    update(data: Partial<MessageI>): void;
    append({ embeds }: Pick<Partial<MessageI>, "embeds">): void;
    /**
     * Edit a message
     * @param data Message edit route data
     */
    edit(data: DataEditMessage): Promise<{
        _id: string;
        nonce?: string | null | undefined;
        channel: string;
        author: string;
        webhook?: {
            name: string;
            avatar?: string | null | undefined;
        } | null | undefined;
        content?: string | null | undefined;
        system?: {
            type: "text";
            content: string;
        } | {
            type: "user_added";
            id: string;
            by: string;
        } | {
            type: "user_remove";
            id: string;
            by: string;
        } | {
            type: "user_joined";
            id: string;
        } | {
            type: "user_left";
            id: string;
        } | {
            type: "user_kicked";
            id: string;
        } | {
            type: "user_banned";
            id: string;
        } | {
            type: "channel_renamed";
            name: string;
            by: string;
        } | {
            type: "channel_description_changed";
            by: string;
        } | {
            type: "channel_icon_changed";
            by: string;
        } | {
            type: "channel_ownership_changed";
            from: string;
            to: string;
        } | null | undefined;
        attachments?: {
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
        }[] | null | undefined;
        edited?: string | null | undefined;
        embeds?: ({
            type: "Website";
            url?: string | null | undefined;
            original_url?: string | null | undefined;
            special?: {
                type: "None";
            } | {
                type: "GIF";
            } | {
                type: "YouTube";
                id: string;
                timestamp?: string | null | undefined;
            } | {
                type: "Lightspeed";
                content_type: "Channel";
                id: string;
            } | {
                type: "Twitch";
                content_type: "Channel" | "Video" | "Clip";
                id: string;
            } | {
                type: "Spotify";
                content_type: string;
                id: string;
            } | {
                type: "Soundcloud";
            } | {
                type: "Bandcamp";
                content_type: "Album" | "Track";
                id: string;
            } | {
                type: "Streamable";
                id: string;
            } | null | undefined;
            title?: string | null | undefined;
            description?: string | null | undefined;
            image?: {
                url: string;
                width: number;
                height: number;
                size: "Large" | "Preview";
            } | null | undefined;
            video?: {
                url: string;
                width: number;
                height: number;
            } | null | undefined;
            site_name?: string | null | undefined;
            icon_url?: string | null | undefined;
            colour?: string | null | undefined;
        } | {
            type: "Image";
            url: string;
            width: number;
            height: number;
            size: "Large" | "Preview";
        } | {
            type: "Video";
            url: string;
            width: number;
            height: number;
        } | {
            type: "Text";
            icon_url?: string | null | undefined;
            url?: string | null | undefined;
            title?: string | null | undefined;
            description?: string | null | undefined;
            media?: {
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
            colour?: string | null | undefined;
        } | {
            type: "None";
        })[] | null | undefined;
        mentions?: string[] | null | undefined;
        replies?: string[] | null | undefined;
        reactions?: {
            [key: string]: string[];
        } | undefined;
        interactions?: {
            reactions?: string[] | null | undefined;
            restrict_reactions?: boolean | undefined;
        } | undefined;
        masquerade?: {
            name?: string | null | undefined;
            avatar?: string | null | undefined;
            colour?: string | null | undefined;
        } | null | undefined;
    }>;
    /**
     * Delete a message
     */
    delete(): Promise<undefined>;
    /**
     * Acknowledge this message as read
     */
    ack(): void;
    /**
     * Reply to Message
     */
    reply(data: string | (Omit<DataMessageSend, "nonce"> & {
        nonce?: string;
    }), mention?: boolean): Promise<Message> | undefined;
    /**
     * Clear all reactions from this message
     */
    clearReactions(): Promise<undefined>;
    /**
     * React to a message
     * @param emoji Unicode or emoji ID
     */
    react(emoji: string): Promise<undefined>;
    /**
     * Unreact from a message
     * @param emoji Unicode or emoji ID
     */
    unreact(emoji: string): Promise<undefined>;
}
export default class Messages extends Collection<string, Message> {
    constructor(client: Client);
    $get(id: string, data?: MessageI): Message;
    /**
     * Create a message object.
     * This is meant for internal use only.
     * @param data Message Data
     * @param emit Whether to emit creation event
     * @returns Message
     */
    createObj(data: MessageI, emit?: boolean | number): Message;
}
