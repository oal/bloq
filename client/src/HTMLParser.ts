export default class HTMLParser {
    private parser: DOMParser = new DOMParser();

    parse(html: string): Element {
        let doc = this.parser.parseFromString(html, 'text/html');
        return doc.body.firstChild as Element;
    }
}