import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { CurrentUser } from '../models/current-user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private baseUrl = 'http://localhost:8080/api/users';
  private currentUserSubject = new BehaviorSubject<CurrentUser | null>(null);

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/id/${id}`);
  }

  create(user: User): Observable<User> {
    return this.http.post<User>(this.baseUrl, user);
  }

  update(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/id/${id}`, user);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/id/${id}`);
  }

  getProfile(forceRefresh: boolean = false): Observable<CurrentUser> {
    const cached = this.currentUserSubject.value;

    if (!forceRefresh && cached) {
      return of(cached);
    }

    return this.http.get<CurrentUser>(`${this.baseUrl}/profile`).pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }

  updateProfile(payload: { fullName: string; email: string }): Observable<CurrentUser> {
    return this.http.put<CurrentUser>(`${this.baseUrl}/profile`, payload).pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }

  changePassword(payload: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/profile/password`, payload);
  }

  getCachedProfile(): CurrentUser | null {
    return this.currentUserSubject.value;
  }

  clearCachedProfile(): void {
    this.currentUserSubject.next(null);
  }
}