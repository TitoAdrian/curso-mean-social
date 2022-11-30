import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { GLOBAL } from "./global";
import { UserService } from "./user.service";

@Injectable()
export class UploadService {
  public url: string;

  constructor(private http: HttpClient, private userService: UserService) {
    this.url = GLOBAL.url;
  }

  makeFileRequest(
    url: string,
    file: File,
    name: string
  ): Observable<any> {
    var formData = new FormData();
    if (file) {
        formData.append(name, file[0]);
    }

    const headers = new HttpHeaders()
      .set("Authorization", this.userService.getToken());

    return this.http.post(url, formData, { headers: headers });
  }
}
