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
  
  getAllTestsPaged(page: number, size: number): Observable<any> {
    return this.http.get(`${BASIC_URL}api/admin/tests/paged?page=${page}&size=${size}`, { headers: this.getAuthHeaders() });
  }
  
  addQuestionInTest(questionDto):Observable<any>{
    return this.http.post(BASIC_URL+'api/admin/test/question', questionDto, { headers: this.getAuthHeaders() });
  }
  
  getTestQuestions(id: number): Observable<any> {
    return this.http.get(`${BASIC_URL}api/admin/test/${id}`, { headers: this.getAuthHeaders() });
  }
  
  getTestQuestionsPaged(id: number, page: number, size: number): Observable<any> {
    return this.http.get(`${BASIC_URL}api/admin/test/${id}/questions/paged?page=${page}&size=${size}`, { headers: this.getAuthHeaders() });
  }

  getTestResults():Observable<any>{
    return this.http.get(BASIC_URL+'api/admin/test-results', { headers: this.getAuthHeaders() });
  }
  
  getTestResultsPaged(page: number, size: number): Observable<any> {
    return this.http.get(`${BASIC_URL}api/admin/test-results/paged?page=${page}&size=${size}`, { headers: this.getAuthHeaders() });
  }
  
  deleteTest(testId: number): Observable<any> {
    return this.http.delete(`${BASIC_URL}api/admin/test/${testId}`, { 
      headers: this.getAuthHeaders(),
      responseType: 'json' // Explicitly expect JSON response
    });
  }

  updateTest(testData: any): Observable<any> {
    return this.http.put(`${BASIC_URL}api/admin/test/${testData.id}`, testData, { headers: this.getAuthHeaders() });
  }

  updateQuestion(questionId: number, questionData: any): Observable<any> {
    return this.http.put(`${BASIC_URL}api/admin/test/question/${questionId}`, questionData, { headers: this.getAuthHeaders() });
  }

  deleteQuestion(questionId: number): Observable<any> {
    return this.http.delete(`${BASIC_URL}api/admin/test/question/${questionId}`, { 
      headers: this.getAuthHeaders(),
      responseType: 'json'
    });
  }

  // User management methods
  getUsersPaged(page: number, size: number): Observable<any> {
    return this.http.get(`${BASIC_URL}api/admin/users/paged?page=${page}&size=${size}`, { headers: this.getAuthHeaders() });
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${BASIC_URL}api/admin/user/${userId}`, { 
      headers: this.getAuthHeaders(),
      responseType: 'json'
    });
  }

  getUserDetails(userId: number): Observable<any> {
    return this.http.get(`${BASIC_URL}api/admin/user/${userId}/details`, { headers: this.getAuthHeaders() });
  }

  getUserCreatedTests(userId: number): Observable<any> {
    return this.http.get(`${BASIC_URL}api/admin/user/${userId}/created-tests`, { headers: this.getAuthHeaders() });
  }

  getUserTakenTests(userId: number): Observable<any> {
    return this.http.get(`${BASIC_URL}api/admin/user/${userId}/taken-tests`, { headers: this.getAuthHeaders() });
  }

  getUserCreatedTestsPaged(userId: number, page: number, size: number = 5): Observable<any> {
    return this.http.get(`${BASIC_URL}api/admin/user/${userId}/created-tests?page=${page}&size=${size}`, { headers: this.getAuthHeaders() });
  }

  getUserTakenTestsPaged(userId: number, page: number, size: number = 5): Observable<any> {
    return this.http.get(`${BASIC_URL}api/admin/user/${userId}/taken-tests?page=${page}&size=${size}`, { headers: this.getAuthHeaders() });
  }

  // Search functionality
  searchTests(query: string): Observable<any> {
    return this.http.get(`${BASIC_URL}api/admin/tests/search?query=${encodeURIComponent(query)}`, { headers: this.getAuthHeaders() });
  }
}