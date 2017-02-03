import { Queryable, QueryableInstance, QueryableCollection } from "./queryable";
import { TextFileParser, BlobFileParser, JSONFileParser, BufferFileParser } from "./odata";

/**
 * Describes a collection of Item objects
 *
 */
export class AttachmentFiles extends QueryableCollection {

    /**
     * Creates a new instance of the AttachmentFiles class
     *
     * @param baseUrl The url or Queryable which forms the parent of this attachments collection
     */
    constructor(baseUrl: string | Queryable, path = "AttachmentFiles") {
        super(baseUrl, path);
    }

    /**
     * Gets a Attachment File by filename
     * 
     * @param name The name of the file, including extension.
     */
    public getByName(name: string): AttachmentFile {
        let f = new AttachmentFile(this);
        f.concat(`('${name}')`);
        return f;
    }

    /**
     * Adds a new attachment to the collection
     *
     * @param name The name of the file, including extension.
     * @param content The Base64 file content.
     */
    public add(name: string, content: string | Blob | ArrayBuffer): Promise<AttachmentFileAddResult> {
        return new AttachmentFiles(this, `add(FileName='${name}')`)
            .post({
                body: content,
            }).then((response) => {
                return {
                    data: response,
                    file: this.getByName(name),
                };
            });
    }
}

/**
 * Describes a single attachment file instance
 *
 */
export class AttachmentFile extends QueryableInstance {

    /**
     * Creates a new instance of the AttachmentFile class
     *
     * @param baseUrl The url or Queryable which forms the parent of this attachment file
     */
    constructor(baseUrl: string | Queryable, path?: string) {
        super(baseUrl, path);
    }

    /**
     * Gets the contents of the file as text
     * 
     */
    public getText(): Promise<string> {

        return new AttachmentFile(this, "$value").get(new TextFileParser());
    }

    /**
     * Gets the contents of the file as a blob, does not work in Node.js
     * 
     */
    public getBlob(): Promise<Blob> {

        return new AttachmentFile(this, "$value").get(new BlobFileParser());
    }

    /**
     * Gets the contents of a file as an ArrayBuffer, works in Node.js
     */
    public getBuffer(): Promise<ArrayBuffer> {

        return new AttachmentFile(this, "$value").get(new BufferFileParser());
    }

    /**
     * Gets the contents of a file as an ArrayBuffer, works in Node.js
     */
    public getJSON(): Promise<any> {

        return new AttachmentFile(this, "$value").get(new JSONFileParser());
    }

    /**
     * Sets the content of a file
     * 
     * @param content The value to set for the file contents
     */
    public setContent(content: string | ArrayBuffer | Blob): Promise<AttachmentFile> {

        let setter = new AttachmentFile(this, "$value");

        return setter.post({
            body: content,
            headers: {
                "X-HTTP-Method": "PUT",
            },
        }).then(_ => new AttachmentFile(this));
    }

    /**
     * Delete this attachment file
     *
     * @param eTag Value used in the IF-Match header, by default "*"
     */
    public delete(eTag = "*"): Promise<void> {
        return this.post({
            headers: {
                "IF-Match": eTag,
                "X-HTTP-Method": "DELETE",
            },
        });
    }
}

export interface AttachmentFileAddResult {
    file: AttachmentFile;
    data: any;
}
