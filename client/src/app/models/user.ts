export class User {
  public _id: string;
  public name: string;
  public surname: string;
  public nick: string;
  public email: string;
  public password: string;
  public role: string;
  public image: string;
  public gettoken: string;

  constructor (
    _id: string,
    name: string,
    surname: string,
    nick: string,
    email: string,
    password: string,
    role: string,
    image: string,
    gettoken: string
  ) {
    this._id = _id;
    this.name = name;
    this.surname = surname;
    this.nick = nick;
    this.email = email;
    this.password = password;
    this.role = role;
    this.image = image;
    this.gettoken = gettoken;
  }
}
