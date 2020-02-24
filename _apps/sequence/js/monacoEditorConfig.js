require.config({ paths: { 'vs': '../libs/js/monaco-editor/min/vs' }});


const appTypescriptLibraries = [
  {
    name: 'ts:filename/sequence.d.ts',
    value: `

  declare function title(sequenceTitle: string);
  declare function object(object: string | Initializer<SequenceObject>): SequenceObject;

  declare class Sequence {
    name: string;
    draft: boolean;
    constructor(sequenceParameter: string | Initializer<Sequence>);
    addObject(object: string | Initializer<SequenceObject>): SequenceObject;
  }

  declare class SequenceObject {
    name: string
    send(receiverObject: SequenceObject, messageParameter?: string | Initializer<Message>): Message;
    info(messageParameter: string | Initializer<Message>): Message;
  }

  declare class Message {
    sender: SequenceObject;
    receiver: SequenceObject;
    text: string;
    respond(messageParameter?: string | Initializer<Message>): Message;
    send(receiver: SequenceObject, messageParameter?: string | Initializer<Message>): Message;
    info(messageParameter?: string | Initializer<Message>): Message;
  }

  declare interface Initializer<T> {
    (value: T): void;
  }
    `,
  }
]
