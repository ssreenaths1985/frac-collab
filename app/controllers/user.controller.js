exports.fullAccess = (request, response) => {
    response.status(200).send("Full access");
}

exports.editorAccess = (request, response) => {
    response.status(200).send("Editor access");
}

exports.commenterAccess = (request, response) => {
    response.status(200).send("Commmenter access");
}

exports.viewerAccess = (request, response) => {
    response.status(200).send("Editor access");
}