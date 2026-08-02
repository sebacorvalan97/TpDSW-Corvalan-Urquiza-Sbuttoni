export interface User {
    id: number;
    name: string;
    mail: string;
}
export declare const userRepository: {
    getAllUsers: () => User[];
    createUser: (name: string, mail: string) => User;
    updateUser: (id: number, newData: Partial<User>) => User | null;
    deleteUser: (id: number) => User[] | null;
    getUserById: (id: number) => User | null;
};
//# sourceMappingURL=user.repository.d.ts.map