import { Component, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import {
  faPlusCircle, faPen, faTrashAlt, faUserNinja,
  faBatteryEmpty, faAdjust, faCheckCircle,
  faChevronUp, faChevronDown
}
  from '@fortawesome/free-solid-svg-icons';

import { OkrService } from '../okr.service';
import { AuthenticationService, UserDetails } from '../authentication.service';
import { UserService } from '../user.service';
import { Okr, KeyResult } from '../okr/okr';

@Component({
  selector: 'app-okr',
  templateUrl: './okr.component.html',
  styleUrls: ['./okr.component.css']
})

export class OkrComponent implements OnChanges {

  faPlusCircle = faPlusCircle;
  faPen = faPen;
  faTrashAlt = faTrashAlt;
  faUserNinja = faUserNinja;
  faBatteryEmpty = faBatteryEmpty;
  faAdjust = faAdjust;
  faCheckCircle = faCheckCircle;
  faChevronUp = faChevronUp;
  faChevronDown = faChevronDown;

  @Input() okr: Okr;
  @Output() hideOkrId = new EventEmitter<string>();
  @Output() parentId = new EventEmitter<string>();
  @Output() okrToEdit = new EventEmitter<Okr>();

  keyResults: {};
  owner: UserDetails;
  parent: Okr;
  children: {};
  showChildren: boolean;
  childrenCount: number;
  averageProgress: number;

  constructor(
    private okrService: OkrService,
    private auth: AuthenticationService,
    private userService: UserService
  ) { }

  ngOnChanges() {
    this.getOwner();
    this.getParent();
    this.children = [];
    this.showChildren = false;
    this.childrenCount = this.okr.children.length;
    this.getAverageProgress();
  }

  getChildren(): void {
    this.okrService.getChildren(this.okr._id)
      .subscribe(children => {
        this.children = children;
        this.verifyChildrenList();
        this.showChildren = true;
      });
  }

  addChild(parentId: string) {
    this.parentId.emit(parentId);
  }

  editOkr(okr: Okr){
    this.okrToEdit.emit(okr);
  }

  //TODO: This method should not be necessary and should be removed
  verifyChildrenList(): void {
    for (let child in this.children) {
      if (!this.okr.children.includes(this.children[child]._id)) {
        this.okrService.addChild(this.okr._id, this.children[child]._id)
          .subscribe(() => console.log('Added childId to parent children array'));
      }
    }
  }

  hideChildren(): void {
    this.children = {};
    this.showChildren = false;
  }

  getAverageProgress() {
    let sum = 0;
    let count = 0;
    this.okr.keyResults
      .forEach(kr => {
        if (kr.progress) {
          sum += kr.progress;
        }
        count += 1;
      });
    this.averageProgress = Math.round(sum / count);
  }

  getOwner(): void {
    if (this.okr.userId) {
      this.userService.getUser(this.okr.userId)
        .subscribe(owner => {
          this.owner = owner;
        });
    }
  }

  getParent(): void {
    if (this.okr.parent) {
      this.okrService.getOkr(this.okr.parent)
        .subscribe(parent => this.parent = parent);
    }
  }

  deleteOKR(): void {
    this.okrService.deleteOkr(this.okr)
      .subscribe(() => this.hideOkrId.emit(this.okr._id));
  }

  hideChild(okrId: string) {
    this.getChildren();
    this.childrenCount = this.childrenCount - 1;
  }
}