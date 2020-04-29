import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'home',
    templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
    public title: string;
    public identity: any;

    constructor(
        private _userService: UserService
    ) {
        this.title = 'Bienvenido a NGSocial';
    }

    ngOnInit(){
        console.log('home.component cargado!!');
        this.identity = this._userService.getIdentity();
    }
}
