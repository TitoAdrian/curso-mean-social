import { PublicationService } from './../../services/publication.service';
import { Publication } from './../../models/publication';
import { GLOBAL } from './../../services/global';
import { UserService } from './../../services/user.service';
import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { UploadService } from './../../services/upload.service';
import { User } from 'src/app/models/user';

@Component({
  selector: "sidebar",
  templateUrl: "./sidebar.component.html",
  providers: [UserService, PublicationService, UploadService],
})
export class SidebarComponent implements OnInit {
  public identity: User;
  public token: string;
  public stats: any;
  public url: string;
  public status: string;
  public publication: Publication;
  public filesToUpload: File;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService,
    private _publicationService: PublicationService,
    private _uploadService: UploadService
  ) {
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
    this.url = GLOBAL.url;
    this.publication = new Publication("", "", "", "", this.identity._id);
  }

  ngOnInit() {
    console.log("Sidebar.component ha sido creado correctamente");
    this._userService.getCounters(this.identity._id).subscribe(response => {
      this.stats = response;
    }, error => {
      console.log(<any>error);
    });
  }

  onSubmit(form: any, $event: any) {
    this._publicationService
      .addPublication(this.token, this.publication)
      .subscribe(
        (response) => {
          if (response.publication) {
            // this.publication = response.publication;
            // Subir imagen
            if (this.filesToUpload) {
              this._uploadService
                .makeFileRequest(
                  this.url + "upload-image-pub/" + response.publication._id,
                  this.filesToUpload,
                  "image"
                )
                .subscribe((result: any) => {
                  this.publication.file = result.image;
                  this.status = "success";
                  form.reset();
                  this._router.navigate(["/timeline"]);
                  this.sended.emit({
                    send: "true",
                  });
                });
            } else {
              this.status = "success";
              form.reset();
              this._router.navigate(["/timeline"]);
              this.sended.emit({
                send: "true",
              });
            }
          } else {
            this.status = "error";
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

  fileChangedEvent(fileInput: any) {
    this.filesToUpload = fileInput.target.files;
  }

  //Output
  @Output() sended = new EventEmitter();
  sendPublication(event) {
    this.sended.emit({
      send: "true",
    });
  }
}