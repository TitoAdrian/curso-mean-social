import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from '../../models/user';
import { Follow } from './../../models/follow';
import { UserService } from '../../services/user.service';
import { FollowService } from './../../services/follow.service';
import { GLOBAL } from '../../services/global';

@Component({
    selector: 'users',
    templateUrl: './users.component.html',
    providers: [ UserService, FollowService ]
})
export class UsersComponent implements OnInit {
    public title: string;
    public url: string;
    public identity;
    public token: string;
    public page: number;
    public next_page;
    public prev_page;
    public total: number;
    public pages: number;
    public users: User[];
    public follows;
    public status: string;

    constructor(private _route: ActivatedRoute, private _router: Router, private _userService: UserService, private _followService: FollowService){
        this.title = 'Gente';
        this.url = GLOBAL.url;
        this.identity = _userService.getIdentity();
        this.token = _userService.getToken();
    }

    ngOnInit(){
        console.log('Users.Component ha sido cargado!!');
        this.actualPage();
    }

    actualPage() {
        this._route.params.subscribe(params => {
            let page = +params['page'];
            this.page = page;

            console.log(page);

            if (!page) {
                page = 1;
            } else {
                this.next_page = page + 1;
                this.prev_page = page - 1;
                if (this.prev_page <= 0) {
                    this.prev_page = 1;
                }
            }

            //Devolver listado de usuarios
            this.getUsers(page);
        });
    }

    getUsers(page) {
        this._userService.getUsers(page).subscribe(
            response => {
                if (!response.users) {
                    this.status = 'error';
                } else {
                    this.total = response.total;
                    this.users = response.users;
                    this.pages = response.pages;
                    this.follows = response.users_following;
                    if (page > this.pages) {
                        this._router.navigate(['/gente', 1]);
                    }
                }
            },
            error => {
                const errorMessage = <any>error;
                console.log(errorMessage);
                if (errorMessage != null) {
                    this.status = 'error';
                }
            }
        )
    }

    public followUserOver;
    mouseEnter(user_id) {
        this.followUserOver = user_id;
    }

    mouseLeave() {
        this.followUserOver = 0;
    }

    followUser(followed) {
        const follow = new Follow('', this.identity._id, followed);
        this._followService.addFollow(this.token, follow).subscribe(
            response => {
                if (!response.follow) {
                    this.status = 'error';
                } else {
                    this.status = 'success';
                    this.follows.push(followed);
                }
            },
            error => {
                const errorMessage = <any>error;
                console.log(errorMessage);
                if (errorMessage != null) {
                    this.status = 'error';
                }
            }
        )
    }

    unfollowUser(followed) {
        this._followService.deleteFollow(this.token, followed).subscribe(
            response => {
                const search = this.follows.indexOf(followed);
                if (search !== -1) {
                    this.follows.splice(search, 1);
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

}