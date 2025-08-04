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
    // Get tests with reasonable page size for stats calculation
    return this.http.get(`${BASE_URL}api/user/tests?page=0&size=100`, { headers: this.getAuthHeaders() });
  }
  
  getAllTestsPaged(page: number, size: number): Observable<any> {
    return this.http.get(`${BASE_URL}api/user/tests?page=${page}&size=${size}`, { headers: this.getAuthHeaders() });
  }
  
  getTestQuestions(id: number): Observable<any> {
    return this.http.get(`${BASE_URL}api/user/test/${id}`, { headers: this.getAuthHeaders() });
  }
  
  getFullTestQuestions(id: number): Observable<any> {
    return this.http.get(`${BASE_URL}api/user/test/${id}/full`, { headers: this.getAuthHeaders() });
  }
  
  getMyTestResultsPaged(page: number, size: number): Observable<any> {
    const userId = UserStorageService.getUserId();
    return this.http.get(`${BASE_URL}api/user/results/${userId}?page=${page}&size=${size}`, { headers: this.getAuthHeaders() });
  }
  
  // User's own tests management
  getMyTestsPaged(page: number, size: number): Observable<any> {
    return this.http.get(`${BASE_URL}api/user/my-tests?page=${page}&size=${size}`, { headers: this.getAuthHeaders() });
  }
  
  createMyTest(testData: any): Observable<any> {
    return this.http.post(`${BASE_URL}api/user/test`, testData, { headers: this.getAuthHeaders() });
  }
  
  updateMyTest(testId: number, testData: any): Observable<any> {
    return this.http.put(`${BASE_URL}api/user/test/${testId}`, testData, { headers: this.getAuthHeaders() });
  }
  
  getMyTestDetails(testId: number): Observable<any> {
    return this.http.get(`${BASE_URL}api/user/test/${testId}/full`, { headers: this.getAuthHeaders() });
  }
  
  addQuestionToMyTest(testId: number, questionData: any): Observable<any> {
    return this.http.post(`${BASE_URL}api/user/test/${testId}/question`, questionData, { headers: this.getAuthHeaders() });
  }
  
  updateQuestionInMyTest(testId: number, questionId: number, questionData: any): Observable<any> {
    return this.http.put(`${BASE_URL}api/user/test/${testId}/question/${questionId}`, questionData, { headers: this.getAuthHeaders() });
  }
  
  deleteQuestionFromMyTest(testId: number, questionId: number): Observable<any> {
    return this.http.delete(`${BASE_URL}api/user/test/${testId}/question/${questionId}`, { headers: this.getAuthHeaders() });
  }
  
  deleteMyTest(testId: number): Observable<any> {
    return this.http.delete(`${BASE_URL}api/user/test/${testId}`, { 
      headers: this.getAuthHeaders(),
      responseType: 'json' // Explicitly expect JSON response
    });
  }
  
  canDeleteTest(testId: number): Observable<any> {
    return this.http.get(`${BASE_URL}api/user/test/${testId}/can-delete`, { headers: this.getAuthHeaders() });
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

  // Get results for a specific test (for test creators to see who took their test)
  getTestResultsByTestId(testId: number): Observable<any> {
    // Use the new backend endpoint
    return this.http.get(`${BASE_URL}api/user/my-tests/${testId}/results`, { headers: this.getAuthHeaders() });
  }

  // Get paginated results for a specific test
  getTestResultsByTestIdPaged(testId: number, page: number, size: number): Observable<any> {
    return this.http.get(`${BASE_URL}api/user/my-tests/${testId}/results?page=${page}&size=${size}`, { headers: this.getAuthHeaders() });
  }

  // Search functionality
  searchTests(query: string): Observable<any> {
    return this.http.get(`${BASE_URL}api/user/tests/search?query=${encodeURIComponent(query)}`, { headers: this.getAuthHeaders() });
  }
}
