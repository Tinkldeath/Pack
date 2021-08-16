import { Subscription } from 'rxjs';
import { IUser, ISubject, IPost, ICategory } from './../shared/models/models';
import { RequestsService } from '../shared/services/requests.service';
import { ViewService } from '../shared/services/view.service';
import { DataService } from '../shared/services/data.service';
import { Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy{

  // User model
  user: IUser = null;

  // Ng models
  searchCategories: boolean = true;
  showPosts: boolean = false;
  searchbar: string = '';

  // All data fields
  categories: ICategory[] = [];
  subjects: ISubject[] = [];
  posts: IPost[] = [];

  // Service subs
  vSub: Subscription = null;
  cSub: Subscription = null;
  sSub: Subscription = null;
  pSub: Subscription = null;


  constructor(
    private reqService: RequestsService,
    private viewService: ViewService,
    private dataService: DataService,
    private router: Router
    ) {
      this.user = this.dataService.DecryptUser();
      this.vSub = this.viewService.currentUser.subscribe(user => {
        this.user = user;
      });
    }

  ngOnInit(){
    this.cSub = this.reqService.GetCategories().subscribe((data) => {
      this.categories = data;
      this.viewService.ChangeCategories(data);
      this.viewService.SetAllCategories(data);
    });
    this.sSub = this.reqService.GetSubjects().subscribe((data) => {
      this.subjects = data;
      this.viewService.ChangeSubjects(data);
      this.viewService.SetAllSubjects(data);
    });
    this.pSub = this.reqService.GetPosts().subscribe((data) => {
      this.posts = data;
      this.viewService.ChangePosts(data);
      this.viewService.SetAllPosts(data);
    });
    this.user = this.dataService.DecryptUser();
    this.viewService.ChangeUser(this.user);
    if(this.user === null){
      localStorage.clear();
    }
  }

  ngOnDestroy(){
    if(this.vSub !== null){
      this.vSub.unsubscribe();
    }
    if(this.sSub !== null){
      this.sSub.unsubscribe();
    }
    if(this.pSub !== null){
      this.pSub.unsubscribe();
    }
    if(this.cSub !== null){
      this.cSub.unsubscribe();
    }
  }

  GoFavorite(){
    this.router.navigateByUrl('favorite');
  }

  GoAdd(){
    this.viewService.ChangeCategories(this.categories);
    this.router.navigateByUrl('add-item');
  }

  GoProfile(){
    this.viewService.ChangeCategories(this.categories);
    this.viewService.ChangeSubjects(this.subjects);
    this.viewService.ChangePosts(this.posts);
    this.router.navigateByUrl('account');
  }

  SwitchSearch(){
    this.searchCategories = !this.searchCategories;
    if(this.searchCategories === false){
      this.showPosts = true;
    }
    else{
      this.showPosts = false;
    }
  }

  Reset(){
    // Тут я добавил отдельную переменную для хранения постов, ибо так немного проще.
    // searchCategories теперь влияет только на кнопку
    if(this.searchCategories === true){
      this.showPosts = false;
    }
    else{
      this.showPosts = true;
    }
    // Тут мы сбрасываем критерии поиска
    this.viewService.ChangeViewCategory(null);
    this.viewService.ChangeViewSubject(null);
    this.viewService.ChangeViewAuthor(null);

    // А тут возвращаем отображение, т.к. отображение постов на компоненте зависит от этих методов
    this.viewService.ChangeCategories(this.categories);
    this.viewService.ChangePosts(this.posts);
    this.viewService.ChangeSubjects(this.subjects);
  }

  SelectCategory(category: ICategory){
    // Вместо кучи кода просто вызываем метод у сервиса, а компонент постов сделает всё сам
    this.viewService.ChangeViewCategory(category);
    this.showPosts = true;
  }

  Searchbar(){
    for(let post of this.posts){
      if(this.searchbar === post.author){
        this.viewService.ChangeViewAuthor(this.searchbar);
      }
      else if( this.searchbar === post.subject){
        for(let subject of this.subjects){
          if(this.searchbar === subject.name){
            this.viewService.ChangeViewSubject(subject);
          }
        }
      } 
      else if(this.searchbar === post.category){
        for(let category of this.categories){
          if(this.searchbar === category.name){
            this.viewService.ChangeViewCategory(category);
          }
        }
      }
    }
  }

}
