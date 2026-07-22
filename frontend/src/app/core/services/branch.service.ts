import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Branch } from '../models/branch.model';

@Injectable({ providedIn: 'root' })
export class BranchService {
  private baseUrl = 'http://localhost:8080/api/branches';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Branch[]> {
    return this.http.get<Branch[]>(this.baseUrl);
  }

  getById(id: number): Observable<Branch> {
    return this.http.get<Branch>(`${this.baseUrl}/${id}`);
  }

  create(branch: Branch): Observable<Branch> {
    return this.http.post<Branch>(this.baseUrl, branch);
  }

  update(id: number, branch: Branch): Observable<Branch> {
    return this.http.put<Branch>(`${this.baseUrl}/${id}`, branch);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}