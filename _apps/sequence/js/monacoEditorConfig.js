require.config({ paths: { 'vs': '../libs/js/monaco-editor/min/vs' }});


const appTypescriptLibraries = [
  {
    name: 'ts:filename/sequence.d.ts',
    value: `

  declare function title(sequenceTitle: string);
  declare function actor(actor: string | Initializer<Actor>): Actor;

  declare class Sequence {
    name: string;
    draft: boolean;
    constructor(sequenceParameter: string | Initializer<Sequence>);
    addActor(actor: string | Initializer<Actor>): Actor;
  }

  declare class Actor {
    name: string
    send(receiverActor: Actor, messageParameter?: string | Initializer<Message>): Message;
    info(messageParameter: string | Initializer<Message>): Message;
  }

  declare class Message {
    sender: Actor;
    receiver: Actor;
    text: string;
    respond(messageParameter?: string | Initializer<Message>): Message;
    send(receiverActor: Actor, messageParameter?: string | Initializer<Message>): Message;
    info(messageParameter?: string | Initializer<Message>): Message;
  }

  declare interface Initializer<T> {
    (value: T): void;
  }
    `,
  }
]
