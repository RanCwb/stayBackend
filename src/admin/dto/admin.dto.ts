export class CreateAdminDto {
  email: string;
  password: string;
  role?: 'ADMIN' | 'USER'; // default USER
}


export type LoginResponse = {
  token: string;
  admin: {
    id: string;
    email: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
  };
};
