import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { GLOBAL } from "./global";
import { User } from "../models/user";

@Injectable()
export class UserService {
  public url: string;
  public identity: any;
  public token: string;
  public stats: any;

  constructor(public _http: HttpClient) {
    this.url = GLOBAL.url;
  }

  register(user: User): Observable<any> {
    const params = JSON.stringify(user);
    const headers = new HttpHeaders().set("Content-type", "application/json");

    return this._http.post(this.url + "register", params, { headers: headers });
  }

  signup(user: User, gettoken = null): Observable<any> {
    if (gettoken != null) {
      user.gettoken = gettoken;
    }
    const params = JSON.stringify(user);
    const headers = new HttpHeaders().set("Content-Type", "application/json");

    return this._http.post(this.url + "login", params, { headers: headers });
  }

  getIdentity() {
    const identity = JSON.parse(localStorage.getItem("identity"));
    if (identity !== undefined) {
      this.identity = identity;
    } else {
      this.identity = null;
    }

    return this.identity;
  }

  getToken() {
    const token = localStorage.getItem("token");
    if (token !== undefined) {
      this.token = token;
    } else {
      this.token = null;
    }

    return this.token;
  }

  getStats() {
    const stats = JSON.parse(localStorage.getItem("stats"));
    if (stats !== undefined) {
      this.stats = stats;
    } else {
      this.stats = null;
    }
    return this.stats;
  }

  getCounters(userId = null): Observable<any> {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json")
      .set("Authorization", this.getToken());
    if (userId != null) {
      return this._http.get(this.url + "counters/" + userId, {
        headers: headers,
      });
    } else {
      return this._http.get(this.url + "counters", { headers: headers });
    }
  }

  updateUser(user: User): Observable<any> {
    const params = JSON.stringify(user);
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json")
      .set("Authorization", this.getToken());
    return this._http.put(this.url + "update-user/" + user._id, params, {
      headers: headers,
    });
  }

  getUsers(page = null): Observable<any> {
    const headers = new HttpHeaders()
      .set("Content-type", "application/json")
      .set("Authorization", this.getToken());
    return this._http.get(this.url + "users/" + page, { headers: headers });
  }

  getUser(id): Observable<any> {
    const headers = new HttpHeaders()
      .set("Content-type", "application/json")
      .set("Authorization", this.getToken());
    return this._http.get(this.url + "user/" + id, { headers: headers });
  }
}
