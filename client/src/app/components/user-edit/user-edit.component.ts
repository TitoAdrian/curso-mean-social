import { GLOBAL } from "./../../services/global";
import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute, Params } from "@angular/router";
import { User } from "../../models/user";
import { UserService } from "../../services/user.service";
import { UploadService } from "./../../services/upload.service";

@Component({
  selector: "user-edit",
  templateUrl: "./user-edit.component.html",
  providers: [UserService, UploadService],
})
export class UserEditComponent implements OnInit {
  public title: string;
  public user: User;
  public identity: User;
  public token: string;
  public status: string;
  public url: string;
  public filesToUpload: File;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService,
    private _uploadService: UploadService
  ) {
    this.title = "Actualizar mis datos";
    this.user = this._userService.getIdentity();
    this.identity = this.user;
    this.token = this._userService.getToken();
    this.url = GLOBAL.url;
  }

  ngOnInit() {
    console.log("user-edit.component se ha cargado!!");
  }

  onSubmit() {
    this._userService.updateUser(this.user).subscribe(
      (response) => {
        if (!response.user) {
          this.status = "error";
        } else {
          this.status = "success";
          localStorage.setItem("identity", JSON.stringify(this.user));
          this.identity = this.user;

          // Subida de imagen de usuario
          this._uploadService.makeFileRequest(
              this.url + "upload-image-user/" + this.user._id,
              this.filesToUpload,
              "image"
            ).subscribe((result) => {
              if(!result.user) {
                console.log(result);
              } else {
                this.user.image = result.user.image;
                localStorage.setItem("identity", JSON.stringify(this.user));
              }
            });
        }
      },
      (error) => {
        const errorMessage = <any>error;
        console.log(errorMessage);
        if (errorMessage != null) {
          this.status = "error";
        }
      }
    );
  }

  fileChangeEvent(fileInput: any) {
    this.filesToUpload = fileInput.target.files;
    console.log(this.filesToUpload);
  }
}
