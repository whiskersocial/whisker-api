export interface User {
    _id: any;
    user: string;
    pass: string;
    bio: string;
}

export interface Post {
    _id: any;
    user_id: string;
    title: string;
    parent_id: string;
    text: string;
}