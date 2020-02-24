const tsDefaultSequence = 
`let user = object(\`User\`);
let controller = object(\`Controller\`);
let service = object(\`Service\`);

user
    .send(controller, \`/rest/endpoint\`)
        .send(service, \`serviceMethod(...)\`)
        .info(\`calculates result\`)
        .respond()
    .respond();`;