import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserStorageService } from '../../shared/auth/services/user-storage.service';
import { environment } from '../../../../environments/environment';

const BASIC_URL = environment.apiUrl + "/";

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = UserStorageService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  createTest(testDto):Observable<any>{
    return this.http.post(BASIC_URL+'api/admin/test', testDto, { headers: this.getAuthHeaders() });
  }
  
  getAllTest():Observable<any>{
    return this.http.get(BASIC_URL+'api/admin/tests', { headers: this.getAuthHeaders() });
  }
  
  addQuestionInTest(questionDto):Observable<any>{
    return this.http.post(BASIC_URL+'api/admin/test/question', questionDto, { headers: this.getAuthHeaders() });
  }
  
  getTestQuestions(id: number): Observable<any> {
    return this.http.get(`${BASIC_URL}api/admin/test/${id}`, { headers: this.getAuthHeaders() });
  }

  getTestResults():Observable<any>{
    return this.http.get(BASIC_URL+'api/admin/test-results', { headers: this.getAuthHeaders() });
  }
}