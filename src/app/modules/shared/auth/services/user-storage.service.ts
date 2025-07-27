import { Injectable } from '@angular/core';

const USER = 'q_user';

@Injectable({
  providedIn: 'root'
})
export class UserStorageService {
  
  constructor() {}
  
  static saveUser(user: any): void {
    window.localStorage.removeItem(USER);
    window.localStorage.setItem(USER, JSON.stringify(user));
  }
  
  static getUser(): any {
    const userData = localStorage.getItem(USER);
    return userData ? JSON.parse(userData) : null;
  }
  
  static getUserId(): string {
    const user = this.getUser();
    if (user == null) {
      return '';
    }
    return user.id?.toString() || '';
  }
  
  static getUserRole(): string {
    const user = this.getUser();
    if (user == null) {
      return '';
    }
    return user.role || '';
  }
  
  static getToken(): string {
    const user = this.getUser();
    if (user == null) {
      return '';
    }
    return user.token || user.jwt || '';
  }
  
  static isAdminLoggedIn(): boolean {
    const role: string = this.getUserRole();
    const user = this.getUser();
    return user != null && role === 'ADMIN';
  }
  
  static isUserLoggedIn(): boolean {
    const role: string = this.getUserRole();
    const user = this.getUser();
    return user != null && role !== '' && role !== 'ADMIN';
  }
  
  static signOut(): void {
    window.localStorage.removeItem(USER);
  }
  
  static hasToken(): boolean {
    const token = this.getToken();
    return token !== '' && token !== null && token !== undefined;
  }
}
