import IModel from "../../common/IModel.interface";

class UserModel implements IModel {
    userId: number;
    email: string;
    passwordHash: string;
    forename: string;
    surname: string;
    phoneNumber: string;
    postalAddress: string;
}

export default UserModel;