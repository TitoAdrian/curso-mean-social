import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GLOBAL } from './global';
import { UserService } from './user.service';

@Injectable()
export class UploadService {
    public url: string;

    constructor(private http: HttpClient, private userService: UserService){
        this.url = GLOBAL.url;
    }

    makeFileRequest(url: string, params: Array<string>, files: Array<File>, token: string, name: string): Observable<any> {

        var formData = new FormData();
        var xhr = new XMLHttpRequest();
        if (files) {
          for (var i = 0; i < files.length; i++) {
            formData.append(name, files[i], files[i].name);
          }
        }

        const headers = new HttpHeaders().set(
          "Content-Type",
          "application/json"
        ).set('Authorization', this.userService.getToken());

        return this.http.post(url, formData, { headers: headers });
    }
}
