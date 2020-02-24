class Sequence {

  constructor(sequenceParameter) {
    
    this.participants = [];
    this.elements = [];
    this.draft = false;
    this.name = '';

    if(typeof sequenceParameter === 'function') {
      sequenceParameter(this);
    } else if(typeof sequenceParameter === 'string') {
      this.name = sequenceParameter;
    }
  }

  addParticipant(participantParameter) {

    if(participantParameter instanceof Participant) {
      this.participants.push(participantParameter);
      return participantParameter;
    }

    let participant = new Participant(this, participantParameter);
    this.participants.push(participant);

    return participant;
  }

  addMessage(message) {
    this.elements.push(message);
  }

  toJsonObj() {
    return {
      name: this.name,
      participants: this.participants.map(participant => participant.toJsonObj()),
      elements: this.elements.map(message => message.toJsonObj()),
      draft: this.draft,
    }
  }
}

class Participant {

  constructor(sequence, participantParameter) {
    this.sequence = sequence;
    if(typeof participantParameter === 'string') {
      this.init(participantParameter);
    } else if(typeof participantParameter === 'function') {
      participantParameter(this);
    }
  }

  init(id, name) {
    this.id = id;
    if(typeof name === 'undefined') {
      this.name = id;
    } else {
      this.name = name;
    }
  }

  send(receiver, messageParameter) {
    let message = new Message(this, receiver, messageParameter);
    this.sequence.addMessage(message);
    return message;
  }

  info(messageParameter) {
    let message = new Message(this, this, messageParameter);
    message._info = true;
    this.sequence.addMessage(message);
    return message;
  }

  toJsonObj() {
    return {
      id: this.id,
      name: this.name,
    }
  }

}

class Message {

  constructor(caller, receiver, messageParameter) {
    
    this.caller = caller;
    this.receiver = receiver;
    this.text = '';
    this.rootMessage = null;
    this.response = false;
    this._info = false;

    if(typeof messageParameter === 'function') {
      messageParameter(this);
    } else if(typeof messageParameter === 'string') {
      this.text = messageParameter;
    } else if(_.isNil(messageParameter)) {
      this.text = '';
    }
  }

  respond(messageParameter) {
    if(this._info && !_.isNil(this.rootMessage)) {
      return this.rootMessage.respond(messageParameter);
    } else if(this.response && !_.isNil(this.rootMessage)) {
      return this.rootMessage.respond(messageParameter);
    }
    let responseMessage = this.receiver.send(this.caller, messageParameter);
    responseMessage.rootMessage = this.rootMessage;
    responseMessage.response = true;
    return responseMessage;
  }

  send(newReceiver, messageParameter) {
    if(this._info && !_.isNil(this.rootMessage)) {
      return this.rootMessage.send(newReceiver, messageParameter);
    }
    let message = this.receiver.send(newReceiver, messageParameter);
    message.rootMessage = this;
    return message;
  }

  info(messageParameter) {
    let info = this.receiver.info(messageParameter);
    info.rootMessage = this;
    return info;
  }

  toJsonObj() {
    return {
      caller: this.caller.id,
      receiver: this.receiver.id,
      text: this.text,
      response: this.response,
      info: this._info,
    }
  }
}