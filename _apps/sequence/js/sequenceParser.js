class SequenceParser {

  parse(sequenceText) {

    let sequence = eval(
`
let sequence = new Sequence();

function title(sequenceName) {
  sequence.name = sequenceName;
}

function actor(actorParam) {
  return sequence.addActor(actorParam);
}

${sequenceText}

sequence;`
    );

    if(typeof sequence === 'undefined' || sequence === null) {
      sequence = new Sequence('');
    }

    return sequence;
  }
}