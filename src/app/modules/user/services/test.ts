import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserStorageService } from '../../shared/auth/services/user-storage.service';
import { environment } from '../../../../environments/environment';

const BASE_URL = environment.apiUrl + '/';

@Injectable({
  providedIn: 'root'
})
export class Test {
  constructor(private http: HttpClient) { }
  
  private getAuthHeaders(): HttpHeaders {
    const token = UserStorageService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
  
  getAllTest(): Observable<any> {
    return this.http.get(BASE_URL + 'api/user/tests', { headers: this.getAuthHeaders() });
  }
  
  getTestQuestions(id: number): Observable<any> {
    return this.http.get(`${BASE_URL}api/user/test/${id}`, { headers: this.getAuthHeaders() });
  }
  
  getMyTestResults(): Observable<any> {
    const userId = UserStorageService.getUserId();
    return this.http.get(`${BASE_URL}api/user/results/${userId}`, { headers: this.getAuthHeaders() });
  }
  
  submitTest(testId: number, responses: any[], score?: number): Observable<any> {
    const userId = UserStorageService.getUserId();
    
    // Exact backend format as specified
    const payload = {
      testId,
      userId,
      responses
    };
    
    return this.http.post(`${BASE_URL}api/user/test/submit`, payload, { headers: this.getAuthHeaders() });
  }
}
