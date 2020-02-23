class Sequence {

  constructor(sequenceParameter) {
    
    this.actors = [];
    this.messages = [];
    this.draft = false;
    this.name = '';

    if(typeof sequenceParameter === 'function') {
      sequenceParameter(this);
    } else if(typeof sequenceParameter === 'string') {
      this.name = sequenceParameter;
    }
  }

  addActor(actorParameter) {

    if(actorParameter instanceof Actor) {
      this.actors.push(actorParameter);
      return actorParameter;
    }

    let actor = new Actor(this, actorParameter);
    this.actors.push(actor);

    return actor;
  }

  addMessage(message) {
    this.messages.push(message);
  }

  toJsonObj() {
    return {
      name: this.name,
      actors: this.actors.map(actor => actor.toJsonObj()),
      messages: this.messages.map(message => message.toJsonObj()),
      draft: this.draft,
    }
  }
}

class Actor {

  constructor(sequence, actorParameter) {
    this.sequence = sequence;
    if(typeof actorParameter === 'string') {
      this.init(actorParameter);
    } else if(typeof actorParameter === 'function') {
      actorParameter(this);
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

  send(receiverActor, messageParameter) {
    let message = new Message(this, receiverActor, messageParameter);
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

  constructor(senderActor, receiverActor, messageParameter) {
    
    this.senderActor = senderActor;
    this.receiverActor = receiverActor;
    this.text = '';
    this.rootMessage = null;
    this.response = false;

    if(typeof messageParameter === 'function') {
      messageParameter(this);
    } else if(typeof messageParameter === 'string') {
      this.text = messageParameter;
    } else if(_.isNil(messageParameter)) {
      this.text = '';
    }
  }

  respond(messageParameter) {
    if(this.response && !_.isNil(this.rootMessage)) {
      return this.rootMessage.respond(messageParameter);
    }
    let responseMessage = this.receiverActor.send(this.senderActor, messageParameter);
    responseMessage.rootMessage = this.rootMessage;
    responseMessage.response = true;
    return responseMessage;
  }

  send(newReceiverActor, messageParameter) {
    let message = this.receiverActor.send(newReceiverActor, messageParameter);
    message.rootMessage = this;
    return message;
  }

  toJsonObj() {
    return {
      sender: this.senderActor.id,
      receiver: this.receiverActor.id,
      text: this.text,
      response: this.response,
    }
  }
}