const tsDefaultSequence = 
`let user = participant(\`User\`);
let controller = participant(\`Controller\`);
let service = participant(\`Service\`);

user
    .send(controller, \`/rest/endpoint\`)
        .send(service, \`serviceMethod(...)\`)
        .info(\`calculates result\`)
        .respond()
    .respond();`;