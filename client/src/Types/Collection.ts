export class Collection {
    id: number;
    name: string;
    image_url: string;
    description: string;
    newListing: boolean;

    constructor(id: number = 0,
        title: string = '',
        image: string = '',
        description: string = '',
        newListing: boolean = false
    ) {
        this.id = id;
        this.name = title;
        this.image_url = image;
        this.description = description;
        this.newListing = newListing;
    }
}