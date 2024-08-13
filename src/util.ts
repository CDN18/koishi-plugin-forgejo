export function convertImg(body: string, url: string) {
    const baseURL = url.match(/(https?:\/\/[^/]+)\//)?.[1]
    // only convert markdown image to html image tag
    body = body.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2"/>');
    // if the image url is relative, add base url
    return body.replace(/<img src="\/(.*?)"/g, `<img src="${baseURL}/$1"`);
}

export function convertMd() {
    // convert markdown to html
    // TODO: then render it as picture
}