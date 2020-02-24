const tsDefaultSequence = 
`let user = actor(\`User\`);
let controller = actor(\`Controller\`);
let service = actor(\`Service\`);

user
    .send(controller, \`/rest/endpoint\`)
        .send(service, \`serviceMethod(...)\`)
        .info(\`calculates result\`)
        .respond()
    .respond();`;