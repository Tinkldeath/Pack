import { DataService } from './../../shared/services/data.service';
import { IUser } from './../../shared/models/models';
import { ViewService } from './../../shared/services/view.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-change-login',
  templateUrl: './change-login.component.html',
  styleUrls: ['./change-login.component.scss'],
})
export class ChangeLoginComponent implements OnInit {

  vSub: Subscription = null;
  login: string = null;
  password: string = null;

  private user: IUser = null;

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private viewService: ViewService,
    private router: Router
  ) { }

  ngOnInit() {
    this.vSub = this.viewService.currentUser.subscribe((data) => {
      this.user = data;
    });
  }

  ngOnDestroy(){
    if(this.vSub !== null){
      this.vSub.unsubscribe();
    }
  }

  Change(){
    if(this.login === null || this.password === null){
      alert('Заполните все поля корректно!');
      return;
    }
    else{

      const user = {
        login: this.user.login,
        password: this.password
      }
      this.authService.Login(user).subscribe((data) => {
        if(data.token !== null){
          const newUser = {
            login: this.login,
            password: this.user.password
          }
            this.vSub = this.authService.ChangeLogin(user).subscribe(data => {
              if(data.message === 'Login updated.'){
                alert('Логин успешно обновлен, войдите повторно.');
                localStorage.clear();
                sessionStorage.clear();
                this.dataService.Clear();
                this.viewService.ChangeUser(null);
                this.router.navigateByUrl('sign-in');
              }
              else if(data.message === 'Conflict'){
                alert('Пользователь с таким логином уже зарегистрирован');
                return;
              }
            }, (err) => {
              if(err){
                console.log(err);
                alert('Ошибка сервера, попробуйте позже');
                return;
              }
            });
        }
        else{
          alert('Пароль введен неверно');
          return;
        }
      });
    }
  }
}