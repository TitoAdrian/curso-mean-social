import { PublicationService } from './../../services/publication.service';
import { UserService } from './../../services/user.service';
import { Publication } from './../../models/publication';
import { GLOBAL } from './../../services/global';
import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
//import * as $ from 'jquery';

@Component({
    selector: 'publications',
    templateUrl: './publications.component.html',
    providers: [UserService, PublicationService]
})
export class PublicationsComponent implements OnInit {
    public identity;
    public token;
    public title: string;
    public url: string;
    public status: string;
    public page;
    public total;
    public pages;
    public itemsPerPage;
    public showImage: number;
    @Input() publications: Publication[];
    @Input() user: string;

    constructor (private _route: ActivatedRoute, private _router: Router, private _userService: UserService, private _publicationService: PublicationService) {
        this.title = 'Publicaciones';
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();
        this.url = GLOBAL.url;
        this.page = 1;
    }

    ngOnInit() {
        console.log('publication.component cargado correctamente!');
        this.getPublications(this.user, this.page);
    }

    getPublications(user, page, adding = false) {
        this._publicationService.getPublicationsUser(this.token, user, page).subscribe(
            response => {
                if (response.publications) {
                    this.total = response.total_items;
                    this.pages = response.pages;
                    this.itemsPerPage = response.itemsPerPage;
                    if (!adding) {
                        this.publications = response.publications;
                    } else {
                        var arrayA = this.publications;
                        var arrayB = response.publications;
                        this.publications = arrayA.concat(arrayB);
                        // $("html, body").animate({ scrollTop: $('html').prop("scrollHeight")}, 500);
                    }

                    if (page > this.pages){
                        //this._router.navigate(['/home']);
                    }
                } else {
                    this.status = 'error';
                }
            },
            error => {
                const errorMessage = <any>error;
                console.log(errorMessage);
                if (errorMessage != null) {
                    this.status = 'error';
                }
            }
        );
    }

    showThisImage(id: number) {
        this.showImage = id;
    }
    
    hideThisImage() {
        this.showImage = null;
    }

    refresh(event = null) {
        
    }

    public noMore = false;
    viewMore() {
        this.page += 1;
        if (this.page === this.pages) {
            this.noMore = true;
        }

        this.getPublications(this.user, this.page, true);
    }

    canDelete(event) {
        if(this.identity ) {
            return true;
        }
    }

    deletePublication(id: number) {
        this._publicationService.deletePublication(this.token, id).subscribe(
          (response) => {
            this.refresh();
          },
          (error) => {
            console.log(<any>error);
          }
        );
      }
}
