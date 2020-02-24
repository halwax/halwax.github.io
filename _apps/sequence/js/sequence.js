class Sequence {

  constructor(sequenceParameter) {
    
    this.objects = [];
    this.messages = [];
    this.draft = false;
    this.name = '';

    if(typeof sequenceParameter === 'function') {
      sequenceParameter(this);
    } else if(typeof sequenceParameter === 'string') {
      this.name = sequenceParameter;
    }
  }

  addObject(objectParameter) {

    if(objectParameter instanceof SequenceObject) {
      this.objects.push(objectParameter);
      return objectParameter;
    }

    let object = new SequenceObject(this, objectParameter);
    this.objects.push(object);

    return object;
  }

  addMessage(message) {
    this.messages.push(message);
  }

  toJsonObj() {
    return {
      name: this.name,
      objects: this.objects.map(object => object.toJsonObj()),
      messages: this.messages.map(message => message.toJsonObj()),
      draft: this.draft,
    }
  }
}

class SequenceObject {

  constructor(sequence, objectParameter) {
    this.sequence = sequence;
    if(typeof objectParameter === 'string') {
      this.init(objectParameter);
    } else if(typeof objectParameter === 'function') {
      objectParameter(this);
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

  constructor(sender, receiver, messageParameter) {
    
    this.sender = sender;
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
    let responseMessage = this.receiver.send(this.sender, messageParameter);
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
      sender: this.sender.id,
      receiver: this.receiver.id,
      text: this.text,
      response: this.response,
      info: this._info,
    }
  }
}