import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService} from '../../authentication.service';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.css']
})
export class NewPasswordComponent implements OnInit {

  password: string;
  email: string;
  token: string;
  pwdReset: boolean;
  message: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthenticationService
  ) { }

  ngOnInit() {
    this.password = '';
    this.getEmail();
    this.getToken();
    this.pwdReset = false;
    this.message = '';
  }

  getEmail(){
    this.email = this.route.snapshot.paramMap.get('email');
  }

  getToken(){
    this.token = this.route.snapshot.paramMap.get('token');
  }

  newPassword(){
    this.auth.newPassword(this.email, this.token, this.password)
      .subscribe(()=>{
        this.router.navigateByUrl('/company/okrs');
      }, (err) => {
        this.message = 'Wrong username or password'
      });
  }
}
