require.config({ paths: { 'vs': '../libs/js/monaco-editor/min/vs' }});


const appTypescriptLibraries = [
  {
    name: 'ts:filename/sequence.d.ts',
    value: `

  declare function title(sequenceTitle: string);
  declare function participant(participant: string | Initializer<Participant>): Participant;

  declare class Sequence {
    name: string;
    draft: boolean;
    constructor(sequenceParameter: string | Initializer<Sequence>);
    addParticipant(participant: string | Initializer<Participant>): Participant;
  }

  declare class Participant {
    name: string
    send(receiver: Participant, messageParameter?: string | Initializer<Message>): Message;
    info(messageParameter: string | Initializer<Message>): Message;
  }

  declare class Message {
    sender: Participant;
    receiver: Participant;
    text: string;
    respond(messageParameter?: string | Initializer<Message>): Message;
    send(receiver: Participant, messageParameter?: string | Initializer<Message>): Message;
    info(messageParameter?: string | Initializer<Message>): Message;
  }

  declare interface Initializer<T> {
    (value: T): void;
  }
    `,
  }
]
