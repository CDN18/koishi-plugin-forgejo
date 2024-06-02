export function convertImg(body: string) {
    // only convert markdown image to html img tag
    return body.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2"/>');
}

export function convertMd() {
    // convert markdown to html
    // TODO: then render it as picture
}