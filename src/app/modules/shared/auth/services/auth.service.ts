import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

const BASIC_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  register(data: any): Observable<any> {
    return this.http.post(`${BASIC_URL}/api/auth/sign-up`, data);
  }
  login(credentials: { email: string; password: string }) {
  return this.http.post(`${BASIC_URL}/api/auth/login`, credentials);
}

}
