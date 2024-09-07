export class Collection {
    id: number;
    name: string;
    image: string;
    description: string;
    newListing: boolean;

    constructor(id: number, title: string, image: string, description: string, newListing: boolean) {
        this.id = id;
        this.name = title;
        this.image = image;
        this.description = description;
        this.newListing = newListing;
    }
}