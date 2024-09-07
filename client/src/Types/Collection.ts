export class Collection {
    id: number;
    title: string;
    image: string;
    newListing: boolean;

    constructor(id: number, title: string, image: string, newListing: boolean) {
        this.id = id;
        this.title = title;
        this.image = image;
        this.newListing = newListing;
    }
}