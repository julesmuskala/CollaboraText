import { v4 as uuid } from "uuid";

import { truncateString } from "../utils/string";

export enum AccessLevel {
  ONLY_OWNER = "ONLY_OWNER",
  READONLY = "READONLY",
  ANYONE = "ANYONE",
}

export interface DocDto {
  id: string;
  name: string;
  creatorId: string;
  accessLevel: AccessLevel;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BriefDocDto {
  id: string;
  name: string;
  creatorId: string;
  briefBody: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Doc {
  private openSockets = new Set<string>();

  private constructor(
    private id: string,
    private name: string,
    private creatorId: string,
    private accessLevel: AccessLevel,
    private body: string,
    private createdAt: Date,
    private updatedAt: Date,
  ) { }

  public static createDoc(creatorId: string) {
    return new Doc(
      uuid(),
      "Untitled document",
      creatorId,
      AccessLevel.ONLY_OWNER,
      "",
      new Date(),
      new Date(),
    );
  }

  public updateBody(body: string) {
    this.body = body;
    this.updatedAt = new Date();

    return this;
  }

  public updateName(name: string) {
    this.name = name;

    return this;
  }

  public updateAccess(accessLevel: AccessLevel) {
    this.accessLevel = accessLevel;

    return this;
  }

  public static fromDto(dto: DocDto) {
    return new Doc(
      dto.id,
      dto.name,
      dto.creatorId,
      dto.accessLevel,
      dto.body,
      dto.createdAt,
      dto.updatedAt,
    );
  }

  public toDto(): DocDto {
    return {
      id: this.id,
      name: this.name,
      creatorId: this.creatorId,
      accessLevel: this.accessLevel,
      body: this.body,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public toBriefDto(): BriefDocDto {
    return {
      id: this.id,
      name: this.name,
      creatorId: this.creatorId,
      briefBody: truncateString(this.body),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public getId() {
    return this.id;
  }

  public getName() {
    return this.name;
  }

  public getCreatorId() {
    return this.creatorId;
  }

  public getAccessLevel() {
    return this.accessLevel;
  }

  public getBody() {
    return this.body;
  }

  public getCreatedAt() {
    return this.createdAt;
  }

  public getUpdatedAt() {
    return this.updatedAt;
  }

  public isOpen() {
    return !!this.openSockets.size;
  }

  public isOwned(userId?: string) {
    return this.creatorId === userId;
  }

  public open(socketId: string) {
    return this.openSockets.add(socketId);
  }

  public close(socketId: string) {
    return this.openSockets.delete(socketId);
  }

  public getOpenSockets() {
    return Array.from(this.openSockets);
  }
}
