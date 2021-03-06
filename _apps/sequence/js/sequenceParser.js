class SequenceParser {

  parse(sequenceText) {

    let sequence = eval(
`
let sequence = new Sequence();

function title(sequenceName) {
  sequence.name = sequenceName;
}

function participant(participantParam) {
  return sequence.addParticipant(participantParam);
}

function fragment(fragmentParam) {
  return sequence.addFragment(fragmentParam);
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