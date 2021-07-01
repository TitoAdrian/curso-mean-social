export class Publication {
    public _id: string;
    public text: string;
    public file: string;
    public created_at: string;
    public user: string;

    constructor(
        _id: string,
        text: string,
        file: string,
        created_at: string,
        user: string
    ) { }
}