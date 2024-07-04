import DiffMatchPatch from 'diff-match-patch';
import { EventEmitter } from 'events';

import { AccessLevel, BriefDocDto, Doc, User } from "../../units";
import { AuthRequiredError, NoDocError, PatchApplyError, SocketDocOpenError, SocketNoDocError, CreateDocError } from "../../errors";
import { Socket } from "../socket-manager";
import { DocRepository, SortingOrder, SortingValues } from "../../db";

interface DocManagerParams {
  docRepository: DocRepository;
}

const FLUSH_INTERVAL = 15000;

export class DocManager {
  private docs = new Map<string, Doc>();

  private ticks = new Map<string, number>();

  private dmp = new DiffMatchPatch();

  private eventHandler = new EventEmitter();

  public constructor(private params: DocManagerParams) {
    this.eventHandler.on("tick", this.tickHandler.bind(this));
  }

  public async createDoc(socket: Socket) {
    if (socket.getOpenDocId()) {
      throw new SocketDocOpenError(socket.getId());
    }

    const creatorId = socket.getUser()?.getId();

    if (!creatorId) {
      throw new AuthRequiredError();
    }

    const doc = Doc.createDoc(creatorId);

    try {
      await this.params.docRepository.createDoc(doc);;
    } catch (err) {
      throw new CreateDocError();
    }

    return doc;
  }

  public async openDoc(socket: Socket, docId: string) {
    if (socket.getOpenDocId()) {
      throw new SocketDocOpenError(socket.getId());
    }

    const doc = await this.findDoc(docId, socket.getUser());

    this.docs.set(docId, doc);

    doc.open(socket.getId());
    socket.openDoc(docId);

    return doc;
  }

  public async focusDoc(socket: Socket) {
    const docId = socket.getOpenDocId();

    if (!docId) {
      throw new SocketDocOpenError(socket.getId());
    }

    const doc = await this.findDoc(docId, socket.getUser());

    if (!doc) {
      throw new NoDocError(docId);
    }

    return doc;
  }

  public async openDocs(
    socket: Socket,
    take = 10,
    skip = 0,
    order = SortingOrder.DESCENDING,
    sortBy = SortingValues.UPDATED_AT
  ) {
    return this.findDocs(take, skip, order, sortBy, socket.getUser());
  }

  public async editDoc(socket: Socket, patches: any) {
    const docId = socket.getOpenDocId();
    const user = socket.getUser();

    if (!docId) {
      throw new SocketNoDocError(socket.getId());
    }

    const doc = await this.findDoc(docId, user);

    if (
      doc.getAccessLevel() === AccessLevel.READONLY &&
      doc.getCreatorId() !== user?.getId()
    ) {
      throw new NoDocError(docId);
    }

    try {
      const editResult = this.dmp.patch_apply(patches, doc.getBody());

      doc.updateBody(editResult[0]);
      this.tickDoc(doc);

      return doc;
    } catch (err) {
      throw new PatchApplyError();
    }
  }

  public async updateDocName(socket: Socket, name: string) {
    const docId = socket.getOpenDocId();
    const user = socket.getUser();

    if (!docId) {
      throw new SocketNoDocError(socket.getId());
    }

    const doc = await this.findDoc(docId, user, true);

    doc.updateName(name);

    const updated = await this.params.docRepository.updateDoc(doc, user, true);

    return updated;
  }

  public async updateDocAccess(socket: Socket, accessLevel: AccessLevel) {
    const docId = socket.getOpenDocId();
    const user = socket.getUser();

    if (!docId) {
      throw new SocketNoDocError(socket.getId());
    }

    const doc = await this.findDoc(docId, user, true);

    doc.updateAccess(accessLevel);

    const updatedDoc = await this.params.docRepository.updateDoc(doc, user, true);

    return updatedDoc;
  }

  public async closeDoc(socket: Socket) {
    const docId = socket.getOpenDocId();

    if (!docId) {
      throw new SocketNoDocError(socket.getId());
    }

    const doc = this.docs.get(docId);

    if (!doc) {
      throw new NoDocError(docId);
    }

    doc.close(socket.getId());
    socket.closeDoc();

    if (!doc.isOpen()) {
      this.docs.delete(docId);
      await this.params.docRepository.updateDocAdmin(doc);
    } else {
      this.tickDoc(doc);
    }
  }

  public async deleteDoc(socket: Socket, docId: string) {
    const creator = socket.getUser();

    if (!creator) {
      throw new AuthRequiredError();
    }

    const doc = await this.findDoc(docId, socket.getUser(), true);

    await this.params.docRepository.deleteDoc(doc, creator);

    this.docs.delete(docId);
  }

  public async getDoc(docId: string, user?: User, elevatedAccess = false) {
    return this.findDoc(docId, user, elevatedAccess);
  }

  private tickDoc(doc: Doc) {
    this.eventHandler.emit("tick", doc);
  }

  private async tickHandler(doc: Doc) {
    const docId = doc.getId();
    const previousTick = this.ticks.get(docId);

    const tickTime = doc.getUpdatedAt().getTime();

    if (!previousTick) {
      this.ticks.set(docId, tickTime);
      return;
    }

    if (tickTime - previousTick < FLUSH_INTERVAL) {
      return;
    }

    this.ticks.set(docId, tickTime);
    await this.params.docRepository.updateDocAdmin(doc);
  }

  private async findDoc(docId: string, user?: User, elevatedAccess = false): Promise<Doc> {
    if (elevatedAccess && !user) {
      throw new AuthRequiredError();
    }

    const doc = this.docs.get(docId) || await this.params.docRepository.getDoc(docId, user, elevatedAccess);

    if (doc.getAccessLevel() === AccessLevel.ONLY_OWNER && doc?.getCreatorId() !== user?.getId()) {
      throw new NoDocError(docId);
    }

    return doc;
  }

  private async findDocs(take: number, skip: number, order: SortingOrder, sortBy: SortingValues, user?: User): Promise<BriefDocDto[]> {
    return this.params.docRepository.getBriefDocs(take, skip, order, sortBy, user);
  }
}
